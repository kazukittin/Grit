export interface WeightLog {
    id: string;
    date: string; // YYYY-MM-DD format
    weight: number;
    bodyFat?: number;
    createdAt: string;
}

export interface Habit {
    id: string;
    name: string;
    completed: boolean;
}

export interface DailyHabits {
    date: string; // YYYY-MM-DD format
    habits: Habit[];
}

export interface AppData {
    logs: WeightLog[];
    dailyHabits: DailyHabits;
}

export const DEFAULT_HABITS: Omit<Habit, 'completed'>[] = [
    { id: 'water', name: '水を2リットル飲む' },
    { id: 'exercise', name: '10分間の運動' },
    { id: 'measure', name: '体重を測る' },
];
