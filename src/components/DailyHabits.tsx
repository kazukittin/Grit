import { useState, useCallback } from 'react';
import { Check, Circle, Zap } from 'lucide-react';
import type { Habit } from '../types';

interface DailyHabitsProps {
    habits: Habit[];
    onToggle: (id: string) => void;
}

const HabitItem = ({
    habit,
    onToggle,
}: {
    habit: Habit;
    onToggle: (id: string) => void;
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = useCallback(() => {
        if (!habit.completed) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
        onToggle(habit.id);
    }, [habit.completed, habit.id, onToggle]);

    return (
        <button
            onClick={handleToggle}
            className={`
        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
        border
        ${habit.completed
                    ? 'bg-grit-accent/10 border-grit-accent/30'
                    : 'bg-grit-surface-hover border-grit-border hover:border-grit-text-dim'
                }
      `}
        >
            <div
                className={`
          w-7 h-7 rounded-full flex items-center justify-center transition-all
          ${isAnimating ? 'animate-check-pulse' : ''}
          ${habit.completed
                        ? 'bg-grit-accent text-white'
                        : 'border-2 border-grit-text-dim'
                    }
        `}
            >
                {habit.completed ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                    <Circle className="w-4 h-4 opacity-0" />
                )}
            </div>
            <span
                className={`
          text-base font-medium transition-colors
          ${habit.completed ? 'text-grit-text line-through opacity-60' : 'text-grit-text'}
        `}
            >
                {habit.name}
            </span>
        </button>
    );
};

export const DailyHabits = ({ habits, onToggle }: DailyHabitsProps) => {
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const progress = (completedCount / totalCount) * 100;

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

            <div className="space-y-3">
                {habits.map(habit => (
                    <HabitItem key={habit.id} habit={habit} onToggle={onToggle} />
                ))}
            </div>

            {completedCount === totalCount && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-grit-accent/20 to-grit-accent-dark/20 border border-grit-accent/30">
                    <p className="text-center text-grit-accent font-semibold">
                        🎉 全タスク完了！素晴らしい！
                    </p>
                </div>
            )}
        </div>
    );
};
