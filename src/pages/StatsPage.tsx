import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    TrendingDown,
    TrendingUp,
    Dumbbell,
    Target,
    BarChart3,
    Activity,
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
import { useAuth } from '../contexts/AuthContext';
import { getWeightLogs, getWorkoutLogs } from '../services/api';
import type { WeightLog, WorkoutLog, MonthlyStats, DayOfWeekStats } from '../types';
import { Skeleton } from '../components/Skeleton';

export function StatsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
    const [dayOfWeekData, setDayOfWeekData] = useState<DayOfWeekStats[]>([]);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Get date ranges based on selected time range
                const now = new Date();
                const startDate = new Date();
                switch (timeRange) {
                    case '1m':
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case '3m':
                        startDate.setMonth(now.getMonth() - 3);
                        break;
                    case '6m':
                        startDate.setMonth(now.getMonth() - 6);
                        break;
                    case '1y':
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                const [weights, workouts] = await Promise.all([
                    getWeightLogs(user.$id, 365),
                    getWorkoutLogs(user.$id, 365),
                ]);

                // Filter by date range
                const startStr = startDate.toISOString().split('T')[0];
                const filteredWeights = weights.filter((w) => w.date >= startStr);
                const filteredWorkouts = workouts.filter((w) => w.date >= startStr);

                setWeightLogs(filteredWeights);
                setWorkoutLogs(filteredWorkouts);

                // Calculate monthly stats
                const monthlyMap = new Map<string, { weights: number[]; workouts: number; workoutMins: number }>();
                filteredWeights.forEach((w) => {
                    const month = w.date.substring(0, 7);
                    if (!monthlyMap.has(month)) {
                        monthlyMap.set(month, { weights: [], workouts: 0, workoutMins: 0 });
                    }
                    monthlyMap.get(month)!.weights.push(w.weight);
                });
                filteredWorkouts.forEach((w) => {
                    const month = w.date.substring(0, 7);
                    if (!monthlyMap.has(month)) {
                        monthlyMap.set(month, { weights: [], workouts: 0, workoutMins: 0 });
                    }
                    const data = monthlyMap.get(month)!;
                    data.workouts++;
                    data.workoutMins += w.duration_min || 0;
                });

                const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.entries())
                    .map(([month, data]) => ({
                        month,
                        avgWeight: data.weights.length > 0 ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null,
                        minWeight: data.weights.length > 0 ? Math.min(...data.weights) : null,
                        maxWeight: data.weights.length > 0 ? Math.max(...data.weights) : null,
                        totalCalories: 0,
                        avgDailyCalories: 0,
                        totalWorkouts: data.workouts,
                        totalWorkoutMinutes: data.workoutMins,
                        habitsCompletionRate: 0,
                    }))
                    .sort((a, b) => a.month.localeCompare(b.month));
                setMonthlyData(monthlyStats);

                // Calculate day of week trends
                const dowMap = new Map<number, { weights: number[]; count: number }>();
                for (let i = 0; i < 7; i++) {
                    dowMap.set(i, { weights: [], count: 0 });
                }
                filteredWeights.forEach((w) => {
                    const dow = new Date(w.date).getDay();
                    const data = dowMap.get(dow)!;
                    data.weights.push(w.weight);
                    data.count++;
                });

                const dowStats: DayOfWeekStats[] = Array.from(dowMap.entries()).map(([dow, data]) => ({
                    dayOfWeek: dow,
                    avgWeight: data.weights.length > 0 ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null,
                    avgCalories: 0,
                    habitsCompletionRate: 0,
                }));
                setDayOfWeekData(dowStats);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, timeRange]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        if (weightLogs.length === 0) {
            return { totalLoss: 0, avgWeight: 0, trend: 'neutral', workoutCount: 0, totalWorkoutMins: 0 };
        }

        const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
        const firstWeight = sortedLogs[0]?.weight || 0;
        const lastWeight = sortedLogs[sortedLogs.length - 1]?.weight || 0;
        const totalLoss = firstWeight - lastWeight;
        const avgWeight = weightLogs.reduce((sum, w) => sum + w.weight, 0) / weightLogs.length;
        const trend = totalLoss > 0 ? 'down' : totalLoss < 0 ? 'up' : 'neutral';

        const workoutCount = workoutLogs.length;
        const totalWorkoutMins = workoutLogs.reduce((sum, w) => sum + (w.duration_min || 0), 0);

        return { totalLoss, avgWeight, trend, workoutCount, totalWorkoutMins };
    }, [weightLogs, workoutLogs]);

    // Prepare chart data
    const weightChartData = useMemo(() => {
        return [...weightLogs]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((log) => ({
                date: log.date.substring(5),
                weight: log.weight,
                bodyFat: log.fat_percentage,
            }));
    }, [weightLogs]);

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dowChartData = dayOfWeekData.map((d) => ({
        day: dayNames[d.dayOfWeek],
        avgWeight: d.avgWeight ? Number(d.avgWeight.toFixed(1)) : null,
    }));

    const TIME_RANGES = [
        { value: '1m', label: '1ヶ月' },
        { value: '3m', label: '3ヶ月' },
        { value: '6m', label: '6ヶ月' },
        { value: '1y', label: '1年' },
    ] as const;

    return (
        <div className="min-h-screen bg-grit-bg pb-6">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-card border-b border-grit-glass-border">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-grit-surface-hover text-grit-text hover:bg-grit-border transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-grit-text">詳細統計</h1>
                            <p className="text-sm text-grit-text-muted">あなたの進捗を分析</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Time Range Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${timeRange === range.value
                                ? 'bg-grit-accent text-white shadow-lg shadow-grit-accent/30'
                                : 'bg-grit-surface-hover text-grit-text-muted hover:text-grit-text'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} variant="rounded" height={100} />
                            ))}
                        </div>
                        <Skeleton variant="rounded" height={300} />
                        <Skeleton variant="rounded" height={250} />
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {summaryStats.trend === 'down' ? (
                                        <TrendingDown className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-sm text-grit-text-muted">体重変化</span>
                                </div>
                                <p
                                    className={`text-2xl font-bold ${summaryStats.totalLoss > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}
                                >
                                    {summaryStats.totalLoss > 0 ? '-' : '+'}
                                    {Math.abs(summaryStats.totalLoss).toFixed(1)} kg
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-grit-accent" />
                                    <span className="text-sm text-grit-text-muted">平均体重</span>
                                </div>
                                <p className="text-2xl font-bold text-grit-text">
                                    {summaryStats.avgWeight.toFixed(1)} kg
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Dumbbell className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm text-grit-text-muted">ワークアウト</span>
                                </div>
                                <p className="text-2xl font-bold text-grit-text">{summaryStats.workoutCount} 回</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm text-grit-text-muted">運動時間</span>
                                </div>
                                <p className="text-2xl font-bold text-grit-text">
                                    {Math.round(summaryStats.totalWorkoutMins / 60)} 時間
                                </p>
                            </motion.div>
                        </div>

                        {/* Weight Trend Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card rounded-2xl p-5"
                        >
                            <h3 className="text-base font-semibold text-grit-text mb-4">体重推移</h3>
                            {weightChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={weightChartData}>
                                        <defs>
                                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grit-chart-grid)" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="var(--color-grit-chart-tick)"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="var(--color-grit-chart-tick)"
                                            tick={{ fontSize: 12 }}
                                            domain={['dataMin - 1', 'dataMax + 1']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--color-grit-surface)',
                                                border: '1px solid var(--color-grit-border)',
                                                borderRadius: '12px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            fill="url(#weightGradient)"
                                            name="体重"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-grit-text-muted">
                                    データがありません
                                </div>
                            )}
                        </motion.div>

                        {/* Day of Week Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card rounded-2xl p-5"
                        >
                            <h3 className="text-base font-semibold text-grit-text mb-4">曜日別傾向</h3>
                            <p className="text-sm text-grit-text-muted mb-4">
                                どの曜日に体重が変動しやすいか分析できます
                            </p>
                            {dowChartData.some((d) => d.avgWeight !== null) ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={dowChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grit-chart-grid)" />
                                        <XAxis dataKey="day" stroke="var(--color-grit-chart-tick)" />
                                        <YAxis
                                            stroke="var(--color-grit-chart-tick)"
                                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--color-grit-surface)',
                                                border: '1px solid var(--color-grit-border)',
                                                borderRadius: '12px',
                                            }}
                                        />
                                        <Bar dataKey="avgWeight" fill="#f97316" radius={[4, 4, 0, 0]} name="平均体重" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-grit-text-muted">
                                    データがありません
                                </div>
                            )}
                        </motion.div>

                        {/* Monthly Comparison */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card rounded-2xl p-5"
                        >
                            <h3 className="text-base font-semibold text-grit-text mb-4">月別サマリー</h3>
                            <div className="space-y-4">
                                {monthlyData.slice(-6).map((month, index) => (
                                    <motion.div
                                        key={month.month}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-grit-surface-hover rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-grit-text">
                                                {month.month.replace('-', '年')}月
                                            </p>
                                            <p className="text-sm text-grit-text-muted">
                                                {month.totalWorkouts}回のワークアウト
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {month.avgWeight && (
                                                <>
                                                    <p className="text-lg font-bold text-grit-text">
                                                        {month.avgWeight.toFixed(1)} kg
                                                    </p>
                                                    <p className="text-xs text-grit-text-muted">
                                                        {month.minWeight?.toFixed(1)} - {month.maxWeight?.toFixed(1)} kg
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
}
