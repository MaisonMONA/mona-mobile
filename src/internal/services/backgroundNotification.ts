import { App } from '@capacitor/app';
import { Geolocation } from '@capacitor/geolocation';
import { ProximityNotificationService, getGlobalCooldownMs } from '@/internal/services/notification';
import { UserData } from '@/internal/databases/UserData';
import { registerPlugin, Capacitor } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { getBackgroundMonitoringPlatform } from '@/internal/services/backgroundNotificationPlatform';
import { startGeofenceMonitoring, stopGeofenceMonitoring, onGeofenceTriggered } from '@/internal/services/geofence';
const FOREGROUND_LOCATION_DISTANCE_M = 1;
const BACKGROUND_LOCATION_DISTANCE_M = 1000;

// Try to register the native background-geolocation plugin. If it's not
// available at runtime we'll fall back to a JS-only watchPosition.
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation',
  {
    // Guard against SSR or web where plugin may not exist.
    web: () => {
      return undefined as any;
    },
  },
);

// Local haversine helper (kept local to avoid cross-file exports).
function toRadians(valueInDegrees: number): number {
  return (valueInDegrees * Math.PI) / 180;
}

function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
}

function extractCoordinates(location: any): { latitude: number; longitude: number } | null {
  if (!location) return null;

  const latitude =
    typeof location.latitude === 'number'
      ? location.latitude
      : typeof location.coords?.latitude === 'number'
        ? location.coords.latitude
        : null;

  const longitude =
    typeof location.longitude === 'number'
      ? location.longitude
      : typeof location.coords?.longitude === 'number'
        ? location.coords.longitude
        : null;

  if (latitude == null || longitude == null) return null;

  return { latitude, longitude };
}

/**
 * Background proximity monitor
 *
 * This is intentionally a best-effort, OS-controlled background watcher.
 * It tries to keep monitoring while the app is backgrounded or suspended and
 * the platform allows it, but it does not guarantee that a force-closed app or
 * a heavily restricted OS state will keep running. The app can only react while
 * the system still permits background execution.
 *
 * - Android: usually the best platform for this pattern, especially with a
 *   native background watcher and foreground-service support.
 * - iOS: supports background location, but execution is limited and may stop or
 *   be throttled by the OS when the user force-closes the app or battery
 *   policy is restrictive.
 *
 * The service therefore behaves conservatively: wake on movement, run the
 * proximity check, respect quiet hours + cooldown, and re-arm only after a
 * cooldown window when the app is still allowed to run in the background.
 */

export class BackgroundProximityService {
  private watchId: string | number | null = null;
  private running = false;
  private proximity = new ProximityNotificationService();
  private inFlight = false; // avoid overlapping runCheck calls
  private bgWatcherId: string | null = null;
  private lastLat: number | null = null;
  private lastLng: number | null = null;
  private autoRearm = true;
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;
  private bestEffortCooldownMs = getGlobalCooldownMs('sparse');
  private appIsForeground = true;
  private locationDistanceFilterM = FOREGROUND_LOCATION_DISTANCE_M;
  private readonly platformAdapter = getBackgroundMonitoringPlatform();
  private geofenceListenerInstalled = false;

  async setAppForeground(isForeground: boolean): Promise<void> {
    const nextDistanceFilterM = isForeground
      ? FOREGROUND_LOCATION_DISTANCE_M
      : BACKGROUND_LOCATION_DISTANCE_M;

    const previousForegroundState = this.appIsForeground;
    this.appIsForeground = isForeground;
    if (this.locationDistanceFilterM === nextDistanceFilterM && this.running) return;

    this.locationDistanceFilterM = nextDistanceFilterM;
    if (!this.running) return;

    // Avoid restarting the watcher from a background app-state callback. On
    // recent Android versions this path can produce a foreground-service start
    // warning that strips location access. Keep the current watcher alive and
    // apply the new filter on a foreground-driven restart.
    if (!isForeground) {
      console.log('[BackgroundProximityService] App moved to background; switching from continuous updates to geofence monitoring', {
        previousForegroundState,
        distanceFilterMDeferred: nextDistanceFilterM,
      });
      // Keep the native geofence registered, but stop the continuous location watcher.
      // Android can then wake the app after meaningful movement instead of delivering
      // location updates every few seconds while the app is not visible.
      await this.stop({ keepArmed: true, keepGeofence: true });
      return;
    }

    console.log('[BackgroundProximityService] App moved to foreground; restarting watcher to apply location filter', {
      previousForegroundState,
      distanceFilterM: nextDistanceFilterM,
    });
    await this.stop({ keepArmed: true });
    await this.start();
  }

  private async isAppForeground(): Promise<boolean> {
    try {
      const state = await App.getState();
      return state?.isActive !== false;
    } catch (e) {
      console.warn('[BackgroundProximityService] App.getState failed, defaulting to foreground', e);
      return true;
    }
  }

  /**
   * Register the native geofence callback so the operating system can wake this app
   * when a monitored boundary is crossed. The callback then fetches the current
   * coordinates and reuses the existing MONA proximity logic.
   */
  private async installGeofenceListener(): Promise<void> {
    if (this.geofenceListenerInstalled) return;

    try {
      const listener = await onGeofenceTriggered(async (event) => {
        console.log('[BackgroundProximityService] geofence transition received', event);

        try {
          const currentPosition = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 20_000,
            maximumAge: 60_000,
          });

          await this.handleLocationUpdate(
            {
              latitude: currentPosition.coords.latitude,
              longitude: currentPosition.coords.longitude,
            },
            // Do not move the geofence after its own callback. Re-registering it
            // immediately causes Android's initial-enter event to fire repeatedly.
            { refreshGeofence: false },
          );
        } catch (error) {
          console.warn('[BackgroundProximityService] geofence callback could not fetch current position', error);
        }
      });

      if (listener) {
        this.geofenceListenerInstalled = true;
      }
    } catch (error) {
      console.warn('[BackgroundProximityService] geofence listener registration failed', error);
    }
  }

  private clearRearmTimer(): void {
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
  }

  private scheduleRearm(delayMs: number): void {
    if (!this.autoRearm) return;

    const normalizedDelay = Math.max(30_000, delayMs);
    this.clearRearmTimer();
    console.log(`[BackgroundProximityService] Scheduling rearm in ${normalizedDelay}ms`);
    this.rearmTimer = setTimeout(() => {
      this.rearmTimer = null;
      if (!this.running && this.autoRearm) {
        console.log('[BackgroundProximityService] Rearming background service (best-effort)');
        void this.start();
      }
    }, normalizedDelay);
  }

  /**
   * Common handler for location updates from both native and fallback watchers
   * @param locationData Either a location object (from native) or latitude/longitude coordinates
   */
  private async handleLocationUpdate(
    locationData: any,
    options: { refreshGeofence?: boolean } = {},
  ): Promise<void> {
    console.log('[BackgroundProximityService] handleLocationUpdate received', locationData);

    // Extract coordinates depending on the source
    let coordinates: { latitude: number; longitude: number } | null = null;

    // Check if we have valid numeric coordinates (not null or undefined)
    const isValidCoord = (val: any): val is number =>
      typeof val === 'number' && !isNaN(val);

    if (isValidCoord(locationData.latitude) && isValidCoord(locationData.longitude)) {
      // Direct coordinates object (from fallback watcher)
      coordinates = { latitude: locationData.latitude, longitude: locationData.longitude };
    } else {
      // Location object from native watcher
      coordinates = extractCoordinates(locationData);
    }

    if (!coordinates) return;

    if (options.refreshGeofence !== false) {
      try {
        // A geofence is meant to represent meaningful movement, not tiny GPS noise.
        // Android is also much more reliable with a practical radius than with a 1-2 m circle.
        const geofenceRadiusM = Math.max(BACKGROUND_LOCATION_DISTANCE_M, 100);
        await startGeofenceMonitoring(coordinates.latitude, coordinates.longitude, geofenceRadiusM, 'mona-main-geofence');
      } catch (e) {
        console.warn('[BackgroundProximityService] geofence registration failed', e);
      }
    }

    if (this.inFlight) return;
    this.inFlight = true;

    try {
      const discoveries = UserData.getSortedDiscoveriesAZ().map((d: any) => {
        const loc = d.getLocation();
        return {
          id: `${d.dType}:${d.id}`,
          title: d.getTitle ? d.getTitle() : '',
          lat: loc.lat,
          lng: loc.lng,
          isCollected: d.isCollected,
        };
      });

      const result = await this.proximity.runCheck(discoveries, coordinates, true);
      console.log('[BackgroundProximityService] runCheck result', result);

      // Best-effort behavior: only sleep/re-arm when the app is backgrounded.
      // While foregrounded, keep the watcher alive so location-based checks keep
      // working during normal app usage and emulator testing.
      if (result.sent) {
        const appIsForeground = await this.isAppForeground();
        if (!appIsForeground) {
          // Keep the native foreground service alive after a background send.
          // The proximity service persists and enforces its cooldown, so
          // stopping the watcher here would prevent all later location checks.
          console.log('[BackgroundProximityService] Background notification sent; keeping native watcher armed while cooldown is enforced');
          return;
        }

        console.log('[BackgroundProximityService] Foreground notification sent; leaving watcher armed for continued location checks');
        return;
      }

      if (['global_cooldown', 'quiet_hours', 'daily_cap'].includes(result.reason)) {
        const appIsForeground = await this.isAppForeground();
        if (!appIsForeground) {
          console.log('[BackgroundProximityService] Cooldown gate hit while backgrounded; scheduling rearm', { reason: result.reason, delayMs: this.bestEffortCooldownMs });
          this.scheduleRearm(this.bestEffortCooldownMs);
        }
      }
    } catch (e) {
      console.error('BackgroundProximityService: runCheck failed', e);
    } finally {
      this.inFlight = false;
    }
  }

  /** Start background monitoring. Safe to call multiple times. */
  async start(): Promise<void> {
    if (this.running) return;
    this.autoRearm = true;
    this.clearRearmTimer();

    await this.installGeofenceListener();

    const platform = Capacitor.getPlatform();
    const nativeWatcherAvailable = this.platformAdapter.supportsNativeWakeup || Boolean(
      BackgroundGeolocation && BackgroundGeolocation.addWatcher,
    );
    console.log('[BackgroundProximityService] start() invoked', {
      platform,
      adapterPlatform: this.platformAdapter.platform,
      nativeWatcherAvailable,
      distanceFilterM: this.locationDistanceFilterM,
      appIsForeground: this.appIsForeground,
    });

    // Ensure we at least have permission to access location.
    try {
      const perm = await Geolocation.checkPermissions();
      console.log('[BackgroundProximityService] location permission state', perm);
      if (perm.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        console.log('[BackgroundProximityService] requestPermissions result', requested);
        if (requested.location !== 'granted') {
          console.warn('BackgroundProximityService: location permission not granted');
          return;
        }
      }
    } catch (e) {
      console.warn('BackgroundProximityService: permission check failed', e);
    }

    // Prefer the platform-native background monitoring adapter when available.
    // This keeps Android/iOS wake-up logic behind a shared app API while still
    // allowing the best-effort JS watcher as a fallback.
    try {
      const watcherId = await this.platformAdapter.start({
        distanceFilterM: this.locationDistanceFilterM,
        backgroundTitle: 'MONA',
        backgroundMessage: "Recherche d'oeuvres d'art",
        onLocation: async (location) => {
          await this.handleLocationUpdate(location);
        },
      });

      if (watcherId) {
        this.bgWatcherId = watcherId;
        this.running = true;
        console.log('[BackgroundProximityService] Native watcher started', {
          watcherId,
          platform,
          adapterPlatform: this.platformAdapter.platform,
          distanceFilterM: this.locationDistanceFilterM,
        });
        return;
      }
    } catch (e) {
      console.warn(
        '[BackgroundProximityService] Native watcher failed; falling back to JS Geolocation.watchPosition. JS fallback will not survive force-close/swipe-away on Android or iOS.',
        e,
      );
    }

    // Fallback: use Geolocation.watchPosition but filter by distance manually
    console.warn(
      '[BackgroundProximityService] Starting JS fallback watcher (best-effort only while app process is alive)',
      { platform, distanceFilterM: this.locationDistanceFilterM },
    );
    const positionHandler = async (position: any, err: any) => {
      if (err) {
        console.warn('BackgroundProximityService watch error', err);
        return;
      }

      if (!position || !position.coords) return;

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // If we have a last position, ignore updates smaller than 1000m
      if (this.lastLat != null && this.lastLng != null) {
        const moved = haversineDistanceMeters(this.lastLat, this.lastLng, lat, lng);
        if (moved < this.locationDistanceFilterM) return;
      }

      // Update last known
      this.lastLat = lat;
      this.lastLng = lng;

      await this.handleLocationUpdate({ latitude: lat, longitude: lng });
    };

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        },
        positionHandler,
      );
    } catch (e) {
      console.error('BackgroundProximityService: failed to start watch', e);
      return;
    }

    this.running = true;
    console.log('BackgroundProximityService: started watch', this.watchId);
  }

  private getZoneFromResultReason(reason: string): 'dense' | 'middle' | 'sparse' | null {
    if (reason === 'sent_dense') return 'dense';
    if (reason === 'sent_middle') return 'middle';
    if (reason === 'sent_sparse') return 'sparse';
    return null;
  }

  /** Stop background monitoring. */
  async stop(options: { keepArmed?: boolean; keepGeofence?: boolean } = {}): Promise<void> {
    const { keepArmed = false, keepGeofence = false } = options;

    if (!keepArmed) {
      this.autoRearm = false;
      this.clearRearmTimer();
    }

    if (!this.running) return;
    try {
      if (this.bgWatcherId) {
        console.log('[BackgroundProximityService] removing native watcher', this.bgWatcherId);
        await this.platformAdapter.stop(this.bgWatcherId);
        this.bgWatcherId = null;
      }

      if (this.watchId != null) {
        console.log('[BackgroundProximityService] clearing JS watch', this.watchId);
        await Geolocation.clearWatch({ id: this.watchId as any });
      }

      if (!keepGeofence) {
        await stopGeofenceMonitoring();
      }
    } catch (e) {
      console.warn('BackgroundProximityService: failed to clear watch', e);
    }

    this.watchId = null;
    this.running = false;
  }
}

// Export a singleton for convenience
export const backgroundProximityService = new BackgroundProximityService();

/**
 * Ensure background permissions by asking the native plugin to request them.
 * Returns `true` when background permission was granted (or not required),
 * `false` if the user denied.
 */
export async function ensureBackgroundPermissions(): Promise<boolean> {
  try {
    if (BackgroundGeolocation && BackgroundGeolocation.addWatcher) {
      // Add a temporary watcher that requests permissions then remove it.
      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          requestPermissions: true,
          backgroundTitle: 'MONA',
          backgroundMessage: 'Autoriser la géolocalisation en arrière-plan',
          stale: false,
          distanceFilter: BACKGROUND_LOCATION_DISTANCE_M,
        },
        (location, error) => {
          // noop -- this watcher is temporary; we'll remove it below.
        },
      );

      // Immediately remove watcher; the OS permission prompt persists.
      if (watcherId && BackgroundGeolocation.removeWatcher) {
        await BackgroundGeolocation.removeWatcher({ id: watcherId });
      }

      return true;
    }
  } catch (e: any) {
    // If the plugin reports a NOT_AUTHORIZED error, permission was denied.
    if (e && e.code === 'NOT_AUTHORIZED') return false;
    console.warn('ensureBackgroundPermissions failed', e);
  }

  // Fallback: try to ensure foreground location permission only.
  try {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      return requested.location === 'granted';
    }
    return true;
  } catch (e) {
    console.warn('ensureBackgroundPermissions fallback failed', e);
    return false;
  }
}