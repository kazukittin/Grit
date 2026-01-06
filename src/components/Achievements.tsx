import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronRight, Lock } from 'lucide-react';
import type { Achievement, AchievementStats } from '../types';
import { ACHIEVEMENTS, getUnlockedAchievements, getAchievementProgress } from '../lib/achievements';

interface AchievementsDisplayProps {
    stats: AchievementStats;
    onClose?: () => void;
    showAsModal?: boolean;
}

export function AchievementsDisplay({ stats, onClose, showAsModal = false }: AchievementsDisplayProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const unlockedAchievements = getUnlockedAchievements(stats);
    const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

    const categories = [
        { id: 'all', label: 'すべて' },
        { id: 'streak', label: '継続' },
        { id: 'weight', label: '体重' },
        { id: 'habit', label: '習慣' },
        { id: 'workout', label: '運動' },
        { id: 'meal', label: '食事' },
    ];

    const filteredAchievements =
        selectedCategory === 'all'
            ? ACHIEVEMENTS
            : ACHIEVEMENTS.filter((a) => a.category === selectedCategory);

    const content = (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-grit-text">実績</h2>
                        <p className="text-sm text-grit-text-muted">
                            {unlockedAchievements.length} / {ACHIEVEMENTS.length} 達成
                        </p>
                    </div>
                </div>
                {showAsModal && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-grit-surface-hover text-grit-text-muted hover:text-grit-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-grit-border rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                            ? 'bg-grit-accent text-white shadow-lg shadow-grit-accent/30'
                            : 'bg-grit-surface-hover text-grit-text-muted hover:text-grit-text'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Achievement grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredAchievements.map((achievement) => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const progress = getAchievementProgress(achievement, stats);

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative p-4 rounded-2xl border transition-all ${isUnlocked
                                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                                : 'bg-grit-surface-hover border-grit-border opacity-60'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/30'
                                        : 'bg-grit-border'
                                        }`}
                                >
                                    {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-grit-text-dim" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className={`font-semibold ${isUnlocked ? 'text-grit-text' : 'text-grit-text-muted'
                                            }`}
                                    >
                                        {achievement.title}
                                    </h3>
                                    <p className="text-sm text-grit-text-muted truncate">
                                        {achievement.description}
                                    </p>
                                    {!isUnlocked && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-grit-text-dim mb-1">
                                                <span>進捗</span>
                                                <span>
                                                    {progress.current} / {progress.target}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-grit-border rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-grit-accent"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress.percentage}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isUnlocked && (
                                <div className="absolute top-2 right-2">
                                    <span className="text-lg">✓</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    if (showAsModal) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-card rounded-3xl p-6"
                >
                    {content}
                </motion.div>
            </motion.div>
        );
    }

    return <div className="glass-card rounded-2xl p-5">{content}</div>;
}

// Achievement unlock toast notification
interface AchievementToastProps {
    achievement: Achievement;
    onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Haptic feedback
    useEffect(() => {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="glass-card rounded-2xl p-4 shadow-2xl shadow-orange-500/30 border border-yellow-500/30 min-w-[300px]">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/40"
                    >
                        {achievement.icon}
                    </motion.div>
                    <div className="flex-1">
                        <p className="text-xs text-yellow-500 font-medium mb-0.5">🎉 実績解除!</p>
                        <h3 className="text-lg font-bold text-grit-text">{achievement.title}</h3>
                        <p className="text-sm text-grit-text-muted">{achievement.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-grit-text-dim hover:text-grit-text hover:bg-grit-surface-hover transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Achievement toast manager
interface AchievementManagerProps {
    stats: AchievementStats;
    previousUnlockedIds: string[];
    onAchievementUnlocked?: (achievement: Achievement) => void;
}

export function AchievementManager({ stats, previousUnlockedIds, onAchievementUnlocked }: AchievementManagerProps) {
    const [toasts, setToasts] = useState<Achievement[]>([]);

    useEffect(() => {
        const currentUnlocked = getUnlockedAchievements(stats);
        const newlyUnlocked = currentUnlocked.filter((a) => !previousUnlockedIds.includes(a.id));

        if (newlyUnlocked.length > 0) {
            setToasts((prev) => [...prev, ...newlyUnlocked]);
            newlyUnlocked.forEach((a) => onAchievementUnlocked?.(a));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats]);

    const handleClose = useCallback((achievementId: string) => {
        setToasts((prev) => prev.filter((a) => a.id !== achievementId));
    }, []);

    return (
        <AnimatePresence>
            {toasts.slice(0, 1).map((achievement) => (
                <AchievementToast
                    key={achievement.id}
                    achievement={achievement}
                    onClose={() => handleClose(achievement.id)}
                />
            ))}
        </AnimatePresence>
    );
}

// Mini achievement badge for header
interface AchievementBadgeProps {
    stats: AchievementStats;
    onClick?: () => void;
}

export function AchievementBadge({ stats, onClick }: AchievementBadgeProps) {
    const unlockedCount = getUnlockedAchievements(stats).length;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all group"
        >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-grit-text">
                {unlockedCount}/{ACHIEVEMENTS.length}
            </span>
            <ChevronRight className="w-4 h-4 text-grit-text-muted group-hover:translate-x-0.5 transition-transform" />
        </button>
    );
}
