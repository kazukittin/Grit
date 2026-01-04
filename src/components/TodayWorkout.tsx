import { useState } from 'react';
import { Dumbbell, Play, Edit3, Coffee, Clock, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WorkoutRoutine, WorkoutLog } from '../types';
import { DAY_NAMES } from '../types';

interface TodayWorkoutProps {
    routine: WorkoutRoutine | null;
    todayLog: WorkoutLog | null;
    onComplete: (title: string, description: string, durationMin: number) => Promise<void>;
    onEdit: () => void;
}

export const TodayWorkout = ({ routine, todayLog, onComplete, onEdit }: TodayWorkoutProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayName = DAY_NAMES[dayOfWeek];

    const handleQuickComplete = async () => {
        if (!routine || isSubmitting) return;

        setIsSubmitting(true);
        await onComplete(routine.title, routine.description, 30); // Default 30 minutes
        setIsSubmitting(false);

        // Fire celebratory confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f97316', '#ea580c', '#22c55e', '#fbbf24'],
        });
    };

    // Already completed today
    if (todayLog) {
        return (
            <div className="bg-grit-surface rounded-2xl p-6 border-2 border-grit-positive/50 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-grit-positive" />
                    <h2 className="text-lg font-semibold text-grit-text">Today's Workout</h2>
                    <span className="text-sm text-grit-text-muted ml-auto">{dayName}</span>
                </div>

                <div className="bg-grit-positive/10 rounded-xl p-4 border border-grit-positive/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-grit-text">{todayLog.title}</h3>
                            {todayLog.description && (
                                <p className="text-sm text-grit-text-muted mt-1">{todayLog.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-grit-positive">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{todayLog.duration_min}分</span>
                        </div>
                    </div>
                    <p className="text-center text-grit-positive font-semibold mt-4">
                        🎉 完了済み！お疲れ様でした！
                    </p>
                </div>
            </div>
        );
    }

    // Has routine for today
    if (routine) {
        return (
            <div className="bg-grit-surface rounded-2xl p-6 border-2 border-grit-accent/50 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">Today's Workout</h2>
                    <span className="text-sm text-grit-text-muted ml-auto">{dayName}</span>
                </div>

                <div className="bg-gradient-to-br from-grit-accent/10 to-grit-accent-dark/10 rounded-xl p-4 border border-grit-accent/30 mb-4">
                    <h3 className="text-xl font-bold text-grit-text">{routine.title}</h3>
                    {routine.description && (
                        <p className="text-sm text-grit-text-muted mt-2 whitespace-pre-line">
                            {routine.description}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleQuickComplete}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                        <Play className="w-5 h-5" />
                        完了して記録
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-3 bg-grit-surface-hover border border-grit-border text-grit-text font-medium rounded-xl hover:bg-grit-border/50 transition-colors flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        編集
                    </button>
                </div>
            </div>
        );
    }

    // Rest day or no routine set
    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-grit-text-muted" />
                <h2 className="text-lg font-semibold text-grit-text">Today's Workout</h2>
                <span className="text-sm text-grit-text-muted ml-auto">{dayName}</span>
            </div>

            <div className="text-center py-6">
                <p className="text-grit-text-muted mb-4">
                    今日はスケジュールされたワークアウトはありません
                </p>
                <p className="text-sm text-grit-text-dim mb-4">
                    休息日として過ごすか、フリーワークアウトを記録できます
                </p>
                <button
                    onClick={onEdit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-grit-surface-hover border border-grit-border text-grit-text font-medium rounded-xl hover:bg-grit-border/50 transition-colors"
                >
                    <Edit3 className="w-4 h-4" />
                    フリーワークアウトを記録
                </button>
            </div>
        </div>
    );
};
