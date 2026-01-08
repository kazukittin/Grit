import { useState, useMemo, useCallback } from 'react';
import { Dumbbell, Play, Edit3, Coffee, Clock, CheckCircle, Flame, Hash, Layers, Timer, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WorkoutRoutine, WorkoutLog, ExerciseItem } from '../types';
import { DAY_NAMES } from '../types';

interface TodayWorkoutProps {
    routine: WorkoutRoutine | null;
    todayLog: WorkoutLog | null;
    onComplete: (title: string, description: string, durationMin: number) => Promise<void>;
    onEdit: () => void;
}

function parseExercises(description: string): ExerciseItem[] {
    try {
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
            // Backward compatibility: add default unit if missing
            return parsed.map(ex => ({
                ...ex,
                unit: ex.unit || 'reps'
            }));
        }
    } catch {
        // 古い形式のデータの場合は空配列を返す
    }
    return [];
}

export const TodayWorkout = ({ routine, todayLog, onComplete, onEdit }: TodayWorkoutProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayName = DAY_NAMES[dayOfWeek];

    const exercises = useMemo(() => {
        if (!routine) return [];
        return parseExercises(routine.description);
    }, [routine]);

    const totalCalories = useMemo(() => {
        return exercises.reduce((sum, ex) => sum + (ex.calories * ex.sets), 0);
    }, [exercises]);

    const estimatedDuration = useMemo(() => {
        // 1エクササイズあたり約5分と仮定
        return Math.max(exercises.length * 5, 15);
    }, [exercises]);

    // Compute completed count and if all are done
    const completedCount = completedExercises.size;
    const allCompleted = exercises.length > 0 && completedCount === exercises.length;
    const progressPercent = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

    // Toggle exercise completion
    const toggleExercise = useCallback((exerciseId: string) => {
        setCompletedExercises(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exerciseId)) {
                newSet.delete(exerciseId);
            } else {
                newSet.add(exerciseId);
            }
            return newSet;
        });
    }, []);

    const handleQuickComplete = async () => {
        if (!routine || isSubmitting) return;

        setIsSubmitting(true);
        await onComplete(routine.title, routine.description, estimatedDuration);
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
        const logExercises = parseExercises(todayLog.description);
        const logTotalCalories = logExercises.reduce((sum, ex) => sum + (ex.calories * ex.sets), 0);

        return (
            <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border-2 border-grit-positive/50 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-grit-positive" />
                    <h2 className="text-lg font-semibold text-grit-text">Today's Workout</h2>
                    <span className="text-sm text-grit-text-muted ml-auto">{dayName}</span>
                </div>

                <div className="bg-grit-positive/10 rounded-xl p-4 border border-grit-positive/30">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-grit-text">{todayLog.title}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-grit-positive">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{todayLog.duration_min}分</span>
                            </div>
                            {logTotalCalories > 0 && (
                                <div className="flex items-center gap-1 text-orange-400">
                                    <Flame className="w-4 h-4" />
                                    <span className="text-sm font-medium">{logTotalCalories}kcal</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {logExercises.length > 0 && (
                        <div className="space-y-1 mb-3">
                            {logExercises.map((ex, i) => (
                                <div key={ex.id || i} className="text-sm text-grit-text-muted flex items-center gap-2">
                                    <span className="text-grit-positive">✓</span>
                                    <span>{ex.name}</span>
                                    <span className="text-xs text-grit-text-dim">
                                        {ex.reps}{ex.unit === 'seconds' ? '秒' : '回'} × {ex.sets}セット
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

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
            <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border-2 border-grit-accent/50 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">Today's Workout</h2>
                    <span className="text-sm text-grit-text-muted ml-auto">{dayName}</span>
                </div>

                <div className="bg-gradient-to-br from-grit-accent/10 to-grit-accent-dark/10 rounded-xl p-4 border border-grit-accent/30 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-grit-text">{routine.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                            {totalCalories > 0 && (
                                <span className="flex items-center gap-1 text-orange-400">
                                    <Flame className="w-4 h-4" />
                                    {totalCalories}kcal
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-grit-text-muted">
                                <Clock className="w-4 h-4" />
                                約{estimatedDuration}分
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {exercises.length > 0 && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-grit-text-muted">進捗</span>
                                <span className={`font-medium ${allCompleted ? 'text-grit-positive' : 'text-grit-accent'}`}>
                                    {completedCount} / {exercises.length} 完了
                                </span>
                            </div>
                            <div className="h-2 bg-grit-bg rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${allCompleted ? 'bg-grit-positive' : 'bg-grit-accent'}`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {exercises.length > 0 ? (
                        <div className="space-y-2">
                            {exercises.map((ex, i) => {
                                const exerciseKey = ex.id || `ex-${i}`;
                                const isCompleted = completedExercises.has(exerciseKey);

                                return (
                                    <button
                                        key={exerciseKey}
                                        onClick={() => toggleExercise(exerciseKey)}
                                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 text-left ${isCompleted
                                            ? 'bg-grit-positive/10 border border-grit-positive/30'
                                            : 'bg-grit-bg/50 hover:bg-grit-accent/10 border border-transparent'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isCompleted
                                            ? 'bg-grit-positive border-grit-positive text-white'
                                            : 'border-grit-border hover:border-grit-accent'
                                            }`}>
                                            {isCompleted && <Check className="w-4 h-4" />}
                                        </div>

                                        {/* Exercise Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium transition-colors ${isCompleted ? 'text-grit-positive line-through' : 'text-grit-text'
                                                    }`}>
                                                    {ex.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-grit-text-muted mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    {ex.unit === 'seconds' ? (
                                                        <Timer className="w-3 h-3" />
                                                    ) : (
                                                        <Hash className="w-3 h-3" />
                                                    )}
                                                    {ex.reps}{ex.unit === 'seconds' ? '秒' : '回'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Layers className="w-3 h-3" />
                                                    {ex.sets}セット
                                                </span>
                                                <span className="flex items-center gap-1 text-orange-400">
                                                    <Flame className="w-3 h-3" />
                                                    {ex.calories * ex.sets}kcal
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-grit-text-muted">
                            メニューが設定されていません
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleQuickComplete}
                        disabled={isSubmitting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl shadow-lg transition-all ${allCompleted
                            ? 'bg-gradient-to-br from-grit-positive to-green-600 text-white shadow-grit-positive/30 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white shadow-grit-accent/30 hover:scale-[1.02] active:scale-[0.98]'
                            } disabled:opacity-50`}
                    >
                        {allCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                ワークアウト完了！記録する
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                {completedCount > 0 ? `${completedCount}種目完了・記録する` : '完了して記録'}
                            </>
                        )}
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
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border border-grit-border animate-fade-in backdrop-blur-xl">
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
