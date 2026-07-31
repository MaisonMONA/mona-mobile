import { Geolocation } from '@capacitor/geolocation';
import { ProximityNotificationService } from '@/internal/services/notification';
import { UserData } from '@/internal/databases/UserData';
import { registerPlugin, Capacitor } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

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

/**
 * Background proximity monitor
 *
 * Notes:
 * - This file provides a lightweight, cross-platform *fallback* that uses
 *   `Geolocation.watchPosition` with a `distanceFilter` of ~1000m. To get
 *   reliable background SLC behavior on iOS (and more robust background
 *   behavior on Android/Samsung) you should install a native background
 *   location plugin (see notes below) and enable the required native
 *   capabilities.
 *
 * Native setup (required for true background delivery):
 * - iOS:
 *   - Add `UIBackgroundModes` => `location` to Info.plist
 *   - Add `NSLocationAlwaysAndWhenInUseUsageDescription` and
 *     `NSLocationWhenInUseUsageDescription` strings to Info.plist
 *   - Request Always/Background location permission (the OS treats SLC as
 *     a background capability)
 *   - Consider using a dedicated plugin that exposes significant-change
 *     monitoring (startMonitoringSignificantLocationChanges) if you need the
 *     exact SLC API and better battery characteristics.
 * - Android:
 *   - Add `FOREGROUND_SERVICE` permission and provide a foreground service
 *     when targeting background location (Android 10+ requires additional
 *     manifest flags and runtime permission flows).
 *   - Add `ACCESS_BACKGROUND_LOCATION` runtime permission (SDK 29+).
 *
 * Recommended plugin options:
 * - capacitor-community/background-geolocation or the well-known
 *   transistorsoft background-geolocation plugin (native setup required).
 *
 * This implementation intentionally keeps changes minimal: it starts a
 * watchPosition with a 1km `distanceFilter` and calls the existing
 * `ProximityNotificationService.runCheck()` on each location update.
 */

export class BackgroundProximityService {
  private watchId: string | number | null = null;
  private running = false;
  private proximity = new ProximityNotificationService();
  private inFlight = false; // avoid overlapping runCheck calls
  private bgWatcherId: string | null = null;
  private lastLat: number | null = null;
  private lastLng: number | null = null;

  /** Start background monitoring. Safe to call multiple times. */
  async start(): Promise<void> {
    if (this.running) return;

    // Ensure we at least have permission to access location.
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') {
          console.warn('BackgroundProximityService: location permission not granted');
          return;
        }
      }
    } catch (e) {
      console.warn('BackgroundProximityService: permission check failed', e);
    }

    // Prefer the native background-geolocation plugin when available. It
    // provides a native foreground/background watcher with better persistence
    // and battery characteristics. If registration or `addWatcher` fails we
    // fall back to Geolocation.watchPosition.
    try {
      if (BackgroundGeolocation && BackgroundGeolocation.addWatcher) {
        // Start native watcher; permissions should be requested before calling
        // `start()` (we do that from the caller). Use requestPermissions=false
        // to avoid double-prompting.
        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundTitle: 'MONA',
            backgroundMessage: 'Recherche d’œuvres à proximité',
            requestPermissions: false,
            stale: false,
            distanceFilter: 1000,
          },
          async (location, error) => {
            if (error) {
              console.warn('BackgroundGeolocation error', error);
              return;
            }

            if (!location) return;

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

              await this.proximity.runCheck(discoveries);
            } catch (e) {
              console.error('BackgroundProximityService: runCheck failed', e);
            } finally {
              this.inFlight = false;
            }
          },
        );

        this.bgWatcherId = watcherId;
        this.running = true;
        console.log('BackgroundProximityService: started native watcher', watcherId);
        return;
      }
    } catch (e) {
      console.warn('BackgroundProximityService: native watcher failed, falling back', e);
    }

    // Fallback: use Geolocation.watchPosition
    try {
      // Fallback: use Geolocation.watchPosition but filter by distance manually
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        },
        async (position, err) => {
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
            if (moved < 1000) return; // not significant enough
          }

          // Update last known
          this.lastLat = lat;
          this.lastLng = lng;

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

            await this.proximity.runCheck(discoveries);
          } catch (e) {
            console.error('BackgroundProximityService: runCheck failed', e);
          } finally {
            this.inFlight = false;
          }
        },
      );

      this.running = true;
      console.log('BackgroundProximityService: started watch', this.watchId);
    } catch (e) {
      console.error('BackgroundProximityService: failed to start watch', e);
    }
  }

  /** Stop background monitoring. */
  async stop(): Promise<void> {
    if (!this.running) return;
    try {
      if (this.bgWatcherId && BackgroundGeolocation && BackgroundGeolocation.removeWatcher) {
        await BackgroundGeolocation.removeWatcher({ id: this.bgWatcherId });
        this.bgWatcherId = null;
      }

      if (this.watchId != null) {
        await Geolocation.clearWatch({ id: this.watchId as any });
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
          distanceFilter: 1000,
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
