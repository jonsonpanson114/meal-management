import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mealtrack.app',
  appName: 'MealTrack',
  webDir: '.next',
  server: {
    // 本番環境はVercel、ローカル開発時は環境変数で上書き可
    url: process.env.CAPACITOR_WEB_URL || 'https://meal-management.vercel.app',
    cleartext: true
  }
};

export default config;
