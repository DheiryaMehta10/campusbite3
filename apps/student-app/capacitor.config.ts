import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unibite.student',
  appName: 'UniBite Student',
  webDir: 'public',
  server: {
    url: 'https://student-app-xi-bice.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ea580c',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
  },
};

export default config;
