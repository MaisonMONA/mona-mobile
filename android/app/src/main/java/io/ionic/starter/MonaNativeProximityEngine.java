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
    private static final long COOLDOWN_MS = 3 * 60 * 1000L;
    private static final long DAILY_LIMIT = 40L;

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

            if (isQuietHours()) {
                Log.d(TAG, "Native notification skipped because quiet hours are active.");
                return;
            }

            long dailyCount = readLong(preferences, "notif_daily_count");
            if (dailyCount >= DAILY_LIMIT) {
                Log.d(TAG, "Native notification skipped because the daily limit was reached.");
                return;
            }

            JSONObject userData = readJsonObject(context, PREFERENCES_FILE);
            int nearbyCount = 0;
            JSONObject nearest = null;
            double nearestDistance = Double.MAX_VALUE;

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

                    if (result[0] <= 1999) {
                        nearbyCount++;
                    }

                    String type = discovery.optString("dType", fileName.contains("artworks") ? "artwork"
                            : fileName.contains("places") ? "place" : "heritage");
                    int id = discovery.optInt("id", -1);
                    if (id >= 0 && result[0] <= 800 && !isCollected(userData, type, id)
                            && result[0] < nearestDistance) {
                        nearestDistance = result[0];
                        nearest = discovery;
                    }
                }
            }

            if (nearest == null || nearbyCount == 0) {
                Log.d(TAG, "Native proximity check found no eligible nearby discovery.");
                return;
            }

            String title = nearest.optString("title", "une oeuvre d'art");
            MonaNativeNotification.show(context, "MONA", "Une oeuvre d'art est à proximité : " + title);
            preferences.edit()
                    .putString("notif_last_global_at", String.valueOf(now))
                    .putString("notif_daily_count", String.valueOf(dailyCount + 1))
                    .apply();
            Log.d(TAG, "Native proximity notification sent for " + title);
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
     * Checks the same overnight quiet-hours window used by the JavaScript service.
     */
    private static boolean isQuietHours() {
        int hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY);
        return hour >= 21 || hour < 9;
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
}
