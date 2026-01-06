import { Client, Databases } from 'node-appwrite';

// Appwrite Configuration
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '695a3e50002216f074c4';
const DATABASE_ID = '695a3eae0037a169dc1d';
// API Key - should ideally be in env variables
const API_KEY = 'standard_60056a9e5768a2f5135dadf7c217323aacf815206d5e593f7ceeed2154e550dea91b6a90a1f9f065ba6a31843bcf6902f79e8dec33916884bb06ecb0b46a6d272f4a0e2c11a65eafeebd3f3bbe567b51e06270f163fa7ff732f964f13f0b47d449f460a44c4dd934cbf8fecbc92c77dc5f6b99806304255249a152cbfe7b9fd0';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function addHeightAttribute() {
    console.log('Adding height attribute to profiles collection...');

    try {
        await databases.createFloatAttribute(
            DATABASE_ID,
            'profiles',
            'height',
            false,  // required
            undefined, // min
            undefined, // max
            undefined, // default
            false   // array
        );
        console.log('✅ Height attribute added successfully!');
        console.log('Note: It may take a few seconds for the attribute to become available.');
    } catch (error) {
        if (error.code === 409) {
            console.log('Height attribute already exists');
        } else {
            console.error('Error adding height attribute:', error);
        }
    }
}

addHeightAttribute();
