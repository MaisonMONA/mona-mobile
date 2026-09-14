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
};

// Proximity thresholds used by the notification rules.
const NOTIFICATION_CONFIG = {
  DENSITY_RADIUS_M: 1000,
  DENSE_MIN_COUNT: 20,
  SPARSE_MAX_COUNT: 5,
  MIN_MOVE_TO_RECHECK_M: 1/*20*/,
  MAX_RECHECK_MIN: 5,
  DAILY_CAP: 40,
  // Keep this short while testing. Production values can be 4h dense / 6h sparse.
  GLOBAL_COOLDOWN_MS: 3 * 60 * 1000,
  PER_DISCOVERY_COOLDOWN_MS: 24 * 60 * 60 * 1000,
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
  void zone;
  return NOTIFICATION_CONFIG.GLOBAL_COOLDOWN_MS;
}

/**
 * An intentional app opening starts a new discovery session. The next check
 * may notify immediately, while future background checks use the normal
 * persistent cooldown timestamp.
 */
export async function resetGlobalNotificationCooldown(): Promise<void> {
  await setNumberPreference(PREFERENCE_KEYS.LAST_GLOBAL_NOTIF_AT, 0);
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
    console.log('[ProximityNotificationService] runCheck start', {
      discoveryCount: discoveries.length,
      currentCoordinates,
      skipPermissionChecks,
    });

    const permissionsGranted = await this.initPermissions();

    if (!permissionsGranted) {
      console.warn('[ProximityNotificationService] Notification gate blocked: permissions_not_granted');
      return { sent: false, reason: 'permissions_not_granted' };
    }

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
      console.log('[ProximityNotificationService] Notification gate blocked: daily_cap', {
        dailyNotificationCount,
        limit: NOTIFICATION_CONFIG.DAILY_CAP,
      });
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
      console.log('[ProximityNotificationService] Movement gate', {
        lastCheckLat,
        lastCheckLng,
        currentLat,
        currentLng,
        movedMeters,
        minMove: NOTIFICATION_CONFIG.MIN_MOVE_TO_RECHECK_M,
      });
      if (movedMeters < NOTIFICATION_CONFIG.MIN_MOVE_TO_RECHECK_M) {
        console.log('[ProximityNotificationService] Notification gate blocked: not_moved_enough', { movedMeters });
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
    if (!decision.notify) {
      console.log('[ProximityNotificationService] Notification decision denied', {
        zone,
        reason: decision.reason,
        discoveriesWithin2Km: discoveriesWithin2Km.length,
      });
      return { sent: false, reason: decision.reason };
    }

    console.log('[ProximityNotificationService] Notification decision accepted', {
      zone,
      message: decision.message,
      candidateCount: decision.candidates.length,
    });

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

    if (
      lastGlobalNotificationAt != null &&
      now - lastGlobalNotificationAt < NOTIFICATION_CONFIG.GLOBAL_COOLDOWN_MS
    ) {
      return { notify: false, reason: 'global_cooldown' };
    }

    // Prevent the same discovery from triggering again too soon.
    const canNotifyDiscovery = (discoveryId: string): boolean => {
      const lastNotificationAt = discoveryLastNotificationMap[discoveryId];
      if (!lastNotificationAt) return true;
      return now - lastNotificationAt >= NOTIFICATION_CONFIG.PER_DISCOVERY_COOLDOWN_MS;
    };

    const inRing = (min: number, max: number) =>
      discoveriesWithDistance.filter((item) => item.distanceMeters >= min && item.distanceMeters <= max);
    const candidateItems = (items: typeof discoveriesWithDistance) =>
      items.filter((item) => item.isUncollected && canNotifyDiscovery(item.discovery.id))
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    const ringA = inRing(0, 299);
    const ringB = inRing(300, 500);
    const ringC = inRing(501, 1000);
    const ringBtoC = inRing(300, 1000);
    const horizon = inRing(0, 1000);
    const outerHorizon = inRing(1001, 2000);
    const nearest = (items: typeof discoveriesWithDistance) =>
      items.length ? Math.round(Math.min(...items.map((item) => item.distanceMeters))) : 0;
    const furthest = (items: typeof discoveriesWithDistance) =>
      items.length ? Math.round(Math.max(...items.map((item) => item.distanceMeters))) : 0;
    const distanceRange = (items: typeof discoveriesWithDistance) => {
      const closest = nearest(items);
      const farthest = furthest(items);
      return closest === farthest ? `à ~${closest} m` : `de ~${closest} à ~${farthest} m`;
    };
    const notify = (
      items: typeof discoveriesWithDistance,
      title: string,
      description: string,
      reason: string,
    ): NotificationDecision => {
      const candidates = candidateItems(items);
      return candidates.length
        ? {
            notify: true,
            zone,
            candidates: candidates.slice(0, 3).map((item) => item.discovery),
            message: `${title}\n${description}`,
          }
        : { notify: false, reason };
    };

    if (ringA.length >= 5) {
      return notify(ringA, '🔥 Véritable nid d’art ici !', `Vous êtes entouré·e ! ${ringA.length} œuvres non collectées se trouvent ${distanceRange(ringA)}. Sortez l’appareil photo !`, 'ring_a_no_new_piece');
    }
    if (ringA.length >= 3) {
      return notify(ringA, '👀 Ouvrez l’œil !', `${ringA.length} œuvres non collectées se trouvent ${distanceRange(ringA)}. Saurez-vous les repérer sur la carte ?`, 'ring_a_no_new_piece');
    }
    if (ringB.length >= 7) {
      return notify(ringB, '📍 Alerte quartier d’art !', `Une belle concentration de ${ringB.length} œuvres vous attend ${distanceRange(ringB)}. Prêt·e pour un petit détour ?`, 'ring_b_no_new_piece');
    }
    if (ringB.length >= 5) {
      return notify(ringB, '🎨 De l’art sur votre chemin', `${ringB.length} œuvres intéressantes se profilent ${distanceRange(ringB)}. Gardez votre carte ouverte !`, 'ring_b_no_new_piece');
    }
    if (ringA.length + ringB.length >= 5) {
      const items = [...ringA, ...ringB];
      return notify(items, '🏛️ Terrain de jeu artistique !', `Ce secteur regorge de ${items.length} pépites cachées ${distanceRange(items)}. Baladez-vous pour toutes les ajouter à votre collection !`, 'ring_ab_no_new_piece');
    }
    if (ringA.length + ringB.length >= 4) {
      const items = [...ringA, ...ringB];
      return notify(items, '✨ Une ruelle inspirante tout près', `${items.length} œuvres sont parsemées autour de vous ${distanceRange(items)}. Parfait pour une petite marche d’exploration !`, 'ring_ab_no_new_piece');
    }
    if (ringC.length >= 15) {
      return notify(ringC, '🏢 Cap vers un district culturel !', `${ringC.length} œuvres vous attendent ${distanceRange(ringC)}. Consultez la carte pour planifier votre itinéraire de collectionneur !`, 'ring_c_no_new_piece');
    }
    if (ringC.length >= 10) {
      return notify(ringC, '🗺️ Curiosités à l’horizon...', `${ringC.length} œuvres vous attendent ${distanceRange(ringC)}. Prêt·e pour l’aventure ?`, 'ring_c_no_new_piece');
    }
    if (ringBtoC.length >= 12) {
      return notify(ringBtoC, '🚀 Destination artistique en vue !', `Une belle route culturelle de ${ringBtoC.length} œuvres se dessine ${distanceRange(ringBtoC)}. Sortez votre application pour ne rien manquer.`, 'ring_bc_no_new_piece');
    }
    if (ringBtoC.length >= 7) {
      return notify(ringBtoC, '💎 L’art s’invite dans le paysage', `Un parcours de ${ringBtoC.length} œuvres s’étend ${distanceRange(ringBtoC)}. Gardez l’œil ouvert !`, 'ring_bc_no_new_piece');
    }
    if (horizon.length >= 6) {
      return notify(horizon, '🌿 L’art s’invite dans le paysage', `${horizon.length} œuvres sont dispersées dans les environs ${distanceRange(horizon)}. Gardez l’œil ouvert !`, 'horizon_no_new_piece');
    }
    if (horizon.length >= 4) {
      return notify(horizon, '💎 Un parcours artistique se dessine', `${horizon.length} œuvres se trouvent dans votre horizon ${distanceRange(horizon)}. Gardez l’œil ouvert !`, 'horizon_no_new_piece');
    }
    // Rural fallback: if the 0-1 km horizon is still sparse, two or fewer
    // pieces in the next kilometre mean the user may not find much soon.
    // Three or more outer pieces suggest a better area may be ahead, so stay
    // silent instead.
    if (outerHorizon.filter((item) => item.isUncollected).length <= 2) {
      return notify(
        [...horizon, ...outerHorizon],
        '🌲 Pépite de région en vue !',
        `Une rare œuvre d’art se trouve à l’horizon, ${distanceRange([...horizon, ...outerHorizon])}. Préparez-vous à faire un arrêt découverte !`,
        'rural_fallback_no_new_piece',
      );
    }
    return { notify: false, reason: 'wilderness' };
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

    const [title, ...descriptionParts] = body.split('\n');
    const description = descriptionParts.join('\n') || title;

    // Schedule the notification a moment later so the call behaves consistently.
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 1_000_000),
          title,
          body: description,
          schedule: { at: new Date(Date.now() + 1000) },
          channelId: 'mona-proximity',
          smallIcon: 'ic_launcher',
        },
      ],
    });
  }
}