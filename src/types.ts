import type { Models } from 'appwrite';

// Appwrite Document Types
export interface Profile extends Models.Document {
    user_id: string;
    height: number | null;         // 身長(cm)
    age: number | null;            // 年齢
    gender: 'male' | 'female' | null; // 性別
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
    order: number; // ソート順
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
    description: string; // JSON string of ExerciseItem[]
}

// For storing exercises in WorkoutRoutine.description as JSON
export interface ExerciseItem {
    id: string;
    name: string;
    reps: number; // 回数 or 秒数 (depending on unit)
    unit: 'reps' | 'seconds'; // 回数 or 秒数
    sets: number; // セット数
    calories: number; // 消費カロリー
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

// お気に入りメニュー（単品）
export interface FavoriteMeal extends Models.Document {
    user_id: string;
    name: string;           // メニュー名
    calories: number;       // カロリー
    protein: number | null; // タンパク質(g)
    fat: number | null;     // 脂質(g)
    carbs: number | null;   // 炭水化物(g)
    use_count: number;      // 使用回数（よく使うもの順にソート用）
}

// セットメニュー（複数メニューの組み合わせ）
export interface MealPreset extends Models.Document {
    user_id: string;
    name: string;           // セット名（例：朝食セット）
    items: string;          // JSON string of FavoriteMealItem[]
    total_calories: number; // 合計カロリー
    use_count: number;      // 使用回数
}

// セットメニューのアイテム（JSON保存用）
export interface MealPresetItem {
    name: string;
    calories: number;
    protein: number | null;
    fat: number | null;
    carbs: number | null;
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

// DiaryEntry is now stored in Appwrite database
export interface DiaryEntry extends Models.Document {
    user_id: string;
    date: string;
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    note: string;
    energy_level: number; // 1-5
}

// ============ User Stats (stored in Appwrite) ============

// User statistics for achievements tracking (replaces localStorage counters)
export interface UserStatsDoc extends Models.Document {
    user_id: string;
    total_habits_completed: number;  // 累計習慣完了数
    total_meals_logged: number;      // 累計食事記録数
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

