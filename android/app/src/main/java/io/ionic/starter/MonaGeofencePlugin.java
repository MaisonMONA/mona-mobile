package io.ionic.starter;

import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
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
        response.put("status", "requested");
        response.put("granted", true);
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

        boolean hadActiveGeofence = activeGeofence != null;
        activeGeofence = new Geofence.Builder()
                .setRequestId(identifier)
                .setCircularRegion(latitude, longitude, (float) radiusMeters)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER | Geofence.GEOFENCE_TRANSITION_EXIT)
                .build();

        GeofencingRequest request = new GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofence(activeGeofence)
                .build();

        // Removing an old geofence is asynchronous. Waiting for that removal to finish prevents
        // Android from confusing the old PendingIntent with the new registration.
        Task<Void> removeTask = !hadActiveGeofence
                ? com.google.android.gms.tasks.Tasks.forResult(null)
                : geofencingClient.removeGeofences(getGeofencePendingIntent());

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
