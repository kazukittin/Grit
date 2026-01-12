import { Client, Account, Databases } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    throw new Error('Missing Appwrite environment variables. Please set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID in your .env file.');
}

export const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs from environment variables
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
export const COLLECTIONS = {
    PROFILES: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles',
    WEIGHT_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_WEIGHT_LOGS || 'weight_logs',
    HABITS: import.meta.env.VITE_APPWRITE_COLLECTION_HABITS || 'habits',
    HABIT_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_HABIT_LOGS || 'habit_logs',
    WORKOUT_ROUTINES: import.meta.env.VITE_APPWRITE_COLLECTION_WORKOUT_ROUTINES || 'workout_routines',
    WORKOUT_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_WORKOUT_LOGS || 'workout_logs',
    MEAL_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_MEAL_LOGS || 'meal_logs',
    FAVORITE_MEALS: 'favorite_meals',
    MEAL_PRESETS: 'meal_presets',

    USER_STATS: import.meta.env.VITE_APPWRITE_COLLECTION_USER_STATS || 'user_stats',
    PUSH_SUBSCRIPTIONS: import.meta.env.VITE_APPWRITE_COLLECTION_PUSH_SUBSCRIPTIONS || 'push_subscriptions',
};

