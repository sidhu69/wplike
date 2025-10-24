import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chatapp.wplike',
  appName: 'ChatApp',
  webDir: 'client/dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
