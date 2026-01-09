import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { account } from '../lib/appwrite';

type ResetMode = 'request' | 'reset' | 'success';

export function PasswordResetPage() {
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<ResetMode>('request');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // URL params for password reset
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    useEffect(() => {
        // If userId and secret are present, show reset form
        if (userId && secret) {
            setMode('reset');
        }
    }, [userId, secret]);

    // Normalize email (same as AuthPage)
    const normalizeEmail = (rawEmail: string): string => {
        return rawEmail
            .replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .replace(/\s+/g, '')
            .trim()
            .toLowerCase();
    };

    // Request password reset email
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanEmail = normalizeEmail(email);

        if (!cleanEmail.includes('.') || !cleanEmail.includes('@')) {
            setError('有効なメールアドレスを入力してください');
            setLoading(false);
            return;
        }

        try {
            const currentUrl = window.location.origin;
            const basePath = import.meta.env.BASE_URL || '/';
            const baseUrl = `${currentUrl}${basePath}`.replace(/\/$/, '');
            const resetUrl = `${baseUrl}/reset-password`;

            await account.createRecovery(cleanEmail, resetUrl);
            
            setSuccessMessage('パスワードリセットのメールを送信しました。メールボックスをご確認ください。');
            setMode('success');
        } catch (err: any) {
            console.error('Password reset request error:', err);
            
            if (err?.code === 404) {
                // Don't reveal if email exists or not for security
                setSuccessMessage('入力されたメールアドレスが登録されている場合、パスワードリセットのメールを送信しました。');
                setMode('success');
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('パスワードリセットの要求に失敗しました。もう一度お試しください。');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset password with new password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('パスワードは8文字以上で入力してください。');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('パスワードが一致しません。');
            return;
        }

        if (!userId || !secret) {
            setError('無効なリセットリンクです。もう一度パスワードリセットをリクエストしてください。');
            return;
        }

        setLoading(true);

        try {
            await account.updateRecovery(userId, secret, newPassword);
            setSuccessMessage('パスワードが正常にリセットされました。新しいパスワードでログインしてください。');
            setMode('success');
        } catch (err: any) {
            console.error('Password reset error:', err);
            
            if (err?.code === 401) {
                setError('リセットリンクの有効期限が切れているか、無効です。もう一度パスワードリセットをリクエストしてください。');
            } else if (err?.type === 'password_recently_used') {
                setError('このパスワードは最近使用されています。別のパスワードを使用してください。');
            } else if (err?.type === 'password_personal_details') {
                setError('パスワードに個人情報（名前やメールアドレスなど）を含めることはできません。');
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('パスワードのリセットに失敗しました。もう一度お試しください。');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
            {/* Logo & Title */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Grit</h1>
                <p className="text-base text-slate-500">パスワードのリセット</p>
            </div>

            <div className="w-full max-w-sm">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Success State */}
                {mode === 'success' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">完了</h2>
                            <p className="text-sm text-slate-600 mb-6">{successMessage}</p>
                            <Link
                                to="/auth"
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                ログイン画面に戻る
                            </Link>
                        </div>
                    </div>
                )}

                {/* Request Reset Form */}
                {mode === 'request' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">パスワードをお忘れですか？</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                            </p>
                            
                            <form onSubmit={handleRequestReset} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">メールアドレス</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="hello@example.com"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    リセットメールを送信
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reset Password Form */}
                {mode === 'reset' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">新しいパスワードを設定</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                新しいパスワードを入力してください（8文字以上）
                            </p>
                            
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">新しいパスワード</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="8文字以上"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">パスワードの確認</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="もう一度入力"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    パスワードを変更
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Back to Login Link */}
                {mode !== 'success' && (
                    <div className="mt-6 text-center">
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            ログイン画面に戻る
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
