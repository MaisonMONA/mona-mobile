import Capacitor
import CoreLocation

@objc(MonaGeofencePlugin)
public class MonaGeofencePlugin: CAPPlugin, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private var monitoredRegion: CLCircularRegion?

    /**
     * Sets up the iOS location manager so it can monitor the geofence even while the app is backgrounded.
     */
    override public func load() {
        super.load()
        locationManager.delegate = self
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }

    /**
     * Requests the location permission required for region monitoring on iOS.
     */
    @objc func requestPermissions(_ call: CAPPluginCall) {
        let status: CLAuthorizationStatus = CLLocationManager.authorizationStatus()
        if status == .notDetermined {
            locationManager.requestAlwaysAuthorization()
        }

        call.resolve([
            "status": "requested",
            "granted": status == .authorizedAlways || status == .authorizedWhenInUse
        ])
    }

    /**
     * Creates a circular region that iOS monitors for entry and exit events.
     * When the device crosses that boundary, the OS notifies the app through the delegate callbacks.
     */
    @objc func startMonitoring(_ call: CAPPluginCall) {
        let latitude = call.getDouble("latitude") ?? 0.0
        let longitude = call.getDouble("longitude") ?? 0.0
        let radiusMeters = call.getDouble("radiusMeters") ?? 1000.0
        let identifier = call.getString("identifier") ?? "mona-main-geofence"

        guard CLLocationManager.locationServicesEnabled() else {
            call.reject("Location services are disabled.")
            return
        }

        if monitoredRegion != nil {
            if let m = monitoredRegion {
                locationManager.stopMonitoring(for: m)
            }
        }

        let region = CLCircularRegion(
            center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
            radius: radiusMeters,
            identifier: identifier
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true
        region.notifyOnEntry = true
        locationManager.startMonitoring(for: region)
        monitoredRegion = region

        call.resolve([
            "status": "started",
            "identifier": identifier
        ])
    }

    /**
     * Stops the monitored region so iOS no longer watches the boundary.
     */
    @objc func stopMonitoring(_ call: CAPPluginCall) {
        if let region = monitoredRegion {
            locationManager.stopMonitoring(for: region)
            monitoredRegion = nil
        }

        call.resolve(["status": "stopped"])
    }

    /**
     * Fired when the user enters the monitored region.
     */
    public func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        notifyListeners("geofenceTriggered", data: [
            "transition": "enter",
            "identifier": region.identifier
        ])
    }

    /**
     * Fired when the user exits the monitored region.
     */
    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        notifyListeners("geofenceTriggered", data: [
            "transition": "exit",
            "identifier": region.identifier
        ])
    }
}
