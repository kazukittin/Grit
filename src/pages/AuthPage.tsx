import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { account } from '../lib/appwrite';
import { OAuthProvider } from 'appwrite';

export function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check for OAuth error in URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            setError('ログインに失敗しました。もう一度お試しください。');
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleGoogleLogin = useCallback(async () => {
        setError('');
        setLoading(true);

        try {
            // Get current URL for success/failure redirects
            // Use the current pathname base for proper routing on GitHub Pages
            const currentUrl = window.location.origin;
            const basePath = import.meta.env.BASE_URL || '/';
            const baseUrl = `${currentUrl}${basePath}`.replace(/\/$/, ''); // Remove trailing slash

            account.createOAuth2Session(
                OAuthProvider.Google,
                `${baseUrl}/`,           // Success URL - redirect to dashboard
                `${baseUrl}/auth?error=1` // Failure URL - back to auth with error
            );
        } catch (err) {
            console.error('Google login error:', err);
            setError('認証の開始に失敗しました。もう一度お試しください。');
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            {/* Logo & Title */}
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-3">Grit</h1>
                <p className="text-lg text-slate-500">シンプルに記録、確実に継続。</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-sm">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    ) : (
                        <>
                            {/* Google "G" Logo */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Googleで続ける</span>
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="my-8 flex items-center">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="px-4 text-sm text-slate-400">または</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📊</span>
                        </div>
                        <span className="text-sm">体重を記録して推移を可視化</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 text-sm">✅</span>
                        </div>
                        <span className="text-sm">日々の習慣をトラッキング</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 text-sm">🎯</span>
                        </div>
                        <span className="text-sm">目標に向かって継続をサポート</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-sm text-slate-400">
                継続は力なり。今日から始めよう。
            </p>
        </div>
    );
}
