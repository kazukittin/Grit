import { useState, useCallback } from 'react';
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { signIn, signUp } = useAuth();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください');
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            setError('パスワードは6文字以上で入力してください');
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccessMessage('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    setError('メールアドレスまたはパスワードが正しくありません');
                }
            }
        } catch {
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    }, [email, password, confirmPassword, isSignUp, signIn, signUp]);

    return (
        <div className="min-h-screen bg-grit-bg flex flex-col items-center justify-center px-4">
            {/* Logo */}
            <div className="mb-8 text-center">
                <h1 className="text-5xl font-bold text-grit-text tracking-tight mb-2">Grit</h1>
                <p className="text-grit-text-muted">体重管理 × 習慣化</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md bg-grit-surface border border-grit-border rounded-2xl p-8">
                {/* Tabs */}
                <div className="flex mb-8 bg-grit-bg rounded-xl p-1">
                    <button
                        onClick={() => { setIsSignUp(false); setError(''); setSuccessMessage(''); }}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
              ${!isSignUp ? 'bg-grit-surface text-grit-text shadow' : 'text-grit-text-muted hover:text-grit-text'}`}
                    >
                        <LogIn className="w-4 h-4" />
                        ログイン
                    </button>
                    <button
                        onClick={() => { setIsSignUp(true); setError(''); setSuccessMessage(''); }}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
              ${isSignUp ? 'bg-grit-surface text-grit-text shadow' : 'text-grit-text-muted hover:text-grit-text'}`}
                    >
                        <UserPlus className="w-4 h-4" />
                        新規登録
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-grit-negative/10 border border-grit-negative/30 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-grit-negative flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-grit-negative">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-grit-positive/10 border border-grit-positive/30">
                        <p className="text-sm text-grit-positive">{successMessage}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                            <Mail className="w-4 h-4" />
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                            <Lock className="w-4 h-4" />
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="6文字以上"
                            className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                <Lock className="w-4 h-4" />
                                パスワード（確認）
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="もう一度入力"
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSignUp ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                アカウント作成
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                ログイン
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <p className="mt-8 text-sm text-grit-text-dim">
                継続は力なり。今日から始めよう。
            </p>
        </div>
    );
}
