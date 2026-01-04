import { useState, useCallback } from 'react';
import { X, Save, Calendar, Scale, Percent } from 'lucide-react';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { date: string; weight: number; bodyFat?: number }) => void;
}

export const RecordModal = ({ isOpen, onClose, onSave }: RecordModalProps) => {
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState(today);
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [error, setError] = useState('');

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

            onSave({ date, weight: weightNum, bodyFat: bodyFatNum });
            setWeight('');
            setBodyFat('');
            onClose();
        },
        [date, weight, bodyFat, onSave, onClose]
    );

    const handleClose = useCallback(() => {
        setWeight('');
        setBodyFat('');
        setError('');
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-grit-surface border-t border-grit-border rounded-t-3xl animate-slide-up">
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

                    {/* Date input */}
                    <div className="mb-4">
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
