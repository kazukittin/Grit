import { useState, useEffect, useCallback } from 'react';
import { Calendar, Save, Trash2, Loader2 } from 'lucide-react';
import type { WorkoutRoutine } from '../types';
import { DAY_NAMES } from '../types';

interface WorkoutScheduleSettingsProps {
    routines: WorkoutRoutine[];
    onSave: (dayOfWeek: number, title: string, description: string) => Promise<void>;
    onDelete: (routineId: string) => Promise<void>;
}

interface DayFormState {
    title: string;
    description: string;
    isDirty: boolean;
    isSaving: boolean;
}

export const WorkoutScheduleSettings = ({
    routines,
    onSave,
    onDelete
}: WorkoutScheduleSettingsProps) => {
    const [dayForms, setDayForms] = useState<Record<number, DayFormState>>({});
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    // Initialize form state from routines
    useEffect(() => {
        const forms: Record<number, DayFormState> = {};
        for (let i = 0; i < 7; i++) {
            const routine = routines.find(r => r.day_of_week === i);
            forms[i] = {
                title: routine?.title || '',
                description: routine?.description || '',
                isDirty: false,
                isSaving: false,
            };
        }
        setDayForms(forms);
    }, [routines]);

    const handleInputChange = useCallback((day: number, field: 'title' | 'description', value: string) => {
        setDayForms(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
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

        await onSave(day, form.title, form.description);

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
            [day]: { title: '', description: '', isDirty: false, isSaving: false },
        }));
    }, [routines, onDelete]);

    const getDayRoutine = (day: number) => routines.find(r => r.day_of_week === day);

    return (
        <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">週間スケジュール設定</h2>
            </div>

            <p className="text-sm text-grit-text-muted mb-6">
                曜日ごとのトレーニングメニューを設定できます。設定しない曜日は休息日になります。
            </p>

            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                    const routine = getDayRoutine(day);
                    const form = dayForms[day] || { title: '', description: '', isDirty: false, isSaving: false };
                    const isExpanded = expandedDay === day;
                    const hasContent = form.title.trim() || routine;

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
                                    {routine && (
                                        <span className="text-sm text-grit-text-muted">
                                            {routine.title}
                                        </span>
                                    )}
                                    {!routine && (
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
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-3">
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => handleInputChange(day, 'title', e.target.value)}
                                        placeholder="タイトル（例: 胸の日、ランニング）"
                                        className="w-full px-4 py-3 bg-grit-surface border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                    />
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => handleInputChange(day, 'description', e.target.value)}
                                        placeholder="詳細メニュー（任意）"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-grit-surface border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors resize-none"
                                    />
                                    <div className="flex gap-2">
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
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
