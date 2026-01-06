import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import type { Profile, WeightLog, Habit, HabitLog, HeatmapDay, WorkoutRoutine, WorkoutLog, MealLog, MealType } from '../types';

// Type helper for Appwrite documents
function asProfile(doc: unknown): Profile {
    return doc as Profile;
}

function asWeightLog(doc: unknown): WeightLog {
    return doc as WeightLog;
}

function asWeightLogArray(docs: unknown[]): WeightLog[] {
    return docs as WeightLog[];
}

function asHabit(doc: unknown): Habit {
    return doc as Habit;
}

function asHabitArray(docs: unknown[]): Habit[] {
    return docs as Habit[];
}

function asHabitLogArray(docs: unknown[]): HabitLog[] {
    return docs as HabitLog[];
}

// ============ Profile API ============

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [Query.equal('user_id', userId), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return asProfile(response.documents[0]);
        }
        return null;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

export async function createProfile(userId: string): Promise<Profile | null> {
    try {
        const profile = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            ID.unique(),
            {
                user_id: userId,
                target_weight: null,
            }
        );
        return asProfile(profile);
    } catch (error) {
        console.error('Error creating profile:', error);
        return null;
    }
}

export async function updateProfile(
    profileId: string,
    updates: {
        target_weight?: number | null;
        target_calories?: number | null;
        target_protein?: number | null;
        target_fat?: number | null;
        target_carbs?: number | null;
    }
): Promise<boolean> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            profileId,
            updates
        );
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
}

export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
    let profile = await getProfile(userId);
    if (!profile) {
        profile = await createProfile(userId);
    }
    return profile;
}

// ============ Weight Logs API ============

export async function getWeightLogs(userId: string, limit?: number): Promise<WeightLog[]> {
    try {
        const queries = [
            Query.equal('user_id', userId),
            Query.orderDesc('date'),
        ];

        if (limit) {
            queries.push(Query.limit(limit));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WEIGHT_LOGS,
            queries
        );

        return asWeightLogArray(response.documents);
    } catch (error) {
        console.error('Error fetching weight logs:', error);
        return [];
    }
}

export async function getWeightLogsInRange(userId: string, startDate: string, endDate: string): Promise<WeightLog[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WEIGHT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.greaterThanEqual('date', startDate),
                Query.lessThanEqual('date', endDate),
                Query.orderAsc('date'),
            ]
        );

        return asWeightLogArray(response.documents);
    } catch (error) {
        console.error('Error fetching weight logs in range:', error);
        return [];
    }
}

export async function addWeightLog(
    userId: string,
    weight: number,
    fatPercentage?: number,
    date?: string
): Promise<WeightLog | null> {
    const logDate = date || new Date().toISOString().split('T')[0];

    try {
        // Check if entry exists for this date
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WEIGHT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('date', logDate),
                Query.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing
            const updated = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.WEIGHT_LOGS,
                existing.documents[0].$id,
                { weight, fat_percentage: fatPercentage ?? null }
            );
            return asWeightLog(updated);
        } else {
            // Create new
            const created = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.WEIGHT_LOGS,
                ID.unique(),
                {
                    user_id: userId,
                    weight,
                    fat_percentage: fatPercentage ?? null,
                    date: logDate,
                }
            );
            return asWeightLog(created);
        }
    } catch (error) {
        console.error('Error adding/updating weight log:', error);
        return null;
    }
}

export async function getRecordedDaysCount(userId: string): Promise<number> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WEIGHT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.limit(1000), // Appwrite max limit for counting
            ]
        );
        return response.total;
    } catch (error) {
        console.error('Error counting weight logs:', error);
        return 0;
    }
}

// ============ Habits API ============

export async function getHabits(userId: string): Promise<Habit[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            [
                Query.equal('user_id', userId),
                Query.equal('is_active', true),
                Query.orderAsc('$createdAt'),
            ]
        );

        return asHabitArray(response.documents);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return [];
    }
}

export async function getAllHabits(userId: string): Promise<Habit[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            [
                Query.equal('user_id', userId),
                Query.orderAsc('$createdAt'),
            ]
        );

        return asHabitArray(response.documents);
    } catch (error) {
        console.error('Error fetching all habits:', error);
        return [];
    }
}

export async function createHabit(userId: string, title: string): Promise<Habit | null> {
    try {
        const habit = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            ID.unique(),
            {
                user_id: userId,
                title,
                is_active: true,
            }
        );
        return asHabit(habit);
    } catch (error) {
        console.error('Error creating habit:', error);
        return null;
    }
}

export async function updateHabit(habitId: string, updates: Partial<{ title: string; is_active: boolean }>): Promise<boolean> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            habitId,
            updates
        );
        return true;
    } catch (error) {
        console.error('Error updating habit:', error);
        return false;
    }
}

export async function deleteHabit(habitId: string): Promise<boolean> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            habitId
        );
        return true;
    } catch (error) {
        console.error('Error deleting habit:', error);
        return false;
    }
}

export async function initializeDefaultHabits(userId: string): Promise<void> {
    const defaultHabits = [
        '水を2リットル飲む',
        '10分間の運動',
        '体重を測る',
    ];

    for (const title of defaultHabits) {
        await createHabit(userId, title);
    }
}

// ============ Habit Logs API ============

export async function getHabitLogsForDate(userId: string, date: string): Promise<HabitLog[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABIT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('date', date),
            ]
        );

        return asHabitLogArray(response.documents);
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        return [];
    }
}

export async function toggleHabitLog(
    userId: string,
    habitId: string,
    date: string,
    completed: boolean
): Promise<boolean> {
    try {
        // Check if log exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABIT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('habit_id', habitId),
                Query.equal('date', date),
                Query.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.HABIT_LOGS,
                existing.documents[0].$id,
                { completed }
            );
        } else {
            // Create new
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.HABIT_LOGS,
                ID.unique(),
                {
                    user_id: userId,
                    habit_id: habitId,
                    date,
                    completed,
                }
            );
        }
        return true;
    } catch (error) {
        console.error('Error toggling habit log:', error);
        return false;
    }
}

// ============ Heatmap Data API ============

export async function getHeatmapData(
    userId: string,
    startDate: string,
    endDate: string
): Promise<HeatmapDay[]> {
    try {
        // Get weight logs in range
        const weightLogs = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WEIGHT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.greaterThanEqual('date', startDate),
                Query.lessThanEqual('date', endDate),
                Query.limit(500),
            ]
        );

        // Get habit logs in range
        const habitLogs = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABIT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.greaterThanEqual('date', startDate),
                Query.lessThanEqual('date', endDate),
                Query.limit(1000),
            ]
        );

        // Get active habits count
        const habits = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HABITS,
            [
                Query.equal('user_id', userId),
                Query.equal('is_active', true),
            ]
        );

        const totalHabits = habits.total || 3;

        // Create maps for quick lookup
        const weightDates = new Set(
            asWeightLogArray(weightLogs.documents).map((doc) => doc.date)
        );

        const habitLogsByDate = new Map<string, number>();
        asHabitLogArray(habitLogs.documents).forEach(log => {
            if (log.completed) {
                const count = habitLogsByDate.get(log.date) || 0;
                habitLogsByDate.set(log.date, count + 1);
            }
        });

        // Generate all dates in range
        const result: HeatmapDay[] = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const weightLogged = weightDates.has(dateStr);
            const habitsCompleted = habitLogsByDate.get(dateStr) || 0;

            // Calculate activity level (0-4)
            let level = 0;
            if (weightLogged || habitsCompleted > 0) {
                const weightScore = weightLogged ? 1 : 0;
                const habitScore = totalHabits > 0 ? (habitsCompleted / totalHabits) * 3 : 0;
                level = Math.min(4, Math.round(weightScore + habitScore));
            }

            result.push({
                date: dateStr,
                level,
                weightLogged,
                habitsCompleted,
                habitsTotal: totalHabits,
            });

            current.setDate(current.getDate() + 1);
        }

        return result;
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return [];
    }
}

// ============ Workout Routines API ============

function asWorkoutRoutine(doc: unknown): WorkoutRoutine {
    return doc as WorkoutRoutine;
}

function asWorkoutRoutineArray(docs: unknown[]): WorkoutRoutine[] {
    return docs as WorkoutRoutine[];
}

function asWorkoutLog(doc: unknown): WorkoutLog {
    return doc as WorkoutLog;
}

function asWorkoutLogArray(docs: unknown[]): WorkoutLog[] {
    return docs as WorkoutLog[];
}

export async function getWorkoutRoutines(userId: string): Promise<WorkoutRoutine[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_ROUTINES,
            [
                Query.equal('user_id', userId),
                Query.orderAsc('day_of_week'),
            ]
        );

        return asWorkoutRoutineArray(response.documents);
    } catch (error) {
        console.error('Error fetching workout routines:', error);
        return [];
    }
}

export async function getWorkoutRoutineForDay(userId: string, dayOfWeek: number): Promise<WorkoutRoutine | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_ROUTINES,
            [
                Query.equal('user_id', userId),
                Query.equal('day_of_week', dayOfWeek),
                Query.limit(1),
            ]
        );

        if (response.documents.length > 0) {
            return asWorkoutRoutine(response.documents[0]);
        }
        return null;
    } catch (error) {
        console.error('Error fetching workout routine for day:', error);
        return null;
    }
}

export async function saveWorkoutRoutine(
    userId: string,
    dayOfWeek: number,
    title: string,
    description: string
): Promise<WorkoutRoutine | null> {
    try {
        // Check if routine exists for this day
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_ROUTINES,
            [
                Query.equal('user_id', userId),
                Query.equal('day_of_week', dayOfWeek),
                Query.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing
            const updated = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.WORKOUT_ROUTINES,
                existing.documents[0].$id,
                { title, description }
            );
            return asWorkoutRoutine(updated);
        } else {
            // Create new
            const created = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.WORKOUT_ROUTINES,
                ID.unique(),
                {
                    user_id: userId,
                    day_of_week: dayOfWeek,
                    title,
                    description,
                }
            );
            return asWorkoutRoutine(created);
        }
    } catch (error) {
        console.error('Error saving workout routine:', error);
        return null;
    }
}

export async function deleteWorkoutRoutine(routineId: string): Promise<boolean> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_ROUTINES,
            routineId
        );
        return true;
    } catch (error) {
        console.error('Error deleting workout routine:', error);
        return false;
    }
}

// ============ Workout Logs API ============

export async function getWorkoutLogs(userId: string, limit?: number): Promise<WorkoutLog[]> {
    try {
        const queries = [
            Query.equal('user_id', userId),
            Query.orderDesc('date'),
        ];

        if (limit) {
            queries.push(Query.limit(limit));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_LOGS,
            queries
        );

        return asWorkoutLogArray(response.documents);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        return [];
    }
}

export async function getWorkoutLogForDate(userId: string, date: string): Promise<WorkoutLog | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('date', date),
                Query.limit(1),
            ]
        );

        if (response.documents.length > 0) {
            return asWorkoutLog(response.documents[0]);
        }
        return null;
    } catch (error) {
        console.error('Error fetching workout log for date:', error);
        return null;
    }
}

export async function addWorkoutLog(
    userId: string,
    title: string,
    description: string,
    durationMin: number,
    date?: string
): Promise<WorkoutLog | null> {
    const logDate = date || new Date().toISOString().split('T')[0];

    try {
        // Check if entry exists for this date
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('date', logDate),
                Query.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing
            const updated = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.WORKOUT_LOGS,
                existing.documents[0].$id,
                { title, description, duration_min: durationMin }
            );
            return asWorkoutLog(updated);
        } else {
            // Create new
            const created = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.WORKOUT_LOGS,
                ID.unique(),
                {
                    user_id: userId,
                    date: logDate,
                    title,
                    description,
                    duration_min: durationMin,
                }
            );
            return asWorkoutLog(created);
        }
    } catch (error) {
        console.error('Error adding/updating workout log:', error);
        return null;
    }
}

export async function deleteWorkoutLog(logId: string): Promise<boolean> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.WORKOUT_LOGS,
            logId
        );
        return true;
    } catch (error) {
        console.error('Error deleting workout log:', error);
        return false;
    }
}

// ============ Meal Logs API ============

function asMealLog(doc: unknown): MealLog {
    return doc as MealLog;
}

function asMealLogArray(docs: unknown[]): MealLog[] {
    return docs as MealLog[];
}

export async function getMealLogsForDate(userId: string, date: string): Promise<MealLog[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.MEAL_LOGS,
            [
                Query.equal('user_id', userId),
                Query.equal('date', date),
                Query.orderAsc('$createdAt'),
            ]
        );

        return asMealLogArray(response.documents);
    } catch (error) {
        console.error('Error fetching meal logs:', error);
        return [];
    }
}

export async function addMealLog(
    userId: string,
    mealType: MealType,
    foodName: string,
    calories: number,
    protein?: number | null,
    fat?: number | null,
    carbs?: number | null,
    date?: string
): Promise<MealLog | null> {
    const logDate = date || new Date().toISOString().split('T')[0];

    try {
        const created = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.MEAL_LOGS,
            ID.unique(),
            {
                user_id: userId,
                date: logDate,
                meal_type: mealType,
                food_name: foodName,
                calories: calories || 0,
                protein: protein ?? null,
                fat: fat ?? null,
                carbs: carbs ?? null,
            }
        );
        return asMealLog(created);
    } catch (error) {
        console.error('Error adding meal log:', error);
        return null;
    }
}

export async function updateMealLog(
    logId: string,
    updates: {
        food_name?: string;
        calories?: number;
        protein?: number | null;
        fat?: number | null;
        carbs?: number | null;
    }
): Promise<MealLog | null> {
    try {
        const updated = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.MEAL_LOGS,
            logId,
            updates
        );
        return asMealLog(updated);
    } catch (error) {
        console.error('Error updating meal log:', error);
        return null;
    }
}

export async function deleteMealLog(logId: string): Promise<boolean> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.MEAL_LOGS,
            logId
        );
        return true;
    } catch (error) {
        console.error('Error deleting meal log:', error);
        return false;
    }
}

// ============ Diary / Notes API ============

import type { DiaryEntry, AchievementStats, ExportData } from '../types';

// Note: For diary entries, we use localStorage as a simple storage solution
// You can create a 'diary_entries' collection in Appwrite for persistent cloud storage

export async function getDiaryEntryForDate(userId: string, date: string): Promise<DiaryEntry | null> {
    try {
        const key = `diary_${userId}_${date}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    } catch (error) {
        console.error('Error fetching diary entry:', error);
        return null;
    }
}

export async function saveDiaryEntry(
    userId: string,
    date: string,
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible',
    note: string,
    energyLevel: number
): Promise<DiaryEntry | null> {
    try {
        const entry: DiaryEntry = {
            $id: `diary_${userId}_${date}`,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            $collectionId: 'diary_entries',
            $databaseId: DATABASE_ID,
            user_id: userId,
            date,
            mood,
            note,
            energy_level: energyLevel,
        };
        localStorage.setItem(`diary_${userId}_${date}`, JSON.stringify(entry));
        return entry;
    } catch (error) {
        console.error('Error saving diary entry:', error);
        return null;
    }
}

// ============ Statistics API ============

export async function getStreakData(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    try {
        const logs = await getWeightLogs(userId, 365);
        if (logs.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        // Sort by date descending
        const sortedDates = logs
            .map((l) => l.date)
            .sort((a, b) => b.localeCompare(a));

        const today = new Date().toISOString().split('T')[0];
        let currentStreak = 0;
        let longestStreak = 0;
        let streak = 0;
        const expectedDate = new Date(today);

        // Calculate current streak
        for (let i = 0; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            const expected = expectedDate.toISOString().split('T')[0];

            if (date === expected) {
                currentStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (date < expected) {
                break;
            }
        }

        // Calculate longest streak
        const sortedAsc = [...sortedDates].sort((a, b) => a.localeCompare(b));
        let prevDate: Date | null = null;

        for (const dateStr of sortedAsc) {
            const date = new Date(dateStr);
            if (prevDate) {
                const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    streak++;
                } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            prevDate = date;
        }
        longestStreak = Math.max(longestStreak, streak);

        return { currentStreak, longestStreak };
    } catch (error) {
        console.error('Error calculating streak:', error);
        return { currentStreak: 0, longestStreak: 0 };
    }
}

export async function getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
        const [weightLogs, streakData, workoutLogs] = await Promise.all([
            getWeightLogs(userId, 1000),
            getStreakData(userId),
            getWorkoutLogs(userId, 1000),
        ]);

        // Get habit completion count from localStorage
        const habitCompletionKey = `habit_completions_${userId}`;
        const storedCompletions = localStorage.getItem(habitCompletionKey);
        const totalHabitsCompleted = storedCompletions ? parseInt(storedCompletions, 10) : 0;

        // Get meal log count from localStorage
        const mealCountKey = `meal_count_${userId}`;
        const storedMealCount = localStorage.getItem(mealCountKey);
        const totalMeals = storedMealCount ? parseInt(storedMealCount, 10) : 0;

        // Calculate weight stats
        const sortedWeights = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
        const startWeight = sortedWeights[0]?.weight || null;
        const currentWeight = sortedWeights[sortedWeights.length - 1]?.weight || null;
        const totalWeightLoss = startWeight && currentWeight ? startWeight - currentWeight : 0;

        // Get profile for target weight
        const profile = await getProfile(userId);

        return {
            totalDaysRecorded: weightLogs.length,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            totalWeightLoss: Math.max(0, totalWeightLoss),
            totalHabitsCompleted,
            totalWorkouts: workoutLogs.length,
            totalMeals,
            currentWeight,
            targetWeight: profile?.target_weight || null,
            startWeight,
        };
    } catch (error) {
        console.error('Error getting achievement stats:', error);
        return {
            totalDaysRecorded: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalWeightLoss: 0,
            totalHabitsCompleted: 0,
            totalWorkouts: 0,
            totalMeals: 0,
            currentWeight: null,
            targetWeight: null,
            startWeight: null,
        };
    }
}

// Track habit completions for achievements
export function incrementHabitCompletions(userId: string, count: number = 1): void {
    const key = `habit_completions_${userId}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (current + count).toString());
}

// Track meal count for achievements
export function incrementMealCount(userId: string, count: number = 1): void {
    const key = `meal_count_${userId}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (current + count).toString());
}

// ============ Data Export/Import API ============

export async function exportAllData(userId: string): Promise<ExportData> {
    const [profile, weightLogs, habits, workoutLogs] = await Promise.all([
        getProfile(userId),
        getWeightLogs(userId, 10000),
        getAllHabits(userId),
        getWorkoutLogs(userId, 10000),
    ]);

    // Collect diary entries from localStorage
    const diaryEntries: DiaryEntry[] = [];
    const diaryPrefix = `diary_${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(diaryPrefix)) {
            const entry = localStorage.getItem(key);
            if (entry) {
                try {
                    diaryEntries.push(JSON.parse(entry));
                } catch {
                    // Skip invalid entries
                }
            }
        }
    }

    return {
        exportedAt: new Date().toISOString(),
        profile,
        weightLogs,
        habits,
        habitLogs: [],
        workoutLogs,
        mealLogs: [],
        diaryEntries,
    };
}

export async function importData(userId: string, data: ExportData): Promise<boolean> {
    try {
        // Import weight logs
        for (const log of data.weightLogs) {
            await addWeightLog(userId, log.weight, log.fat_percentage ?? undefined, log.date);
        }

        // Import diary entries
        for (const entry of data.diaryEntries) {
            await saveDiaryEntry(userId, entry.date, entry.mood, entry.note, entry.energy_level);
        }

        // Import workout logs
        for (const log of data.workoutLogs) {
            await addWorkoutLog(userId, log.title, log.description, log.duration_min, log.date);
        }

        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

