'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyRecord } from '@/types';

export function useWeightHistory(days: number = 30) {
    const [history, setHistory] = useState<DailyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('daily_records')
                .select('date, weight')
                .eq('user_id', user.id)
                .gte('date', startDateStr)
                .not('weight', 'is', null)
                .order('date', { ascending: true });

            if (error) {
                console.error('Error fetching weight history:', error);
            } else {
                setHistory(data as DailyRecord[]);
            }
            setLoading(false);
        }

        fetchHistory();
    }, [days, supabase]);

    return { history, loading };
}
