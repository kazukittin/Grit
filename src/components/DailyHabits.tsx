import { useState, useCallback } from 'react';
import { Check, Circle, Zap } from 'lucide-react';
import type { DailyHabitStatus } from '../types';

interface DailyHabitsProps {
    habits: DailyHabitStatus[];
    onToggle: (habitId: string, completed: boolean) => void;
}

const HabitItem = ({
    habitStatus,
    onToggle,
}: {
    habitStatus: DailyHabitStatus;
    onToggle: (habitId: string, completed: boolean) => void;
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const { habit, completed } = habitStatus;

    const handleToggle = useCallback(() => {
        if (!completed) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
        onToggle(habit.$id, !completed);
    }, [completed, habit.$id, onToggle]);

    return (
        <button
            onClick={handleToggle}
            className={`
        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
        border
        ${completed
                    ? 'bg-grit-accent/10 border-grit-accent/30'
                    : 'bg-grit-surface-hover border-grit-border hover:border-grit-text-dim'
                }
      `}
        >
            <div
                className={`
          w-7 h-7 rounded-full flex items-center justify-center transition-all
          ${isAnimating ? 'animate-check-pulse' : ''}
          ${completed
                        ? 'bg-grit-accent text-white'
                        : 'border-2 border-grit-text-dim'
                    }
        `}
            >
                {completed ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                    <Circle className="w-4 h-4 opacity-0" />
                )}
            </div>
            <span
                className={`
          text-base font-medium transition-colors
          ${completed ? 'text-grit-text line-through opacity-60' : 'text-grit-text'}
        `}
            >
                {habit.title}
            </span>
        </button>
    );
};

export const DailyHabits = ({ habits, onToggle }: DailyHabitsProps) => {
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">今日のタスク</h2>
                </div>
                <span className="text-sm font-medium text-grit-text-muted">
                    {completedCount}/{totalCount}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-grit-border rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-grit-accent to-grit-accent-dark rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {habits.length > 0 ? (
                <div className="space-y-3">
                    {habits.map(habitStatus => (
                        <HabitItem
                            key={habitStatus.habit.$id}
                            habitStatus={habitStatus}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-grit-text-muted">
                    <p>タスクがありません</p>
                    <p className="text-sm mt-1">設定から追加してください</p>
                </div>
            )}

            {totalCount > 0 && completedCount === totalCount && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-grit-accent/20 to-grit-accent-dark/20 border border-grit-accent/30">
                    <p className="text-center text-grit-accent font-semibold">
                        🎉 全タスク完了！素晴らしい！
                    </p>
                </div>
            )}
        </div>
    );
};
