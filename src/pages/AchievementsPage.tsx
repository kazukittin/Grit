import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AchievementsDisplay } from '../components/Achievements';
import { getAchievementStats } from '../services/api';
import type { AchievementStats } from '../types';
import { Skeleton } from '../components/Skeleton';

export function AchievementsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AchievementStats | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadStats = async () => {
            setLoading(true);
            try {
                const achievementStats = await getAchievementStats(user.$id);
                setStats(achievementStats);
            } catch (error) {
                console.error('Error loading achievement stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    return (
        <div className="min-h-screen bg-grit-bg pb-6">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-card border-b border-grit-glass-border">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-grit-surface-hover text-grit-text hover:bg-grit-border transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-grit-text">実績</h1>
                            <p className="text-sm text-grit-text-muted">あなたの達成を確認</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="space-y-6">
                        <Skeleton variant="rounded" height={60} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} variant="rounded" height={100} />
                            ))}
                        </div>
                    </div>
                ) : stats ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AchievementsDisplay stats={stats} />
                    </motion.div>
                ) : (
                    <div className="text-center py-12 text-grit-text-muted">
                        データを読み込めませんでした
                    </div>
                )}
            </main>
        </div>
    );
}
