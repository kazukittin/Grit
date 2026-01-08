import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { WeightLog } from '../types';

interface WeeklyChartProps {
    logs: WeightLog[];
    targetWeight?: number | null;
}

export const WeeklyChart = ({ logs, targetWeight }: WeeklyChartProps) => {
    const { theme } = useTheme();

    // Theme-aware colors
    const tickColor = theme === 'dark' ? '#737373' : '#64748b';
    const dotStrokeColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';

    // Process data to group by date
    const processedData = logs.reduce((acc, log) => {
        const dateStr = log.date;
        const displayDate = new Date(log.date).toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
        });

        if (!acc[dateStr]) {
            acc[dateStr] = { displayDate };
        }

        if (log.time_of_day === 'evening') {
            acc[dateStr].evening = log.weight;
        } else {
            // Default to morning if not specified or explicitly morning
            acc[dateStr].morning = log.weight;
        }

        return acc;
    }, {} as Record<string, { displayDate: string; morning?: number; evening?: number }>);

    // Sort by date and convert to array
    const chartData = Object.keys(processedData)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(date => processedData[date]);

    // Calculate min/max for better chart scaling
    const weights = logs.map(l => l.weight);
    if (targetWeight) weights.push(targetWeight);
    const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 1) : 0;
    const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 1) : 100;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-grit-surface border border-grit-border rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-xs text-grit-text-muted mb-1">{label}</p>
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm font-semibold text-grit-text">
                            <span className={`w-2 h-2 rounded-full ${entry.name === 'morning' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
                            <span>{entry.name === 'morning' ? '朝' : '夜'}:</span>
                            <span>{entry.value.toFixed(1)}kg</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border border-grit-border animate-fade-in backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">週間推移</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-grit-text-muted">朝</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-grit-text-muted">夜</span>
                    </div>
                </div>
            </div>

            {chartData.length > 0 ? (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                            {/* Glow filter for dark mode */}
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: tickColor, fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[minWeight, maxWeight]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: tickColor, fontSize: 12 }}
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

                            {/* Morning Line */}
                            <Line
                                id="morning"
                                name="morning"
                                type="monotone"
                                dataKey="morning"
                                stroke="#f97316"
                                strokeWidth={theme === 'dark' ? 3 : 2}
                                filter={theme === 'dark' ? 'url(#glow)' : undefined}
                                dot={{
                                    fill: '#f97316',
                                    stroke: dotStrokeColor,
                                    strokeWidth: 2,
                                    r: 4,
                                }}
                                activeDot={{
                                    fill: '#f97316',
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 6,
                                }}
                                connectNulls
                            />

                            {/* Evening Line */}
                            <Line
                                id="evening"
                                name="evening"
                                type="monotone"
                                dataKey="evening"
                                stroke="#6366f1"
                                strokeWidth={theme === 'dark' ? 3 : 2}
                                filter={theme === 'dark' ? 'url(#glow)' : undefined}
                                dot={{
                                    fill: '#6366f1',
                                    stroke: dotStrokeColor,
                                    strokeWidth: 2,
                                    r: 4,
                                }}
                                activeDot={{
                                    fill: '#6366f1',
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 6,
                                }}
                                connectNulls
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

