import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mona.starter',
  appName: 'MONA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    navigationBarBackgroundColor: '#1f1f1f',
    navigationBarStyle: 'dark'
  }
};

export default config;
