import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, Circle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
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

    // Track if confetti has already fired for this "all complete" state
    const confettiFiredRef = useRef(false);
    const prevCompletedCountRef = useRef(completedCount);

    useEffect(() => {
        const allComplete = totalCount > 0 && completedCount === totalCount;
        const justCompleted = completedCount > prevCompletedCountRef.current;

        // Fire confetti only when user just completed the last task
        if (allComplete && justCompleted && !confettiFiredRef.current) {
            confettiFiredRef.current = true;

            // Fire confetti with celebratory colors
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#ea580c', '#22c55e', '#fbbf24', '#ef4444'],
            });

            // Second burst for extra celebration
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#f97316', '#ea580c', '#22c55e'],
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#f97316', '#ea580c', '#22c55e'],
                });
            }, 200);
        }

        // Reset confetti flag when tasks become incomplete
        if (!allComplete) {
            confettiFiredRef.current = false;
        }

        prevCompletedCountRef.current = completedCount;
    }, [completedCount, totalCount]);

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-4 lg:p-6 border border-grit-border animate-fade-in backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-grit-accent" />
                    <h2 className="text-base lg:text-lg font-semibold text-grit-text">今日のタスク</h2>
                </div>
                <span className="text-xs lg:text-sm font-medium text-grit-text-muted">
                    {completedCount}/{totalCount}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 lg:h-1.5 bg-grit-border rounded-full mb-4 lg:mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-grit-accent to-grit-accent-dark rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {habits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
                    {habits.map(habitStatus => (
                        <HabitItem
                            key={habitStatus.habit.$id}
                            habitStatus={habitStatus}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-6 lg:py-8 text-center text-grit-text-muted">
                    <p>タスクがありません</p>
                    <p className="text-sm mt-1">設定から追加してください</p>
                </div>
            )}

            {totalCount > 0 && completedCount === totalCount && (
                <div className="mt-3 lg:mt-4 p-3 lg:p-4 rounded-xl bg-gradient-to-r from-grit-accent/20 to-grit-accent-dark/20 border border-grit-accent/30">
                    <p className="text-center text-grit-accent font-semibold text-sm lg:text-base">
                        🎉 全タスク完了！素晴らしい！
                    </p>
                </div>
            )}
        </div>
    );
};
