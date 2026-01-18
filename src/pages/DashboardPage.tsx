import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { DailyHabits } from '../components/DailyHabits';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { RecordModal } from '../components/RecordModal';
import { FloatingButton } from '../components/FloatingButton';
import { TodayWorkout } from '../components/TodayWorkout';
import { WorkoutModal } from '../components/WorkoutModal';
import { RecentWorkouts } from '../components/RecentWorkouts';
import { MealDashboard } from '../components/MealDashboard';
import { MealModal } from '../components/MealModal';
import { FavoriteMealSelector } from '../components/FavoriteMealSelector';
import { StatsSummary } from '../components/StatsSummary';


import { InitialSetupWizard, useInitialSetup } from '../components/InitialSetupWizard';
import {
    SkeletonSummaryCard,
    SkeletonChart,
    SkeletonHabits,
    SkeletonHeatmap,
    SkeletonMeals,
} from '../components/Skeleton';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getOrCreateProfile,
    getWeightLogs,
    getWeightLogsInRange,
    addWeightLog,
    getHabits,
    getHabitLogsForDate,
    toggleHabitLog,
    getHeatmapData,
    initializeDefaultHabits,
    getWorkoutRoutineForDay,
    getWorkoutLogForDate,
    getWorkoutLogs,
    addWorkoutLog,
    getMealLogsForDate,
    addMealLog,
    updateMealLog,
    deleteMealLog,

    updateProfile,
    getFavoriteMeals,
    getMealPresets,
    addFavoriteMeal,
    deleteFavoriteMeal,
    deleteMealPreset,
    incrementFavoriteMealUseCount,
    incrementMealPresetUseCount,
} from '../services/api';
import type { Profile, WeightLog, DailyHabitStatus, HeatmapDay, WorkoutRoutine, WorkoutLog, MealLog, MealType, PFCSummary, FavoriteMeal, MealPreset } from '../types';
import type { SetupData } from '../components/InitialSetupWizard';
import { getTodayString, getEffectiveDayOfWeek } from '../lib/dateUtils';

export function DashboardPage() {
    const { user } = useAuth();

    // Initial setup wizard
    const { showSetup, checkSetupStatus, completeSetup, skipSetup } = useInitialSetup(user?.$id);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [latestLog, setLatestLog] = useState<WeightLog | null>(null);
    const [previousLog, setPreviousLog] = useState<WeightLog | null>(null);
    const [weeklyLogs, setWeeklyLogs] = useState<WeightLog[]>([]);
    const [dailyHabits, setDailyHabits] = useState<DailyHabitStatus[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Workout state
    const [todayRoutine, setTodayRoutine] = useState<WorkoutRoutine | null>(null);
    const [todayWorkoutLog, setTodayWorkoutLog] = useState<WorkoutLog | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

    // Meal state (Date Navigation)
    const [mealDate, setMealDate] = useState(() => getTodayString()); // 食事記録用の日付
    const [displayedMeals, setDisplayedMeals] = useState<MealLog[]>([]); // 表示中の日の食事
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);

    // Favorite meals state
    const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>([]);
    const [mealPresets, setMealPresets] = useState<MealPreset[]>([]);
    const [isFavoriteSelectorOpen, setIsFavoriteSelectorOpen] = useState(false);



    // 日付をステートとして管理し、日付が変わったら自動更新
    const [today, setToday] = useState(() => getTodayString());

    // ページがフォーカスされたときや定期的に日付をチェック
    useEffect(() => {
        const checkDateChange = () => {
            const currentDate = getTodayString();
            if (currentDate !== today) {
                setToday(currentDate);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkDateChange();
            }
        };

        const handleFocus = () => {
            checkDateChange();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        const intervalId = setInterval(checkDateChange, 60000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(intervalId);
        };
    }, [today]);

    // Independent meal loading when date changes
    useEffect(() => {
        const loadMeals = async () => {
            if (!user) return;
            try {
                const meals = await getMealLogsForDate(user.$id, mealDate);
                setDisplayedMeals(meals);
            } catch (error) {
                console.error('Error loading meals:', error);
            }
        };
        loadMeals();
    }, [user, mealDate]); // Re-run when user or selected date changes

    const loadData = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        try {
            // Calculate date ranges upfront
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 6);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const dayOfWeek = getEffectiveDayOfWeek();

            // Load profile first (needed for setup check)
            const profileData = await getOrCreateProfile(user.$id);
            setProfile(profileData);

            // Check if initial setup should be shown
            const hasTargets = !!(profileData?.target_weight || profileData?.target_calories);
            checkSetupStatus(hasTargets);

            // Parallel load all independent data
            const [
                logs,
                weeklyData,
                habits,
                habitLogs,
                heatmap,
                routine,
                workoutLog,
                workoutHistory,
                favorites,
                presets,
            ] = await Promise.all([
                getWeightLogs(user.$id, 2),
                getWeightLogsInRange(user.$id, weekAgo.toISOString().split('T')[0], today),
                getHabits(user.$id),
                getHabitLogsForDate(user.$id, today),
                getHeatmapData(user.$id, threeMonthsAgo.toISOString().split('T')[0], today),
                getWorkoutRoutineForDay(user.$id, dayOfWeek),
                getWorkoutLogForDate(user.$id, today),
                getWorkoutLogs(user.$id, 5),
                getFavoriteMeals(user.$id),
                getMealPresets(user.$id),
            ]);

            // Set weight data
            setLatestLog(logs[0] || null);
            setPreviousLog(logs[1] || null);
            setWeeklyLogs(weeklyData);

            // Handle habits - initialize if needed
            let finalHabits = habits;
            if (habits.length === 0) {
                await initializeDefaultHabits(user.$id);
                finalHabits = await getHabits(user.$id);
            }

            const habitLogsMap = new Map(habitLogs.map(l => [l.habit_id, l]));
            const dailyHabitStatuses: DailyHabitStatus[] = finalHabits.map(habit => ({
                habit,
                completed: habitLogsMap.get(habit.$id)?.completed || false,
                logId: habitLogsMap.get(habit.$id)?.$id,
            }));
            setDailyHabits(dailyHabitStatuses);

            // Set remaining data
            setHeatmapData(heatmap);
            setTodayRoutine(routine);
            setTodayWorkoutLog(workoutLog);
            setRecentWorkouts(workoutHistory);
            // Note: Meals are handled by separate effect
            setFavoriteMeals(favorites);
            setMealPresets(presets);


        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, today]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleHabit = useCallback(async (habitId: string, completed: boolean) => {
        if (!user) return;

        setDailyHabits(prev =>
            prev.map(h =>
                h.habit.$id === habitId ? { ...h, completed } : h
            )
        );

        const success = await toggleHabitLog(user.$id, habitId, today, completed);
        if (!success) {
            setDailyHabits(prev =>
                prev.map(h =>
                    h.habit.$id === habitId ? { ...h, completed: !completed } : h
                )
            );
        }
    }, [user, today]);

    const handleSaveRecord = useCallback(async (record: { date: string; weight: number; bodyFat?: number; timeOfDay?: 'morning' | 'evening' }) => {
        if (!user) return;

        const newLog = await addWeightLog(user.$id, record.weight, record.bodyFat, record.date, record.timeOfDay);
        if (newLog) {
            await loadData();
        }
        setIsModalOpen(false);
    }, [user, loadData]);

    const handleSaveWorkout = useCallback(async (title: string, description: string, durationMin: number) => {
        if (!user) return;

        const newLog = await addWorkoutLog(user.$id, title, description, durationMin, today);
        if (newLog) {
            setTodayWorkoutLog(newLog);
            setRecentWorkouts(prev => [newLog, ...prev.slice(0, 4)]);
        }
        setIsWorkoutModalOpen(false);
    }, [user, today]);

    // Meal handlers
    const handleAddMeal = useCallback((mealType: MealType) => {
        setSelectedMealType(mealType);
        setEditingMeal(null);
        setIsMealModalOpen(true);
    }, []);

    const handleEditMeal = useCallback((meal: MealLog) => {
        setEditingMeal(meal);
        setIsMealModalOpen(true);
    }, []);

    const handleSaveMeal = useCallback(async (foodName: string, calories: number, mealType: MealType, protein?: number, fat?: number, carbs?: number) => {
        if (!user) return;

        const newMeal = await addMealLog(user.$id, mealType, foodName, calories, protein, fat, carbs, mealDate);
        if (newMeal) {
            setDisplayedMeals(prev => [...prev, newMeal]);
        }
        setIsMealModalOpen(false);
    }, [user, mealDate]); // Use mealDate for saving

    const handleUpdateMeal = useCallback(async (logId: string, foodName: string, calories: number, protein?: number, fat?: number, carbs?: number) => {
        const updated = await updateMealLog(logId, { food_name: foodName, calories, protein, fat, carbs });
        if (updated) {
            setDisplayedMeals(prev => prev.map(m => m.$id === logId ? updated : m));
        }
        setIsMealModalOpen(false);
        setEditingMeal(null);
    }, []);

    const handleDeleteMeal = useCallback(async (mealId: string) => {
        const success = await deleteMealLog(mealId);
        if (success) {
            setDisplayedMeals(prev => prev.filter(m => m.$id !== mealId));
        }
    }, []);

    const handleCompleteSetup = useCallback(async (data: SetupData) => {
        if (!profile || !user) return;

        await updateProfile(profile.$id, {
            height: data.height,
            target_weight: data.targetWeight,
            target_calories: data.targetCalories,
            target_protein: data.targetProtein,
            target_fat: data.targetFat,
            target_carbs: data.targetCarbs,
        });

        setProfile({
            ...profile,
            height: data.height,
            target_weight: data.targetWeight,
            target_calories: data.targetCalories,
            target_protein: data.targetProtein,
            target_fat: data.targetFat,
            target_carbs: data.targetCarbs,
        });

        if (data.currentWeight) {
            const weightLog = await addWeightLog(user.$id, data.currentWeight, undefined);
            if (weightLog) {
                setLatestLog(weightLog);
            }
        }

        completeSetup();
    }, [profile, user, completeSetup]);

    // Calculate PFC summary from displayed meals
    const pfcSummary: PFCSummary = useMemo(() => {
        return displayedMeals.reduce(
            (acc, meal) => ({
                calories: acc.calories + (meal.calories || 0),
                protein: acc.protein + (meal.protein || 0),
                fat: acc.fat + (meal.fat || 0),
                carbs: acc.carbs + (meal.carbs || 0),
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );
    }, [displayedMeals]);

    const targetPFC = useMemo(() => {
        if (!profile?.target_calories) return null;
        return {
            calories: profile.target_calories,
            protein: profile.target_protein || 120,
            fat: profile.target_fat || 60,
            carbs: profile.target_carbs || 200,
        };
    }, [profile]);

    const weightDiff =
        latestLog && previousLog ? latestLog.weight - previousLog.weight : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-grit-bg pb-24 md:pb-6">
                <Header />
                <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {/* Main content - spans 2 columns on xl */}
                        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                            <SkeletonSummaryCard />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                <SkeletonChart />
                                <SkeletonChart />
                            </div>
                            <SkeletonHeatmap />
                        </div>
                        {/* Sidebar */}
                        <div className="space-y-4 lg:space-y-6">
                            <SkeletonHabits />
                            <SkeletonMeals />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grit-bg pb-24 md:pb-6">
            <Header />

            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                {/* Desktop action button */}
                <div className="hidden md:flex justify-end mb-4 lg:mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-105 active:scale-95 transition-transform"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        今日の記録
                    </button>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">

                    {/* Left Column - Weight & Charts (spans 2 cols on xl) */}
                    <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                        {/* Summary Card - full width */}
                        <SummaryCard
                            latestWeight={latestLog?.weight ?? null}
                            weightDiff={weightDiff}
                            targetWeight={profile?.target_weight ?? null}
                        />

                        {/* Stats Summary */}
                        {user && (
                            <StatsSummary
                                userId={user.$id}
                                weeklyLogs={weeklyLogs}
                                habits={dailyHabits}
                                targetWeight={profile?.target_weight}
                            />
                        )}

                        {/* Heatmap - only visible on larger screens to save mobile space */}
                        <div className="hidden md:block">
                            <ContributionHeatmap data={heatmapData} months={3} />
                        </div>
                    </div>

                    {/* Right Column - Today's Activities */}
                    <div className="space-y-4 lg:space-y-6">
                        {/* Workout section */}
                        <TodayWorkout
                            routine={todayRoutine}
                            todayLog={todayWorkoutLog}
                            onComplete={handleSaveWorkout}
                        />

                        {/* Habits - compact on mobile */}
                        <DailyHabits
                            habits={dailyHabits}
                            onToggle={handleToggleHabit}
                        />

                        {/* Meals Dashboard */}
                        <MealDashboard
                            meals={displayedMeals}
                            favoriteMeals={favoriteMeals}
                            currentPFC={pfcSummary}
                            targetPFC={targetPFC}
                            onAddMeal={handleAddMeal}
                            onEditMeal={handleEditMeal}
                            onDeleteMeal={handleDeleteMeal}
                            onQuickAdd={async (meal, mealType) => {
                                if (!user) return;
                                await addMealLog(user.$id, mealType, meal.name, meal.calories, meal.protein, meal.fat, meal.carbs, mealDate);
                                await incrementFavoriteMealUseCount(meal.$id);
                                const updatedMeals = await getMealLogsForDate(user.$id, mealDate);
                                setDisplayedMeals(updatedMeals);
                            }}
                            onOpenFavorites={() => setIsFavoriteSelectorOpen(true)}
                            onOpenManualEntry={(mealType) => {
                                setSelectedMealType(mealType);
                                setEditingMeal(null);
                                setIsMealModalOpen(true);
                            }}
                            selectedDate={mealDate}
                            onDateChange={setMealDate}
                            isToday={mealDate === today}
                            todayDate={today}
                        />

                        {/* Recent workouts - hidden on mobile */}
                        <div className="hidden sm:block">
                            <RecentWorkouts logs={recentWorkouts} />
                        </div>
                    </div>

                    {/* Mobile: Heatmap and Stats at bottom */}
                    <div className="md:hidden space-y-4">
                        <ContributionHeatmap data={heatmapData} months={3} />
                    </div>
                </div>
            </main>

            <FloatingButton onClick={() => setIsModalOpen(true)} />

            <RecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRecord}
            />

            <WorkoutModal
                isOpen={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
                onSave={handleSaveWorkout}
                routine={todayRoutine}
            />

            <MealModal
                isOpen={isMealModalOpen}
                onClose={() => {
                    setIsMealModalOpen(false);
                    setEditingMeal(null);
                }}
                onSave={handleSaveMeal}
                onUpdate={handleUpdateMeal}
                onAddToFavorites={async (foodName, calories, protein, fat, carbs) => {
                    if (!user) return;
                    const meal = await addFavoriteMeal(user.$id, foodName, calories, protein, fat, carbs);
                    if (meal) {
                        setFavoriteMeals(prev => {
                            const exists = prev.find(m => m.$id === meal.$id);
                            if (exists) return prev.map(m => m.$id === meal.$id ? meal : m);
                            return [meal, ...prev];
                        });
                    }
                }}
                initialMealType={selectedMealType}
                editingMeal={editingMeal}
            />

            <FavoriteMealSelector
                isOpen={isFavoriteSelectorOpen}
                onClose={() => setIsFavoriteSelectorOpen(false)}
                favoriteMeals={favoriteMeals}
                mealPresets={mealPresets}
                onSelectFavorite={async (meal, mealType) => {
                    if (!user) return;
                    await addMealLog(user.$id, mealType, meal.name, meal.calories, meal.protein, meal.fat, meal.carbs, mealDate);
                    await incrementFavoriteMealUseCount(meal.$id);
                    const updatedMeals = await getMealLogsForDate(user.$id, mealDate);
                    setDisplayedMeals(updatedMeals);
                }}
                onSelectPreset={async (preset, mealType) => {
                    if (!user) return;
                    try {
                        const items = JSON.parse(preset.items) as { name: string; calories: number; protein?: number | null; fat?: number | null; carbs?: number | null }[];
                        for (const item of items) {
                            await addMealLog(user.$id, mealType, item.name, item.calories, item.protein, item.fat, item.carbs, mealDate);
                        }
                        await incrementMealPresetUseCount(preset.$id);
                        const updatedMeals = await getMealLogsForDate(user.$id, mealDate);
                        setDisplayedMeals(updatedMeals);
                    } catch (e) {
                        console.error('Error parsing preset items:', e);
                    }
                }}
                onDeleteFavorite={async (mealId) => {
                    if (confirm('このお気に入りを削除しますか？')) {
                        await deleteFavoriteMeal(mealId);
                        setFavoriteMeals(prev => prev.filter(m => m.$id !== mealId));
                    }
                }}
                onDeletePreset={async (presetId) => {
                    if (confirm('このセットメニューを削除しますか？')) {
                        await deleteMealPreset(presetId);
                        setMealPresets(prev => prev.filter(p => p.$id !== presetId));
                    }
                }}
                initialMealType={selectedMealType}
            />



            <InitialSetupWizard
                isOpen={showSetup}
                onComplete={handleCompleteSetup}
                onSkip={skipSetup}
            />
        </div>
    );
}
