import { BarChart3, TrendingDown, TrendingUp, Minus, CheckCircle } from 'lucide-react';
import type { WeightLog, DailyHabitStatus } from '../types';

interface WeeklyReportProps {
    logs: WeightLog[];
    habits: DailyHabitStatus[];
}

export const WeeklyReport = ({ logs, habits }: WeeklyReportProps) => {
    // Calculate average weight
    const weights = logs.map(l => l.weight);
    const avgWeight = weights.length > 0
        ? weights.reduce((a, b) => a + b, 0) / weights.length
        : null;

    // Calculate weight change (first log vs latest log)
    const weightChange = logs.length >= 2
        ? logs[logs.length - 1].weight - logs[0].weight
        : null;

    // Calculate habit completion rate
    const completedHabits = habits.filter(h => h.completed).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0
        ? Math.round((completedHabits / totalHabits) * 100)
        : 0;

    const getWeightChangeColor = (change: number | null) => {
        if (change === null) return 'text-grit-text-muted';
        if (change < 0) return 'text-grit-positive'; // 減少は良い傾向
        if (change > 0) return 'text-grit-negative'; // 増加は悪い傾向
        return 'text-grit-text-muted';
    };

    const getWeightChangeIcon = (change: number | null) => {
        if (change === null) return <Minus className="w-5 h-5" />;
        if (change < 0) return <TrendingDown className="w-5 h-5" />;
        if (change > 0) return <TrendingUp className="w-5 h-5" />;
        return <Minus className="w-5 h-5" />;
    };

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 80) return 'text-grit-positive';
        if (rate >= 50) return 'text-grit-accent';
        return 'text-grit-text-muted';
    };

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border border-grit-border animate-fade-in backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">週間レポート</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Average Weight */}
                <div className="text-center p-4 rounded-xl bg-grit-surface-hover border border-grit-border">
                    <p className="text-xs text-grit-text-muted mb-2">平均体重</p>
                    {avgWeight !== null ? (
                        <p className="text-xl font-bold text-grit-text">
                            {avgWeight.toFixed(1)}
                            <span className="text-sm text-grit-text-muted ml-0.5">kg</span>
                        </p>
                    ) : (
                        <p className="text-xl font-bold text-grit-text-muted">--</p>
                    )}
                </div>

                {/* Weight Change */}
                <div className="text-center p-4 rounded-xl bg-grit-surface-hover border border-grit-border">
                    <p className="text-xs text-grit-text-muted mb-2">体重変動</p>
                    <div className={`flex items-center justify-center gap-1 ${getWeightChangeColor(weightChange)}`}>
                        {getWeightChangeIcon(weightChange)}
                        <span className="text-xl font-bold">
                            {weightChange !== null
                                ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}`
                                : '--'}
                        </span>
                        {weightChange !== null && (
                            <span className="text-sm">kg</span>
                        )}
                    </div>
                </div>

                {/* Habit Completion Rate */}
                <div className="text-center p-4 rounded-xl bg-grit-surface-hover border border-grit-border">
                    <p className="text-xs text-grit-text-muted mb-2">習慣達成率</p>
                    <div className={`flex items-center justify-center gap-1 ${getCompletionRateColor(completionRate)}`}>
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-xl font-bold">{completionRate}</span>
                        <span className="text-sm">%</span>
                    </div>
                </div>
            </div>

            {/* Summary message */}
            {logs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-grit-border">
                    <p className="text-sm text-center text-grit-text-muted">
                        {weightChange !== null && weightChange < 0 && completionRate >= 50 && (
                            <span className="text-grit-positive">🎉 素晴らしい進捗です！この調子で頑張りましょう！</span>
                        )}
                        {weightChange !== null && weightChange >= 0 && completionRate >= 80 && (
                            <span className="text-grit-accent">💪 習慣は維持できています。結果は後からついてきます！</span>
                        )}
                        {completionRate < 50 && (
                            <span className="text-grit-text-dim">📊 小さな一歩から始めましょう。継続が力になります。</span>
                        )}
                        {(weightChange === null || (weightChange >= 0 && completionRate < 80 && completionRate >= 50)) && (
                            <span>継続は力なり。毎日の積み重ねが大切です。</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};
