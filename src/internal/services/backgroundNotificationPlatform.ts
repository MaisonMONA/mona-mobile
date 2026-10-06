import { Capacitor } from '@capacitor/core';
import { createAndroidBackgroundMonitoringAdapter } from './backgroundNotificationAndroid';
import { createIosBackgroundMonitoringAdapter } from './backgroundNotificationIos';

export type BackgroundMonitoringPlatformName = 'android' | 'ios' | 'fallback';

export type BackgroundMonitoringLocationCallback = (
  location: any,
  error?: any,
) => Promise<void> | void;

export interface BackgroundMonitoringAdapter {
  readonly platform: BackgroundMonitoringPlatformName;
  readonly supportsNativeWakeup: boolean;
  start(options: {
    distanceFilterM: number;
    backgroundTitle?: string;
    backgroundMessage?: string;
    onLocation: BackgroundMonitoringLocationCallback;
  }): Promise<string | null>;
  stop(id?: string | null): Promise<void>;
}

export function createFallbackBackgroundMonitoringAdapter(): BackgroundMonitoringAdapter {
  return {
    platform: 'fallback',
    supportsNativeWakeup: false,
    async start() {
      console.warn('[BackgroundNotificationPlatform] Fallback adapter active; no native wake-up path available in this runtime.');
      return null;
    },
    async stop() {
      return;
    },
  };
}

export function getBackgroundMonitoringPlatform(): BackgroundMonitoringAdapter {
  switch (Capacitor.getPlatform()) {
    case 'android':
      return createAndroidBackgroundMonitoringAdapter();
    case 'ios':
      return createIosBackgroundMonitoringAdapter();
    default:
      return createFallbackBackgroundMonitoringAdapter();
  }
}
