/**
 * VAPID キー生成スクリプト
 * 
 * 使用方法:
 *   node scripts/generate-vapid-keys.js
 * 
 * 生成されたキーを .env ファイルに追加してください
 */

import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(60));
console.log('VAPID Keys Generated Successfully!');
console.log('='.repeat(60));
console.log('');
console.log('以下を .env ファイルに追加してください:');
console.log('');
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('='.repeat(60));
console.log('注意: VAPID_PRIVATE_KEY は .env に保存し、');
console.log('Appwrite Functions でも使用します（クライアントには公開しない）');
console.log('='.repeat(60));
