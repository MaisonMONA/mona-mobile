import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export type DiscoveryCandidate = {
  id: string;
  title?: string;
  lat: number;
  lng: number;
  isCollected?: boolean;
};

export type CurrentCoordinates = {
  latitude: number;
  longitude: number;
};

type NotificationDensityZone = 'dense' | 'middle' | 'sparse';

type NotificationDecision =
  | { notify: false; reason: string }
  | {
      notify: true;
      zone: NotificationDensityZone;
      candidates: DiscoveryCandidate[];
      message: string;
    };

// Keys used to persist notification cooldowns and scan metadata.
const PREFERENCE_KEYS = {
  LAST_GLOBAL_NOTIF_AT: 'notif_last_global_at',
  LAST_CHECK_LAT: 'notif_last_check_lat',
  LAST_CHECK_LNG: 'notif_last_check_lng',
  LAST_CHECK_AT: 'notif_last_check_at',
  DAILY_COUNT_DATE: 'notif_daily_count_date',
  DAILY_COUNT: 'notif_daily_count',
  PIECE_LAST_NOTIF_MAP: 'notif_piece_last_map',
  QUIET_HOURS_START: 'quiet_hours_start',
  QUIET_HOURS_END: 'quiet_hours_end',
};

// Proximity thresholds used by the notification rules.
const NOTIFICATION_CONFIG = {
  DENSITY_RADIUS_M: 1999,
  DENSE_MIN_COUNT: 20,
  SPARSE_MAX_COUNT: 5,
  DENSE: {
    RADIUS_M: 200,
    MIN_TOTAL_IN_RADIUS: 5,
    MIN_UNEXPLORED_IN_RADIUS: 3,
    NEAREST_MAX_M: 150,
    GLOBAL_COOLDOWN_H: 1/120, //4
  },
  MIDDLE: {
    RADIUS_M: 450,
    MIN_UNEXPLORED_IN_RADIUS: 2,
    NEAREST_MAX_M: 300,
    GLOBAL_COOLDOWN_H: 1/120, //3
  },
  SPARSE: {
    RADIUS_M: 800,
    MIN_UNEXPLORED_IN_RADIUS: 1,
    GLOBAL_COOLDOWN_H: 1/120, //2
  },
  
  QUIET_HOURS_START: 21,
  QUIET_HOURS_END: 8,
  MIN_MOVE_TO_RECHECK_M: 1/*20*/,
  MAX_RECHECK_MIN: 1/*5*/,
  DAILY_CAP: 40,
  PER_DISCOVERY_COOLDOWN_H: 0/*24*/,
};

// Convert degrees to radians for the haversine formula.
function toRadians(valueInDegrees: number): number {
  return (valueInDegrees * Math.PI) / 180;
}

// Compute the distance in meters between two coordinates.
function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
}

// Return the current timestamp in milliseconds.
function nowMs(): number {
  return Date.now();
}

// Build a local YYYY-MM-DD key for daily notification limits.
function todayKeyLocal(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Return true when notifications should be suppressed for quiet hours.
async function isQuietHours(date = new Date()): Promise<boolean> {
  const hour = date.getHours();

  const { value: startValue } = await Preferences.get({
    key: PREFERENCE_KEYS.QUIET_HOURS_START,
  });

  const { value: endValue } = await Preferences.get({
    key: PREFERENCE_KEYS.QUIET_HOURS_END,
  });

  // Default if user never changed them
  const start = Number(startValue ?? 21); // 9 PM
  const end = Number(endValue ?? 9);      // 9 AM

  // Example: 13 -> 15
  if (start < end) {
    return hour >= start && hour < end;
  }

  // Example: 21 -> 9
  return hour >= start || hour < end;
}

// Read a numeric preference and normalize invalid values to null.
async function getNumberPreference(key: string): Promise<number | null> {
  const { value } = await Preferences.get({ key });
  if (!value) return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

// Persist a numeric preference as a string.
async function setNumberPreference(key: string, value: number): Promise<void> {
  await Preferences.set({ key, value: String(value) });
}

// Set the quiet hours for notifications.
// The function saves these values in the preferences 
//storage using the `Preferences.set` method.

export async function setQuietHours(
  start: number,
  end: number,
): Promise<void> {
  await Preferences.set({
    key: PREFERENCE_KEYS.QUIET_HOURS_START,
    value: String(start),
  });

  await Preferences.set({
    key: PREFERENCE_KEYS.QUIET_HOURS_END,
    value: String(end),
  });
} 

// Read the per-discovery cooldown map from storage.
async function getDiscoveryLastNotificationMap(): Promise<Record<string, number>> {
  const { value } = await Preferences.get({ key: PREFERENCE_KEYS.PIECE_LAST_NOTIF_MAP });
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// Persist the per-discovery cooldown map.
async function setDiscoveryLastNotificationMap(map: Record<string, number>): Promise<void> {
  await Preferences.set({ key: PREFERENCE_KEYS.PIECE_LAST_NOTIF_MAP, value: JSON.stringify(map) });
}

// Classify the current area by discovery density.
function getDensityZone(countWithin2Km: number): NotificationDensityZone {
  if (countWithin2Km >= NOTIFICATION_CONFIG.DENSE_MIN_COUNT) return 'dense';
  if (countWithin2Km <= NOTIFICATION_CONFIG.SPARSE_MAX_COUNT) return 'sparse';
  return 'middle';
}

export function getGlobalCooldownMs(zone: NotificationDensityZone): number {
  const zoneCooldownHours =
    zone === 'dense'
      ? NOTIFICATION_CONFIG.DENSE.GLOBAL_COOLDOWN_H
      : zone === 'middle'
        ? NOTIFICATION_CONFIG.MIDDLE.GLOBAL_COOLDOWN_H
        : NOTIFICATION_CONFIG.SPARSE.GLOBAL_COOLDOWN_H;

  return (zoneCooldownHours ?? 0) * 3600_000;
}

export class ProximityNotificationService {
  /**
   * Request the permissions required for geolocation and local notifications.
   */
  async initPermissions(): Promise<boolean> {
    const geoPermissions = await Geolocation.checkPermissions();
    if (geoPermissions.location !== 'granted') {
      const requestedGeoPermissions = await Geolocation.requestPermissions();
      if (requestedGeoPermissions.location !== 'granted') return false;
    }

    const notificationPermissions = await LocalNotifications.checkPermissions();
    if (notificationPermissions.display !== 'granted') {
      const requestedNotificationPermissions = await LocalNotifications.requestPermissions();
      if (requestedNotificationPermissions.display !== 'granted') return false;
    }

    return true;
  }

  /**
   * Run one proximity scan and send a notification when the rules pass.
   */
  async runCheck(
    discoveries: DiscoveryCandidate[],
    currentCoordinates?: CurrentCoordinates,
    skipPermissionChecks = false,
  ): Promise<{ sent: boolean; reason: string }> {
    // Apply the hard gates first to avoid unnecessary location work.
    const permissionsGranted = await this.initPermissions();

    if (!permissionsGranted) 
      return { sent: false, reason: 'permissions_not_granted' };

    if (await isQuietHours()) 
      return { sent: false, reason: 'quiet_hours' };

    // Enforce the daily cap with a local YYYY-MM-DD key.
    const today = todayKeyLocal();
    const { value: storedDay } = await Preferences.get({ key: PREFERENCE_KEYS.DAILY_COUNT_DATE });
    let dailyNotificationCount = (await getNumberPreference(PREFERENCE_KEYS.DAILY_COUNT)) ?? 0;

    if (storedDay !== today) {
      dailyNotificationCount = 0;
      await Preferences.set({ key: PREFERENCE_KEYS.DAILY_COUNT_DATE, value: today });
      await setNumberPreference(PREFERENCE_KEYS.DAILY_COUNT, 0);
    }

    if (dailyNotificationCount >= NOTIFICATION_CONFIG.DAILY_CAP) {
      return { sent: false, reason: 'daily_cap' };
    }

    // Reuse coordinates from the wake event when available; otherwise read them once.
    const position = currentCoordinates
      ? null
      : await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 15000,
        });

    // Safely extract coordinates with fallbacks
    let currentLat: number = 0;
    let currentLng: number = 0;

    if (currentCoordinates) {
      // Use provided coordinates, with validation
      currentLat = typeof currentCoordinates.latitude === 'number' ? currentCoordinates.latitude : 0;
      currentLng = typeof currentCoordinates.longitude === 'number' ? currentCoordinates.longitude : 0;
    } else if (position && position.coords) {
      // Use position from Geolocation call
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
    }
    // If both are invalid/falsy, we'll use the defaults (0, 0) which will likely fail validation later
    // but at least won't crash

    const now = nowMs();

    // Skip repeated scans if the user has not moved enough since the last one.
    const lastCheckLat = await getNumberPreference(PREFERENCE_KEYS.LAST_CHECK_LAT);
    const lastCheckLng = await getNumberPreference(PREFERENCE_KEYS.LAST_CHECK_LNG);
    if (lastCheckLat != null && lastCheckLng != null) {
      const movedMeters = haversineDistanceMeters(lastCheckLat, lastCheckLng, currentLat, currentLng);
      if (movedMeters < NOTIFICATION_CONFIG.MIN_MOVE_TO_RECHECK_M) {
        return { sent: false, reason: 'not_moved_enough' };
      }
    }

    await setNumberPreference(PREFERENCE_KEYS.LAST_CHECK_LAT, currentLat);
    await setNumberPreference(PREFERENCE_KEYS.LAST_CHECK_LNG, currentLng);
    await setNumberPreference(PREFERENCE_KEYS.LAST_CHECK_AT, now);

    // Precompute distances so the zone rules can reuse the same values.
    const discoveriesWithDistance = discoveries.map((discovery) => ({
      discovery,
      distanceMeters: haversineDistanceMeters(currentLat, currentLng, discovery.lat, discovery.lng),
      isUncollected: !discovery.isCollected,
    }));

    const discoveriesWithin2Km = discoveriesWithDistance.filter(
      (item) => item.distanceMeters <= NOTIFICATION_CONFIG.DENSITY_RADIUS_M,
    );
    const zone = getDensityZone(discoveriesWithin2Km.length);

    const decision = await this.evaluateTrigger(zone, discoveriesWithDistance, now);
    if (!decision.notify) return { sent: false, reason: decision.reason };

    await this.sendNotification(decision.message);

    // Persist the cooldown counters after a notification has been scheduled.
    await setNumberPreference(PREFERENCE_KEYS.LAST_GLOBAL_NOTIF_AT, now);
    await setNumberPreference(PREFERENCE_KEYS.DAILY_COUNT, dailyNotificationCount + 1);

    const discoveryLastNotificationMap = await getDiscoveryLastNotificationMap();
    for (const discovery of decision.candidates) {
      discoveryLastNotificationMap[discovery.id] = now;
    }
    await setDiscoveryLastNotificationMap(discoveryLastNotificationMap);

    return { sent: true, reason: `sent_${decision.zone}` };
  }

  /**
   * Evaluate the density-specific rules and decide whether to notify.
   */
  private async evaluateTrigger(
    zone: NotificationDensityZone,
    discoveriesWithDistance: Array<{
      discovery: DiscoveryCandidate;
      distanceMeters: number;
      isUncollected: boolean;
    }>,
    now: number,
  ): Promise<NotificationDecision> {
    const discoveryLastNotificationMap = await getDiscoveryLastNotificationMap();
    const lastGlobalNotificationAt = await getNumberPreference(PREFERENCE_KEYS.LAST_GLOBAL_NOTIF_AT);

    // Each zone has its own global cooldown window.
    const zoneCooldownHours =
      zone === 'dense'
        ? NOTIFICATION_CONFIG.DENSE.GLOBAL_COOLDOWN_H
        : zone === 'middle'
          ? NOTIFICATION_CONFIG.MIDDLE.GLOBAL_COOLDOWN_H
          : NOTIFICATION_CONFIG.SPARSE.GLOBAL_COOLDOWN_H;

    if (
      lastGlobalNotificationAt != null &&
      now - lastGlobalNotificationAt < zoneCooldownHours * 3600_000
    ) {
      return { notify: false, reason: 'global_cooldown' };
    }

    // Prevent the same discovery from triggering again too soon.
    const canNotifyDiscovery = (discoveryId: string): boolean => {
      const lastNotificationAt = discoveryLastNotificationMap[discoveryId];
      if (!lastNotificationAt) return true;
      return now - lastNotificationAt >= NOTIFICATION_CONFIG.PER_DISCOVERY_COOLDOWN_H * 3600_000;
    };

    if (zone === 'dense') {
      const discoveriesInRadius = discoveriesWithDistance.filter(
        (item) => item.distanceMeters <= NOTIFICATION_CONFIG.DENSE.RADIUS_M,
      );
      const uncollectedDiscoveries = discoveriesInRadius.filter((item) => item.isUncollected);
      const nearestDistanceMeters = discoveriesInRadius.length
        ? Math.min(...discoveriesInRadius.map((item) => item.distanceMeters))
        : Infinity;

      const candidates = uncollectedDiscoveries
        .filter((item) => canNotifyDiscovery(item.discovery.id))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .map((item) => item.discovery);

      const shouldNotify =
        discoveriesInRadius.length >= NOTIFICATION_CONFIG.DENSE.MIN_TOTAL_IN_RADIUS &&
        uncollectedDiscoveries.length >= NOTIFICATION_CONFIG.DENSE.MIN_UNEXPLORED_IN_RADIUS &&
        nearestDistanceMeters <= NOTIFICATION_CONFIG.DENSE.NEAREST_MAX_M &&
        candidates.length > 0;

      if (!shouldNotify) return { notify: false, reason: 'dense_conditions_not_met' };

      return {
        notify: true,
        zone: 'dense',
        candidates: candidates.slice(0, 3),
        message: `🎨 Zone riche : plusieurs œuvres proches de vous (à ~${Math.round(nearestDistanceMeters)} m).`,
      };
    }

    if (zone === 'middle') {
      const discoveriesInRadius = discoveriesWithDistance.filter(
        (item) => item.distanceMeters <= NOTIFICATION_CONFIG.MIDDLE.RADIUS_M,
      );
      const uncollectedDiscoveries = discoveriesInRadius.filter((item) => item.isUncollected);
      const nearestDistanceMeters = discoveriesInRadius.length
        ? Math.min(...discoveriesInRadius.map((item) => item.distanceMeters))
        : Infinity;

      const candidates = uncollectedDiscoveries
        .filter((item) => canNotifyDiscovery(item.discovery.id))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .map((item) => item.discovery);

      const shouldNotify =
        uncollectedDiscoveries.length >= NOTIFICATION_CONFIG.MIDDLE.MIN_UNEXPLORED_IN_RADIUS &&
        nearestDistanceMeters <= NOTIFICATION_CONFIG.MIDDLE.NEAREST_MAX_M &&
        candidates.length > 0;

      if (!shouldNotify) return { notify: false, reason: 'middle_conditions_not_met' };

      return {
        notify: true,
        zone: 'middle',
        candidates: candidates.slice(0, 2),
        message: `🧭 Des œuvres intéressantes sont proches (à ~${Math.round(nearestDistanceMeters)} m et plus!).`,
      };
    }

    // Sparse zones use a broader radius and a lighter trigger condition.
    const discoveriesInRadius = discoveriesWithDistance.filter(
      (item) => item.distanceMeters <= NOTIFICATION_CONFIG.SPARSE.RADIUS_M,
    );
    const uncollectedDiscoveries = discoveriesInRadius.filter((item) => item.isUncollected);

    const candidates = uncollectedDiscoveries
      .filter((item) => canNotifyDiscovery(item.discovery.id))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map((item) => item.discovery);

    const shouldNotify =
      uncollectedDiscoveries.length >= NOTIFICATION_CONFIG.SPARSE.MIN_UNEXPLORED_IN_RADIUS &&
      candidates.length > 0;

    if (!shouldNotify) return { notify: false, reason: 'sparse_conditions_not_met' };

    const nearestDistanceMeters = discoveriesInRadius.length
      ? Math.min(...discoveriesInRadius.map((item) => item.distanceMeters))
      : Infinity;

    return {
      notify: true,
      zone: 'sparse',
      candidates: candidates.slice(0, 2),
      message: `🗺️ Une ou quelques œuvres à ~${Math.round(nearestDistanceMeters)} m).`,
    };
  } 

  /**
   * Schedule the local notification that the user will see.
   */
  private async sendNotification(body: string): Promise<void> {
    // Create the Android channel if needed. This is a safe no-op on iOS.
    await LocalNotifications.createChannel({
      id: 'mona-proximity',
      name: 'MONA Proximité',
      importance: 4,
      visibility: 1,
    }).catch(() => {});

    // Schedule the notification a moment later so the call behaves consistently.
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 1_000_000),
          title: '',
          body,
          schedule: { at: new Date(Date.now() + 1000) },
          channelId: 'mona-proximity',
          smallIcon: 'ic_launcher',
        },
      ],
    });
  }
}