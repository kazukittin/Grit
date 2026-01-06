import { TrendingDown, TrendingUp, Minus, Scale, Target } from 'lucide-react';

interface SummaryCardProps {
    latestWeight: number | null;
    weightDiff: number | null;
    targetWeight: number | null;
}

export const SummaryCard = ({ latestWeight, weightDiff, targetWeight }: SummaryCardProps) => {
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

    const getTargetDiff = () => {
        if (latestWeight === null || targetWeight === null) return null;
        const diff = latestWeight - targetWeight;
        return diff;
    };

    const targetDiff = getTargetDiff();

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-8 border border-grit-border animate-fade-in backdrop-blur-xl">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-grit-text-muted mb-3">最新の体重</p>
                    {latestWeight !== null ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl md:text-7xl font-bold text-grit-text tracking-tighter">
                                    {latestWeight.toFixed(1)}
                                </span>
                                <span className="text-2xl text-grit-text-muted font-light">kg</span>
                            </div>
                            <div className="mt-4">
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
                <div className="w-16 h-16 rounded-full bg-grit-accent/15 dark:bg-grit-accent/20 flex items-center justify-center dark:glow-accent">
                    <Scale className="w-8 h-8 text-grit-accent" />
                </div>
            </div>

            {/* Target weight display */}
            {targetWeight !== null && targetDiff !== null && (
                <div className="mt-4 pt-4 border-t border-grit-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-grit-text-muted">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">目標: {targetWeight.toFixed(1)}kg</span>
                        </div>
                        <div className={`text-sm font-semibold ${targetDiff <= 0 ? 'text-grit-positive' : 'text-grit-accent'}`}>
                            {targetDiff <= 0 ? (
                                '🎉 目標達成！'
                            ) : (
                                `あと ${targetDiff.toFixed(1)}kg`
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
