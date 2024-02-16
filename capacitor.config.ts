import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mona.starter',
  appName: 'MONA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
