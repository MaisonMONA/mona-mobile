package io.ionic.starter;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import android.location.Location;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import androidx.core.content.ContextCompat;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "MonaGeofence")
public class MonaGeofencePlugin extends Plugin {
    private static final String TAG = "MonaGeofencePlugin";

    // We keep one copy of the plugin instance so the Android receiver can call back into the app
    // after the OS wakes us up. Without this, the native Android system would detect the geofence,
    // but the JS app would never know that it fired.
    private static MonaGeofencePlugin instance;

    // Android geofencing service that registers the actual boundary we want to watch.
    private GeofencingClient geofencingClient;

    // This is the broadcast we send to Android when the geofence is triggered.
    private PendingIntent geofencePendingIntent;

    // The one circular geofence that MONA currently watches.
    private Geofence activeGeofence;

    /**
     * Sends the geofence event from native Android code back into the JavaScript side.
     *
     * In plain English: the phone detects a geofence crossing, this method tells the app
     * "the user entered or left the monitored zone", and the JS layer can then decide whether
     * to run the existing MONA notification logic.
     */
    public static void emitGeofenceTransitionToJs(String transition, String identifier) {
        if (instance == null) {
            Log.w(TAG, "Geofence event emitted before plugin instance was attached to the bridge.");
            return;
        }

        JSObject payload = new JSObject();
        payload.put("transition", transition);
        payload.put("identifier", identifier);
        instance.notifyListeners("geofenceTriggered", payload);
    }

    /**
     * Called once the plugin is created.
     *
     * This is the startup point where we grab the Android geofencing client. Once this is ready,
     * we can tell Android to watch a circular area around a location and wake the app when the
     * device crosses the boundary.
     */
    @Override
    public void load() {
        super.load();
        instance = this;
        geofencingClient = LocationServices.getGeofencingClient(getContext());
    }

    /**
     * Answers the app's request for geofence permission status.
     *
     * In practice, Android still handles the actual permission flow and OS-level checks, but this
     * method gives the JS side a simple response so the app knows whether the geofence layer is
     * allowed to start monitoring.
     */
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        JSObject response = new JSObject();
        boolean foregroundGranted = ContextCompat.checkSelfPermission(
                getContext(),
                "android.permission.ACCESS_FINE_LOCATION"
        ) == PackageManager.PERMISSION_GRANTED;
        boolean backgroundGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                || ContextCompat.checkSelfPermission(
                        getContext(),
                        "android.permission.ACCESS_BACKGROUND_LOCATION"
                ) == PackageManager.PERMISSION_GRANTED;

        if (foregroundGranted && !backgroundGranted) {
            // Android 11+ requires the user to enable "Allow all the time" from
            // the app's location settings instead of showing it in the first prompt.
            Intent settingsIntent = new Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getContext().getPackageName())
            );
            settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(settingsIntent);
        }

        response.put("status", backgroundGranted ? "granted" : "settings");
        response.put("granted", foregroundGranted && backgroundGranted);
        call.resolve(response);
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        boolean foregroundGranted = ContextCompat.checkSelfPermission(
                getContext(),
                "android.permission.ACCESS_FINE_LOCATION"
        ) == PackageManager.PERMISSION_GRANTED;
        boolean backgroundGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                || ContextCompat.checkSelfPermission(
                        getContext(),
                        "android.permission.ACCESS_BACKGROUND_LOCATION"
                ) == PackageManager.PERMISSION_GRANTED;

        JSObject response = new JSObject();
        response.put("foregroundGranted", foregroundGranted);
        response.put("backgroundGranted", backgroundGranted);
        call.resolve(response);
    }

    /**
     * Creates the geofence boundary around the current point.
     *
     * Think of it like this: "watch a circle around this artwork area." If the user walks into or
     * away from that circle, Android will wake the app and call our receiver. This is the OS-native
     * wake-up path that JS background watchers cannot reliably rely on after the app has been
     * swiped away.
     */
    @PluginMethod
    public void startMonitoring(PluginCall call) {
        double latitude = call.getDouble("latitude", 0.0);
        double longitude = call.getDouble("longitude", 0.0);
        double radiusMeters = call.getDouble("radiusMeters", 1000.0);
        String identifier = call.getString("identifier", "mona-main-geofence");

        if (latitude == 0.0 && longitude == 0.0) {
            call.reject("Invalid geofence center.");
            return;
        }

        activeGeofence = new Geofence.Builder()
                .setRequestId(identifier)
                .setCircularRegion(latitude, longitude, (float) radiusMeters)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(
                        Geofence.GEOFENCE_TRANSITION_ENTER
                                | Geofence.GEOFENCE_TRANSITION_EXIT
                )
                .build();

        GeofencingRequest request = new GeofencingRequest.Builder()
                // Do not check merely because MONA opened while the user is
                // already inside the newly registered 1 km monitoring area.
                // Notifications should follow a real movement boundary event.
                .setInitialTrigger(0)
                .addGeofence(activeGeofence)
                .build();

        // Removing an old geofence is asynchronous. Waiting for that removal to finish prevents
        // Android from confusing the old PendingIntent with the new registration.
        // The Android process may have been recreated while the OS retained
        // the old geofence, so remove by PendingIntent even if activeGeofence
        // is null in this new plugin instance.
        Task<Void> removeTask = geofencingClient.removeGeofences(getGeofencePendingIntent());

        removeTask.addOnCompleteListener(ignored -> registerGeofence(request, identifier, call));
    }

    /**
     * Registers the new boundary only after any previous boundary has been removed.
     */
    private void registerGeofence(GeofencingRequest request, String identifier, PluginCall call) {
        geofencingClient.addGeofences(request, getGeofencePendingIntent())
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG, "Geofence added successfully for " + identifier);
                    JSObject response = new JSObject();
                    response.put("status", "started");
                    response.put("identifier", identifier);
                    call.resolve(response);
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Failed to add geofence", e);
                    call.reject("Could not add geofence", e);
                });
    }

    /**
     * Re-centers the permanent geofence after Android wakes the receiver.
     * This keeps the 1 km movement trigger working without a continuous watcher.
     */
    public static void rearmFromReceiver(Context context, Location location) {
        if (location == null) {
            return;
        }

        Context appContext = context.getApplicationContext();
        GeofencingClient client = LocationServices.getGeofencingClient(appContext);
        Intent intent = new Intent(appContext, MonaGeofenceReceiver.class);
        intent.setAction("com.mona.MonaGeofence.TRIGGER");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getBroadcast(appContext, 0, intent, flags);

        Geofence geofence = new Geofence.Builder()
                .setRequestId("mona-main-geofence")
                .setCircularRegion(location.getLatitude(), location.getLongitude(), 1000f)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(
                        Geofence.GEOFENCE_TRANSITION_ENTER
                                | Geofence.GEOFENCE_TRANSITION_EXIT
                )
                .build();
        GeofencingRequest request = new GeofencingRequest.Builder()
                // Do not fire an immediate enter event for the new center.
                .setInitialTrigger(0)
                .addGeofence(geofence)
                .build();

        client.removeGeofences(pendingIntent).addOnCompleteListener(ignored ->
                client.addGeofences(request, pendingIntent)
                        .addOnSuccessListener(ignoredAdd ->
                                Log.d(TAG, "Native receiver re-armed the 1 km geofence."))
                        .addOnFailureListener(error ->
                                Log.e(TAG, "Native receiver could not re-arm the geofence.", error))
        );
    }

    /**
     * Stops the geofence monitoring.
     *
     * This is the cleanup step: we tell Android to stop watching the boundary so the app no longer
     * receives wake-up events from that area.
     */
    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        try {
            if (geofencingClient != null) {
                geofencingClient.removeGeofences(getGeofencePendingIntent());
            }
            activeGeofence = null;
            JSObject response = new JSObject();
            response.put("status", "stopped");
            call.resolve(response);
        } catch (Exception e) {
            call.reject("Failed to stop geofence monitoring", e);
        }
    }

    /**
     * Builds the Android broadcast we register with the geofence system.
     *
     * This is the "doorbell" Android uses to wake us up. When the user crosses the boundary,
     * Android sends this PendingIntent to the receiver, and the receiver can then decide what to do.
     */
    private PendingIntent getGeofencePendingIntent() {
        if (geofencePendingIntent != null) {
            return geofencePendingIntent;
        }

        Intent intent = new Intent(getContext(), MonaGeofenceReceiver.class);
        intent.setAction("com.mona.MonaGeofence.TRIGGER");

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android's geofencing service must be able to add the transition payload
            // (enter/exit and triggering regions) before delivering this broadcast.
            // An immutable PendingIntent can arrive with extras=null on newer Android versions.
            flags |= PendingIntent.FLAG_MUTABLE;
        }

        geofencePendingIntent = PendingIntent.getBroadcast(getContext(), 0, intent, flags);
        return geofencePendingIntent;
    }
}
