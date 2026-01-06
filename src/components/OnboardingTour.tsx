import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    X,
    Scale,
    Target,
    CheckSquare,
    LineChart,
    Calendar,
    Dumbbell,
    Utensils,
    Trophy,
    Sparkles
} from 'lucide-react';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    targetSelector?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Gritへようこそ！ 🎉',
        description: 'ダイエットと健康管理をサポートするアプリです。このツアーで主要な機能をご紹介します。',
        icon: <Sparkles className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'weight-record',
        title: '体重を記録する',
        description: '毎日の体重を記録して、進捗を追跡しましょう。体脂肪率も一緒に記録できます。',
        icon: <Scale className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'summary-card',
        title: 'サマリーカード',
        description: '現在の体重と目標までの差を一目で確認できます。前日との変化も表示されます。',
        icon: <Target className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'weekly-chart',
        title: '週間グラフ',
        description: '過去1週間の体重推移をグラフで確認。目標体重のラインも表示されます。',
        icon: <LineChart className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'habits',
        title: '習慣トラッキング',
        description: '毎日のタスクを管理して習慣化をサポート。タップするだけで完了できます。',
        icon: <CheckSquare className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'heatmap',
        title: '継続カレンダー',
        description: 'GitHubのようなヒートマップで継続状況を可視化。緑が濃いほど記録が充実しています。',
        icon: <Calendar className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'workouts',
        title: 'ワークアウト管理',
        description: '曜日ごとのワークアウトスケジュールを設定できます。完了したら記録しましょう。',
        icon: <Dumbbell className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'meals',
        title: '食事記録',
        description: '朝食・昼食・夕食・間食を記録。カロリーとPFC（タンパク質・脂質・炭水化物）を管理できます。',
        icon: <Utensils className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'achievements',
        title: '実績システム',
        description: '記録を続けると実績が解除されます！目標達成を目指して頑張りましょう。',
        icon: <Trophy className="w-8 h-8" />,
        position: 'center',
    },
    {
        id: 'complete',
        title: '準備完了！ 🚀',
        description: '右下のオレンジのボタンから今日の記録を始めましょう。設定ページで目標体重やタスクをカスタマイズできます。',
        icon: <Sparkles className="w-8 h-8" />,
        position: 'center',
    },
];

interface OnboardingTourProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const step = ONBOARDING_STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === ONBOARDING_STEPS.length - 1;
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

    const handleNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleDotClick = (index: number) => {
        setDirection(index > currentStep ? 1 : -1);
        setCurrentStep(index);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onSkip();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentStep]);

    // Haptic feedback
    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md glass-card rounded-3xl overflow-hidden"
            >
                {/* Progress bar */}
                <div className="h-1 bg-grit-border">
                    <motion.div
                        className="h-full bg-gradient-to-r from-grit-accent to-orange-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Skip button */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onSkip}
                        className="p-2 rounded-xl text-grit-text-muted hover:text-grit-text hover:bg-grit-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pt-6">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className="text-center"
                        >
                            {/* Icon */}
                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-grit-accent to-orange-400 flex items-center justify-center text-white shadow-xl shadow-grit-accent/40">
                                    {step.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-grit-text mb-3">{step.title}</h2>

                            {/* Description */}
                            <p className="text-grit-text-muted leading-relaxed">{step.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8 mb-6">
                        {ONBOARDING_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    handleDotClick(index);
                                    triggerHaptic();
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'w-8 bg-grit-accent'
                                        : 'bg-grit-border hover:bg-grit-text-dim'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        {!isFirst && (
                            <button
                                onClick={() => {
                                    handlePrev();
                                    triggerHaptic();
                                }}
                                className="flex-1 py-3 rounded-xl border border-grit-border text-grit-text font-medium hover:bg-grit-surface-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                戻る
                            </button>
                        )}
                        <button
                            onClick={() => {
                                handleNext();
                                triggerHaptic();
                            }}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-grit-accent to-orange-400 text-white font-semibold shadow-lg shadow-grit-accent/30 hover:shadow-xl hover:shadow-grit-accent/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isLast ? '始める' : '次へ'}
                            {!isLast && <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Hook to manage onboarding state
const ONBOARDING_KEY = 'grit_onboarding_completed';

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            // Delay showing onboarding to let the page load first
            setTimeout(() => {
                setShowOnboarding(true);
            }, 500);
        }
        setHasChecked(true);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShowOnboarding(false);
    };

    const skipOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        hasChecked,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
    };
}
