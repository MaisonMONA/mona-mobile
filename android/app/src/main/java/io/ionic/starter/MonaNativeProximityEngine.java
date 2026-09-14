package io.ionic.starter;

import android.content.Context;
import android.content.SharedPreferences;
import android.location.Location;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * Performs the small amount of MONA proximity logic needed when Android wakes
 * the app after the JavaScript process has already been stopped.
 */
public final class MonaNativeProximityEngine {
    private static final String TAG = "MonaNativeProximity";
    private static final String PREFERENCES_FILE = "appdata/preferences.json";
    private static final String[] DISCOVERY_FILES = {
            "appdata/artworks.json",
            "appdata/places.json",
            "appdata/heritages.json"
    };
    // These values mirror MONA's current JavaScript notification settings.
    // Testing value. Use 4 hours for dense areas and 6 hours for sparse areas in production.
    private static final long COOLDOWN_MS = 3 * 60 * 1000L;
    private static final long PER_DISCOVERY_COOLDOWN_MS = 24 * 60 * 60 * 1000L;
    private static final long DAILY_LIMIT = 40L;
    private static final float BASE_NOTIFICATION_RADIUS_METERS = 800f;
    private static final float ACCURACY_BUFFER_START_METERS = 50f;
    private static final float MAX_ACCURACY_BUFFER_METERS = 400f;

    private MonaNativeProximityEngine() {
    }

    /**
     * Checks nearby local discoveries and sends one notification when the rules allow it.
     *
     * The receiver uses this method instead of JavaScript so the check still works
     * when the app was swiped away and the WebView no longer exists.
     */
    public static void checkAndNotify(Context context, Location currentLocation) {
        if (currentLocation == null) {
            Log.w(TAG, "Android woke MONA without a usable location.");
            return;
        }

        try {
            SharedPreferences preferences = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            long now = System.currentTimeMillis();

            // Save the location from this event before checking notification rules.
            // On the next geofence event, this becomes the previous location that
            // MONA can use when comparing how far the user has moved.
            saveLastCheckLocation(preferences, currentLocation, now);

            long lastNotification = readLong(preferences, "notif_last_global_at");
            if (lastNotification > 0 && now - lastNotification < COOLDOWN_MS) {
                Log.d(TAG, "Native notification skipped because the cooldown is still active.");
                return;
            }

            long dailyCount = readLong(preferences, "notif_daily_count");
            if (dailyCount >= DAILY_LIMIT) {
                Log.d(TAG, "Native notification skipped because the daily limit was reached.");
                return;
            }

            JSONObject userData = readJsonObject(context, PREFERENCES_FILE);
            List<DiscoveryDistance> allDiscoveries = new ArrayList<>();
            float notificationRadius = getNotificationRadius(currentLocation);

            for (String fileName : DISCOVERY_FILES) {
                JSONArray discoveries = readJsonArray(context, fileName);
                for (int index = 0; index < discoveries.length(); index++) {
                    JSONObject discovery = discoveries.optJSONObject(index);
                    if (discovery == null) {
                        continue;
                    }

                    JSONObject location = discovery.optJSONObject("location");
                    if (location == null) {
                        continue;
                    }

                    double latitude = location.optDouble("lat", Double.NaN);
                    double longitude = location.optDouble("lng", Double.NaN);
                    if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
                        continue;
                    }

                    float[] result = new float[1];
                    Location.distanceBetween(
                            currentLocation.getLatitude(),
                            currentLocation.getLongitude(),
                            latitude,
                            longitude,
                            result
                    );

                    String type = discovery.optString("dType", fileName.contains("artworks") ? "artwork"
                            : fileName.contains("places") ? "place" : "heritage");
                    int id = discovery.optInt("id", -1);
                    if (id >= 0 && result[0] <= 2000 && !isCollected(userData, type, id)) {
                        allDiscoveries.add(new DiscoveryDistance(discovery, result[0], type, id));
                    }
                }
            }

            List<DiscoveryDistance> eligible = filterRecentlyNotified(preferences, allDiscoveries, now);
            String message = buildRingMessage(eligible);
            if (message == null) {
                Log.d(TAG, "Native proximity check found no eligible nearby discovery.");
                return;
            }

            String[] messageParts = message.split("\\n", 2);
            String title = messageParts[0];
            String description = messageParts.length > 1 ? messageParts[1] : "";
            MonaNativeNotification.show(context, title, description);
            preferences.edit()
                    .putString("notif_last_global_at", String.valueOf(now))
                    .putString("notif_daily_count", String.valueOf(dailyCount + 1))
                    .apply();
            saveRecentlyNotified(preferences, eligible, now);
            Log.d(TAG, "Native proximity notification sent: " + message);
        } catch (Exception error) {
            Log.e(TAG, "Native proximity check failed.", error);
        }
    }

    /**
     * Reads a stored number without crashing when the preference is missing or malformed.
     */
    private static long readLong(SharedPreferences preferences, String key) {
        try {
            return Long.parseLong(preferences.getString(key, "0"));
        } catch (NumberFormatException error) {
            return 0;
        }
    }

    /**
     * Stores the newest geofence location so it becomes the old location on the next check.
     */
    private static void saveLastCheckLocation(
            SharedPreferences preferences,
            Location location,
            long timestamp
    ) {
        preferences.edit()
                .putString("notif_last_check_lat", String.valueOf(location.getLatitude()))
                .putString("notif_last_check_lng", String.valueOf(location.getLongitude()))
                .putString("notif_last_check_at", String.valueOf(timestamp))
                .apply();
    }

    /**
     * Reads a JSON object from MONA's durable application data directory.
     */
    private static JSONObject readJsonObject(Context context, String relativePath) {
        try {
            File file = new File(context.getFilesDir(), relativePath);
            if (!file.exists()) {
                return new JSONObject();
            }
            String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
            return new JSONObject(content);
        } catch (Exception error) {
            Log.w(TAG, "Could not read " + relativePath, error);
            return new JSONObject();
        }
    }

    /**
     * Reads a JSON array from MONA's durable application data directory.
     */
    private static JSONArray readJsonArray(Context context, String relativePath) {
        try {
            File file = new File(context.getFilesDir(), relativePath);
            if (!file.exists()) {
                return new JSONArray();
            }
            String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
            return new JSONArray(content);
        } catch (Exception error) {
            Log.w(TAG, "Could not read " + relativePath, error);
            return new JSONArray();
        }
    }

    /**
     * Looks in collected lists so MONA does not notify again for an already collected item.
     */
    private static boolean isCollected(JSONObject userData, String type, int id) {
        JSONObject collected = userData.optJSONObject("collected");
        if (collected == null) {
            return false;
        }

        JSONArray items = collected.optJSONArray(type + "s");
        if (items == null) {
            return false;
        }

        for (int index = 0; index < items.length(); index++) {
            JSONObject item = items.optJSONObject(index);
            if (item != null && item.optInt("id", -1) == id) {
                return true;
            }
            if (items.optInt(index, -1) == id) {
                return true;
            }
        }
        return false;
    }

    private static List<DiscoveryDistance> filterRecentlyNotified(
            SharedPreferences preferences,
            List<DiscoveryDistance> discoveries,
            long now
    ) {
        JSONObject lastMap = readPreferenceObject(preferences, "notif_piece_last_map");
        List<DiscoveryDistance> result = new ArrayList<>();
        for (DiscoveryDistance discovery : discoveries) {
            long last = lastMap.optLong(discovery.key(), 0);
            if (last == 0 || now - last >= PER_DISCOVERY_COOLDOWN_MS) {
                result.add(discovery);
            }
        }
        return result;
    }

    private static void saveRecentlyNotified(
            SharedPreferences preferences,
            List<DiscoveryDistance> discoveries,
            long now
    ) {
        JSONObject lastMap = readPreferenceObject(preferences, "notif_piece_last_map");
        for (int index = 0; index < Math.min(3, discoveries.size()); index++) {
            try {
                lastMap.put(discoveries.get(index).key(), now);
            } catch (Exception error) {
                Log.w(TAG, "Could not persist per-discovery notification timestamp.", error);
            }
        }
        preferences.edit().putString("notif_piece_last_map", lastMap.toString()).apply();
    }

    private static JSONObject readPreferenceObject(SharedPreferences preferences, String key) {
        try {
            return new JSONObject(preferences.getString(key, "{}"));
        } catch (Exception error) {
            return new JSONObject();
        }
    }

    private static String buildRingMessage(List<DiscoveryDistance> discoveries) {
        List<DiscoveryDistance> ringA = ring(discoveries, 0, 299);
        List<DiscoveryDistance> ringB = ring(discoveries, 300, 500);
        List<DiscoveryDistance> ringC = ring(discoveries, 501, 1000);
        List<DiscoveryDistance> ringBC = ring(discoveries, 300, 1000);
        List<DiscoveryDistance> horizon = ring(discoveries, 0, 1000);
        List<DiscoveryDistance> outerHorizon = ring(discoveries, 1001, 2000);
        if (ringA.size() >= 5) return ringMessage("🔥 Véritable nid d’art ici !",
                "Vous êtes entouré·e ! " + ringA.size() + " œuvres non collectées se trouvent "
                        + distanceRange(ringA) + ". Sortez l’appareil photo !", ringA);
        if (ringA.size() >= 3) return ringMessage("👀 Ouvrez l’œil !",
                ringA.size() + " œuvres non collectées se trouvent " + distanceRange(ringA)
                        + ". Saurez-vous les repérer sur la carte ?", ringA);
        if (ringB.size() >= 7) return ringMessage("📍 Alerte quartier d’art !",
                "Une belle concentration de " + ringB.size() + " œuvres vous attend "
                        + distanceRange(ringB) + ". Prêt·e pour un petit détour ?", ringB);
        if (ringB.size() >= 5) return ringMessage("🎨 De l’art sur votre chemin",
                ringB.size() + " œuvres intéressantes se profilent " + distanceRange(ringB)
                        + ". Gardez votre carte ouverte !", ringB);
        if (ringA.size() + ringB.size() >= 5) {
            List<DiscoveryDistance> items = combine(ringA, ringB);
            return ringMessage("🏛️ Terrain de jeu artistique !",
                    "Ce secteur regorge de " + items.size() + " pépites cachées "
                            + distanceRange(items) + ". Baladez-vous pour toutes les ajouter à votre collection !", items);
        }
        if (ringA.size() + ringB.size() >= 4) {
            List<DiscoveryDistance> items = combine(ringA, ringB);
            return ringMessage("✨ Une ruelle inspirante tout près",
                    items.size() + " œuvres sont parsemées autour de vous " + distanceRange(items)
                            + ". Parfait pour une petite marche d’exploration !", items);
        }
        if (ringC.size() >= 15) return ringMessage("🏢 Cap vers un district culturel !",
                ringC.size() + " œuvres vous attendent " + distanceRange(ringC)
                        + ". Consultez la carte pour planifier votre itinéraire de collectionneur !", ringC);
        if (ringC.size() >= 10) return ringMessage("🗺️ Curiosités à l’horizon...",
                ringC.size() + " œuvres vous attendent " + distanceRange(ringC)
                        + ". Prêt·e pour l’aventure ?", ringC);
        if (ringBC.size() >= 12) return ringMessage("🚀 Destination artistique en vue !",
                "Une belle route culturelle de " + ringBC.size() + " œuvres se dessine "
                        + distanceRange(ringBC) + ". Sortez votre application pour ne rien manquer.", ringBC);
        if (ringBC.size() >= 7) return ringMessage("💎 L’art s’invite dans le paysage",
                "Un parcours de " + ringBC.size() + " œuvres s’étend " + distanceRange(ringBC)
                        + ". Gardez l’œil ouvert !", ringBC);
        if (horizon.size() >= 6) return ringMessage("🌿 L’art s’invite dans le paysage",
                horizon.size() + " œuvres sont dispersées dans les environs "
                        + distanceRange(horizon) + ". Gardez l’œil ouvert !", horizon);
        if (horizon.size() >= 4) return ringMessage("💎 Un parcours artistique se dessine",
                horizon.size() + " œuvres se trouvent dans votre horizon "
                        + distanceRange(horizon) + ". Gardez l’œil ouvert !", horizon);
        // Rural fallback mirrors the JavaScript engine: with fewer than four
        // pieces within 1 km, notify only when the next kilometre has at most
        // two pieces; three or more means better options may be ahead.
        if (!horizon.isEmpty() && outerHorizon.size() <= 2) {
            List<DiscoveryDistance> items = combine(horizon, outerHorizon);
            return ringMessage("🌲 Pépite de région en vue !",
                    "Une rare œuvre d’art se trouve à l’horizon, " + distanceRange(items)
                            + ". Préparez-vous à faire un arrêt découverte !", items);
        }
        return null;
    }

    private static String ringMessage(String title, String description, List<DiscoveryDistance> ring) {
        return title + "\n" + description;
    }

    private static String distanceRange(List<DiscoveryDistance> discoveries) {
        float closest = Float.MAX_VALUE;
        float furthest = 0;
        for (DiscoveryDistance discovery : discoveries) {
            closest = Math.min(closest, discovery.distanceMeters);
            furthest = Math.max(furthest, discovery.distanceMeters);
        }
        long roundedClosest = Math.round(closest);
        long roundedFurthest = Math.round(furthest);
        return roundedClosest == roundedFurthest
                ? "à ~" + roundedClosest + " m"
                : "de ~" + roundedClosest + " à ~" + roundedFurthest + " m";
    }

    private static List<DiscoveryDistance> combine(
            List<DiscoveryDistance> first,
            List<DiscoveryDistance> second
    ) {
        List<DiscoveryDistance> combined = new ArrayList<>(first);
        combined.addAll(second);
        return combined;
    }

    private static List<DiscoveryDistance> ring(
            List<DiscoveryDistance> discoveries,
            float minimum,
            float maximum
    ) {
        List<DiscoveryDistance> result = new ArrayList<>();
        for (DiscoveryDistance discovery : discoveries) {
            if (discovery.distanceMeters >= minimum && discovery.distanceMeters <= maximum) {
                result.add(discovery);
            }
        }
        return result;
    }

    private static final class DiscoveryDistance {
        private final JSONObject discovery;
        private final float distanceMeters;
        private final String type;
        private final int id;

        private DiscoveryDistance(JSONObject discovery, float distanceMeters, String type, int id) {
            this.discovery = discovery;
            this.distanceMeters = distanceMeters;
            this.type = type;
            this.id = id;
        }

        private String key() {
            return type + ":" + id;
        }
    }

    /**
     * MONA stores translated discovery titles as an object. Native notifications
     * always use French, regardless of the phone's language.
     */
    private static String getFrenchTitle(JSONObject discovery) {
        Object rawTitle = discovery.opt("title");
        if (rawTitle instanceof JSONObject) {
            String frenchTitle = ((JSONObject) rawTitle).optString("fr", "").trim();
            if (!frenchTitle.isEmpty()) {
                return frenchTitle;
            }
        } else if (rawTitle instanceof String) {
            String title = ((String) rawTitle).trim();
            if (!title.isEmpty()) {
                return title;
            }
        }
        return "une oeuvre d'art";
    }

    /**
     * Compensates for a weak GPS fix without allowing an inaccurate cell-tower
     * location to expand the notification range without a safety limit.
     */
    private static float getNotificationRadius(Location location) {
        float accuracy = location.getAccuracy();
        if (accuracy <= ACCURACY_BUFFER_START_METERS) {
            return BASE_NOTIFICATION_RADIUS_METERS;
        }

        float buffer = Math.min(
                accuracy - ACCURACY_BUFFER_START_METERS,
                MAX_ACCURACY_BUFFER_METERS
        );
        return BASE_NOTIFICATION_RADIUS_METERS + buffer;
    }
}
