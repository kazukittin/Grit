/**
 * Appwrite Database Setup Script
 * 
 * このスクリプトは、Gritアプリに必要なすべてのコレクションと属性を作成します。
 * 
 * 使用方法:
 *   node scripts/setup-database.mjs
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

// ============ Configuration ============
const config = {
    endpoint: 'https://sfo.cloud.appwrite.io/v1',
    projectId: '695a3e50002216f074c4',
    apiKey: process.env.APPWRITE_API_KEY || 'standard_60056a9e5768a2f5135dadf7c217323aacf815206d5e593f7ceeed2154e550dea91b6a90a1f9f065ba6a31843bcf6902f79e8dec33916884bb06ecb0b46a6d272f4a0e2c11a65eafeebd3f3bbe567b51e06270f163fa7ff732f964f13f0b47d449f460a44c4dd934cbf8fecbc92c77dc5f6b99806304255249a152cbfe7b9fd0',
    // GritDB - correct database ID from Appwrite console
    databaseId: '695a3eae0037a169dc1d',
};

// Initialize client
const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

const databases = new Databases(client);

// Default permissions for all collections
const defaultPermissions = [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
];

// ============ Collection Definitions ============

const collections = [
    {
        id: 'profiles',
        name: 'Profiles',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'float', key: 'height', required: false }, // 身長(cm)
            { type: 'float', key: 'target_weight', required: false },
            { type: 'integer', key: 'target_calories', required: false },
            { type: 'integer', key: 'target_protein', required: false },
            { type: 'integer', key: 'target_fat', required: false },
            { type: 'integer', key: 'target_carbs', required: false },
            { type: 'integer', key: 'age', required: false },
            { type: 'enum', key: 'gender', elements: ['male', 'female'], required: false },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
        ],
    },
    {
        id: 'weight_logs',
        name: 'Weight Logs',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'date', size: 10, required: true }, // YYYY-MM-DD
            { type: 'enum', key: 'time_of_day', elements: ['morning', 'evening'], required: false }, // 朝/夜
            { type: 'float', key: 'weight', required: true },
            { type: 'float', key: 'fat_percentage', required: false },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'date_idx', type: 'key', attributes: ['date'] },
            { key: 'user_date_idx', type: 'key', attributes: ['user_id', 'date'] },
        ],
    },
    {
        id: 'habits',
        name: 'Habits',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'boolean', key: 'is_active', required: false, default: true },
            { type: 'integer', key: 'order', required: false, default: 0 },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
        ],
    },
    {
        id: 'habit_logs',
        name: 'Habit Logs',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'habit_id', size: 36, required: true },
            { type: 'string', key: 'date', size: 10, required: true }, // YYYY-MM-DD
            { type: 'boolean', key: 'completed', required: true },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'habit_id_idx', type: 'key', attributes: ['habit_id'] },
            { key: 'date_idx', type: 'key', attributes: ['date'] },
            { key: 'user_date_idx', type: 'key', attributes: ['user_id', 'date'] },
        ],
    },
    {
        id: 'workout_routines',
        name: 'Workout Routines',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'integer', key: 'day_of_week', required: true }, // 0-6 (Sun-Sat)
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'string', key: 'description', size: 1000, required: false },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'user_day_idx', type: 'key', attributes: ['user_id', 'day_of_week'] },
        ],
    },
    {
        id: 'workout_logs',
        name: 'Workout Logs',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'date', size: 10, required: true }, // YYYY-MM-DD
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'string', key: 'description', size: 1000, required: false },
            { type: 'integer', key: 'duration_min', required: false },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'date_idx', type: 'key', attributes: ['date'] },
        ],
    },
    {
        id: 'meal_logs',
        name: 'Meal Logs',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'date', size: 10, required: true }, // YYYY-MM-DD
            { type: 'enum', key: 'meal_type', elements: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
            { type: 'string', key: 'food_name', size: 255, required: true },
            { type: 'integer', key: 'calories', required: true },
            { type: 'float', key: 'protein', required: false },
            { type: 'float', key: 'fat', required: false },
            { type: 'float', key: 'carbs', required: false },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'date_idx', type: 'key', attributes: ['date'] },
            { key: 'user_date_idx', type: 'key', attributes: ['user_id', 'date'] },
        ],
    },
    {
        id: 'diary_entries',
        name: 'Diary Entries',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'date', size: 10, required: true }, // YYYY-MM-DD
            { type: 'enum', key: 'mood', elements: ['great', 'good', 'neutral', 'bad', 'terrible'], required: true },
            { type: 'string', key: 'note', size: 5000, required: false },
            { type: 'integer', key: 'energy_level', required: false }, // 1-5
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'date_idx', type: 'key', attributes: ['date'] },
            { key: 'user_date_idx', type: 'key', attributes: ['user_id', 'date'] },
        ],
    },
    {
        id: 'favorite_meals',
        name: 'Favorite Meals',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'name', size: 255, required: true },
            { type: 'integer', key: 'calories', required: false, default: 0 },
            { type: 'float', key: 'protein', required: false },
            { type: 'float', key: 'fat', required: false },
            { type: 'float', key: 'carbs', required: false },
            { type: 'integer', key: 'use_count', required: false, default: 0 },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
        ],
    },
    {
        id: 'meal_presets',
        name: 'Meal Presets',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'name', size: 255, required: true },
            { type: 'string', key: 'items', size: 5000, required: true }, // JSON string
            { type: 'integer', key: 'total_calories', required: false, default: 0 },
            { type: 'integer', key: 'use_count', required: false, default: 0 },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
        ],
    },
    {
        id: 'user_stats',
        name: 'User Stats',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'integer', key: 'total_habits_completed', required: false, default: 0 },
            { type: 'integer', key: 'total_meals_logged', required: false, default: 0 },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
        ],
    },
    {
        id: 'push_subscriptions',
        name: 'Push Subscriptions',
        attributes: [
            { type: 'string', key: 'user_id', size: 36, required: true },
            { type: 'string', key: 'endpoint', size: 500, required: true },
            { type: 'string', key: 'keys_p256dh', size: 255, required: true },
            { type: 'string', key: 'keys_auth', size: 255, required: true },
            { type: 'boolean', key: 'notification_enabled', required: true, default: true },
            { type: 'string', key: 'notification_time', size: 5, required: true }, // HH:MM format
            { type: 'string', key: 'timezone', size: 50, required: true },
        ],
        indexes: [
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'notification_time_idx', type: 'key', attributes: ['notification_time'] },
            { key: 'enabled_time_idx', type: 'key', attributes: ['notification_enabled', 'notification_time'] },
        ],
    },
];

// ============ Helper Functions ============

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createDatabase() {
    try {
        console.log('📦 Creating database...');
        await databases.create(config.databaseId, 'Grit Database');
        console.log('✅ Database created successfully!');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Database already exists, continuing...');
        } else {
            throw error;
        }
    }
}

async function createCollection(collectionDef) {
    try {
        console.log(`\n📁 Creating collection: ${collectionDef.name}...`);
        await databases.createCollection(
            config.databaseId,
            collectionDef.id,
            collectionDef.name,
            defaultPermissions
        );
        console.log(`✅ Collection "${collectionDef.name}" created!`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`ℹ️  Collection "${collectionDef.name}" already exists, skipping creation...`);
        } else {
            throw error;
        }
    }
}

async function createAttribute(collectionId, attr) {
    try {
        switch (attr.type) {
            case 'string':
                await databases.createStringAttribute(
                    config.databaseId,
                    collectionId,
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default || null
                );
                break;
            case 'integer':
                await databases.createIntegerAttribute(
                    config.databaseId,
                    collectionId,
                    attr.key,
                    attr.required,
                    attr.min || null,
                    attr.max || null,
                    attr.default || null
                );
                break;
            case 'float':
                await databases.createFloatAttribute(
                    config.databaseId,
                    collectionId,
                    attr.key,
                    attr.required,
                    attr.min || null,
                    attr.max || null,
                    attr.default || null
                );
                break;
            case 'boolean':
                await databases.createBooleanAttribute(
                    config.databaseId,
                    collectionId,
                    attr.key,
                    attr.required,
                    attr.default || null
                );
                break;
            case 'enum':
                await databases.createEnumAttribute(
                    config.databaseId,
                    collectionId,
                    attr.key,
                    attr.elements,
                    attr.required,
                    attr.default || null
                );
                break;
        }
        console.log(`   ✓ Attribute "${attr.key}" (${attr.type})`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`   ⏭️  Attribute "${attr.key}" already exists`);
        } else {
            console.error(`   ❌ Error creating attribute "${attr.key}":`, error.message);
        }
    }
}

async function createIndex(collectionId, index) {
    try {
        await databases.createIndex(
            config.databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes,
            index.orders || []
        );
        console.log(`   ✓ Index "${index.key}"`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`   ⏭️  Index "${index.key}" already exists`);
        } else {
            console.error(`   ❌ Error creating index "${index.key}":`, error.message);
        }
    }
}

// ============ Main Setup Function ============

async function setup() {
    console.log('🚀 Starting Grit Database Setup...\n');
    console.log(`   Endpoint: ${config.endpoint}`);
    console.log(`   Project: ${config.projectId}`);
    console.log(`   Database: ${config.databaseId}`);
    console.log('');

    // Database already exists, skip creation
    // Note: Using existing database from Appwrite project
    console.log('📦 Using existing database...');

    // Create collections and attributes
    for (const collectionDef of collections) {
        await createCollection(collectionDef);

        // Create attributes
        console.log('   Creating attributes...');
        for (const attr of collectionDef.attributes) {
            await createAttribute(collectionDef.id, attr);
            await sleep(500); // Wait for attribute to be processed
        }

        // Wait for attributes to be ready before creating indexes
        console.log('   ⏳ Waiting for attributes to be ready...');
        await sleep(3000);

        // Create indexes
        if (collectionDef.indexes && collectionDef.indexes.length > 0) {
            console.log('   Creating indexes...');
            for (const index of collectionDef.indexes) {
                await createIndex(collectionDef.id, index);
                await sleep(1000);
            }
        }
    }

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Created collections:');
    collections.forEach((c) => console.log(`   - ${c.name} (${c.id})`));

    console.log('\n⚠️  Next steps:');
    console.log('   1. Update your .env file with:');
    console.log(`      VITE_APPWRITE_DATABASE_ID=${config.databaseId}`);
    console.log('   2. Restart your development server');
}

// Run setup
setup().catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
});
