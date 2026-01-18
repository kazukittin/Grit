import { useState, useEffect, useMemo } from 'react';
import {
    TrendingDown,
    TrendingUp,
    Dumbbell,
    Target,
    Activity,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Calendar,
    CheckCircle,
    Minus,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { getWeightLogs, getWorkoutLogs } from '../services/api';
import type { WeightLog, WorkoutLog, DailyHabitStatus } from '../types';

interface StatsSummaryProps {
    userId: string;
    weeklyLogs?: WeightLog[];
    habits?: DailyHabitStatus[];
    targetWeight?: number | null;
}

type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
    { value: '1w', label: '1週間' },
    { value: '1m', label: '1ヶ月' },
    { value: '3m', label: '3ヶ月' },
    { value: '6m', label: '6ヶ月' },
    { value: '1y', label: '1年' },
];

export const StatsSummary = ({ userId, weeklyLogs = [], habits = [], targetWeight }: StatsSummaryProps) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('1w');
    const [allWeightLogs, setAllWeightLogs] = useState<WeightLog[]>([]);
    const [allWorkoutLogs, setAllWorkoutLogs] = useState<WorkoutLog[]>([]);

    // Month navigation state
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Theme-aware colors
    const tickColor = theme === 'dark' ? '#737373' : '#64748b';
    const dotStrokeColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [weights, workouts] = await Promise.all([
                    getWeightLogs(userId, 365),
                    getWorkoutLogs(userId, 365),
                ]);

                setAllWeightLogs(weights);
                setAllWorkoutLogs(workouts);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    // Get start date based on time range
    const getStartDate = (range: TimeRange): string => {
        const now = new Date();
        const startDate = new Date();
        switch (range) {
            case '1w':
                startDate.setDate(now.getDate() - 7);
                break;
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
        return startDate.toISOString().split('T')[0];
    };

    // Filtered logs based on time range
    const filteredWeightLogs = useMemo(() => {
        const startStr = getStartDate(timeRange);
        return allWeightLogs.filter(w => w.date >= startStr);
    }, [allWeightLogs, timeRange]);

    const filteredWorkoutLogs = useMemo(() => {
        const startStr = getStartDate(timeRange);
        return allWorkoutLogs.filter(w => w.date >= startStr);
    }, [allWorkoutLogs, timeRange]);

    // Weekly chart data (from weeklyLogs prop for 1w, or filtered for longer periods)
    const weeklyChartData = useMemo(() => {
        const logs = timeRange === '1w' ? weeklyLogs : filteredWeightLogs;

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
                acc[dateStr].morning = log.weight;
            }

            return acc;
        }, {} as Record<string, { displayDate: string; morning?: number; evening?: number }>);

        return Object.keys(processedData)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map(date => processedData[date]);
    }, [weeklyLogs, filteredWeightLogs, timeRange]);

    // Calculate min/max for chart scaling
    const chartMinMax = useMemo(() => {
        const logs = timeRange === '1w' ? weeklyLogs : filteredWeightLogs;
        const weights = logs.map(l => l.weight);
        if (targetWeight) weights.push(targetWeight);
        const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 1) : 0;
        const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 1) : 100;
        return { minWeight, maxWeight };
    }, [weeklyLogs, filteredWeightLogs, targetWeight, timeRange]);

    // Weekly report calculations
    const weeklyReportStats = useMemo(() => {
        const logs = timeRange === '1w' ? weeklyLogs : filteredWeightLogs;
        const weights = logs.map(l => l.weight);
        const avgWeight = weights.length > 0
            ? weights.reduce((a, b) => a + b, 0) / weights.length
            : null;

        const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
        const weightChange = sortedLogs.length >= 2
            ? sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight
            : null;

        const completedHabits = habits.filter(h => h.completed).length;
        const totalHabits = habits.length;
        const completionRate = totalHabits > 0
            ? Math.round((completedHabits / totalHabits) * 100)
            : 0;

        return { avgWeight, weightChange, completionRate };
    }, [weeklyLogs, filteredWeightLogs, habits, timeRange]);

    // Calculate monthly stats
    const monthlyData = useMemo(() => {
        const monthlyMap = new Map<string, { weights: number[]; workouts: number; workoutMins: number }>();

        allWeightLogs.forEach((w) => {
            const month = w.date.substring(0, 7);
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, { weights: [], workouts: 0, workoutMins: 0 });
            }
            monthlyMap.get(month)!.weights.push(w.weight);
        });

        allWorkoutLogs.forEach((w) => {
            const month = w.date.substring(0, 7);
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, { weights: [], workouts: 0, workoutMins: 0 });
            }
            const data = monthlyMap.get(month)!;
            data.workouts++;
            data.workoutMins += w.duration_min || 0;
        });

        const months = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                avgWeight: data.weights.length > 0 ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null,
                minWeight: data.weights.length > 0 ? Math.min(...data.weights) : null,
                maxWeight: data.weights.length > 0 ? Math.max(...data.weights) : null,
                totalWorkouts: data.workouts,
                totalWorkoutMinutes: data.workoutMins,
                weightChange: null as number | null,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        for (let i = 1; i < months.length; i++) {
            if (months[i].avgWeight !== null && months[i - 1].avgWeight !== null) {
                months[i].weightChange = months[i].avgWeight! - months[i - 1].avgWeight!;
            }
        }

        return months;
    }, [allWeightLogs, allWorkoutLogs]);

    const availableMonths = useMemo(() => monthlyData.map(m => m.month), [monthlyData]);
    const currentMonthStats = useMemo(() => monthlyData.find(m => m.month === selectedMonth) || null, [monthlyData, selectedMonth]);

    const goToPreviousMonth = () => {
        const currentIndex = availableMonths.indexOf(selectedMonth);
        if (currentIndex > 0) setSelectedMonth(availableMonths[currentIndex - 1]);
    };

    const goToNextMonth = () => {
        const currentIndex = availableMonths.indexOf(selectedMonth);
        if (currentIndex < availableMonths.length - 1) setSelectedMonth(availableMonths[currentIndex + 1]);
    };

    const canGoPrevious = availableMonths.indexOf(selectedMonth) > 0;
    const canGoNext = availableMonths.indexOf(selectedMonth) < availableMonths.length - 1;

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return `${year}年${parseInt(month)}月`;
    };

    const getTimeRangeLabel = (range: TimeRange) => TIME_RANGES.find(r => r.value === range)?.label || '';

    // Summary stats for the selected time range
    const summaryStats = useMemo(() => {
        if (filteredWeightLogs.length === 0) {
            return { totalLoss: 0, avgWeight: 0, trend: 'neutral' as const, workoutCount: 0, totalWorkoutMins: 0 };
        }

        const sortedLogs = [...filteredWeightLogs].sort((a, b) => a.date.localeCompare(b.date));
        const firstWeight = sortedLogs[0]?.weight || 0;
        const lastWeight = sortedLogs[sortedLogs.length - 1]?.weight || 0;
        const totalLoss = firstWeight - lastWeight;
        const avgWeight = filteredWeightLogs.reduce((sum, w) => sum + w.weight, 0) / filteredWeightLogs.length;
        const trend = totalLoss > 0 ? 'down' as const : totalLoss < 0 ? 'up' as const : 'neutral' as const;

        const workoutCount = filteredWorkoutLogs.length;
        const totalWorkoutMins = filteredWorkoutLogs.reduce((sum, w) => sum + (w.duration_min || 0), 0);

        return { totalLoss, avgWeight, trend, workoutCount, totalWorkoutMins };
    }, [filteredWeightLogs, filteredWorkoutLogs]);

    // Day of week analysis
    const dowChartData = useMemo(() => {
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dowMap = new Map<number, number[]>();
        for (let i = 0; i < 7; i++) dowMap.set(i, []);
        filteredWeightLogs.forEach((w) => {
            const dow = new Date(w.date).getDay();
            dowMap.get(dow)!.push(w.weight);
        });

        return Array.from(dowMap.entries()).map(([dow, weights]) => ({
            day: dayNames[dow],
            avgWeight: weights.length > 0 ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)) : null,
        }));
    }, [filteredWeightLogs]);

    // Custom tooltip for weekly chart
    const WeeklyChartTooltip = ({ active, payload, label }: any) => {
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

    const getWeightChangeColor = (change: number | null) => {
        if (change === null) return 'text-grit-text-muted';
        if (change < 0) return 'text-green-500';
        if (change > 0) return 'text-red-500';
        return 'text-grit-text-muted';
    };

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 80) return 'text-green-500';
        if (rate >= 50) return 'text-grit-accent';
        return 'text-grit-text-muted';
    };

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
                    <span className="text-xs text-grit-text-dim ml-1">{getTimeRangeLabel(timeRange)}</span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-grit-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-grit-text-muted" />
                )}
            </button>

            {/* Time Range Selector */}
            <div className="px-4 lg:px-5 pb-3">
                <div className="flex gap-1.5 overflow-x-auto">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTimeRange(range.value);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${timeRange === range.value
                                ? 'bg-grit-accent text-white'
                                : 'bg-grit-surface-hover text-grit-text-muted hover:text-grit-text'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
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

                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Target className="w-4 h-4 text-grit-accent" />
                            <span className="text-xs text-grit-text-muted">平均体重</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-grit-text">
                            {summaryStats.avgWeight > 0 ? summaryStats.avgWeight.toFixed(1) : '--'} kg
                        </p>
                    </div>

                    <div className="bg-grit-surface-hover rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Dumbbell className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-grit-text-muted">ワークアウト</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-grit-text">{summaryStats.workoutCount} 回</p>
                    </div>

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
                    {/* Weekly Chart (Line Chart with Morning/Evening) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-grit-text">体重推移</h3>
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
                        {weeklyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
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
                                        tick={{ fill: tickColor, fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[chartMinMax.minWeight, chartMinMax.maxWeight]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: tickColor, fontSize: 10 }}
                                        dx={-5}
                                        width={35}
                                    />
                                    <Tooltip content={<WeeklyChartTooltip />} />
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
                                                fontSize: 10,
                                            }}
                                        />
                                    )}
                                    <Line
                                        name="morning"
                                        type="monotone"
                                        dataKey="morning"
                                        stroke="#f97316"
                                        strokeWidth={theme === 'dark' ? 3 : 2}
                                        filter={theme === 'dark' ? 'url(#glow)' : undefined}
                                        dot={{ fill: '#f97316', stroke: dotStrokeColor, strokeWidth: 2, r: 4 }}
                                        activeDot={{ fill: '#f97316', stroke: '#fff', strokeWidth: 2, r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        name="evening"
                                        type="monotone"
                                        dataKey="evening"
                                        stroke="#6366f1"
                                        strokeWidth={theme === 'dark' ? 3 : 2}
                                        filter={theme === 'dark' ? 'url(#glow)' : undefined}
                                        dot={{ fill: '#6366f1', stroke: dotStrokeColor, strokeWidth: 2, r: 4 }}
                                        activeDot={{ fill: '#6366f1', stroke: '#fff', strokeWidth: 2, r: 6 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center text-grit-text-muted text-sm">
                                データがありません
                            </div>
                        )}
                    </div>

                    {/* Weekly Report Stats */}
                    <div>
                        <h3 className="text-sm font-medium text-grit-text mb-3">レポート</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-3 rounded-xl bg-grit-bg border border-grit-border">
                                <p className="text-xs text-grit-text-muted mb-1">平均体重</p>
                                {weeklyReportStats.avgWeight !== null ? (
                                    <p className="text-lg font-bold text-grit-text">
                                        {weeklyReportStats.avgWeight.toFixed(1)}
                                        <span className="text-xs text-grit-text-muted ml-0.5">kg</span>
                                    </p>
                                ) : (
                                    <p className="text-lg font-bold text-grit-text-muted">--</p>
                                )}
                            </div>
                            <div className="text-center p-3 rounded-xl bg-grit-bg border border-grit-border">
                                <p className="text-xs text-grit-text-muted mb-1">体重変動</p>
                                <div className={`flex items-center justify-center gap-1 ${getWeightChangeColor(weeklyReportStats.weightChange)}`}>
                                    {weeklyReportStats.weightChange !== null ? (
                                        weeklyReportStats.weightChange < 0 ? <TrendingDown className="w-4 h-4" /> :
                                            weeklyReportStats.weightChange > 0 ? <TrendingUp className="w-4 h-4" /> :
                                                <Minus className="w-4 h-4" />
                                    ) : <Minus className="w-4 h-4" />}
                                    <span className="text-lg font-bold">
                                        {weeklyReportStats.weightChange !== null
                                            ? `${weeklyReportStats.weightChange > 0 ? '+' : ''}${weeklyReportStats.weightChange.toFixed(1)}`
                                            : '--'}
                                    </span>
                                    {weeklyReportStats.weightChange !== null && <span className="text-xs">kg</span>}
                                </div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-grit-bg border border-grit-border">
                                <p className="text-xs text-grit-text-muted mb-1">習慣達成率</p>
                                <div className={`flex items-center justify-center gap-1 ${getCompletionRateColor(weeklyReportStats.completionRate)}`}>
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-lg font-bold">{weeklyReportStats.completionRate}</span>
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                        </div>
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

                    {/* Monthly Summary */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-grit-accent" />
                                <h3 className="text-sm font-medium text-grit-text">月別サマリー</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={goToPreviousMonth}
                                    disabled={!canGoPrevious}
                                    className="p-1.5 rounded-lg hover:bg-grit-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-grit-text-muted" />
                                </button>
                                <span className="text-sm font-medium text-grit-text min-w-[90px] text-center">
                                    {formatMonth(selectedMonth)}
                                </span>
                                <button
                                    onClick={goToNextMonth}
                                    disabled={!canGoNext}
                                    className="p-1.5 rounded-lg hover:bg-grit-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-grit-text-muted" />
                                </button>
                            </div>
                        </div>

                        {currentMonthStats ? (
                            <div className="bg-grit-bg rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-grit-text-muted">平均体重</span>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-grit-text">
                                            {currentMonthStats.avgWeight?.toFixed(1) ?? '--'} kg
                                        </span>
                                        {currentMonthStats.weightChange !== null && (
                                            <span className={`ml-2 text-xs font-medium ${currentMonthStats.weightChange < 0 ? 'text-green-500' : currentMonthStats.weightChange > 0 ? 'text-red-500' : 'text-grit-text-muted'}`}>
                                                {currentMonthStats.weightChange > 0 ? '+' : ''}{currentMonthStats.weightChange.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {currentMonthStats.minWeight !== null && currentMonthStats.maxWeight !== null && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-grit-text-muted">体重範囲</span>
                                        <span className="text-sm text-grit-text">
                                            {currentMonthStats.minWeight.toFixed(1)} - {currentMonthStats.maxWeight.toFixed(1)} kg
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-grit-text-muted">ワークアウト</span>
                                    <span className="text-sm font-medium text-grit-text">
                                        {currentMonthStats.totalWorkouts} 回
                                        {currentMonthStats.totalWorkoutMinutes > 0 && (
                                            <span className="text-grit-text-muted ml-1">
                                                ({currentMonthStats.totalWorkoutMinutes >= 60
                                                    ? `${Math.round(currentMonthStats.totalWorkoutMinutes / 60)}時間`
                                                    : `${currentMonthStats.totalWorkoutMinutes}分`})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-grit-bg rounded-xl p-4 text-center text-sm text-grit-text-muted">
                                この月のデータはありません
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
