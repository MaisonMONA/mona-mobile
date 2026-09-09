package io.ionic.starter;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;
import com.google.android.gms.location.LocationServices;

import java.util.List;

public class MonaGeofenceReceiver extends BroadcastReceiver {
    private static final String TAG = "MonaGeofenceReceiver";

    /**
     * Called by the Android system when a geofence transition fires for the monitored area.
     */
    @Override
    public void onReceive(Context context, Intent intent) {
        // goAsync gives the receiver a little extra time to finish the native
        // location check before Android considers this wake-up complete.
        final PendingResult pendingResult = goAsync();
        if (intent == null) {
            Log.w(TAG, "Android delivered a geofence callback without an Intent.");
            pendingResult.finish();
            return;
        }

        // Log the action and extras so we can tell whether Android delivered a real
        // geofence event or merely woke the receiver without the expected payload.
        Log.d(TAG, "Received geofence broadcast: action=" + intent.getAction()
                + ", extras=" + intent.getExtras());

        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
        if (geofencingEvent == null) {
            Log.w(TAG, "Android woke the receiver, but the broadcast contained no geofence event data.");
            pendingResult.finish();
            return;
        }

        if (geofencingEvent.hasError()) {
            Log.e(TAG, "Android geofencing reported an error code: "
                    + geofencingEvent.getErrorCode());
            pendingResult.finish();
            return;
        }

        int transition = geofencingEvent.getGeofenceTransition();
        if (transition == Geofence.GEOFENCE_TRANSITION_ENTER || transition == Geofence.GEOFENCE_TRANSITION_EXIT) {
            String transitionName = transition == Geofence.GEOFENCE_TRANSITION_ENTER ? "enter" : "exit";
            Log.d(TAG, "Geofence transition: " + transitionName);

            List<Geofence> geofences = geofencingEvent.getTriggeringGeofences();
            if (geofences == null || geofences.isEmpty()) {
                Log.w(TAG, "Geofence transition arrived without a triggering region.");
                pendingResult.finish();
                return;
            }

            // Prefer the precise location attached to the geofence event. If Android did
            // not include one, use its last known location so the native check can still
            // run after the WebView process has been stopped.
            if (geofencingEvent.getTriggeringLocation() != null) {
                MonaNativeProximityEngine.checkAndNotify(
                        context,
                        geofencingEvent.getTriggeringLocation()
                );
                pendingResult.finish();
            } else {
                Log.w(TAG, "Geofence transition had no triggering location; requesting Android's last known location.");
                LocationServices.getFusedLocationProviderClient(context)
                        .getLastLocation()
                        .addOnSuccessListener(location -> {
                            if (location == null) {
                                Log.w(TAG, "Android did not have a last known location for the native check.");
                                pendingResult.finish();
                                return;
                            }
                            MonaNativeProximityEngine.checkAndNotify(context, location);
                            pendingResult.finish();
                        })
                        .addOnFailureListener(error -> {
                            Log.e(TAG, "Could not read Android's last known location.", error);
                            pendingResult.finish();
                        });
            }

            if (geofences != null) {
                for (Geofence geofence : geofences) {
                    MonaGeofencePlugin.emitGeofenceTransitionToJs(transitionName, geofence.getRequestId());
                }
            }
        } else {
            Log.w(TAG, "Received unsupported geofence transition: " + transition);
            pendingResult.finish();
        }
    }
}
