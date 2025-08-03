import { Geolocation } from '@capacitor/geolocation';

export class LocationService {
  private static readonly DEFAULT_ACCURACY = 10; // Default accuracy in meters when not provided by GPS
  private static watchId: string | null = null;
  private static currentPosition: { lat: number, lng: number, accuracy: number } | null = null;
  private static callbacks: Set<(position: { lat: number, lng: number, accuracy: number }) => void> = new Set();

  /**
   * Start continuous location tracking
   */
  static async startWatching(): Promise<void> {
    if (this.watchId) {
      console.log('Location watching already started');
      return;
    }

    try {
      // Request permissions first
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Start watching position with optimized settings
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000, // Use cached position if less than 5 seconds old
        },
        (position, err) => {
          if (err) {
            console.error('Location watch error:', err);
            return;
          }

          if (position) {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy || LocationService.DEFAULT_ACCURACY,
            };

            this.currentPosition = newPosition;

            // Notify all callbacks
            this.callbacks.forEach(callback => {
              try {
                callback(newPosition);
              } catch (error) {
                console.error('Error in location callback:', error);
              }
            });
          }
        }
      );

      console.log('Location watching started with ID:', this.watchId);
    } catch (error) {
      console.error('Failed to start location watching:', error);
      throw error;
    }
  }

  /**
   * Stop location watching
   */
  static async stopWatching(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      console.log('Location watching stopped');
    }
  }

  /**
   * Get current position (from cache if available)
   */
  static getCurrentPosition(): { lat: number, lng: number, accuracy: number } | null {
    return this.currentPosition;
  }

  /**
   * Get current position as [lng, lat] array for OpenLayers
   */
  static getCurrentLocationArray(): [number, number] | null {
    if (!this.currentPosition) return null;
    return [this.currentPosition.lng, this.currentPosition.lat];
  }

  /**
   * Subscribe to location updates
   */
  static subscribe(callback: (position: { lat: number, lng: number, accuracy: number }) => void): () => void {
    this.callbacks.add(callback);
    
    // If we already have a position, call the callback immediately
    if (this.currentPosition) {
      callback(this.currentPosition);
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get one-time position (fallback for when watch isn't available)
   */
  static async getOneTimePosition(): Promise<{ lat: number, lng: number, accuracy: number }> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy || LocationService.DEFAULT_ACCURACY,
      };
    } catch (error) {
      console.error('Failed to get one-time position:', error);
      throw error;
    }
  }

  /**
   * Check if location watching is active
   */
  static isWatching(): boolean {
    return this.watchId !== null;
  }
}
