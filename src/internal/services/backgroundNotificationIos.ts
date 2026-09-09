import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import type { BackgroundMonitoringAdapter } from './backgroundNotificationPlatform';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation',
  {
    web: () => undefined as any,
  },
);

export function createIosBackgroundMonitoringAdapter(): BackgroundMonitoringAdapter {
  return {
    platform: 'ios',
    supportsNativeWakeup: Boolean(BackgroundGeolocation && BackgroundGeolocation.addWatcher),
    async start({ distanceFilterM, backgroundTitle = 'MONA', backgroundMessage = 'Recherche d’œuvres à proximité', onLocation }) {
      if (!BackgroundGeolocation || !BackgroundGeolocation.addWatcher) {
        console.warn('[IosBackgroundMonitoringAdapter] BackgroundGeolocation plugin not available.');
        return null;
      }

      console.log('[IosBackgroundMonitoringAdapter] Using native wake-up bridge; iOS will rely on the OS-managed location callback path when available.');

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
            console.warn('[IosBackgroundMonitoringAdapter] Error from native watcher', error);
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
