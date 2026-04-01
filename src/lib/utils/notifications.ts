import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationSchedule {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  time: string;
}

export class NotificationManager {
  async init() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not running on native platform, using web notifications');
      return;
    }

    // Request permissions on init
    await this.requestPermission();
  }

  async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } else {
      // Fallback to web notifications
      if (!('Notification' in window)) {
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    }
  }

  async scheduleNotifications(schedules: NotificationSchedule[]) {
    if (Capacitor.isNativePlatform()) {
      // Clear existing notifications
      await this.clearAllNotifications();

      // Schedule new notifications
      const notifications = schedules.map(schedule => {
        const [hours, minutes] = schedule.time.split(':').map(Number);

        return {
          id: this.getNotificationId(schedule.mealType),
          title: this.getMealTitle(schedule.mealType),
          body: '食事を記録してください',
          schedule: {
            on: {
              hour: hours,
              minute: minutes,
            },
            repeats: true, // Repeated daily
            allowWhileIdle: true,
          },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          largeIcon: 'icon',
        };
      });

      await LocalNotifications.schedule({
        notifications,
      });
    } else {
      // Full background push subscription for Web/PWA
      await this.subscribeToPushNotifications();
    }
  }

  async subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 1. Unsubscribe from existing one if it exists to clean up
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
        console.log('Cleaned up existing subscription before re-subscribing');
      }
      
      // Public VAPID Key from vapid.txt
      const vapidPublicKey = 'BFAqWE2Q_lhxYvPqw1SULEQUx8Go5zLZniTAo2W9oafEFZW9idYB-deF__PGl_kUXD9B-DLW1Ad8k-ioimaC9hA';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) throw new Error('Failed to save subscription');
      console.log('Successfully subscribed to Push Notifications');
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err);
    }
  }

  async unsubscribeFromPushNotifications() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from Push Notifications');
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async clearAllNotifications() {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({
        notifications: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ]
      });
    } else {
      await this.unsubscribeFromPushNotifications();
    }
  }

  async cancelNotification(mealType: 'breakfast' | 'lunch' | 'dinner') {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({
        notifications: [{ id: this.getNotificationId(mealType) }],
      });
    }
  }

  private getNotificationId(mealType: 'breakfast' | 'lunch' | 'dinner'): number {
    const ids = {
      breakfast: 1,
      lunch: 2,
      dinner: 3,
    };
    return ids[mealType];
  }

  private getMealTitle(mealType: 'breakfast' | 'lunch' | 'dinner'): string {
    const titles = {
      breakfast: '🍳 朝食の時間です！',
      lunch: '🍱 昼食の時間です！',
      dinner: '🍙 夕食の時間です！',
    };
    return titles[mealType];
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'> {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.checkPermissions();
      return result.display;
    } else {
      if ('Notification' in window) {
        return Notification.permission as 'granted' | 'denied' | 'prompt';
      }
      return 'denied';
    }
  }

  async isSupported(): Promise<boolean> {
    return Capacitor.isNativePlatform() || ('serviceWorker' in navigator && 'Notification' in window);
  }
}

export const notificationManager = new NotificationManager();
