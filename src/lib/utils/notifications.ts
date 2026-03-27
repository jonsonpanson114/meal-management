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
      // Fallback to web notifications (Service Worker)
      console.warn('Native notifications not available, use web notifications instead');
    }
  }

  async clearAllNotifications() {
    if (Capacitor.isNativePlatform()) {
      // Cancel all notification IDs (1, 2, 3 for breakfast, lunch, dinner)
      await LocalNotifications.cancel({
        notifications: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ]
      });
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
