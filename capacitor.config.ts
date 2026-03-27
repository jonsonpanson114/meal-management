import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mealtrack.app',
  appName: 'MealTrack',
  webDir: '.next',
  server: {
    // ローカル開発時はlocalhost、本番ではVercelのURL
    url: process.env.CAPACITOR_WEB_URL || 'http://192.168.1.5:3000',
    cleartext: true
  }
};

export default config;
