import type { Models } from 'appwrite';

// Appwrite Document Types
export interface Profile extends Models.Document {
    user_id: string;
    target_weight: number | null;
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


