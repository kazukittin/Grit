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
