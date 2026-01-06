import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, BatteryLow, BatteryFull, BatteryMedium, BatteryWarning, Sparkles } from 'lucide-react';
import type { DiaryEntry } from '../types';

type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface DiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mood: MoodType, note: string, energyLevel: number) => Promise<void>;
    existingEntry?: DiaryEntry | null;
}

const MOOD_OPTIONS: { value: MoodType; label: string; icon: string; color: string }[] = [
    { value: 'great', label: '最高', icon: '😄', color: 'from-green-400 to-emerald-500' },
    { value: 'good', label: '良い', icon: '🙂', color: 'from-lime-400 to-green-500' },
    { value: 'neutral', label: '普通', icon: '😐', color: 'from-yellow-400 to-amber-500' },
    { value: 'bad', label: 'いまいち', icon: '😕', color: 'from-orange-400 to-red-500' },
    { value: 'terrible', label: '最悪', icon: '😞', color: 'from-red-400 to-rose-600' },
];

const ENERGY_LEVELS = [
    { level: 1, label: '疲労困憊', icon: BatteryWarning },
    { level: 2, label: '疲れ気味', icon: BatteryLow },
    { level: 3, label: '普通', icon: BatteryMedium },
    { level: 4, label: '元気', icon: Battery },
    { level: 5, label: 'エネルギー満タン', icon: BatteryFull },
];

export function DiaryModal({ isOpen, onClose, onSave, existingEntry }: DiaryModalProps) {
    const [mood, setMood] = useState<MoodType>(existingEntry?.mood || 'neutral');
    const [note, setNote] = useState(existingEntry?.note || '');
    const [energyLevel, setEnergyLevel] = useState(existingEntry?.energy_level || 3);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingEntry) {
            setMood(existingEntry.mood);
            setNote(existingEntry.note);
            setEnergyLevel(existingEntry.energy_level);
        } else {
            setMood('neutral');
            setNote('');
            setEnergyLevel(3);
        }
    }, [existingEntry, isOpen]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            await onSave(mood, note, energyLevel);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    // Haptic feedback
    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full md:max-w-lg glass-card rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-grit-text">今日の記録</h2>
                                    <p className="text-sm text-grit-text-muted">気分とメモを残そう</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-grit-surface-hover text-grit-text-muted hover:text-grit-text transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mood Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-grit-text-muted mb-3">
                                今日の気分は？
                            </label>
                            <div className="flex justify-between gap-2">
                                {MOOD_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setMood(option.value);
                                            triggerHaptic();
                                        }}
                                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${mood === option.value
                                            ? `border-transparent bg-gradient-to-br ${option.color} shadow-lg`
                                            : 'border-grit-border bg-grit-surface-hover hover:border-grit-text-dim'
                                            }`}
                                    >
                                        <span className="text-2xl">{option.icon}</span>
                                        <span
                                            className={`text-xs font-medium ${mood === option.value ? 'text-white' : 'text-grit-text-muted'
                                                }`}
                                        >
                                            {option.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Energy Level */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-grit-text-muted mb-3">
                                エネルギーレベル
                            </label>
                            <div className="flex justify-between gap-2">
                                {ENERGY_LEVELS.map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = energyLevel === item.level;
                                    return (
                                        <button
                                            key={item.level}
                                            onClick={() => {
                                                setEnergyLevel(item.level);
                                                triggerHaptic();
                                            }}
                                            className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${isSelected
                                                ? 'border-grit-accent bg-grit-accent/20'
                                                : 'border-grit-border bg-grit-surface-hover hover:border-grit-text-dim'
                                                }`}
                                        >
                                            <Icon
                                                className={`w-6 h-6 ${isSelected ? 'text-grit-accent' : 'text-grit-text-muted'
                                                    }`}
                                            />
                                            <span
                                                className={`text-xs font-medium text-center ${isSelected ? 'text-grit-accent' : 'text-grit-text-muted'
                                                    }`}
                                            >
                                                {item.level}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-center text-sm text-grit-text-muted mt-2">
                                {ENERGY_LEVELS.find((e) => e.level === energyLevel)?.label}
                            </p>
                        </div>

                        {/* Note */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-grit-text-muted mb-3">
                                メモ（任意）
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="今日の出来事、感じたこと、明日の目標など..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-grit-surface-hover border border-grit-border text-grit-text placeholder-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50 resize-none"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? '保存中...' : existingEntry ? '更新する' : '保存する'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Mood display card for dashboard
interface MoodCardProps {
    entry: DiaryEntry | null;
    onEdit: () => void;
}

export function MoodCard({ entry, onEdit }: MoodCardProps) {
    const moodOption = entry ? MOOD_OPTIONS.find((m) => m.value === entry.mood) : null;
    const energyOption = entry ? ENERGY_LEVELS.find((e) => e.level === entry.energy_level) : null;

    return (
        <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-grit-text">今日の気分</h3>
                <button
                    onClick={onEdit}
                    className="text-sm text-grit-accent hover:underline"
                >
                    {entry ? '編集' : '記録する'}
                </button>
            </div>

            {entry && moodOption ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${moodOption.color} flex items-center justify-center text-3xl shadow-lg`}
                        >
                            {moodOption.icon}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-grit-text">{moodOption.label}</p>
                            <div className="flex items-center gap-2 text-sm text-grit-text-muted">
                                {energyOption && (
                                    <>
                                        <energyOption.icon className="w-4 h-4" />
                                        <span>{energyOption.label}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {entry.note && (
                        <p className="text-sm text-grit-text-muted bg-grit-surface-hover rounded-xl p-3 line-clamp-3">
                            {entry.note}
                        </p>
                    )}
                </div>
            ) : (
                <button
                    onClick={onEdit}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-grit-border hover:border-grit-accent/50 transition-colors flex flex-col items-center gap-2 text-grit-text-muted hover:text-grit-accent"
                >
                    <Sparkles className="w-8 h-8" />
                    <span className="text-sm font-medium">今日の気分を記録しよう</span>
                </button>
            )}
        </div>
    );
}
