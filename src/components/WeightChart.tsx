'use client';

import { useMemo } from 'react';

interface Props {
    data: { date: string; weight: number }[];
    height?: number;
}

export default function WeightChart({ data, height = 200 }: Props) {
    const chartPoints = useMemo(() => {
        if (data.length < 2) return null;

        const weights = data.map(d => d.weight);
        const maxWeight = Math.max(...weights) + 1;
        const minWeight = Math.min(...weights) - 1;
        const range = maxWeight - minWeight;

        const width = 1000;
        const datePoints = data.length;
        const stepX = width / (datePoints - 1);

        const points = data.map((d, i) => {
            const x = i * stepX;
            const y = height - ((d.weight - minWeight) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return { points, minWeight, maxWeight };
    }, [data, height]);

    if (!chartPoints || data.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium italic">
                    {data.length === 1 ? 'データがまだ足りません（あと1日分！）' : '体重の記録がありません。'}
                </p>
            </div>
        );
    }

    const { points } = chartPoints;

    return (
        <div className="w-full">
            <div className="relative" style={{ height: `${height}px` }}>
                <svg
                    viewBox={`0 0 1000 ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Fill Area Gradient */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Path background fill */}
                    <path
                        d={`M 0,${height} L ${points} L 1000,${height} Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Grid lines (optional - keeping it clean first) */}
                    <line x1="0" y1="0" x2="1000" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1={height / 2} x2="1000" y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1={height} x2="1000" y2={height} stroke="#f1f5f9" strokeWidth="2" />

                    {/* Main Line */}
                    <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="drop-shadow-sm"
                    />

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const weights = data.map(w => w.weight);
                        const range = Math.max(...weights) + 1 - (Math.min(...weights) - 1);
                        const x = i * (1000 / (data.length - 1));
                        const y = height - ((d.weight - (Math.min(...weights) - 1)) / range) * height;

                        return (
                            <g key={d.date}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="12"
                                    fill="white"
                                    stroke="#f97316"
                                    strokeWidth="4"
                                    className="transition-all hover:r-16"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Labels (simplistic version) */}
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold px-1">
                    <span>{data[0].date.split('-')[2]}日</span>
                    <span>{data[Math.floor(data.length / 2)].date.split('-')[2]}日</span>
                    <span>{data[data.length - 1].date.split('-')[2]}日</span>
                </div>
            </div>
        </div>
    );
}
