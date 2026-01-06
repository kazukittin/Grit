import type { Models } from 'appwrite';

// Appwrite Document Types
export interface Profile extends Models.Document {
    user_id: string;
    target_weight: number | null;
    target_calories: number | null; // 1日の目標カロリー
    target_protein: number | null;  // 目標タンパク質(g)
    target_fat: number | null;      // 目標脂質(g)
    target_carbs: number | null;    // 目標炭水化物(g)
}

export interface WeightLog extends Models.Document {
    user_id: string;
    weight: number;
    fat_percentage: number | null;
    date: string; // ISO date string
}

export interface Habit extends Models.Document {
    user_id: string;
    title: string;
    is_active: boolean;
}

export interface HabitLog extends Models.Document {
    user_id: string;
    habit_id: string;
    date: string; // ISO date string
    completed: boolean;
}

export interface WorkoutRoutine extends Models.Document {
    user_id: string;
    day_of_week: number; // 0-6 (Sunday = 0)
    title: string;
    description: string;
}

export interface WorkoutLog extends Models.Document {
    user_id: string;
    date: string; // ISO date string
    title: string;
    description: string;
    duration_min: number;
}

export interface MealLog extends Models.Document {
    user_id: string;
    date: string; // ISO date string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_name: string;
    calories: number;
    protein: number | null;  // タンパク質(g)
    fat: number | null;      // 脂質(g)
    carbs: number | null;    // 炭水化物(g)
}

// PFC Summary for display
export interface PFCSummary {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

// Frontend Types
export interface DailyHabitStatus {
    habit: Habit;
    completed: boolean;
    logId?: string;
}

export interface HeatmapDay {
    date: string;
    level: number; // 0-4 (0 = no activity, 4 = max activity)
    weightLogged: boolean;
    habitsCompleted: number;
    habitsTotal: number;
}

export interface UserStats {
    currentWeight: number | null;
    previousWeight: number | null;
    targetWeight: number | null;
    recordedDays: number;
    level: number;
}

// Day of week helpers
export const DAY_NAMES = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'] as const;
export const DAY_NAMES_SHORT = ['日', '月', '火', '水', '木', '金', '土'] as const;

// Meal type helpers
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const MEAL_TYPES: { type: MealType; label: string; icon: 'sunrise' | 'sun' | 'sunset' | 'cookie' }[] = [
    { type: 'breakfast', label: '朝食', icon: 'sunrise' },
    { type: 'lunch', label: '昼食', icon: 'sun' },
    { type: 'dinner', label: '夕食', icon: 'sunset' },
    { type: 'snack', label: '間食', icon: 'cookie' },
];

// ============ Achievements / Milestones ============

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'streak' | 'weight' | 'habit' | 'workout' | 'meal';
    condition: (stats: AchievementStats) => boolean;
    unlockedAt?: string; // ISO date
}

export interface AchievementStats {
    totalDaysRecorded: number;
    currentStreak: number;
    longestStreak: number;
    totalWeightLoss: number;
    totalHabitsCompleted: number;
    totalWorkouts: number;
    totalMeals: number;
    currentWeight: number | null;
    targetWeight: number | null;
    startWeight: number | null;
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: string;
}

// ============ Diary / Notes ============

// DiaryEntry is stored in localStorage, so doesn't need to extend Models.Document
export interface DiaryEntry {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions?: string[];
    $collectionId?: string;
    $databaseId?: string;
    user_id: string;
    date: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    note: string;
    energy_level: number; // 1-5
}

// ============ Statistics ============

export interface WeeklyStats {
    weekStart: string;
    weekEnd: string;
    avgWeight: number | null;
    weightChange: number | null;
    avgCalories: number;
    habitsCompletionRate: number;
    workoutCount: number;
}

export interface MonthlyStats {
    month: string; // YYYY-MM
    avgWeight: number | null;
    minWeight: number | null;
    maxWeight: number | null;
    totalCalories: number;
    avgDailyCalories: number;
    totalWorkouts: number;
    totalWorkoutMinutes: number;
    habitsCompletionRate: number;
}

export interface DayOfWeekStats {
    dayOfWeek: number;
    avgWeight: number | null;
    avgCalories: number;
    habitsCompletionRate: number;
}

// ============ Data Export ============

export interface ExportData {
    exportedAt: string;
    profile: Profile | null;
    weightLogs: WeightLog[];
    habits: Habit[];
    habitLogs: HabitLog[];
    workoutLogs: WorkoutLog[];
    mealLogs: MealLog[];
    diaryEntries: DiaryEntry[];
}

