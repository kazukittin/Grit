import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { WeeklyReport } from '../components/WeeklyReport';
import { DailyHabits } from '../components/DailyHabits';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { RecordModal } from '../components/RecordModal';
import { FloatingButton } from '../components/FloatingButton';
import { TodayWorkout } from '../components/TodayWorkout';
import { WorkoutModal } from '../components/WorkoutModal';
import { RecentWorkouts } from '../components/RecentWorkouts';
import { TodayMeals } from '../components/TodayMeals';
import { MealModal } from '../components/MealModal';
import { CalorieRingChart } from '../components/CalorieRingChart';
import { DiaryModal, MoodCard } from '../components/DiaryModal';
import { OnboardingTour, useOnboarding } from '../components/OnboardingTour';
import { AchievementManager } from '../components/Achievements';
import { InitialSetupWizard, useInitialSetup } from '../components/InitialSetupWizard';
import {
    SkeletonSummaryCard,
    SkeletonChart,
    SkeletonHabits,
    SkeletonHeatmap,
    SkeletonCalorieRing,
    SkeletonMeals,
} from '../components/Skeleton';
import { Plus, BarChart3, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getOrCreateProfile,
    getWeightLogs,
    getWeightLogsInRange,
    addWeightLog,
    getHabits,
    getHabitLogsForDate,
    toggleHabitLog,
    getRecordedDaysCount,
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
    getDiaryEntryForDate,
    saveDiaryEntry,
    getAchievementStats,
    incrementHabitCompletions,
    incrementMealCount,
    updateProfile,
} from '../services/api';
import type { Profile, WeightLog, DailyHabitStatus, HeatmapDay, WorkoutRoutine, WorkoutLog, MealLog, MealType, PFCSummary, DiaryEntry, AchievementStats } from '../types';
import type { SetupData } from '../components/InitialSetupWizard';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Onboarding
    const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

    // Initial setup wizard
    const { showSetup, checkSetupStatus, completeSetup, skipSetup } = useInitialSetup();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [latestLog, setLatestLog] = useState<WeightLog | null>(null);
    const [previousLog, setPreviousLog] = useState<WeightLog | null>(null);
    const [weeklyLogs, setWeeklyLogs] = useState<WeightLog[]>([]);
    const [dailyHabits, setDailyHabits] = useState<DailyHabitStatus[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
    const [level, setLevel] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Workout state
    const [todayRoutine, setTodayRoutine] = useState<WorkoutRoutine | null>(null);
    const [todayWorkoutLog, setTodayWorkoutLog] = useState<WorkoutLog | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

    // Meal state
    const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);

    // Diary state
    const [todayDiary, setTodayDiary] = useState<DiaryEntry | null>(null);
    const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);

    // Achievement state
    const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
    const [previousUnlockedIds, setPreviousUnlockedIds] = useState<string[]>([]);


    const today = new Date().toISOString().split('T')[0];

    const loadData = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        try {
            // Load or create profile
            const profileData = await getOrCreateProfile(user.$id);
            setProfile(profileData);

            // Check if initial setup should be shown
            const hasTargets = !!(profileData?.target_weight || profileData?.target_calories);
            checkSetupStatus(hasTargets);

            // Load weight logs
            const logs = await getWeightLogs(user.$id, 2);
            setLatestLog(logs[0] || null);
            setPreviousLog(logs[1] || null);

            // Load weekly logs
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 6);
            const weeklyData = await getWeightLogsInRange(
                user.$id,
                weekAgo.toISOString().split('T')[0],
                today
            );
            setWeeklyLogs(weeklyData);

            // Load habits and today's logs
            let habits = await getHabits(user.$id);

            // Initialize default habits if none exist
            if (habits.length === 0) {
                await initializeDefaultHabits(user.$id);
                habits = await getHabits(user.$id);
            }

            const habitLogs = await getHabitLogsForDate(user.$id, today);
            const habitLogsMap = new Map(habitLogs.map(l => [l.habit_id, l]));

            const dailyHabitStatuses: DailyHabitStatus[] = habits.map(habit => ({
                habit,
                completed: habitLogsMap.get(habit.$id)?.completed || false,
                logId: habitLogsMap.get(habit.$id)?.$id,
            }));
            setDailyHabits(dailyHabitStatuses);

            // Load level
            const recordedDays = await getRecordedDaysCount(user.$id);
            setLevel(Math.floor(recordedDays / 5) + 1);

            // Load heatmap data
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const heatmap = await getHeatmapData(
                user.$id,
                threeMonthsAgo.toISOString().split('T')[0],
                today
            );
            setHeatmapData(heatmap);

            // Load workout data
            const dayOfWeek = new Date().getDay();
            const [routine, workoutLog, workoutHistory] = await Promise.all([
                getWorkoutRoutineForDay(user.$id, dayOfWeek),
                getWorkoutLogForDate(user.$id, today),
                getWorkoutLogs(user.$id, 5),
            ]);
            setTodayRoutine(routine);
            setTodayWorkoutLog(workoutLog);
            setRecentWorkouts(workoutHistory);

            // Load meal data
            const mealLogs = await getMealLogsForDate(user.$id, today);
            setTodayMeals(mealLogs);

            // Load diary entry for today
            const diaryEntry = await getDiaryEntryForDate(user.$id, today);
            setTodayDiary(diaryEntry);

            // Load achievement stats
            const stats = await getAchievementStats(user.$id);
            setAchievementStats(stats);
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

        // Optimistic update
        setDailyHabits(prev =>
            prev.map(h =>
                h.habit.$id === habitId ? { ...h, completed } : h
            )
        );

        const success = await toggleHabitLog(user.$id, habitId, today, completed);
        if (!success) {
            // Revert on failure
            setDailyHabits(prev =>
                prev.map(h =>
                    h.habit.$id === habitId ? { ...h, completed: !completed } : h
                )
            );
        } else if (completed) {
            // Track for achievements
            incrementHabitCompletions(user.$id);
        }
    }, [user, today]);

    const handleSaveRecord = useCallback(async (record: { date: string; weight: number; bodyFat?: number }) => {
        if (!user) return;

        const newLog = await addWeightLog(user.$id, record.weight, record.bodyFat, record.date);
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

        const newMeal = await addMealLog(user.$id, mealType, foodName, calories, protein, fat, carbs, today);
        if (newMeal) {
            setTodayMeals(prev => [...prev, newMeal]);
            // Track for achievements
            incrementMealCount(user.$id);
        }
        setIsMealModalOpen(false);
    }, [user, today]);

    const handleUpdateMeal = useCallback(async (logId: string, foodName: string, calories: number, protein?: number, fat?: number, carbs?: number) => {
        const updated = await updateMealLog(logId, { food_name: foodName, calories, protein, fat, carbs });
        if (updated) {
            setTodayMeals(prev => prev.map(m => m.$id === logId ? updated : m));
        }
        setIsMealModalOpen(false);
        setEditingMeal(null);
    }, []);

    const handleDeleteMeal = useCallback(async (mealId: string) => {
        const success = await deleteMealLog(mealId);
        if (success) {
            setTodayMeals(prev => prev.filter(m => m.$id !== mealId));
        }
    }, []);

    // Handle initial setup completion
    const handleCompleteSetup = useCallback(async (data: SetupData) => {
        if (!profile) return;

        await updateProfile(profile.$id, {
            target_weight: data.targetWeight,
            target_calories: data.targetCalories,
            target_protein: data.targetProtein,
            target_fat: data.targetFat,
            target_carbs: data.targetCarbs,
        });

        // Update local profile state
        setProfile({
            ...profile,
            target_weight: data.targetWeight,
            target_calories: data.targetCalories,
            target_protein: data.targetProtein,
            target_fat: data.targetFat,
            target_carbs: data.targetCarbs,
        });

        completeSetup();
    }, [profile, completeSetup]);

    // Calculate PFC summary from today's meals
    const pfcSummary: PFCSummary = useMemo(() => {
        return todayMeals.reduce(
            (acc, meal) => ({
                calories: acc.calories + (meal.calories || 0),
                protein: acc.protein + (meal.protein || 0),
                fat: acc.fat + (meal.fat || 0),
                carbs: acc.carbs + (meal.carbs || 0),
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );
    }, [todayMeals]);

    // Target PFC from profile
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
                <Header level={level} />
                <main className="max-w-5xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="md:col-span-3 space-y-6">
                            <SkeletonSummaryCard />
                            <SkeletonChart />
                            <SkeletonChart />
                            <SkeletonHeatmap />
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <SkeletonCalorieRing />
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
            <Header level={level} />

            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* PC用: 「＋ 今日の記録」ボタン */}
                <div className="hidden md:flex justify-end mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-105 active:scale-95 transition-transform"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        今日の記録
                    </button>
                </div>

                {/* レスポンシブグリッド: スマホは縦一列、PCは2カラム */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* 左側 (PCで3カラム = 60%) */}
                    <div className="md:col-span-3 space-y-6">
                        <SummaryCard
                            latestWeight={latestLog?.weight ?? null}
                            weightDiff={weightDiff}
                            targetWeight={profile?.target_weight ?? null}
                        />

                        <WeeklyChart
                            logs={weeklyLogs}
                            targetWeight={profile?.target_weight}
                        />

                        <WeeklyReport
                            logs={weeklyLogs}
                            habits={dailyHabits}
                        />

                        <ContributionHeatmap data={heatmapData} months={3} />
                    </div>

                    {/* 右側 (PCで2カラム = 40%) */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Calorie & PFC Ring Chart */}
                        <CalorieRingChart
                            current={pfcSummary}
                            target={targetPFC}
                        />

                        <TodayWorkout
                            routine={todayRoutine}
                            todayLog={todayWorkoutLog}
                            onComplete={handleSaveWorkout}
                            onEdit={() => setIsWorkoutModalOpen(true)}
                        />

                        <DailyHabits
                            habits={dailyHabits}
                            onToggle={handleToggleHabit}
                        />

                        <TodayMeals
                            meals={todayMeals}
                            onAddMeal={handleAddMeal}
                            onEditMeal={handleEditMeal}
                            onDeleteMeal={handleDeleteMeal}
                        />

                        <MoodCard
                            entry={todayDiary}
                            onEdit={() => setIsDiaryModalOpen(true)}
                        />

                        <RecentWorkouts logs={recentWorkouts} />

                        {/* Quick Navigation */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/stats')}
                                className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-grit-surface-hover hover:bg-grit-border transition-colors group"
                            >
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium text-grit-text">詳細統計</span>
                            </button>
                            <button
                                onClick={() => navigate('/achievements')}
                                className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-grit-surface-hover hover:bg-grit-border transition-colors group"
                            >
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium text-grit-text">実績</span>
                            </button>
                        </div>
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
                initialMealType={selectedMealType}
                editingMeal={editingMeal}
            />

            <DiaryModal
                isOpen={isDiaryModalOpen}
                onClose={() => setIsDiaryModalOpen(false)}
                onSave={async (mood, note, energyLevel) => {
                    if (!user) return;
                    const entry = await saveDiaryEntry(user.$id, today, mood, note, energyLevel);
                    if (entry) {
                        setTodayDiary(entry);
                    }
                }}
                existingEntry={todayDiary}
            />

            {/* Onboarding Tour */}
            <OnboardingTour
                isOpen={showOnboarding}
                onComplete={completeOnboarding}
                onSkip={skipOnboarding}
            />

            {/* Achievement Toast Manager */}
            {achievementStats && (
                <AchievementManager
                    stats={achievementStats}
                    previousUnlockedIds={previousUnlockedIds}
                    onAchievementUnlocked={(achievement) => {
                        // Add to previously unlocked to avoid showing again
                        setPreviousUnlockedIds(prev => [...prev, achievement.id]);
                    }}
                />
            )}

            {/* Initial Setup Wizard for new users */}
            <InitialSetupWizard
                isOpen={showSetup}
                onComplete={handleCompleteSetup}
                onSkip={skipSetup}
            />
        </div>
    );
}
