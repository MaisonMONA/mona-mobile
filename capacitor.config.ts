import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mona.starter',
  appName: 'MONA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
  ,
  android: {
    useLegacyBridge: true
  }
};

export default config;
