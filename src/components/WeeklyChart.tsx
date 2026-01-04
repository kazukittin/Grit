import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { WeightLog } from '../types';

interface WeeklyChartProps {
    logs: WeightLog[];
    targetWeight?: number | null;
}

export const WeeklyChart = ({ logs, targetWeight }: WeeklyChartProps) => {
    const chartData = logs.map(log => ({
        date: new Date(log.date).toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
        }),
        weight: log.weight,
    }));

    // Calculate min/max for better chart scaling
    const weights = logs.map(l => l.weight);
    if (targetWeight) weights.push(targetWeight);
    const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 1) : 0;
    const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 1) : 100;

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-grit-surface border border-grit-border rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-grit-text font-semibold">
                        {payload[0].value.toFixed(1)}kg
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">週間推移</h2>
                </div>
                <span className="text-sm text-grit-text-muted">直近7日間</span>
            </div>

            {chartData.length > 0 ? (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#737373', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[minWeight, maxWeight]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#737373', fontSize: 12 }}
                                dx={-5}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Target weight line */}
                            {targetWeight && (
                                <ReferenceLine
                                    y={targetWeight}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{
                                        value: '目標',
                                        position: 'right',
                                        fill: '#ef4444',
                                        fontSize: 12,
                                    }}
                                />
                            )}

                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#f97316"
                                strokeWidth={3}
                                dot={{
                                    fill: '#f97316',
                                    stroke: '#0a0a0a',
                                    strokeWidth: 2,
                                    r: 5,
                                }}
                                activeDot={{
                                    fill: '#f97316',
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 7,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 flex items-center justify-center">
                    <p className="text-grit-text-muted">データがありません</p>
                </div>
            )}
        </div>
    );
};
