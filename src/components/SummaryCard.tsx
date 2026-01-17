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
                    <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-base lg:text-lg font-semibold">-{absValue}kg</span>
                </div>
            );
        } else if (weightDiff > 0) {
            return (
                <div className="flex items-center gap-1.5 text-grit-negative">
                    <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-base lg:text-lg font-semibold">+{absValue}kg</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1.5 text-grit-text-muted">
                    <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-base lg:text-lg font-semibold">±0kg</span>
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
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-5 sm:p-6 lg:p-8 border border-grit-border animate-fade-in backdrop-blur-xl">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm text-grit-text-muted mb-2 lg:mb-3">最新の体重</p>
                    {latestWeight !== null ? (
                        <>
                            <div className="flex items-baseline gap-1.5 sm:gap-2">
                                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-grit-text tracking-tighter">
                                    {latestWeight.toFixed(1)}
                                </span>
                                <span className="text-lg sm:text-xl lg:text-2xl text-grit-text-muted font-light">kg</span>
                            </div>
                            <div className="mt-2 lg:mt-4">
                                {getDiffDisplay()}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 mt-4">
                            <Scale className="w-6 h-6 lg:w-8 lg:h-8 text-grit-text-dim" />
                            <span className="text-grit-text-muted text-sm lg:text-base">記録がありません</span>
                        </div>
                    )}
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-grit-accent/15 dark:bg-grit-accent/20 flex items-center justify-center dark:glow-accent">
                    <Scale className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-grit-accent" />
                </div>
            </div>

            {/* Target weight display */}
            {targetWeight !== null && targetDiff !== null && (
                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-grit-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-grit-text-muted">
                            <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            <span className="text-xs lg:text-sm">目標: {targetWeight.toFixed(1)}kg</span>
                        </div>
                        <div className={`text-xs lg:text-sm font-semibold ${targetDiff <= 0 ? 'text-grit-positive' : 'text-grit-accent'}`}>
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
