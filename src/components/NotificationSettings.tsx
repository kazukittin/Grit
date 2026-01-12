/**
 * Notification Settings Component
 * 通知設定用のUIコンポーネント
 */

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Clock, Check, Loader2, AlertCircle, TestTube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    isPushNotificationSupported,
    getNotificationPermission,
    registerServiceWorker,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showTestNotification,
    subscriptionToJSON,
} from '../services/pushNotificationService';
import {
    getPushSubscription,
    savePushSubscription,
    updatePushSubscriptionSettings,
    deletePushSubscription,
} from '../services/api';
import type { PushSubscriptionDoc } from '../types';

// 時刻オプション (5分刻み)
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
}

interface NotificationSettingsProps {
    className?: string;
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
    const { user } = useAuth();

    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [subscriptionDoc, setSubscriptionDoc] = useState<PushSubscriptionDoc | null>(null);

    // 通知設定のステート
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const [notificationTime, setNotificationTime] = useState('20:00');

    // 初期化
    useEffect(() => {
        const initialize = async () => {
            const supported = isPushNotificationSupported();
            setIsSupported(supported);

            if (supported) {
                setPermission(getNotificationPermission());
                await registerServiceWorker();
            }

            // ユーザーの通知設定を取得
            if (user) {
                const doc = await getPushSubscription(user.$id);
                if (doc) {
                    setSubscriptionDoc(doc);
                    setNotificationEnabled(doc.notification_enabled);
                    setNotificationTime(doc.notification_time || '20:00');
                }
            }

            setIsLoading(false);
        };

        initialize();
    }, [user]);

    // 通知を有効化
    const handleEnableNotifications = useCallback(async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            // 通知許可をリクエスト
            const perm = await requestNotificationPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                setIsSaving(false);
                return;
            }

            // プッシュ通知を購読
            const subscription = await subscribeToPushNotifications();
            if (!subscription) {
                console.error('Failed to subscribe to push notifications');
                setIsSaving(false);
                return;
            }

            // サーバーに保存
            const subJson = subscriptionToJSON(subscription);
            const doc = await savePushSubscription(
                user.$id,
                subJson,
                notificationTime,
                Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo'
            );

            if (doc) {
                setSubscriptionDoc(doc);
                setNotificationEnabled(true);
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        }
        setIsSaving(false);
    }, [user, notificationTime]);

    // 通知を無効化
    const handleDisableNotifications = useCallback(async () => {
        if (!subscriptionDoc) return;

        setIsSaving(true);
        try {
            await unsubscribeFromPushNotifications();
            await deletePushSubscription(subscriptionDoc.$id);
            setSubscriptionDoc(null);
            setNotificationEnabled(false);
        } catch (error) {
            console.error('Failed to disable notifications:', error);
        }
        setIsSaving(false);
    }, [subscriptionDoc]);

    // 通知時間を更新
    const handleTimeChange = useCallback(async (time: string) => {
        setNotificationTime(time);

        if (subscriptionDoc) {
            setIsSaving(true);
            await updatePushSubscriptionSettings(subscriptionDoc.$id, {
                notification_time: time,
            });
            setIsSaving(false);
        }
    }, [subscriptionDoc]);

    // テスト通知
    const handleTestNotification = useCallback(async () => {
        setIsTesting(true);
        await showTestNotification();
        setTimeout(() => setIsTesting(false), 1000);
    }, []);

    if (isLoading) {
        return (
            <div className={`bg-grit-surface rounded-2xl p-6 border border-grit-border ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-grit-accent animate-spin" />
                </div>
            </div>
        );
    }

    // ブラウザがサポートしていない場合
    if (!isSupported) {
        return (
            <div className={`bg-grit-surface rounded-2xl p-6 border border-grit-border ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <BellOff className="w-5 h-5 text-grit-text-muted" />
                    <h2 className="text-lg font-semibold text-grit-text">リマインダー通知</h2>
                </div>
                <div className="flex items-center gap-2 text-grit-text-muted">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">このブラウザではプッシュ通知がサポートされていません</p>
                </div>
            </div>
        );
    }

    // 通知が拒否されている場合
    if (permission === 'denied') {
        return (
            <div className={`bg-grit-surface rounded-2xl p-6 border border-grit-border ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <BellOff className="w-5 h-5 text-grit-negative" />
                    <h2 className="text-lg font-semibold text-grit-text">リマインダー通知</h2>
                </div>
                <div className="bg-grit-negative/10 border border-grit-negative/30 rounded-xl p-4">
                    <p className="text-sm text-grit-text-muted mb-2">
                        通知がブラウザでブロックされています。
                    </p>
                    <p className="text-xs text-grit-text-dim">
                        ブラウザの設定から通知を許可してください。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-grit-surface rounded-2xl p-6 border border-grit-border ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">リマインダー通知</h2>
            </div>

            <p className="text-sm text-grit-text-muted mb-6">
                毎日決まった時間に体重記録のリマインダー通知を受け取ることができます。
            </p>

            {/* Toggle Button */}
            <div className="flex items-center justify-between mb-6 p-4 bg-grit-bg rounded-xl">
                <div className="flex items-center gap-3">
                    {notificationEnabled ? (
                        <Bell className="w-5 h-5 text-grit-accent" />
                    ) : (
                        <BellOff className="w-5 h-5 text-grit-text-dim" />
                    )}
                    <div>
                        <div className="font-medium text-grit-text">
                            {notificationEnabled ? '通知ON' : '通知OFF'}
                        </div>
                        <div className="text-xs text-grit-text-dim">
                            {notificationEnabled ? '毎日リマインダーが届きます' : '通知は送信されません'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={notificationEnabled ? handleDisableNotifications : handleEnableNotifications}
                    disabled={isSaving}
                    className={`relative w-14 h-8 rounded-full transition-colors ${notificationEnabled
                            ? 'bg-grit-accent'
                            : 'bg-grit-border'
                        }`}
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    ) : (
                        <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notificationEnabled ? 'left-7' : 'left-1'
                                }`}
                        >
                            {notificationEnabled && (
                                <Check className="w-4 h-4 text-grit-accent absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    )}
                </button>
            </div>

            {/* Time Selection */}
            {notificationEnabled && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                            <Clock className="w-4 h-4" />
                            通知時刻
                        </label>
                        <select
                            value={notificationTime}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text focus:outline-none focus:border-grit-accent transition-colors"
                        >
                            {TIME_OPTIONS.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Test Notification Button */}
                    <button
                        onClick={handleTestNotification}
                        disabled={isTesting}
                        className="w-full py-3 bg-grit-surface-hover text-grit-text font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-grit-border transition-colors disabled:opacity-50"
                    >
                        {isTesting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <TestTube className="w-4 h-4" />
                        )}
                        テスト通知を送信
                    </button>
                </div>
            )}

            {/* Info */}
            <div className="mt-6 p-3 bg-grit-bg/50 rounded-lg">
                <p className="text-xs text-grit-text-dim">
                    ⚠️ 通知を受け取るには、ブラウザとデバイスの通知設定が有効になっている必要があります。
                    また、電池節約モードやおやすみモードが有効な場合、通知が届かないことがあります。
                </p>
            </div>
        </div>
    );
}
