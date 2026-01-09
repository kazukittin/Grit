import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { account } from '../lib/appwrite';

export function MagicLinkCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleMagicLink = async () => {
            const userId = searchParams.get('userId');
            const secret = searchParams.get('secret');

            if (!userId || !secret) {
                setError('無効なリンクです。もう一度ログインリンクを送信してください。');
                setStatus('error');
                return;
            }

            try {
                // Complete the magic URL session
                await account.updateMagicURLSession(userId, secret);
                setStatus('success');

                // Redirect to home after a short delay
                setTimeout(() => {
                    window.location.href = import.meta.env.BASE_URL || '/';
                }, 1500);
            } catch (err: any) {
                console.error('Magic link error:', err);

                if (err?.code === 401) {
                    setError('リンクの有効期限が切れています。もう一度ログインリンクを送信してください。');
                } else if (err?.code === 404) {
                    setError('無効なリンクです。もう一度ログインリンクを送信してください。');
                } else {
                    setError('ログインに失敗しました。もう一度お試しください。');
                }
                setStatus('error');
            }
        };

        handleMagicLink();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    {status === 'loading' && (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">ログイン中...</h2>
                            <p className="text-sm text-slate-500">しばらくお待ちください</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">ログイン成功！</h2>
                            <p className="text-sm text-slate-500">ホーム画面に移動します...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">エラー</h2>
                            <p className="text-sm text-slate-500 mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
                            >
                                ログイン画面に戻る
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
