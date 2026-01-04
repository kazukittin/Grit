import { useState, useEffect } from 'react';
import { X, Clock, Dumbbell } from 'lucide-react';
import type { WorkoutRoutine } from '../types';

interface WorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, description: string, durationMin: number) => Promise<void>;
    routine?: WorkoutRoutine | null;
}

export const WorkoutModal = ({ isOpen, onClose, onSave, routine }: WorkoutModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('30');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(routine?.title || '');
            setDescription(routine?.description || '');
            setDuration('30');
        }
    }, [isOpen, routine]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSaving(true);
        await onSave(title.trim(), description.trim(), parseInt(duration) || 30);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-grit-surface rounded-t-3xl sm:rounded-2xl border border-grit-border shadow-xl animate-slide-up">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-grit-accent" />
                            <h2 className="text-lg font-semibold text-grit-text">
                                ワークアウトを記録
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-grit-surface-hover flex items-center justify-center hover:bg-grit-border transition-colors"
                        >
                            <X className="w-5 h-5 text-grit-text-muted" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                タイトル
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="例: ランニング、筋トレ（胸の日）"
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                詳細メニュー（任意）
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="例: ベンチプレス 60kg x 10 x 3セット&#10;ダンベルフライ 12kg x 12 x 3セット"
                                rows={4}
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors resize-none"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                トレーニング時間（分）
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min="1"
                                max="300"
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!title.trim() || isSaving}
                            className="w-full py-4 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isSaving ? '保存中...' : '記録する'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
