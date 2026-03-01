'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MealRecord } from '@/types';

export function useMeals(date?: string) {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const targetDate = date || new Date().toISOString().split('T')[0];

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const startOfDay = `${targetDate}T00:00:00`;
    const endOfDay = `${targetDate}T23:59:59`;

    const { data, error } = await supabase
      .from('meal_records')
      .select('*')
      .gte('recorded_at', startOfDay)
      .lte('recorded_at', endOfDay)
      .order('recorded_at', { ascending: true });

    if (!error && data) {
      setMeals(data as MealRecord[]);
    }
    setLoading(false);
  }, [targetDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return { meals, loading, totalCalories, refetch: fetchMeals };
}
