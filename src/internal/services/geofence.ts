import { registerPlugin } from '@capacitor/core';

export interface GeofenceOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  identifier?: string;
}

export interface MonaGeofencePlugin {
  startMonitoring(options: GeofenceOptions): Promise<{ status: string; identifier?: string }>;
  stopMonitoring(): Promise<{ status: string }>;
  requestPermissions(): Promise<{ status: string; granted: boolean }>;
  addListener(eventName: 'geofenceTriggered', listener: (event: any) => void): Promise<{ remove: () => Promise<void> }>;
}

const MonaGeofence = registerPlugin<MonaGeofencePlugin>('MonaGeofence');

/**
 * Starts a native geofence around the given point.
 *
 * In plain English: "Watch a circle around this location. If the user enters or leaves
 * that circle, the phone OS should notify the app so MONA can check whether it is now
 * near an artwork and whether it should send a local notification."
 */
export async function startGeofenceMonitoring(
  latitude: number,
  longitude: number,
  radiusMeters = 1000,
  identifier = 'mona-main-geofence',
): Promise<{ status: string; identifier?: string }> {
  return MonaGeofence.startMonitoring({ latitude, longitude, radiusMeters, identifier });
}

/**
 * Stops the active native geofence so the app no longer listens for location transitions.
 */
export async function stopGeofenceMonitoring(): Promise<{ status: string }> {
  return MonaGeofence.stopMonitoring();
}

/**
 * Requests the platform permission needed to monitor geofences while the app is backgrounded.
 */
export async function requestGeofencePermissions(): Promise<{ status: string; granted: boolean }> {
  return MonaGeofence.requestPermissions();
}

/**
 * Subscribes to geofence transition events emitted by the native platform.
 * This lets the app react when the OS reports a region entry or exit.
 */
export async function onGeofenceTriggered(callback: (event: any) => void): Promise<{ remove: () => Promise<void> } | null> {
  try {
    return await MonaGeofence.addListener('geofenceTriggered', callback);
  } catch (e) {
    console.warn('[MonaGeofence] addListener failed', e);
    return null;
  }
}
