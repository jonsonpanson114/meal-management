export interface NotificationSchedule {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  time: string;
}

export class NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async init() {
    if ('serviceWorker' in navigator) {
      this.swRegistration = await navigator.serviceWorker.ready;
    }
  }

  async requestPermission(): Promise<boolean> {
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

  async scheduleNotifications(schedules: NotificationSchedule[]) {
    if (!this.swRegistration) {
      await this.init();
    }

    if (!this.swRegistration) {
      console.error('Service Worker not available');
      return;
    }

    // Clear existing notifications
    await this.clearAllNotifications();

    // Schedule new notifications
    schedules.forEach(schedule => {
      this.swRegistration!.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        mealType: schedule.mealType,
        time: schedule.time,
      });
    });
  }

  async clearAllNotifications() {
    if (!this.swRegistration) {
      await this.init();
    }

    if (!this.swRegistration) {
      return;
    }

    const notifications = await this.swRegistration.getNotifications();
    notifications.forEach(notification => notification.close());
  }

  showNotification(title: string, body: string) {
    if (!this.swRegistration) {
      return;
    }

    this.swRegistration.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
    });
  }

  async checkPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  async isSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }
}

export const notificationManager = new NotificationManager();
