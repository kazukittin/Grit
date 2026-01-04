import { TrendingDown, TrendingUp, Minus, Scale } from 'lucide-react';

interface SummaryCardProps {
    latestWeight: number | null;
    weightDiff: number | null;
}

export const SummaryCard = ({ latestWeight, weightDiff }: SummaryCardProps) => {
    const getDiffDisplay = () => {
        if (weightDiff === null) return null;

        const absValue = Math.abs(weightDiff).toFixed(1);

        if (weightDiff < 0) {
            return (
                <div className="flex items-center gap-1.5 text-grit-positive">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-lg font-semibold">-{absValue}kg</span>
                </div>
            );
        } else if (weightDiff > 0) {
            return (
                <div className="flex items-center gap-1.5 text-grit-negative">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-semibold">+{absValue}kg</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1.5 text-grit-text-muted">
                    <Minus className="w-5 h-5" />
                    <span className="text-lg font-semibold">±0kg</span>
                </div>
            );
        }
    };

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-grit-text-muted mb-2">最新の体重</p>
                    {latestWeight !== null ? (
                        <>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-grit-text tracking-tight">
                                    {latestWeight.toFixed(1)}
                                </span>
                                <span className="text-xl text-grit-text-muted">kg</span>
                            </div>
                            <div className="mt-3">
                                {getDiffDisplay()}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 mt-4">
                            <Scale className="w-8 h-8 text-grit-text-dim" />
                            <span className="text-grit-text-muted">記録がありません</span>
                        </div>
                    )}
                </div>
                <div className="w-14 h-14 rounded-full bg-grit-accent/10 flex items-center justify-center">
                    <Scale className="w-7 h-7 text-grit-accent" />
                </div>
            </div>
        </div>
    );
};
