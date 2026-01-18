import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingDown,
    TrendingUp,
    Dumbbell,
    Target,
    Activity,
    ChevronDown,
    ChevronUp,
    BarChart3,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { getWeightLogs, getWorkoutLogs } from '../services/api';
import type { WeightLog, WorkoutLog } from '../types';

interface StatsSummaryProps {
    userId: string;
}

export const StatsSummary = ({ userId }: StatsSummaryProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load last 3 months of data
                const [weights, workouts] = await Promise.all([
                    getWeightLogs(userId, 100),
                    getWorkoutLogs(userId, 100),
                ]);

                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                const startStr = threeMonthsAgo.toISOString().split('T')[0];

                setWeightLogs(weights.filter(w => w.date >= startStr));
                setWorkoutLogs(workouts.filter(w => w.date >= startStr));
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        if (weightLogs.length === 0) {
            return { totalLoss: 0, avgWeight: 0, trend: 'neutral' as const, workoutCount: 0, totalWorkoutMins: 0 };
        }

        const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
        const firstWeight = sortedLogs[0]?.weight || 0;
        const lastWeight = sortedLogs[sortedLogs.length - 1]?.weight || 0;
        const totalLoss = firstWeight - lastWeight;
        const avgWeight = weightLogs.reduce((sum, w) => sum + w.weight, 0) / weightLogs.length;
        const trend = totalLoss > 0 ? 'down' as const : totalLoss < 0 ? 'up' as const : 'neutral' as const;

        const workoutCount = workoutLogs.length;
        const totalWorkoutMins = workoutLogs.reduce((sum, w) => sum + (w.duration_min || 0), 0);

        return { totalLoss, avgWeight, trend, workoutCount, totalWorkoutMins };
    }, [weightLogs, workoutLogs]);

    // Weight chart data
    const weightChartData = useMemo(() => {
        return [...weightLogs]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30) // Last 30 records for cleaner display
            .map((log) => ({
                date: log.date.substring(5),
                weight: log.weight,
            }));
    }, [weightLogs]);

    // Day of week analysis
    const dowChartData = useMemo(() => {
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dowMap = new Map<number, number[]>();
        for (let i = 0; i < 7; i++) {
            dowMap.set(i, []);
        }
        weightLogs.forEach((w) => {
            const dow = new Date(w.date).getDay();
            dowMap.get(dow)!.push(w.weight);
        });

        return Array.from(dowMap.entries()).map(([dow, weights]) => ({
            day: dayNames[dow],
            avgWeight: weights.length > 0 ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)) : null,
        }));
    }, [weightLogs]);

    if (loading) {
        return (
            <div className="bg-grit-surface dark:glass-card rounded-2xl p-4 lg:p-6 border border-grit-border animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-grit-surface-hover rounded" />
                    <div className="h-5 w-24 bg-grit-surface-hover rounded" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-grit-surface-hover rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl border border-grit-border animate-fade-in backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 lg:p-5 flex items-center justify-between hover:bg-grit-surface-hover/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                    <h2 className="text-base lg:text-lg font-semibold text-grit-text">統計サマリー</h2>
                    <span className="text-xs text-grit-text-dim ml-1">過去3ヶ月</span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-grit-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-grit-text-muted" />
                )}
            </button>

            {/* Summary Cards - Always visible */}
            <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    {/* Weight Change */}
                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            {summaryStats.trend === 'down' ? (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-grit-text-muted">体重変化</span>
                        </div>
                        <p className={`text-lg lg:text-xl font-bold ${summaryStats.totalLoss > 0 ? 'text-green-500' : summaryStats.totalLoss < 0 ? 'text-red-500' : 'text-grit-text'}`}>
                            {summaryStats.totalLoss > 0 ? '-' : summaryStats.totalLoss < 0 ? '+' : ''}
                            {Math.abs(summaryStats.totalLoss).toFixed(1)} kg
                        </p>
                    </div>

                    {/* Average Weight */}
                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Target className="w-4 h-4 text-grit-accent" />
                            <span className="text-xs text-grit-text-muted">平均体重</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-grit-text">
                            {summaryStats.avgWeight > 0 ? summaryStats.avgWeight.toFixed(1) : '--'} kg
                        </p>
                    </div>

                    {/* Workout Count */}
                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Dumbbell className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-grit-text-muted">ワークアウト</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-grit-text">{summaryStats.workoutCount} 回</p>
                    </div>

                    {/* Total Workout Time */}
                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-grit-text-muted">運動時間</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-grit-text">
                            {summaryStats.totalWorkoutMins >= 60
                                ? `${Math.round(summaryStats.totalWorkoutMins / 60)} 時間`
                                : `${summaryStats.totalWorkoutMins} 分`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 lg:px-5 pb-4 lg:pb-5 space-y-4 border-t border-grit-border pt-4">
                    {/* Weight Trend Chart */}
                    <div>
                        <h3 className="text-sm font-medium text-grit-text mb-3">体重推移</h3>
                        {weightChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={weightChartData}>
                                    <defs>
                                        <linearGradient id="weightGradientHome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grit-chart-grid)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--color-grit-chart-tick)"
                                        tick={{ fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="var(--color-grit-chart-tick)"
                                        tick={{ fontSize: 10 }}
                                        domain={['dataMin - 1', 'dataMax + 1']}
                                        width={35}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-grit-surface)',
                                            border: '1px solid var(--color-grit-border)',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        fill="url(#weightGradientHome)"
                                        name="体重"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center text-grit-text-muted text-sm">
                                データがありません
                            </div>
                        )}
                    </div>

                    {/* Day of Week Chart */}
                    <div>
                        <h3 className="text-sm font-medium text-grit-text mb-2">曜日別傾向</h3>
                        <p className="text-xs text-grit-text-muted mb-3">
                            どの曜日に体重が変動しやすいか
                        </p>
                        {dowChartData.some(d => d.avgWeight !== null) ? (
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={dowChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grit-chart-grid)" />
                                    <XAxis dataKey="day" stroke="var(--color-grit-chart-tick)" tick={{ fontSize: 10 }} />
                                    <YAxis
                                        stroke="var(--color-grit-chart-tick)"
                                        tick={{ fontSize: 10 }}
                                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                        width={35}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-grit-surface)',
                                            border: '1px solid var(--color-grit-border)',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="avgWeight" fill="#f97316" radius={[4, 4, 0, 0]} name="平均体重" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[150px] flex items-center justify-center text-grit-text-muted text-sm">
                                データがありません
                            </div>
                        )}
                    </div>

                    {/* Link to full stats page */}
                    <button
                        onClick={() => navigate('/stats')}
                        className="w-full py-2.5 text-sm font-medium text-grit-accent hover:text-grit-accent-dark transition-colors"
                    >
                        さらに詳しく分析する →
                    </button>
                </div>
            )}
        </div>
    );
};
