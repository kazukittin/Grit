import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Target,
    Flame,
    CheckCircle,
    Sparkles,
    Scale,
    Ruler,
    User,
    Calculator,
} from 'lucide-react';

interface InitialSetupWizardProps {
    isOpen: boolean;
    onComplete: (data: SetupData) => Promise<void>;
    onSkip: () => void;
}

export interface SetupData {
    currentWeight: number | null;
    height: number | null;
    targetWeight: number | null;
    targetCalories: number | null;
    targetProtein: number | null;
    targetFat: number | null;
    targetCarbs: number | null;
}

const STEPS = ['welcome', 'body', 'goals', 'nutrition', 'complete'] as const;
type StepType = typeof STEPS[number];

export function InitialSetupWizard({ isOpen, onComplete, onSkip }: InitialSetupWizardProps) {
    const [currentStep, setCurrentStep] = useState<StepType>('welcome');
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [currentWeight, setCurrentWeight] = useState('');
    const [height, setHeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const [targetCalories, setTargetCalories] = useState('');
    const [targetProtein, setTargetProtein] = useState('');
    const [targetFat, setTargetFat] = useState('');
    const [targetCarbs, setTargetCarbs] = useState('');
    const [age, setAge] = useState('30');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [isAutoCalculated, setIsAutoCalculated] = useState(false);

    const currentStepIndex = STEPS.indexOf(currentStep);
    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

    const handleNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setDirection(1);
            setCurrentStep(STEPS[nextIndex]);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setDirection(-1);
            setCurrentStep(STEPS[prevIndex]);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        await onComplete({
            currentWeight: currentWeight ? parseFloat(currentWeight) : null,
            height: height ? parseFloat(height) : null,
            targetWeight: targetWeight ? parseFloat(targetWeight) : null,
            targetCalories: targetCalories ? parseInt(targetCalories) : null,
            targetProtein: targetProtein ? parseInt(targetProtein) : null,
            targetFat: targetFat ? parseInt(targetFat) : null,
            targetCarbs: targetCarbs ? parseInt(targetCarbs) : null,
        });
        setIsSubmitting(false);
    };

    // Calculate BMI if height and weight are entered
    const bmi = height && currentWeight
        ? (parseFloat(currentWeight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
        : null;

    const getBmiStatus = (bmi: number) => {
        if (bmi < 18.5) return { label: 'やせ', color: 'text-blue-400' };
        if (bmi < 25) return { label: '標準', color: 'text-green-400' };
        if (bmi < 30) return { label: '肥満(1度)', color: 'text-yellow-400' };
        return { label: '肥満(2度以上)', color: 'text-red-400' };
    };

    // Calculate nutrition goals based on height, weight, age, and gender using Mifflin-St Jeor equation
    const calculateNutritionGoals = () => {
        const weightKg = parseFloat(currentWeight);
        const heightCm = parseFloat(height);
        const ageYears = parseInt(age) || 30;

        if (!weightKg || !heightCm) return null;

        // Mifflin-St Jeor Equation for BMR
        let bmr: number;
        if (gender === 'male') {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        } else {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        }

        // TDEE with moderate activity level (1.55)
        const tdee = bmr * 1.55;

        // For weight loss: subtract 500kcal (about 0.5kg/week)
        const targetCaloriesNum = Math.round(tdee - 500);

        // Protein: 2g per kg body weight for muscle preservation during diet
        const proteinNum = Math.round(weightKg * 2);

        // Fat: 25% of calories (9 kcal/g)
        const fatNum = Math.round((targetCaloriesNum * 0.25) / 9);

        // Carbs: remaining calories (4 kcal/g)
        const proteinCals = proteinNum * 4;
        const fatCals = fatNum * 9;
        const carbsNum = Math.round((targetCaloriesNum - proteinCals - fatCals) / 4);

        return {
            calories: Math.max(1200, targetCaloriesNum), // Minimum 1200 kcal
            protein: proteinNum,
            fat: fatNum,
            carbs: Math.max(50, carbsNum), // Minimum 50g carbs
        };
    };

    // Auto-calculate nutrition goals when moving to nutrition step
    useEffect(() => {
        if (currentStep === 'nutrition' && !isAutoCalculated && currentWeight && height) {
            const goals = calculateNutritionGoals();
            if (goals) {
                setTargetCalories(goals.calories.toString());
                setTargetProtein(goals.protein.toString());
                setTargetFat(goals.fat.toString());
                setTargetCarbs(goals.carbs.toString());
                setIsAutoCalculated(true);
            }
        }
    }, [currentStep, currentWeight, height, age, gender, isAutoCalculated]);

    // Recalculate when user clicks recalculate button
    const handleRecalculate = () => {
        const goals = calculateNutritionGoals();
        if (goals) {
            setTargetCalories(goals.calories.toString());
            setTargetProtein(goals.protein.toString());
            setTargetFat(goals.fat.toString());
            setTargetCarbs(goals.carbs.toString());
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'welcome':
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-grit-accent to-orange-400 flex items-center justify-center shadow-xl shadow-grit-accent/30">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-grit-text mb-3">
                            Gritへようこそ！ 🎉
                        </h2>
                        <p className="text-grit-text-muted leading-relaxed mb-6">
                            ダイエットと健康管理をサポートするアプリです。<br />
                            まずは簡単な初期設定を行いましょう。
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleNext}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-grit-accent to-orange-400 text-white font-semibold shadow-lg shadow-grit-accent/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                初期設定を始める
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onSkip}
                                className="w-full py-3 rounded-xl text-grit-text-muted hover:text-grit-text transition-colors"
                            >
                                後で設定する
                            </button>
                        </div>
                    </div>
                );

            case 'body':
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-grit-text">体の情報</h2>
                                <p className="text-sm text-grit-text-muted">現在の状態を教えてください</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {/* Current Weight */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                    <Scale className="w-4 h-4" />
                                    現在の体重
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={currentWeight}
                                        onChange={(e) => { setCurrentWeight(e.target.value); setIsAutoCalculated(false); }}
                                        placeholder="65.0"
                                        className="w-full px-4 py-3 pr-14 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-lg placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">
                                        kg
                                    </span>
                                </div>
                            </div>

                            {/* Height */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                    <Ruler className="w-4 h-4" />
                                    身長
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={height}
                                        onChange={(e) => { setHeight(e.target.value); setIsAutoCalculated(false); }}
                                        placeholder="170.0"
                                        className="w-full px-4 py-3 pr-14 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-lg placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">
                                        cm
                                    </span>
                                </div>
                            </div>

                            {/* Age and Gender for nutrition calculation */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                        年齢
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => { setAge(e.target.value); setIsAutoCalculated(false); }}
                                            placeholder="30"
                                            min="10"
                                            max="100"
                                            className="w-full px-4 py-3 pr-12 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-lg placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted text-sm">
                                            歳
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                        性別
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setGender('male'); setIsAutoCalculated(false); }}
                                            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${gender === 'male'
                                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                    : 'bg-grit-surface-hover border-grit-border text-grit-text-muted'
                                                }`}
                                        >
                                            男性
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setGender('female'); setIsAutoCalculated(false); }}
                                            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${gender === 'female'
                                                    ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                                    : 'bg-grit-surface-hover border-grit-border text-grit-text-muted'
                                                }`}
                                        >
                                            女性
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* BMI Display */}
                            {bmi && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-grit-surface rounded-xl p-4 border border-grit-border"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-grit-text-muted">BMI</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-grit-text">{bmi}</span>
                                            <span className={`ml-2 text-sm font-medium ${getBmiStatus(parseFloat(bmi)).color}`}>
                                                {getBmiStatus(parseFloat(bmi)).label}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 rounded-xl border border-grit-border text-grit-text font-medium hover:bg-grit-surface-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-grit-accent to-orange-400 text-white font-semibold shadow-lg shadow-grit-accent/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                次へ
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );

            case 'goals':
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-grit-text">目標体重</h2>
                                <p className="text-sm text-grit-text-muted">あなたの理想の体重を設定しましょう</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                目標体重（kg）
                            </label>
                            <div className="relative">
                                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grit-text-dim" />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(e.target.value)}
                                    placeholder="60.0"
                                    className="w-full pl-12 pr-16 py-4 bg-grit-surface-hover border border-grit-border rounded-2xl text-grit-text text-lg placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">
                                    kg
                                </span>
                            </div>

                            {/* Weight difference */}
                            {currentWeight && targetWeight && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 text-center"
                                >
                                    <span className={`text-sm font-medium ${parseFloat(currentWeight) > parseFloat(targetWeight)
                                        ? 'text-green-400'
                                        : parseFloat(currentWeight) < parseFloat(targetWeight)
                                            ? 'text-blue-400'
                                            : 'text-grit-text-muted'
                                        }`}>
                                        {parseFloat(currentWeight) > parseFloat(targetWeight)
                                            ? `🎯 ${(parseFloat(currentWeight) - parseFloat(targetWeight)).toFixed(1)}kg 減量目標`
                                            : parseFloat(currentWeight) < parseFloat(targetWeight)
                                                ? `💪 ${(parseFloat(targetWeight) - parseFloat(currentWeight)).toFixed(1)}kg 増量目標`
                                                : '✨ 現在の体重を維持'}
                                    </span>
                                </motion.div>
                            )}

                            <p className="text-xs text-grit-text-dim mt-3">
                                後から設定ページで変更できます
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 rounded-xl border border-grit-border text-grit-text font-medium hover:bg-grit-surface-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-grit-accent to-orange-400 text-white font-semibold shadow-lg shadow-grit-accent/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                次へ
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );

            case 'nutrition':
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-grit-text">栄養目標</h2>
                                <p className="text-sm text-grit-text-muted">1日の目標カロリーとPFCを設定</p>
                            </div>
                        </div>

                        {/* Auto-calculated badge and recalculate button */}
                        {currentWeight && height && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-green-400">
                                            身長・体重から自動計算しました
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRecalculate}
                                        className="text-xs text-green-400 hover:text-green-300 underline"
                                    >
                                        再計算
                                    </button>
                                </div>
                                <p className="text-xs text-grit-text-muted mt-1">
                                    ※ 減量目標（-500kcal/日）で計算。手動で調整も可能です。
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            {/* Calories */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-grit-text-muted mb-2">
                                    <Flame className="w-4 h-4" />
                                    目標カロリー
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetCalories}
                                        onChange={(e) => setTargetCalories(e.target.value)}
                                        placeholder="2000"
                                        className="w-full px-4 py-3 pr-16 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-grit-accent/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted text-sm">
                                        kcal
                                    </span>
                                </div>
                            </div>

                            {/* PFC */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-red-400 mb-1.5">
                                        P（タンパク質）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetProtein}
                                            onChange={(e) => setTargetProtein(e.target.value)}
                                            placeholder="120"
                                            className="w-full px-3 py-2.5 pr-8 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-sm placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-red-400/50"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">
                                            g
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-yellow-400 mb-1.5">
                                        F（脂質）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetFat}
                                            onChange={(e) => setTargetFat(e.target.value)}
                                            placeholder="60"
                                            className="w-full px-3 py-2.5 pr-8 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-sm placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">
                                            g
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-blue-400 mb-1.5">
                                        C（炭水化物）
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetCarbs}
                                            onChange={(e) => setTargetCarbs(e.target.value)}
                                            placeholder="200"
                                            className="w-full px-3 py-2.5 pr-8 bg-grit-surface-hover border border-grit-border rounded-xl text-grit-text text-sm placeholder:text-grit-text-dim focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-grit-text-dim">
                                            g
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 rounded-xl border border-grit-border text-grit-text font-medium hover:bg-grit-surface-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-grit-accent to-orange-400 text-white font-semibold shadow-lg shadow-grit-accent/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                次へ
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-grit-text mb-3">
                            設定完了！ 🚀
                        </h2>
                        <p className="text-grit-text-muted leading-relaxed mb-6">
                            これで準備が整いました！<br />
                            右下のボタンから今日の記録を始めましょう。
                        </p>

                        {/* Summary */}
                        <div className="bg-grit-surface-hover rounded-2xl p-4 mb-6 text-left">
                            <h3 className="text-sm font-semibold text-grit-text-muted mb-3">設定内容</h3>
                            <div className="space-y-2 text-sm">
                                {currentWeight && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-grit-text-muted">現在の体重</span>
                                        <span className="text-grit-text font-medium">{currentWeight} kg</span>
                                    </div>
                                )}
                                {height && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-grit-text-muted">身長</span>
                                        <span className="text-grit-text font-medium">{height} cm</span>
                                    </div>
                                )}
                                {targetWeight && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-grit-text-muted">目標体重</span>
                                        <span className="text-grit-text font-medium">{targetWeight} kg</span>
                                    </div>
                                )}
                                {targetCalories && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-grit-text-muted">目標カロリー</span>
                                        <span className="text-grit-text font-medium">{targetCalories} kcal</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-grit-text-muted">PFC目標</span>
                                    <span className="text-grit-text font-medium">
                                        P:{targetProtein}g / F:{targetFat}g / C:{targetCarbs}g
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 rounded-xl border border-grit-border text-grit-text font-medium hover:bg-grit-surface-hover transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                戻る
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? '保存中...' : '始める！'}
                            </button>
                        </div>
                    </div>
                );
        }
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

                {/* Content */}
                <div className="p-6">
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
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {STEPS.map((step, index) => (
                            <div
                                key={step}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStepIndex
                                    ? 'w-8 bg-grit-accent'
                                    : index < currentStepIndex
                                        ? 'bg-grit-accent/50'
                                        : 'bg-grit-border'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Hook to manage initial setup state
const SETUP_COMPLETED_KEY = 'grit_initial_setup_completed';

export function useInitialSetup() {
    const [showSetup, setShowSetup] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const checkSetupStatus = (_profileHasTargets?: boolean) => {
        const completed = localStorage.getItem(SETUP_COMPLETED_KEY);

        // Show setup if:
        // 1. Setup hasn't been completed/skipped before (localStorage entry doesn't exist)
        // Note: If user resets via settings, the key is removed so wizard shows again
        if (!completed) {
            setShowSetup(true);
        }
        setHasChecked(true);
    };

    const completeSetup = () => {
        localStorage.setItem(SETUP_COMPLETED_KEY, 'true');
        setShowSetup(false);
    };

    const skipSetup = () => {
        localStorage.setItem(SETUP_COMPLETED_KEY, 'skipped');
        setShowSetup(false);
    };

    const resetSetup = () => {
        localStorage.removeItem(SETUP_COMPLETED_KEY);
    };

    return {
        showSetup,
        hasChecked,
        checkSetupStatus,
        completeSetup,
        skipSetup,
        resetSetup,
    };
}
