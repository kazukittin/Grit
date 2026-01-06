import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Save, Trash2, Loader2, Plus, X, Dumbbell, Flame, Hash, Layers } from 'lucide-react';
import type { WorkoutRoutine, ExerciseItem } from '../types';
import { DAY_NAMES } from '../types';

interface WorkoutScheduleSettingsProps {
    routines: WorkoutRoutine[];
    onSave: (dayOfWeek: number, title: string, description: string) => Promise<void>;
    onDelete: (routineId: string) => Promise<void>;
}

interface DayFormState {
    title: string;
    exercises: ExerciseItem[];
    isDirty: boolean;
    isSaving: boolean;
}

// 事前に定義された筋トレメニューオプション
const PRESET_EXERCISES = [
    '腕立て伏せ',
    'スクワット',
    'プランク',
    '腹筋',
    'バーピー',
    'ランジ',
    'デッドリフト',
    'ベンチプレス',
    'ショルダープレス',
    'ラットプルダウン',
    'レッグプレス',
    'カーフレイズ',
    'バイセップカール',
    'トライセップディップス',
    'ランニング',
    'バイク',
    'ジャンピングジャック',
    'マウンテンクライマー',
];

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function parseExercises(description: string): ExerciseItem[] {
    try {
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch {
        // 古い形式のデータの場合は空配列を返す
    }
    return [];
}

function serializeExercises(exercises: ExerciseItem[]): string {
    return JSON.stringify(exercises);
}

export const WorkoutScheduleSettings = ({
    routines,
    onSave,
    onDelete
}: WorkoutScheduleSettingsProps) => {
    const [dayForms, setDayForms] = useState<Record<number, DayFormState>>({});
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [newExerciseName, setNewExerciseName] = useState('');

    // Initialize form state from routines
    useEffect(() => {
        const forms: Record<number, DayFormState> = {};
        for (let i = 0; i < 7; i++) {
            const routine = routines.find(r => r.day_of_week === i);
            forms[i] = {
                title: routine?.title || '',
                exercises: routine ? parseExercises(routine.description) : [],
                isDirty: false,
                isSaving: false,
            };
        }
        setDayForms(forms);
    }, [routines]);

    const handleTitleChange = useCallback((day: number, value: string) => {
        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                title: value,
                isDirty: true,
            },
        }));
    }, []);

    const handleAddExercise = useCallback((day: number, name: string) => {
        if (!name.trim()) return;

        const newExercise: ExerciseItem = {
            id: generateId(),
            name: name.trim(),
            reps: 10,
            sets: 3,
            calories: 50,
        };

        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: [...prev[day].exercises, newExercise],
                isDirty: true,
            },
        }));
        setNewExerciseName('');
    }, []);

    const handleUpdateExercise = useCallback((day: number, exerciseId: string, field: keyof ExerciseItem, value: string | number) => {
        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, [field]: value } : ex
                ),
                isDirty: true,
            },
        }));
    }, []);

    const handleRemoveExercise = useCallback((day: number, exerciseId: string) => {
        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.filter(ex => ex.id !== exerciseId),
                isDirty: true,
            },
        }));
    }, []);

    const handleSave = useCallback(async (day: number) => {
        const form = dayForms[day];
        if (!form || form.isSaving) return;

        setDayForms(prev => ({
            ...prev,
            [day]: { ...prev[day], isSaving: true },
        }));

        await onSave(day, form.title, serializeExercises(form.exercises));

        setDayForms(prev => ({
            ...prev,
            [day]: { ...prev[day], isDirty: false, isSaving: false },
        }));
    }, [dayForms, onSave]);

    const handleDelete = useCallback(async (day: number) => {
        const routine = routines.find(r => r.day_of_week === day);
        if (!routine) return;

        if (!confirm(`${DAY_NAMES[day]}のワークアウトを削除しますか？`)) return;

        await onDelete(routine.$id);

        setDayForms(prev => ({
            ...prev,
            [day]: { title: '', exercises: [], isDirty: false, isSaving: false },
        }));
    }, [routines, onDelete]);

    const getDayRoutine = (day: number) => routines.find(r => r.day_of_week === day);

    const getTotalCalories = (exercises: ExerciseItem[]) => {
        return exercises.reduce((sum, ex) => sum + (ex.calories * ex.sets), 0);
    };

    return (
        <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">週間スケジュール設定</h2>
            </div>

            <p className="text-sm text-grit-text-muted mb-6">
                曜日ごとのトレーニングメニューを設定できます。エクササイズごとに回数・セット数・消費カロリーを入力してください。
            </p>

            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                    const routine = getDayRoutine(day);
                    const form = dayForms[day] || { title: '', exercises: [], isDirty: false, isSaving: false };
                    const isExpanded = expandedDay === day;
                    const hasContent = form.title.trim() || form.exercises.length > 0 || routine;
                    const totalCalories = getTotalCalories(form.exercises);

                    return (
                        <div
                            key={day}
                            className={`rounded-xl border transition-colors ${hasContent
                                ? 'border-grit-accent/30 bg-grit-accent/5'
                                : 'border-grit-border bg-grit-bg'
                                }`}
                        >
                            {/* Day Header */}
                            <button
                                onClick={() => setExpandedDay(isExpanded ? null : day)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-semibold ${hasContent ? 'text-grit-accent' : 'text-grit-text'}`}>
                                        {DAY_NAMES[day]}
                                    </span>
                                    {routine ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-grit-text-muted">
                                                {routine.title}
                                            </span>
                                            {form.exercises.length > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-grit-accent bg-grit-accent/10 px-2 py-0.5 rounded-full">
                                                    <Dumbbell className="w-3 h-3" />
                                                    {form.exercises.length}種目
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-grit-text-dim">
                                            休息日
                                        </span>
                                    )}
                                </div>
                                <span className="text-grit-text-muted text-sm">
                                    {isExpanded ? '閉じる' : '編集'}
                                </span>
                            </button>

                            {/* Expanded Form */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 space-y-4">
                                            {/* Title Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                                    トレーニング名
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.title}
                                                    onChange={(e) => handleTitleChange(day, e.target.value)}
                                                    placeholder="例: 胸の日、下半身、有酸素"
                                                    className="w-full px-4 py-3 bg-grit-surface border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                                />
                                            </div>

                                            {/* Exercises List */}
                                            <div>
                                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                                    筋トレメニュー
                                                </label>

                                                {form.exercises.length > 0 && (
                                                    <div className="space-y-2 mb-3">
                                                        {form.exercises.map((exercise, index) => (
                                                            <div
                                                                key={exercise.id}
                                                                className="flex items-center gap-2 p-3 bg-grit-bg rounded-xl border border-grit-border"
                                                            >
                                                                <span className="text-xs text-grit-text-dim w-5">
                                                                    {index + 1}.
                                                                </span>

                                                                {/* Exercise Name */}
                                                                <input
                                                                    type="text"
                                                                    value={exercise.name}
                                                                    onChange={(e) => handleUpdateExercise(day, exercise.id, 'name', e.target.value)}
                                                                    className="flex-1 min-w-0 px-2 py-1.5 bg-transparent border-b border-grit-border text-grit-text text-sm focus:outline-none focus:border-grit-accent"
                                                                    placeholder="エクササイズ名"
                                                                />

                                                                {/* Reps */}
                                                                <div className="flex items-center gap-1">
                                                                    <Hash className="w-3 h-3 text-grit-text-dim" />
                                                                    <input
                                                                        type="number"
                                                                        value={exercise.reps}
                                                                        onChange={(e) => handleUpdateExercise(day, exercise.id, 'reps', parseInt(e.target.value) || 0)}
                                                                        className="w-12 px-1 py-1 bg-grit-surface-hover border border-grit-border rounded text-center text-sm text-grit-text focus:outline-none focus:border-grit-accent"
                                                                        min="1"
                                                                    />
                                                                    <span className="text-xs text-grit-text-dim">回</span>
                                                                </div>

                                                                {/* Sets */}
                                                                <div className="flex items-center gap-1">
                                                                    <Layers className="w-3 h-3 text-grit-text-dim" />
                                                                    <input
                                                                        type="number"
                                                                        value={exercise.sets}
                                                                        onChange={(e) => handleUpdateExercise(day, exercise.id, 'sets', parseInt(e.target.value) || 0)}
                                                                        className="w-10 px-1 py-1 bg-grit-surface-hover border border-grit-border rounded text-center text-sm text-grit-text focus:outline-none focus:border-grit-accent"
                                                                        min="1"
                                                                    />
                                                                    <span className="text-xs text-grit-text-dim">セット</span>
                                                                </div>

                                                                {/* Calories per set */}
                                                                <div className="flex items-center gap-1">
                                                                    <Flame className="w-3 h-3 text-orange-400" />
                                                                    <input
                                                                        type="number"
                                                                        value={exercise.calories}
                                                                        onChange={(e) => handleUpdateExercise(day, exercise.id, 'calories', parseInt(e.target.value) || 0)}
                                                                        className="w-14 px-1 py-1 bg-grit-surface-hover border border-grit-border rounded text-center text-sm text-grit-text focus:outline-none focus:border-grit-accent"
                                                                        min="0"
                                                                    />
                                                                    <span className="text-xs text-grit-text-dim">kcal</span>
                                                                </div>

                                                                {/* Remove Button */}
                                                                <button
                                                                    onClick={() => handleRemoveExercise(day, exercise.id)}
                                                                    className="p-1.5 text-grit-text-dim hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        {/* Total Calories */}
                                                        <div className="flex items-center justify-end gap-2 pt-2 text-sm">
                                                            <span className="text-grit-text-muted">合計消費カロリー:</span>
                                                            <span className="font-semibold text-orange-400">
                                                                {totalCalories} kcal
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Add Exercise */}
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={newExerciseName}
                                                            onChange={(e) => setNewExerciseName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleAddExercise(day, newExerciseName);
                                                                }
                                                            }}
                                                            placeholder="エクササイズを追加..."
                                                            list={`preset-exercises-${day}`}
                                                            className="w-full px-4 py-2.5 bg-grit-surface border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                                        />
                                                        <datalist id={`preset-exercises-${day}`}>
                                                            {PRESET_EXERCISES.map((name) => (
                                                                <option key={name} value={name} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddExercise(day, newExerciseName)}
                                                        disabled={!newExerciseName.trim()}
                                                        className="px-4 py-2.5 bg-grit-accent/20 text-grit-accent rounded-xl hover:bg-grit-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleSave(day)}
                                                    disabled={!form.isDirty || form.isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-grit-accent text-white font-medium rounded-xl hover:bg-grit-accent-dark transition-colors disabled:opacity-50"
                                                >
                                                    {form.isSaving ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4" />
                                                    )}
                                                    保存
                                                </button>
                                                {routine && (
                                                    <button
                                                        onClick={() => handleDelete(day)}
                                                        className="px-4 py-2.5 text-grit-negative hover:bg-grit-negative/10 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
