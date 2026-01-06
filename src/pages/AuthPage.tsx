import { useState, useCallback, useEffect } from 'react';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { account } from '../lib/appwrite';
import { OAuthProvider, ID } from 'appwrite';

export function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Check for OAuth error in URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            setError('ログインに失敗しました。もう一度お試しください。');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleGoogleLogin = useCallback(async () => {
        setError('');
        setLoading(true);

        try {
            const currentUrl = window.location.origin;
            const basePath = import.meta.env.BASE_URL || '/';
            const baseUrl = `${currentUrl}${basePath}`.replace(/\/$/, '');

            account.createOAuth2Session(
                OAuthProvider.Google,
                `${baseUrl}/`,
                `${baseUrl}/auth?error=1`
            );
        } catch (err) {
            console.error('Google login error:', err);
            setError('認証の開始に失敗しました。もう一度お試しください。');
            setLoading(false);
        }
    }, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Normalize email:
        // 1. Convert full-width characters (alphanumeric AND symbols like @) to half-width
        // 2. Remove whitespace
        // 3. Convert to lowercase
        const cleanEmail = email
            .replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .replace(/\s+/g, '') // Remove all whitespace
            .trim()
            .toLowerCase();

        // Basic validation before sending
        if (!cleanEmail.includes('.') || !cleanEmail.includes('@')) {
            setError('有効なメールアドレスを入力してください（例: name@example.com）');
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                // Create user account
                await account.create(ID.unique(), cleanEmail, password, name);
                // Create session
                await account.createEmailPasswordSession(cleanEmail, password);
            } else {
                // Login
                await account.createEmailPasswordSession(cleanEmail, password);
            }
            // Page reload or redirect will happen automatically via AuthContext
            window.location.reload();
        } catch (err: any) {
            console.error('Auth error:', err);

            // Appwrite specific error mapping
            if (err?.code === 409) {
                setError('このメールアドレスは既に登録されています。');
            } else if (err?.code === 401) {
                setError('メールアドレスまたはパスワードが間違っています。');
            } else if (err?.type === 'param_email' || err?.message?.includes("'email' param")) {
                setError('有効なメールアドレスを入力してください（例: name@example.com）');
            } else if (err?.type === 'param_name') {
                setError('お名前は128文字以内で入力してください。');
            } else if (err?.type === 'password_recently_used') {
                setError('このパスワードは最近使用されています。別のパスワードを使用してください。');
            } else if (err?.type === 'password_personal_details') {
                setError('パスワードに個人情報（名前やメールアドレスなど）を含めることはできません。');
            } else if (err?.type === 'password_too_short' || (err?.message && err.message.length < 8 && mode === 'signup')) {
                setError('パスワードは8文字以上で入力してください。');
            } else if (err?.message === "There was an error processing your request. Please check the inputs and try again.") {
                setError('入力内容に誤りがある可能性があります。またはサーバーで一時的なエラーが発生しています。詳細: ' + (err.type || 'unknown'));
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('認証に失敗しました。もう一度お試しください。');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
            {/* Logo & Title */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Grit</h1>
                <p className="text-base text-slate-500">シンプルに記録、確実に継続。</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-sm">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Main Auth Form */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'login'
                                ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            ログイン
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'signup'
                                ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            新規登録
                        </button>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {mode === 'signup' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">お名前</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="山田 太郎"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

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

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">パスワード</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="8文字以上"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {mode === 'login' ? 'ログイン' : 'アカウント作成'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Divider */}
                <div className="mb-6 flex items-center">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="px-4 text-xs text-slate-400">または</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                        <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            </div>

            {/* Features Link - Simplified for mobile */}
            <p className="mt-8 text-xs text-slate-400">
                継続は力なり。
            </p>
        </div>
    );
}
