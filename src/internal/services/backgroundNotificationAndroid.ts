import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import type { BackgroundMonitoringAdapter } from './backgroundNotificationPlatform';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation',
  {
    web: () => undefined as any,
  },
);

export function createAndroidBackgroundMonitoringAdapter(): BackgroundMonitoringAdapter {
  return {
    platform: 'android',
    supportsNativeWakeup: Boolean(BackgroundGeolocation && BackgroundGeolocation.addWatcher),
    async start({ distanceFilterM, backgroundTitle = 'MONA', backgroundMessage = "Recherche d'oeuvres d'art", onLocation }) {
      if (!BackgroundGeolocation || !BackgroundGeolocation.addWatcher) {
        console.warn('[AndroidBackgroundMonitoringAdapter] BackgroundGeolocation plugin not available.');
        return null;
      }

      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundTitle,
          backgroundMessage,
          requestPermissions: false,
          stale: false,
          distanceFilter: distanceFilterM,
        },
        async (location, error) => {
          if (error) {
            console.warn('[AndroidBackgroundMonitoringAdapter] Error from native watcher', error);
            return;
          }

          await onLocation(location, error);
        },
      );

      return watcherId ?? null;
    },
    async stop(id) {
      if (!id || !BackgroundGeolocation || !BackgroundGeolocation.removeWatcher) {
        return;
      }

      await BackgroundGeolocation.removeWatcher({ id });
    },
  };
}
