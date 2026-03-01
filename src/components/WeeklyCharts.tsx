'use client';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyData } from '@/types';

interface Props {
  data: WeeklyData[];
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const FOCUS_LABELS: Record<number, string> = {
  1: '😴',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🤩',
};

export default function WeeklyCharts({ data }: Props) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    calories: d.total_calories,
    weight: d.weight,
    focus: d.focus_level,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl shadow-lg px-3 py-2 text-xs border border-gray-100">
        <p className="font-bold text-gray-600 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}{p.unit || ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calorie Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-4 gradient-primary rounded-full inline-block" />
          カロリー推移
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="calories"
              name="カロリー"
              unit="kcal"
              radius={[6, 6, 0, 0]}
              fill="url(#calorieGradient)"
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weight Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-4 gradient-green rounded-full inline-block" />
          体重推移
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              name="体重"
              unit="kg"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#weightGradient)"
              dot={{ fill: '#34d399', r: 4, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Focus Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-4 gradient-purple rounded-full inline-block" />
          集中力推移
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const val = payload[0].value as number;
                return (
                  <div className="bg-white rounded-xl shadow-lg px-3 py-2 text-xs border border-gray-100">
                    <p className="font-bold text-gray-600">{label}</p>
                    <p className="text-purple-500 font-semibold">
                      {FOCUS_LABELS[val] || val} (レベル {val})
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="focus"
              name="集中力"
              stroke="url(#focusGradient)"
              strokeWidth={2.5}
              dot={{ fill: '#a78bfa', r: 4, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
