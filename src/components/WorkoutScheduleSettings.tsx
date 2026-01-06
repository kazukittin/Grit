import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Save, Trash2, Loader2, Plus, X, Dumbbell, Flame, ChevronDown } from 'lucide-react';
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

// 事前に定義された筋トレメニューオプション（カテゴリ付き）
const PRESET_EXERCISES = [
    { category: '胸', items: ['腕立て伏せ', 'ベンチプレス', 'ダンベルフライ', 'ケーブルクロス'] },
    { category: '背中', items: ['ラットプルダウン', 'デッドリフト', 'ローイング', '懸垂'] },
    { category: '脚', items: ['スクワット', 'レッグプレス', 'ランジ', 'レッグカール', 'カーフレイズ'] },
    { category: '肩', items: ['ショルダープレス', 'サイドレイズ', 'フロントレイズ', 'リアレイズ'] },
    { category: '腕', items: ['バイセップカール', 'トライセップディップス', 'ハンマーカール'] },
    { category: '体幹', items: ['プランク', '腹筋', 'クランチ', 'レッグレイズ', 'サイドプランク'] },
    { category: '全身・有酸素', items: ['バーピー', 'マウンテンクライマー', 'ジャンピングジャック', 'ランニング', 'バイク'] },
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
    const [showExercisePicker, setShowExercisePicker] = useState<number | null>(null);
    const [customExerciseName, setCustomExerciseName] = useState('');

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
            calories: 10,
        };

        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: [...prev[day].exercises, newExercise],
                isDirty: true,
            },
        }));
        setShowExercisePicker(null);
        setCustomExerciseName('');
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
                曜日ごとのトレーニングメニューを設定できます。
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
                                                    🏷️ トレーニング名
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
                                                <label className="block text-sm font-medium text-grit-text-muted mb-3">
                                                    💪 エクササイズ
                                                </label>

                                                {form.exercises.length > 0 && (
                                                    <div className="space-y-3 mb-4">
                                                        {form.exercises.map((exercise, index) => (
                                                            <motion.div
                                                                key={exercise.id}
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="bg-gradient-to-r from-grit-surface to-grit-bg rounded-xl border border-grit-border p-4"
                                                            >
                                                                {/* Exercise Header */}
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-grit-accent/20 text-grit-accent text-xs font-bold">
                                                                            {index + 1}
                                                                        </span>
                                                                        <input
                                                                            type="text"
                                                                            value={exercise.name}
                                                                            onChange={(e) => handleUpdateExercise(day, exercise.id, 'name', e.target.value)}
                                                                            className="bg-transparent border-none text-grit-text font-medium focus:outline-none focus:ring-0 text-base"
                                                                            placeholder="エクササイズ名"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveExercise(day, exercise.id)}
                                                                        className="p-1.5 text-grit-text-dim hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                {/* Exercise Details - Horizontal Grid */}
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {/* Reps */}
                                                                    <div className="bg-grit-surface-hover rounded-lg p-3">
                                                                        <label className="block text-xs text-grit-text-dim mb-1">
                                                                            回数
                                                                        </label>
                                                                        <div className="flex items-center gap-1">
                                                                            <input
                                                                                type="number"
                                                                                value={exercise.reps}
                                                                                onChange={(e) => handleUpdateExercise(day, exercise.id, 'reps', parseInt(e.target.value) || 0)}
                                                                                className="w-full bg-transparent border-none text-grit-text text-lg font-semibold focus:outline-none text-center"
                                                                                min="1"
                                                                            />
                                                                            <span className="text-xs text-grit-text-dim">回</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Sets */}
                                                                    <div className="bg-grit-surface-hover rounded-lg p-3">
                                                                        <label className="block text-xs text-grit-text-dim mb-1">
                                                                            セット
                                                                        </label>
                                                                        <div className="flex items-center gap-1">
                                                                            <input
                                                                                type="number"
                                                                                value={exercise.sets}
                                                                                onChange={(e) => handleUpdateExercise(day, exercise.id, 'sets', parseInt(e.target.value) || 0)}
                                                                                className="w-full bg-transparent border-none text-grit-text text-lg font-semibold focus:outline-none text-center"
                                                                                min="1"
                                                                            />
                                                                            <span className="text-xs text-grit-text-dim">set</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Calories per set */}
                                                                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
                                                                        <label className="block text-xs text-orange-400 mb-1">
                                                                            消費カロリー
                                                                        </label>
                                                                        <div className="flex items-center gap-1">
                                                                            <input
                                                                                type="number"
                                                                                value={exercise.calories}
                                                                                onChange={(e) => handleUpdateExercise(day, exercise.id, 'calories', parseInt(e.target.value) || 0)}
                                                                                className="w-full bg-transparent border-none text-orange-400 text-lg font-semibold focus:outline-none text-center"
                                                                                min="0"
                                                                            />
                                                                            <span className="text-xs text-orange-400/70">kcal</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}

                                                        {/* Total Calories */}
                                                        <div className="flex items-center justify-end gap-2 pt-2 text-sm">
                                                            <Flame className="w-4 h-4 text-orange-400" />
                                                            <span className="text-grit-text-muted">合計:</span>
                                                            <span className="font-bold text-orange-400 text-lg">
                                                                {totalCalories} kcal
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Add Exercise Button / Picker */}
                                                <div>
                                                    <button
                                                        onClick={() => setShowExercisePicker(showExercisePicker === day ? null : day)}
                                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-grit-border hover:border-grit-accent/50 hover:bg-grit-accent/5 transition-all text-grit-text-muted hover:text-grit-accent"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                        <span className="font-medium">エクササイズを追加</span>
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${showExercisePicker === day ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Exercise Picker - Inline */}
                                                    <AnimatePresence>
                                                        {showExercisePicker === day && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden mt-3"
                                                            >
                                                                <div className="bg-grit-bg border-2 border-grit-accent/30 rounded-2xl shadow-lg overflow-hidden">
                                                                    {/* Header */}
                                                                    <div className="bg-gradient-to-r from-grit-accent/20 to-orange-500/20 px-4 py-3 border-b border-grit-border">
                                                                        <h4 className="text-sm font-bold text-grit-text flex items-center gap-2">
                                                                            <Dumbbell className="w-4 h-4 text-grit-accent" />
                                                                            エクササイズを選択
                                                                        </h4>
                                                                    </div>

                                                                    {/* Custom Input */}
                                                                    <div className="p-3 bg-grit-surface border-b border-grit-border">
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={customExerciseName}
                                                                                onChange={(e) => setCustomExerciseName(e.target.value)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && customExerciseName.trim()) {
                                                                                        handleAddExercise(day, customExerciseName);
                                                                                    }
                                                                                }}
                                                                                placeholder="✏️ オリジナルの種目を入力..."
                                                                                className="flex-1 px-4 py-2.5 bg-grit-bg border-2 border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleAddExercise(day, customExerciseName)}
                                                                                disabled={!customExerciseName.trim()}
                                                                                className="px-5 py-2.5 bg-grit-accent text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-grit-accent-dark transition-colors"
                                                                            >
                                                                                追加
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Preset Categories */}
                                                                    <div className="max-h-80 overflow-y-auto p-3 space-y-4">
                                                                        {PRESET_EXERCISES.map((category) => (
                                                                            <div key={category.category}>
                                                                                <div className="text-xs font-bold text-grit-accent uppercase tracking-wider px-1 mb-2 flex items-center gap-2">
                                                                                    <span className="w-1 h-4 bg-grit-accent rounded-full"></span>
                                                                                    {category.category}
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    {category.items.map((item) => (
                                                                                        <button
                                                                                            key={item}
                                                                                            onClick={() => handleAddExercise(day, item)}
                                                                                            className="px-4 py-2.5 bg-grit-surface hover:bg-grit-accent text-left border border-grit-border hover:border-grit-accent rounded-xl text-sm text-grit-text hover:text-white font-medium transition-all duration-150"
                                                                                        >
                                                                                            {item}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Close hint */}
                                                                    <div className="px-4 py-2 bg-grit-surface-hover text-center">
                                                                        <span className="text-xs text-grit-text-dim">
                                                                            ボタンをクリックで選択
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
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
