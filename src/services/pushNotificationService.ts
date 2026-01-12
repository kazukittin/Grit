/**
 * Push Notification Service
 * プッシュ通知の購読管理とService Worker登録
 */

// VAPID Public Key (環境変数から取得)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Service Worker がサポートされているかチェック
 */
export function isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * 通知許可の状態を取得
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isPushNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission;
}

/**
 * Service Worker を登録
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!isPushNotificationSupported()) {
        console.warn('Push notifications are not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

/**
 * 通知許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushNotificationSupported()) {
        throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
}

/**
 * Base64 URL を Uint8Array に変換
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * プッシュ通知を購読
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!VAPID_PUBLIC_KEY) {
        console.error('VAPID public key is not configured');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // 既存の購読をチェック
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // 新規購読
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
            console.log('Push subscription created:', subscription);
        }

        return subscription;
    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return null;
    }
}

/**
 * プッシュ通知の購読を解除
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('Push subscription removed');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
        return false;
    }
}

/**
 * 現在の購読情報を取得
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    } catch (error) {
        console.error('Failed to get current subscription:', error);
        return null;
    }
}

/**
 * テスト通知を表示（ローカル）
 */
export async function showTestNotification(): Promise<boolean> {
    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Grit - テスト通知', {
            body: '通知が正常に設定されました！🎉',
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-72.png',
            tag: 'test-notification',
        });
        return true;
    } catch (error) {
        console.error('Failed to show test notification:', error);
        return false;
    }
}

/**
 * PushSubscription を JSON に変換（サーバー送信用）
 */
export function subscriptionToJSON(subscription: PushSubscription): {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
} {
    const json = subscription.toJSON();
    return {
        endpoint: json.endpoint || '',
        keys: {
            p256dh: json.keys?.p256dh || '',
            auth: json.keys?.auth || '',
        },
    };
}
