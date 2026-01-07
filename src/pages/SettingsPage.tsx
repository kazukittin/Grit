import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, Plus, Trash2, Edit3, Check, X, LogOut, Loader2, Flame, Beef, Droplets, Wheat, RefreshCw, AlertTriangle, Calculator, Ruler, Star, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutScheduleSettings } from '../components/WorkoutScheduleSettings';
import { DataExportImport } from '../components/DataExport';
import { useOnboarding } from '../components/OnboardingTour';
import { useInitialSetup } from '../components/InitialSetupWizard';
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
    exportAllData,
    importData,
    getFavoriteMeals,
    getMealPresets,
    deleteFavoriteMeal,
    addMealPreset,
    deleteMealPreset,
    updateMealPreset,
} from '../services/api';
import type { Profile, Habit, WorkoutRoutine, FavoriteMeal, MealPreset, MealPresetItem } from '../types';

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, signOut, deleteAccount } = useAuth();
    const { resetOnboarding } = useOnboarding();
    const { resetSetup } = useInitialSetup();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingNutrition, setSavingNutrition] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [targetWeight, setTargetWeight] = useState('');
    const [targetCalories, setTargetCalories] = useState('');
    const [targetProtein, setTargetProtein] = useState('');
    const [targetFat, setTargetFat] = useState('');
    const [targetCarbs, setTargetCarbs] = useState('');
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editingHabitTitle, setEditingHabitTitle] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | null>(null);

    // Favorite meals and presets state
    const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>([]);
    const [mealPresets, setMealPresets] = useState<MealPreset[]>([]);
    const [showPresetModal, setShowPresetModal] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [selectedFavoritesForPreset, setSelectedFavoritesForPreset] = useState<string[]>([]);
    const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            const [profileData, habitsData, routinesData, favoritesData, presetsData] = await Promise.all([
                getOrCreateProfile(user.$id),
                getAllHabits(user.$id),
                getWorkoutRoutines(user.$id),
                getFavoriteMeals(user.$id),
                getMealPresets(user.$id),
            ]);
            setProfile(profileData);
            setHabits(habitsData);
            setWorkoutRoutines(routinesData);
            setFavoriteMeals(favoritesData);
            setMealPresets(presetsData);
            if (profileData?.target_weight) {
                setTargetWeight(profileData.target_weight.toString());
            }
            if (profileData?.target_calories) {
                setTargetCalories(profileData.target_calories.toString());
            }
            if (profileData?.target_protein) {
                setTargetProtein(profileData.target_protein.toString());
            }
            if (profileData?.target_fat) {
                setTargetFat(profileData.target_fat.toString());
            }
            if (profileData?.target_carbs) {
                setTargetCarbs(profileData.target_carbs.toString());
            }
            if (profileData?.height) {
                setHeight(profileData.height.toString());
            }
            if (profileData?.age) {
                setAge(profileData.age.toString());
            }
            if (profileData?.gender) {
                setGender(profileData.gender);
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

    const handleSaveNutritionGoals = useCallback(async () => {
        if (!user || !profile) return;

        const calories = parseInt(targetCalories) || null;
        const protein = parseInt(targetProtein) || null;
        const fat = parseInt(targetFat) || null;
        const carbs = parseInt(targetCarbs) || null;
        const heightValue = parseFloat(height) || null;
        const ageValue = parseInt(age) || null;

        setSavingNutrition(true);
        await updateProfile(profile.$id, {
            target_calories: calories,
            target_protein: protein,
            target_fat: fat,
            target_carbs: carbs,
            age: ageValue,
            gender: gender,
            height: heightValue,
        });
        setSavingNutrition(false);
    }, [user, profile, targetCalories, targetProtein, targetFat, targetCarbs, height, age, gender]);

    // Calculate nutrition goals based on height, weight, age, and gender using Mifflin-St Jeor equation
    const calculateNutritionGoals = useCallback(() => {
        const heightCm = parseFloat(height);
        const weightKg = parseFloat(targetWeight); // Use target weight as the baseline
        const ageYears = parseInt(age) || 30;
        const genderValue = gender || 'male';

        if (!heightCm || !weightKg) {
            alert('身長と目標体重を先に入力してください');
            return;
        }

        // Mifflin-St Jeor Equation for BMR
        let bmr: number;
        if (genderValue === 'male') {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        } else {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        }

        // TDEE with moderate activity level (1.55)
        const tdee = bmr * 1.55;

        // For weight loss: subtract 500kcal (about 0.5kg/week)
        const targetCaloriesNum = Math.round(tdee - 500);

        // Protein: 2g per kg body weight for muscle preservation during diet
        const proteinNum = Math.round(weightKg * 2);

        // Fat: 25% of calories (9 kcal/g)
        const fatNum = Math.round((targetCaloriesNum * 0.25) / 9);

        // Carbs: remaining calories (4 kcal/g)
        const proteinCals = proteinNum * 4;
        const fatCals = fatNum * 9;
        const carbsNum = Math.round((targetCaloriesNum - proteinCals - fatCals) / 4);

        setTargetCalories(Math.max(1200, targetCaloriesNum).toString());
        setTargetProtein(proteinNum.toString());
        setTargetFat(fatNum.toString());
        setTargetCarbs(Math.max(50, carbsNum).toString());
    }, [height, targetWeight, age, gender]);

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

                {/* Nutrition Goals */}
                <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-5 h-5 text-grit-accent" />
                        <h2 className="text-lg font-semibold text-grit-text">栄養目標</h2>
                    </div>
                    <p className="text-sm text-grit-text-muted mb-4">
                        1日の目標カロリーとPFCを設定します。進捗がダッシュボードに表示されます。
                    </p>

                    <div className="space-y-4">
                        {/* Height Input */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-grit-text-muted mb-2">
                                <Ruler className="w-4 h-4" />
                                身長（自動計算に使用）
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="170.0"
                                    min="100"
                                    max="250"
                                    className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">cm</span>
                            </div>
                        </div>

                        {/* Age and Gender for calculation */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                    年齢
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="30"
                                        min="10"
                                        max="100"
                                        className="w-full px-4 py-3 pr-10 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted text-sm">歳</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                    性別
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${gender === 'male'
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-grit-bg border-grit-border text-grit-text-muted hover:border-grit-accent'
                                            }`}
                                    >
                                        男性
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${gender === 'female'
                                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                            : 'bg-grit-bg border-grit-border text-grit-text-muted hover:border-grit-accent'
                                            }`}
                                    >
                                        女性
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Auto Calculate Button */}
                        <button
                            type="button"
                            onClick={calculateNutritionGoals}
                            className="w-full py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
                        >
                            <Calculator className="w-4 h-4" />
                            身長・体重から自動計算
                        </button>
                        <p className="text-xs text-grit-text-dim text-center">
                            ※ Mifflin-St Jeor式を使用。減量目標（-500kcal/日）で計算します。
                        </p>

                        <div className="border-t border-grit-border pt-4">
                            {/* Target Calories */}
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-grit-text-muted mb-2">
                                    <Flame className="w-4 h-4" />
                                    目標カロリー
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetCalories}
                                        onChange={(e) => setTargetCalories(e.target.value)}
                                        placeholder="2000"
                                        min="500"
                                        max="10000"
                                        className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">kcal</span>
                                </div>
                            </div>

                            {/* PFC Targets */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Protein */}
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium text-grit-text-muted mb-1.5">
                                        <Beef className="w-3.5 h-3.5 text-red-400" />
                                        P（タンパク質）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetProtein}
                                            onChange={(e) => setTargetProtein(e.target.value)}
                                            placeholder="120"
                                            min="0"
                                            className="w-full px-3 py-2.5 bg-grit-bg border border-grit-border rounded-lg text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-red-400 transition-colors pr-8 text-sm"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">g</span>
                                    </div>
                                </div>

                                {/* Fat */}
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium text-grit-text-muted mb-1.5">
                                        <Droplets className="w-3.5 h-3.5 text-yellow-400" />
                                        F（脂質）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetFat}
                                            onChange={(e) => setTargetFat(e.target.value)}
                                            placeholder="60"
                                            min="0"
                                            className="w-full px-3 py-2.5 bg-grit-bg border border-grit-border rounded-lg text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-yellow-400 transition-colors pr-8 text-sm"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">g</span>
                                    </div>
                                </div>

                                {/* Carbs */}
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium text-grit-text-muted mb-1.5">
                                        <Wheat className="w-3.5 h-3.5 text-blue-400" />
                                        C（炭水化物）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetCarbs}
                                            onChange={(e) => setTargetCarbs(e.target.value)}
                                            placeholder="200"
                                            min="0"
                                            className="w-full px-3 py-2.5 bg-grit-bg border border-grit-border rounded-lg text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-blue-400 transition-colors pr-8 text-sm"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveNutritionGoals}
                            disabled={savingNutrition}
                            className="w-full py-3 bg-grit-accent text-white font-medium rounded-xl hover:bg-grit-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingNutrition ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            栄養目標を保存
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
                            placeholder="例: 水を2L飲む、10分運動、体重を測る"
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

                {/* Favorite Meals & Presets Management */}
                <section className="bg-grit-surface rounded-2xl p-6 border border-grit-border">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-grit-text">よく食べるメニュー</h2>
                    </div>

                    {/* Favorite Meals List */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-grit-text-muted mb-3">
                            お気に入りメニュー ({favoriteMeals.length})
                        </h3>
                        {favoriteMeals.length === 0 ? (
                            <p className="text-sm text-grit-text-dim text-center py-4">
                                食事記録時に⭐ボタンで追加できます
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {favoriteMeals.map(meal => (
                                    <div
                                        key={meal.$id}
                                        className="flex items-center justify-between p-3 bg-grit-bg rounded-xl"
                                    >
                                        <div>
                                            <div className="font-medium text-grit-text">{meal.name}</div>
                                            <div className="text-xs text-grit-text-muted">
                                                {meal.calories} kcal
                                                {meal.protein && ` • P: ${meal.protein}g`}
                                                {meal.fat && ` • F: ${meal.fat}g`}
                                                {meal.carbs && ` • C: ${meal.carbs}g`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm('このお気に入りを削除しますか？')) {
                                                    await deleteFavoriteMeal(meal.$id);
                                                    setFavoriteMeals(prev => prev.filter(m => m.$id !== meal.$id));
                                                }
                                            }}
                                            className="p-2 text-grit-negative/50 hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Meal Presets List */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-grit-text-muted">
                                <Package className="w-4 h-4 inline mr-1" />
                                セットメニュー ({mealPresets.length})
                            </h3>
                            <button
                                onClick={() => {
                                    setNewPresetName('');
                                    setSelectedFavoritesForPreset([]);
                                    setEditingPresetId(null);
                                    setShowPresetModal(true);
                                }}
                                disabled={favoriteMeals.length === 0}
                                className="text-xs text-grit-accent hover:underline disabled:opacity-50 disabled:hover:no-underline"
                            >
                                + 新規作成
                            </button>
                        </div>
                        {mealPresets.length === 0 ? (
                            <p className="text-sm text-grit-text-dim text-center py-4">
                                お気に入りを組み合わせてセットを作成できます
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {mealPresets.map(preset => {
                                    let items: MealPresetItem[] = [];
                                    try {
                                        items = JSON.parse(preset.items);
                                    } catch { /* empty */ }

                                    return (
                                        <div
                                            key={preset.$id}
                                            className="p-3 bg-grit-bg rounded-xl"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium text-grit-text">{preset.name}</div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPresetId(preset.$id);
                                                            setNewPresetName(preset.name);
                                                            // Find matching favorite IDs
                                                            const selectedIds = items
                                                                .map(item => favoriteMeals.find(f => f.name === item.name)?.$id)
                                                                .filter((id): id is string => !!id);
                                                            setSelectedFavoritesForPreset(selectedIds);
                                                            setShowPresetModal(true);
                                                        }}
                                                        className="p-1.5 text-grit-text-muted hover:text-grit-accent hover:bg-grit-accent/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('このセットメニューを削除しますか？')) {
                                                                await deleteMealPreset(preset.$id);
                                                                setMealPresets(prev => prev.filter(p => p.$id !== preset.$id));
                                                            }
                                                        }}
                                                        className="p-1.5 text-grit-negative/50 hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-grit-text-muted">
                                                {items.length}品 • 計 {preset.total_calories} kcal
                                            </div>
                                            <div className="mt-1 text-xs text-grit-text-dim">
                                                {items.map(i => i.name).join('、')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Preset Creation Modal */}
                {showPresetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPresetModal(false)} />
                        <div className="relative w-full max-w-md bg-grit-surface rounded-2xl border border-grit-border p-6 max-h-[80vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold text-grit-text mb-4">
                                {editingPresetId ? 'セットメニューを編集' : '新しいセットメニュー'}
                            </h3>

                            {/* Preset Name */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                    セット名
                                </label>
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    placeholder="例: 朝食セット"
                                    className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                />
                            </div>

                            {/* Select Favorites */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                    含めるメニュー（複数選択可）
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {favoriteMeals.map(meal => (
                                        <label
                                            key={meal.$id}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedFavoritesForPreset.includes(meal.$id)
                                                ? 'bg-grit-accent/20 border border-grit-accent'
                                                : 'bg-grit-bg border border-transparent hover:border-grit-border'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedFavoritesForPreset.includes(meal.$id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedFavoritesForPreset(prev => [...prev, meal.$id]);
                                                    } else {
                                                        setSelectedFavoritesForPreset(prev => prev.filter(id => id !== meal.$id));
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedFavoritesForPreset.includes(meal.$id)
                                                ? 'bg-grit-accent border-grit-accent text-white'
                                                : 'border-grit-text-dim'
                                                }`}>
                                                {selectedFavoritesForPreset.includes(meal.$id) && <Check className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-grit-text">{meal.name}</div>
                                                <div className="text-xs text-grit-text-muted">{meal.calories} kcal</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {selectedFavoritesForPreset.length > 0 && (
                                <div className="mb-4 p-3 bg-grit-bg rounded-xl">
                                    <div className="text-xs text-grit-text-muted mb-1">合計</div>
                                    <div className="text-sm font-medium text-grit-text">
                                        {selectedFavoritesForPreset.length}品 •
                                        {favoriteMeals
                                            .filter(m => selectedFavoritesForPreset.includes(m.$id))
                                            .reduce((sum, m) => sum + m.calories, 0)} kcal
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPresetModal(false)}
                                    className="flex-1 py-3 bg-grit-surface-hover text-grit-text-muted font-medium rounded-xl hover:bg-grit-border transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!user || !newPresetName.trim() || selectedFavoritesForPreset.length === 0) return;

                                        const items: MealPresetItem[] = favoriteMeals
                                            .filter(m => selectedFavoritesForPreset.includes(m.$id))
                                            .map(m => ({
                                                name: m.name,
                                                calories: m.calories,
                                                protein: m.protein,
                                                fat: m.fat,
                                                carbs: m.carbs,
                                            }));

                                        if (editingPresetId) {
                                            const updated = await updateMealPreset(editingPresetId, {
                                                name: newPresetName.trim(),
                                                items,
                                            });
                                            if (updated) {
                                                setMealPresets(prev => prev.map(p => p.$id === editingPresetId ? updated : p));
                                            }
                                        } else {
                                            const created = await addMealPreset(user.$id, newPresetName.trim(), items);
                                            if (created) {
                                                setMealPresets(prev => [created, ...prev]);
                                            }
                                        }

                                        setShowPresetModal(false);
                                        setNewPresetName('');
                                        setSelectedFavoritesForPreset([]);
                                        setEditingPresetId(null);
                                    }}
                                    disabled={!newPresetName.trim() || selectedFavoritesForPreset.length === 0}
                                    className="flex-1 py-3 bg-grit-accent text-white font-medium rounded-xl hover:bg-grit-accent-dark transition-colors disabled:opacity-50"
                                >
                                    {editingPresetId ? '更新' : '作成'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Workout Schedule Settings */}
                <WorkoutScheduleSettings
                    routines={workoutRoutines}
                    onSave={handleSaveWorkoutRoutine}
                    onDelete={handleDeleteWorkoutRoutine}
                />

                {/* Data Export/Import */}
                {user && (
                    <DataExportImport
                        onExport={() => exportAllData(user.$id)}
                        onImport={(data) => importData(user.$id, data)}
                    />
                )}

                {/* Reset Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={resetOnboarding}
                        className="w-full py-3 bg-grit-surface border border-grit-border text-grit-text-muted font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-surface-hover transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        チュートリアルを再表示
                    </button>
                    <button
                        onClick={() => {
                            resetSetup();
                            alert('初期設定をリセットしました。ダッシュボードに戻ると表示されます。');
                        }}
                        className="w-full py-3 bg-grit-surface border border-grit-border text-grit-text-muted font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-surface-hover transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        初期設定ウィザードを再表示
                    </button>
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-grit-surface border border-grit-border text-grit-text-muted font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-surface-hover hover:text-grit-negative transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    ログアウト
                </button>

                {/* Danger Zone - Account Deletion */}
                <div className="pt-6 border-t border-grit-border">
                    <h3 className="text-sm font-medium text-grit-negative mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        危険な操作
                    </h3>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-4 bg-grit-negative/10 border border-grit-negative/30 text-grit-negative font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-negative/20 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        アカウントを削除
                    </button>
                    <p className="text-xs text-grit-text-muted mt-2 text-center">
                        全てのデータが完全に削除されます。この操作は取り消せません。
                    </p>
                </div>
            </main>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-grit-negative/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-grit-negative" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-grit-text">アカウント削除</h2>
                                    <p className="text-sm text-grit-text-muted">この操作は取り消せません</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-grit-negative/10 rounded-xl border border-grit-negative/30">
                                    <p className="text-sm text-grit-text">
                                        アカウントを削除すると、以下の全てのデータが完全に削除されます：
                                    </p>
                                    <ul className="mt-2 text-sm text-grit-text-muted list-disc list-inside space-y-1">
                                        <li>体重記録</li>
                                        <li>食事記録</li>
                                        <li>習慣データ</li>
                                        <li>ワークアウト記録</li>
                                        <li>プロフィール設定</li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block text-sm text-grit-text-muted mb-2">
                                        確認のため「削除」と入力してください
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="削除"
                                        className="w-full px-4 py-3 bg-grit-surface border border-grit-border rounded-xl text-grit-text focus:outline-none focus:ring-2 focus:ring-grit-negative/50"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteConfirmText('');
                                        }}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 bg-grit-surface border border-grit-border text-grit-text-muted font-medium rounded-xl hover:bg-grit-surface-hover transition-colors disabled:opacity-50"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (deleteConfirmText !== '削除') return;
                                            setIsDeleting(true);
                                            const result = await deleteAccount();
                                            setIsDeleting(false);
                                            if (result.success) {
                                                navigate('/auth');
                                            } else {
                                                alert(result.error || 'アカウント削除に失敗しました');
                                            }
                                        }}
                                        disabled={deleteConfirmText !== '削除' || isDeleting}
                                        className="flex-1 py-3 bg-grit-negative text-white font-medium rounded-xl hover:bg-grit-negative/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                削除中...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                完全に削除する
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
