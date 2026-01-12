/**
 * Appwrite Function: Send Push Notifications
 * 
 * スケジュールされた時間にプッシュ通知を送信する
 * CRON Schedule: 毎分実行 (* * * * *)
 * 
 * 環境変数:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 * - DATABASE_ID
 * - COLLECTION_PUSH_SUBSCRIPTIONS
 * - VAPID_PUBLIC_KEY
 * - VAPID_PRIVATE_KEY
 * - VAPID_SUBJECT (e.g., mailto:your-email@example.com)
 */

import { Client, Databases, Query } from 'node-appwrite';
import webpush from 'web-push';

export default async ({ req, res, log, error }) => {
    // 環境変数のチェック
    const {
        APPWRITE_ENDPOINT,
        APPWRITE_PROJECT_ID,
        APPWRITE_API_KEY,
        DATABASE_ID,
        COLLECTION_PUSH_SUBSCRIPTIONS,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
        VAPID_SUBJECT,
    } = process.env;

    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
        error('Missing Appwrite configuration');
        return res.json({ success: false, error: 'Missing Appwrite configuration' });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
        error('Missing VAPID configuration');
        return res.json({ success: false, error: 'Missing VAPID configuration' });
    }

    // Appwrite クライアントの初期化
    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Web Push の設定
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    try {
        // 現在時刻を取得 (HH:MM 形式)
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

        log(`Checking for notifications at ${currentTime}...`);

        // 通知が有効で、現在の時刻に設定されているサブスクリプションを取得
        // 注意: タイムゾーン処理が必要な場合は、ここでロジックを追加
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_PUSH_SUBSCRIPTIONS,
            [
                Query.equal('notification_enabled', true),
                Query.equal('notification_time', currentTime),
                Query.limit(100),
            ]
        );

        log(`Found ${response.documents.length} subscriptions to notify`);

        let successCount = 0;
        let failCount = 0;

        for (const doc of response.documents) {
            const pushSubscription = {
                endpoint: doc.endpoint,
                keys: {
                    p256dh: doc.keys_p256dh,
                    auth: doc.keys_auth,
                },
            };

            const payload = JSON.stringify({
                title: 'Grit - 体重記録リマインダー',
                body: '今日の体重を記録しましょう！📊',
                icon: '/icons/icon-192.png',
                badge: '/icons/badge-72.png',
                tag: 'daily-reminder',
                url: '/',
            });

            try {
                await webpush.sendNotification(pushSubscription, payload);
                successCount++;
                log(`Notification sent to user: ${doc.user_id}`);
            } catch (pushError) {
                failCount++;
                error(`Failed to send notification to user ${doc.user_id}: ${pushError.message}`);

                // 410 Gone または 404 は購読が無効になったことを意味する
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    try {
                        await databases.deleteDocument(
                            DATABASE_ID,
                            COLLECTION_PUSH_SUBSCRIPTIONS,
                            doc.$id
                        );
                        log(`Deleted expired subscription for user: ${doc.user_id}`);
                    } catch (deleteError) {
                        error(`Failed to delete expired subscription: ${deleteError.message}`);
                    }
                }
            }
        }

        const result = {
            success: true,
            time: currentTime,
            total: response.documents.length,
            sent: successCount,
            failed: failCount,
        };

        log(`Completed: ${JSON.stringify(result)}`);
        return res.json(result);

    } catch (err) {
        error(`Function error: ${err.message}`);
        return res.json({ success: false, error: err.message });
    }
};
