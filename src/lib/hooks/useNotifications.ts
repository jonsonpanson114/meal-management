'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NotificationSettings } from '@/lib/types/notifications';

export function useNotifications() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadNotificationSettings();
    checkNotificationPermission();
  }, []);

  const loadNotificationSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setNotificationSettings(data);
    setLoading(false);
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return false;
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotificationSettings(data);
      return true;
    }
    return false;
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        alert('通知を有効にするには、通知許可が必要です');
        return false;
      }
    }

    return await updateNotificationSettings({ enabled });
  };

  const updateMealTime = async (mealType: 'breakfast' | 'lunch' | 'dinner', time: string) => {
    const timeField = `${mealType}_time` as keyof NotificationSettings;
    return await updateNotificationSettings({ [timeField]: time });
  };

  return {
    notificationSettings,
    permission,
    loading,
    requestPermission,
    toggleNotifications,
    updateMealTime,
    refreshSettings: loadNotificationSettings,
  };
}
