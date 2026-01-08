import { useState, useCallback, useEffect } from 'react';
import { X, Save, Calendar, Scale, Percent, Sunrise, Moon } from 'lucide-react';
import type { TimeOfDay } from '../types';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { date: string; weight: number; bodyFat?: number; timeOfDay?: TimeOfDay }) => void;
}

export const RecordModal = ({ isOpen, onClose, onSave }: RecordModalProps) => {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const [date, setDate] = useState(today);
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(currentHour < 12 ? 'morning' : 'evening');
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTimeOfDay(new Date().getHours() < 12 ? 'morning' : 'evening');
            setDate(today);
        }
    }, [isOpen, today]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setError('');

            const weightNum = parseFloat(weight);
            if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
                setError('有効な体重を入力してください（1-500kg）');
                return;
            }

            let bodyFatNum: number | undefined;
            if (bodyFat.trim()) {
                bodyFatNum = parseFloat(bodyFat);
                if (isNaN(bodyFatNum) || bodyFatNum < 0 || bodyFatNum > 100) {
                    setError('有効な体脂肪率を入力してください（0-100%）');
                    return;
                }
            }

            onSave({ date, weight: weightNum, bodyFat: bodyFatNum, timeOfDay });
            setWeight('');
            setBodyFat('');
            onClose();
        },
        [date, weight, bodyFat, timeOfDay, onSave, onClose]
    );

    const handleClose = useCallback(() => {
        setDate(today);
        setWeight('');
        setBodyFat('');
        setError('');
        onClose();
    }, [onClose, today]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-grit-surface dark:glass-card border-t border-grit-border dark:border-grit-glass-border rounded-t-3xl animate-slide-up backdrop-blur-2xl">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-grit-border rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4">
                    <h2 className="text-xl font-bold text-grit-text">記録を追加</h2>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-grit-surface-hover flex items-center justify-center hover:bg-grit-border transition-colors"
                    >
                        <X className="w-5 h-5 text-grit-text-muted" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-grit-negative/10 border border-grit-negative/30">
                            <p className="text-sm text-grit-negative">{error}</p>
                        </div>
                    )}

                    {/* Date & Time Date input */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                <Calendar className="w-4 h-4" />
                                日付
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                max={today}
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text focus:outline-none focus:border-grit-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                {timeOfDay === 'morning' ? <Sunrise className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                                時間帯
                            </label>
                            <div className="flex bg-grit-bg rounded-xl border border-grit-border p-1">
                                <button
                                    type="button"
                                    onClick={() => setTimeOfDay('morning')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${timeOfDay === 'morning'
                                            ? 'bg-orange-500/10 text-orange-500 shadow-sm'
                                            : 'text-grit-text-muted hover:bg-grit-surface'
                                        }`}
                                >
                                    <Sunrise className="w-4 h-4" />
                                    朝
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTimeOfDay('evening')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${timeOfDay === 'evening'
                                            ? 'bg-indigo-500/10 text-indigo-500 shadow-sm'
                                            : 'text-grit-text-muted hover:bg-grit-surface'
                                        }`}
                                >
                                    <Moon className="w-4 h-4" />
                                    夜
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weight input */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                            <Scale className="w-4 h-4" />
                            体重 (kg) *
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="65.0"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Body fat input */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                            <Percent className="w-4 h-4" />
                            体脂肪率 (%) - 任意
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="20.0"
                            value={bodyFat}
                            onChange={e => setBodyFat(e.target.value)}
                            className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        <Save className="w-5 h-5" />
                        保存する
                    </button>
                </form>
            </div>
        </div>
    );
};
