'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyRecord } from '@/types';

export function useDailyRecord(date?: string) {
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const targetDate = date || new Date().toISOString().split('T')[0];

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('daily_records')
      .select('*')
      .eq('date', targetDate)
      .maybeSingle();

    setRecord(data as DailyRecord | null);
    setLoading(false);
  }, [targetDate]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const saveRecord = async (updates: Partial<DailyRecord>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (record) {
      const { data } = await supabase
        .from('daily_records')
        .update(updates)
        .eq('id', record.id)
        .select()
        .single();
      if (data) setRecord(data as DailyRecord);
    } else {
      const { data } = await supabase
        .from('daily_records')
        .insert({ ...updates, date: targetDate, user_id: user.id })
        .select()
        .single();
      if (data) setRecord(data as DailyRecord);
    }
  };

  return { record, loading, saveRecord, refetch: fetchRecord };
}
