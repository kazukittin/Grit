import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, Plus, Trash2, Edit3, Check, X, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutScheduleSettings } from '../components/WorkoutScheduleSettings';
import {
    getOrCreateProfile,
    updateProfile,
    getAllHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getWorkoutRoutines,
    saveWorkoutRoutine,
    deleteWorkoutRoutine,
} from '../services/api';
import type { Profile, Habit, WorkoutRoutine } from '../types';

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [targetWeight, setTargetWeight] = useState('');
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editingHabitTitle, setEditingHabitTitle] = useState('');

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            const [profileData, habitsData, routinesData] = await Promise.all([
                getOrCreateProfile(user.$id),
                getAllHabits(user.$id),
                getWorkoutRoutines(user.$id),
            ]);
            setProfile(profileData);
            setHabits(habitsData);
            setWorkoutRoutines(routinesData);
            if (profileData?.target_weight) {
                setTargetWeight(profileData.target_weight.toString());
            }
            setLoading(false);
        };

        loadData();
    }, [user]);

    const handleSaveTargetWeight = useCallback(async () => {
        if (!user || !profile) return;

        const weight = parseFloat(targetWeight);
        if (isNaN(weight) || weight <= 0 || weight > 500) {
            return;
        }

        setSaving(true);
        await updateProfile(profile.$id, { target_weight: weight });
        setSaving(false);
    }, [user, profile, targetWeight]);

    const handleAddHabit = useCallback(async () => {
        if (!user || !newHabitTitle.trim()) return;

        const habit = await createHabit(user.$id, newHabitTitle.trim());
        if (habit) {
            setHabits(prev => [...prev, habit]);
            setNewHabitTitle('');
        }
    }, [user, newHabitTitle]);

    const handleUpdateHabit = useCallback(async (habitId: string) => {
        if (!editingHabitTitle.trim()) return;

        const success = await updateHabit(habitId, { title: editingHabitTitle.trim() });
        if (success) {
            setHabits(prev => prev.map(h => h.$id === habitId ? { ...h, title: editingHabitTitle.trim() } : h));
            setEditingHabitId(null);
            setEditingHabitTitle('');
        }
    }, [editingHabitTitle]);

    const handleToggleHabitActive = useCallback(async (habitId: string, isActive: boolean) => {
        const success = await updateHabit(habitId, { is_active: !isActive });
        if (success) {
            setHabits(prev => prev.map(h => h.$id === habitId ? { ...h, is_active: !isActive } : h));
        }
    }, []);

    const handleDeleteHabit = useCallback(async (habitId: string) => {
        if (!confirm('このタスクを削除しますか？')) return;

        const success = await deleteHabit(habitId);
        if (success) {
            setHabits(prev => prev.filter(h => h.$id !== habitId));
        }
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut();
        navigate('/');
    }, [signOut, navigate]);

    const handleSaveWorkoutRoutine = useCallback(async (dayOfWeek: number, title: string, description: string) => {
        if (!user) return;

        const routine = await saveWorkoutRoutine(user.$id, dayOfWeek, title, description);
        if (routine) {
            setWorkoutRoutines(prev => {
                const filtered = prev.filter(r => r.day_of_week !== dayOfWeek);
                return [...filtered, routine].sort((a, b) => a.day_of_week - b.day_of_week);
            });
        }
    }, [user]);

    const handleDeleteWorkoutRoutine = useCallback(async (routineId: string) => {
        const success = await deleteWorkoutRoutine(routineId);
        if (success) {
            setWorkoutRoutines(prev => prev.filter(r => r.$id !== routineId));
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-grit-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-grit-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grit-bg pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-grit-bg/80 backdrop-blur-xl border-b border-grit-border">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-grit-surface flex items-center justify-center hover:bg-grit-surface-hover transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-grit-text" />
                    </button>
                    <h1 className="text-xl font-bold text-grit-text">設定</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Target Weight */}
                <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-grit-accent" />
                        <h2 className="text-lg font-semibold text-grit-text">目標体重</h2>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                step="0.1"
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(e.target.value)}
                                placeholder="60.0"
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">kg</span>
                        </div>
                        <button
                            onClick={handleSaveTargetWeight}
                            disabled={saving}
                            className="px-6 py-3 bg-grit-accent text-white font-medium rounded-xl hover:bg-grit-accent-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            保存
                        </button>
                    </div>
                </section>

                {/* Habits Management */}
                <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Edit3 className="w-5 h-5 text-grit-accent" />
                        <h2 className="text-lg font-semibold text-grit-text">習慣タスク管理</h2>
                    </div>

                    {/* Add new habit */}
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            placeholder="新しいタスクを追加..."
                            className="flex-1 px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                        />
                        <button
                            onClick={handleAddHabit}
                            disabled={!newHabitTitle.trim()}
                            className="px-4 py-3 bg-grit-accent text-white rounded-xl hover:bg-grit-accent-dark transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Habit list */}
                    <div className="space-y-2">
                        {habits.map(habit => (
                            <div
                                key={habit.$id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${habit.is_active ? 'bg-grit-bg' : 'bg-grit-bg/50 opacity-60'
                                    }`}
                            >
                                {editingHabitId === habit.$id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingHabitTitle}
                                            onChange={(e) => setEditingHabitTitle(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-grit-surface border border-grit-border rounded-lg text-grit-text focus:outline-none focus:border-grit-accent"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleUpdateHabit(habit.$id)}
                                            className="p-2 text-grit-positive hover:bg-grit-positive/10 rounded-lg transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setEditingHabitId(null); setEditingHabitTitle(''); }}
                                            className="p-2 text-grit-text-muted hover:bg-grit-surface-hover rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleToggleHabitActive(habit.$id, habit.is_active)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${habit.is_active
                                                ? 'bg-grit-accent border-grit-accent text-white'
                                                : 'border-grit-text-dim'
                                                }`}
                                        >
                                            {habit.is_active && <Check className="w-3 h-3" />}
                                        </button>
                                        <span className={`flex-1 text-grit-text ${!habit.is_active && 'line-through'}`}>
                                            {habit.title}
                                        </span>
                                        <button
                                            onClick={() => { setEditingHabitId(habit.$id); setEditingHabitTitle(habit.title); }}
                                            className="p-2 text-grit-text-muted hover:bg-grit-surface-hover rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHabit(habit.$id)}
                                            className="p-2 text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Workout Schedule Settings */}
                <WorkoutScheduleSettings
                    routines={workoutRoutines}
                    onSave={handleSaveWorkoutRoutine}
                    onDelete={handleDeleteWorkoutRoutine}
                />

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-grit-surface border border-grit-border text-grit-text-muted font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-surface-hover hover:text-grit-negative transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    ログアウト
                </button>
            </main>
        </div>
    );
}
