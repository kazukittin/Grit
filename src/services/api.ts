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

export async function updateProfile(profileId: string, updates: { target_weight?: number | null }): Promise<boolean> {
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
    updates: { food_name?: string; calories?: number }
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

