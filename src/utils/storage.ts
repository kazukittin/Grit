import type { AppData, DailyHabits, WeightLog } from '../types';
import { DEFAULT_HABITS } from '../types';

const STORAGE_KEY = 'grit-app-data';

const getToday = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

const createDefaultHabits = (date: string): DailyHabits => ({
    date,
    habits: DEFAULT_HABITS.map(h => ({ ...h, completed: false })),
});

export const loadData = (): AppData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return {
                logs: [],
                dailyHabits: createDefaultHabits(getToday()),
            };
        }

        const data: AppData = JSON.parse(stored);
        const today = getToday();

        // Reset habits if it's a new day
        if (data.dailyHabits.date !== today) {
            data.dailyHabits = createDefaultHabits(today);
            saveData(data);
        }

        return data;
    } catch {
        return {
            logs: [],
            dailyHabits: createDefaultHabits(getToday()),
        };
    }
};

export const saveData = (data: AppData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addWeightLog = (log: Omit<WeightLog, 'id' | 'createdAt'>): WeightLog => {
    const data = loadData();
    const newLog: WeightLog = {
        ...log,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    // Check if there's already a log for the same date and update it
    const existingIndex = data.logs.findIndex(l => l.date === log.date);
    if (existingIndex !== -1) {
        data.logs[existingIndex] = newLog;
    } else {
        data.logs.push(newLog);
    }

    // Sort logs by date (newest first)
    data.logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    saveData(data);
    return newLog;
};

export const toggleHabit = (habitId: string): void => {
    const data = loadData();
    const habit = data.dailyHabits.habits.find(h => h.id === habitId);
    if (habit) {
        habit.completed = !habit.completed;
        saveData(data);
    }
};

export const getRecordedDaysCount = (): number => {
    const data = loadData();
    return data.logs.length;
};

export const getLevel = (): number => {
    const days = getRecordedDaysCount();
    return Math.floor(days / 5) + 1;
};

export const getWeeklyLogs = (): WeightLog[] => {
    const data = loadData();
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    return data.logs
        .filter(log => {
            const logDate = new Date(log.date);
            return logDate >= weekAgo && logDate <= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getLatestLog = (): WeightLog | null => {
    const data = loadData();
    return data.logs[0] || null;
};

export const getPreviousLog = (): WeightLog | null => {
    const data = loadData();
    return data.logs[1] || null;
};
