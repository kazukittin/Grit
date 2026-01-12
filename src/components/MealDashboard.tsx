import { useState, useMemo } from 'react';
import {
    Utensils,
    Plus,
    Sunrise,
    Sun,
    Sunset,
    Cookie,
    Flame,
    Edit3,
    Trash2,
    Star,
    Zap,
    TrendingUp,
    Clock,
    ChevronRight,
    ChevronLeft,
    CalendarDays,
    Sparkles,
    Target,
    Beef,
    Droplets,
    Wheat,
    Coffee,
    Pizza,
    Salad,
    Sandwich,
    IceCream,
    Apple,
    Egg,
    Fish,
    Drumstick,
} from 'lucide-react';
import type { MealLog, MealType, FavoriteMeal, PFCSummary } from '../types';
import { MEAL_TYPES } from '../types';

interface MealDashboardProps {
    meals: MealLog[];
    favoriteMeals: FavoriteMeal[];
    currentPFC: PFCSummary;
    targetPFC: { calories: number; protein: number; fat: number; carbs: number } | null;
    onAddMeal: (mealType: MealType) => void;
    onEditMeal: (meal: MealLog) => void;
    onDeleteMeal: (mealId: string) => Promise<void>;
    onQuickAdd: (meal: FavoriteMeal, mealType: MealType) => Promise<void>;
    onOpenFavorites?: () => void;
    onOpenManualEntry?: (mealType: MealType) => void;
    // Date navigation
    selectedDate: string; // YYYY-MM-DD format
    onDateChange: (date: string) => void;
    isToday: boolean;
    todayDate: string;
}

// Food icon mapping based on keywords
const getFoodIcon = (foodName: string) => {
    const name = foodName.toLowerCase();
    if (name.includes('コーヒー') || name.includes('紅茶') || name.includes('tea')) return Coffee;
    if (name.includes('ピザ') || name.includes('pizza')) return Pizza;
    if (name.includes('サラダ') || name.includes('salad') || name.includes('野菜')) return Salad;
    if (name.includes('サンド') || name.includes('パン') || name.includes('bread')) return Sandwich;
    if (name.includes('アイス') || name.includes('デザート') || name.includes('ケーキ')) return IceCream;
    if (name.includes('りんご') || name.includes('フルーツ') || name.includes('果物')) return Apple;
    if (name.includes('卵') || name.includes('たまご') || name.includes('egg')) return Egg;
    if (name.includes('魚') || name.includes('さかな') || name.includes('fish') || name.includes('鮭')) return Fish;
    if (name.includes('チキン') || name.includes('鶏') || name.includes('chicken')) return Drumstick;
    if (name.includes('肉') || name.includes('ステーキ') || name.includes('beef')) return Beef;
    return Utensils;
};

const MealIcon = ({ type }: { type: 'sunrise' | 'sun' | 'sunset' | 'cookie' }) => {
    switch (type) {
        case 'sunrise': return <Sunrise className="w-5 h-5" />;
        case 'sun': return <Sun className="w-5 h-5" />;
        case 'sunset': return <Sunset className="w-5 h-5" />;
        case 'cookie': return <Cookie className="w-5 h-5" />;
    }
};

// Progress Ring Component
const ProgressRing = ({
    progress,
    size = 60,
    strokeWidth = 6,
    color,
    bgColor = 'rgba(255,255,255,0.1)',
    children,
}: {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    bgColor?: string;
    children?: React.ReactNode;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - Math.min(progress, 100) / 100 * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

// Animated Progress Bar
const AnimatedProgressBar = ({
    current,
    target,
    color,
    label,
    unit = 'g',
    icon: Icon,
}: {
    current: number;
    target: number;
    color: string;
    label: string;
    unit?: string;
    icon: React.ElementType;
}) => {
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isOver = current > target && target > 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs font-medium text-grit-text-muted">{label}</span>
                </div>
                <span className={`text-xs font-bold ${isOver ? 'text-red-400' : 'text-grit-text'}`}>
                    {Math.round(current)}/{target}{unit}
                </span>
            </div>
            <div className="h-2 bg-grit-bg rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isOver ? 'animate-pulse' : ''}`}
                    style={{
                        width: `${progress}%`,
                        background: isOver
                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                            : `linear-gradient(90deg, ${color}, ${color}88)`,
                    }}
                />
            </div>
        </div>
    );
};

// Quick Add Button
const QuickAddButton = ({
    meal,
    onAdd,
    mealType,
}: {
    meal: FavoriteMeal;
    onAdd: (meal: FavoriteMeal, mealType: MealType) => void;
    mealType: MealType;
}) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleClick = async () => {
        setIsAdding(true);
        await onAdd(meal, mealType);
        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isAdding}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-xl
                bg-gradient-to-r from-grit-surface to-grit-surface-hover
                border border-grit-border hover:border-grit-accent/50
                transition-all duration-200 group
                ${isAdding ? 'scale-95 opacity-75' : 'hover:scale-[1.02]'}
            `}
        >
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                bg-grit-accent/20 text-grit-accent
                ${isAdding ? 'animate-spin' : 'group-hover:scale-110'}
                transition-transform
            `}>
                {isAdding ? (
                    <Sparkles className="w-4 h-4" />
                ) : (
                    <Zap className="w-4 h-4" />
                )}
            </div>
            <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-medium text-grit-text truncate">{meal.name}</p>
                <p className="text-[10px] text-grit-text-muted">{meal.calories} kcal</p>
            </div>
        </button>
    );
};

// Meal Timeline Card
const MealTimelineCard = ({
    meal,
    onEdit,
    onDelete,
}: {
    meal: MealLog;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const FoodIcon = getFoodIcon(meal.food_name);

    const handleDelete = async () => {
        if (!confirm('この食事を削除しますか？')) return;
        setIsDeleting(true);
        await onDelete();
    };

    // Generate a gradient based on meal type
    const getGradient = (type: MealType) => {
        switch (type) {
            case 'breakfast': return 'from-orange-500/20 to-yellow-500/10';
            case 'lunch': return 'from-blue-500/20 to-cyan-500/10';
            case 'dinner': return 'from-purple-500/20 to-pink-500/10';
            case 'snack': return 'from-green-500/20 to-emerald-500/10';
        }
    };

    const getAccentColor = (type: MealType) => {
        switch (type) {
            case 'breakfast': return '#f97316';
            case 'lunch': return '#3b82f6';
            case 'dinner': return '#a855f7';
            case 'snack': return '#22c55e';
        }
    };

    return (
        <div
            className={`
                relative p-4 rounded-2xl
                bg-gradient-to-br ${getGradient(meal.meal_type)}
                border border-white/5 backdrop-blur-sm
                hover:border-white/10 transition-all duration-300
                group cursor-pointer
                ${isDeleting ? 'opacity-50 scale-95' : ''}
            `}
            onClick={onEdit}
        >
            {/* Time indicator */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: getAccentColor(meal.meal_type) }}
            />

            <div className="flex items-start gap-3">
                {/* Food Icon */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getAccentColor(meal.meal_type)}20` }}
                >
                    <FoodIcon
                        className="w-6 h-6"
                        style={{ color: getAccentColor(meal.meal_type) }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-grit-text truncate">{meal.food_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        {meal.calories > 0 && (
                            <span className="flex items-center gap-1 text-xs text-grit-text-muted">
                                <Flame className="w-3 h-3 text-orange-400" />
                                {meal.calories} kcal
                            </span>
                        )}
                        {meal.protein && meal.protein > 0 && (
                            <span className="flex items-center gap-1 text-xs text-grit-text-muted">
                                <Beef className="w-3 h-3 text-red-400" />
                                {meal.protein}g
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-grit-text-muted hover:text-grit-accent transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-grit-text-muted hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* PFC Mini Bar */}
            {(meal.protein || meal.fat || meal.carbs) && (
                <div className="flex gap-1 mt-3">
                    {meal.protein && meal.protein > 0 && (
                        <div className="flex-1 h-1 rounded-full bg-red-400/30 overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: '100%' }} />
                        </div>
                    )}
                    {meal.fat && meal.fat > 0 && (
                        <div className="flex-1 h-1 rounded-full bg-yellow-400/30 overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '100%' }} />
                        </div>
                    )}
                    {meal.carbs && meal.carbs > 0 && (
                        <div className="flex-1 h-1 rounded-full bg-blue-400/30 overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: '100%' }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const MealDashboard = ({
    meals,
    favoriteMeals,
    currentPFC,
    targetPFC,
    onAddMeal,
    onEditMeal,
    onDeleteMeal,
    onQuickAdd,
    onOpenFavorites,
    onOpenManualEntry,
    selectedDate,
    onDateChange,
    isToday,
    todayDate,
}: MealDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'nutrition'>('timeline');
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

    // Calculate remaining calories
    const remainingCalories = targetPFC ? targetPFC.calories - currentPFC.calories : 0;
    const calorieProgress = targetPFC ? (currentPFC.calories / targetPFC.calories) * 100 : 0;

    // Get current meal type based on time
    const getCurrentMealType = (): MealType => {
        const hour = new Date().getHours();
        if (hour < 10) return 'breakfast';
        if (hour < 15) return 'lunch';
        if (hour < 21) return 'dinner';
        return 'snack';
    };

    const currentMealType = useMemo(() => getCurrentMealType(), []);

    // Group meals by type
    const getMealsForType = (type: MealType) => meals.filter(m => m.meal_type === type);

    // Get suggested quick meals (most used, up to 4)
    const suggestedMeals = useMemo(() => {
        return [...favoriteMeals]
            .sort((a, b) => b.use_count - a.use_count)
            .slice(0, 4);
    }, [favoriteMeals]);

    // Date navigation helpers
    const navigateDate = (direction: 'prev' | 'next') => {
        const current = new Date(selectedDate);
        if (direction === 'prev') {
            current.setDate(current.getDate() - 1);
        } else {
            current.setDate(current.getDate() + 1);
        }
        onDateChange(current.toISOString().split('T')[0]);
    };

    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate.getTime() === today.getTime()) {
            return '今日';
        } else if (targetDate.getTime() === yesterday.getTime()) {
            return '昨日';
        } else {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
            return `${month}/${day} (${weekday})`;
        }
    };

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl border border-grit-border animate-fade-in backdrop-blur-xl overflow-hidden">
            {/* Date Navigation */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 rounded-lg hover:bg-grit-surface-hover text-grit-text-muted hover:text-grit-text transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-grit-accent" />
                    <span className={`text-sm font-semibold ${isToday ? 'text-grit-accent' : 'text-grit-text'}`}>
                        {formatDateDisplay(selectedDate)}
                    </span>
                    {!isToday && (
                        <button
                            onClick={() => onDateChange(todayDate)}
                            className="px-2 py-0.5 text-xs bg-grit-accent/20 text-grit-accent rounded-full hover:bg-grit-accent/30 transition-colors"
                        >
                            今日へ
                        </button>
                    )}
                </div>
                <button
                    onClick={() => navigateDate('next')}
                    disabled={isToday}
                    className={`p-2 rounded-lg transition-colors ${isToday
                        ? 'text-grit-text-dim cursor-not-allowed'
                        : 'hover:bg-grit-surface-hover text-grit-text-muted hover:text-grit-text'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Header with Nutrition Overview */}
            <div className="p-5 pt-2 bg-gradient-to-br from-grit-accent/10 to-purple-500/5 border-b border-grit-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-grit-accent/20 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-grit-accent" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-grit-text">{isToday ? '今日の食事' : '食事記録'}</h2>
                            <p className="text-xs text-grit-text-muted">{meals.length}品目記録済み</p>
                        </div>
                    </div>

                    {/* Calorie Ring */}
                    {targetPFC && (
                        <ProgressRing
                            progress={calorieProgress}
                            size={64}
                            strokeWidth={5}
                            color={remainingCalories >= 0 ? '#10b981' : '#ef4444'}
                        >
                            <div className="text-center">
                                <p className="text-xs font-bold text-grit-text">
                                    {Math.abs(remainingCalories).toLocaleString()}
                                </p>
                                <p className="text-[8px] text-grit-text-muted">
                                    {remainingCalories >= 0 ? '残り' : '超過'}
                                </p>
                            </div>
                        </ProgressRing>
                    )}
                </div>

                {/* PFC Progress Bars */}
                {targetPFC && (
                    <div className="grid grid-cols-3 gap-3">
                        <AnimatedProgressBar
                            current={currentPFC.protein}
                            target={targetPFC.protein}
                            color="#ef4444"
                            label="P"
                            icon={Beef}
                        />
                        <AnimatedProgressBar
                            current={currentPFC.fat}
                            target={targetPFC.fat}
                            color="#eab308"
                            label="F"
                            icon={Droplets}
                        />
                        <AnimatedProgressBar
                            current={currentPFC.carbs}
                            target={targetPFC.carbs}
                            color="#3b82f6"
                            label="C"
                            icon={Wheat}
                        />
                    </div>
                )}
            </div>

            {/* Quick Add Section */}
            {suggestedMeals.length > 0 && (
                <div className="p-4 border-b border-grit-border bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-grit-text">クイック追加</span>
                        </div>
                        <select
                            value={selectedMealType}
                            onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                            className="text-xs bg-grit-bg border border-grit-border rounded-lg px-2 py-1 text-grit-text"
                        >
                            {MEAL_TYPES.map(({ type, label }) => (
                                <option key={type} value={type}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {suggestedMeals.map(meal => (
                            <QuickAddButton
                                key={meal.$id}
                                meal={meal}
                                onAdd={onQuickAdd}
                                mealType={selectedMealType}
                            />
                        ))}
                    </div>
                    {onOpenFavorites && (
                        <button
                            onClick={onOpenFavorites}
                            className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-xs text-grit-text-muted hover:text-grit-accent transition-colors"
                        >
                            <Star className="w-3.5 h-3.5" />
                            すべてのお気に入りを表示
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Tab Switcher */}
            <div className="flex border-b border-grit-border">
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                        ${activeTab === 'timeline'
                            ? 'text-grit-accent border-b-2 border-grit-accent bg-grit-accent/5'
                            : 'text-grit-text-muted hover:text-grit-text'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    タイムライン
                </button>
                <button
                    onClick={() => setActiveTab('nutrition')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                        ${activeTab === 'nutrition'
                            ? 'text-grit-accent border-b-2 border-grit-accent bg-grit-accent/5'
                            : 'text-grit-text-muted hover:text-grit-text'
                        }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    栄養分析
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'timeline' ? (
                    /* Timeline View */
                    <div className="space-y-4">
                        {MEAL_TYPES.map(({ type, label, icon }) => {
                            const typeMeals = getMealsForType(type);
                            const isCurrentMealTime = type === currentMealType;

                            return (
                                <div key={type} className="relative">
                                    {/* Meal Type Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`${isCurrentMealTime ? 'text-grit-accent' : 'text-grit-text-muted'}`}>
                                                <MealIcon type={icon} />
                                            </span>
                                            <span className={`font-medium ${isCurrentMealTime ? 'text-grit-accent' : 'text-grit-text'}`}>
                                                {label}
                                            </span>
                                            {isCurrentMealTime && (
                                                <span className="px-2 py-0.5 bg-grit-accent/20 text-grit-accent text-[10px] rounded-full font-medium">
                                                    いま
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onAddMeal(type)}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs text-grit-accent hover:bg-grit-accent/10 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            追加
                                        </button>
                                    </div>

                                    {/* Timeline Line */}
                                    <div className="ml-2.5 pl-4 border-l-2 border-grit-border space-y-2">
                                        {typeMeals.length > 0 ? (
                                            typeMeals.map(meal => (
                                                <MealTimelineCard
                                                    key={meal.$id}
                                                    meal={meal}
                                                    onEdit={() => onEditMeal(meal)}
                                                    onDelete={() => onDeleteMeal(meal.$id)}
                                                />
                                            ))
                                        ) : (
                                            <div className="py-3 text-center">
                                                <p className="text-xs text-grit-text-dim">まだ記録がありません</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Nutrition Analysis View */
                    <div className="space-y-4">
                        {/* Calorie Summary Card */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-grit-accent/10 to-emerald-500/10 border border-grit-accent/20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-grit-accent" />
                                    <span className="font-medium text-grit-text">カロリーバランス</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-grit-text">
                                        {currentPFC.calories.toLocaleString()}
                                        <span className="text-lg text-grit-text-muted ml-1">kcal</span>
                                    </p>
                                    {targetPFC && (
                                        <p className="text-sm text-grit-text-muted">
                                            目標 {targetPFC.calories.toLocaleString()} kcal
                                        </p>
                                    )}
                                </div>
                                {targetPFC && (
                                    <div className={`px-3 py-1.5 rounded-lg ${remainingCalories >= 0
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        <span className="text-sm font-bold">
                                            {remainingCalories >= 0 ? '−' : '+'}{Math.abs(remainingCalories).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PFC Breakdown */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Protein Card */}
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Beef className="w-4 h-4 text-red-400" />
                                    <span className="text-xs font-medium text-red-400">タンパク質</span>
                                </div>
                                <p className="text-xl font-bold text-grit-text">
                                    {Math.round(currentPFC.protein)}
                                    <span className="text-sm text-grit-text-muted ml-0.5">g</span>
                                </p>
                                {targetPFC && (
                                    <p className="text-[10px] text-grit-text-dim mt-1">
                                        / {targetPFC.protein}g
                                    </p>
                                )}
                            </div>

                            {/* Fat Card */}
                            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Droplets className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-medium text-yellow-400">脂質</span>
                                </div>
                                <p className="text-xl font-bold text-grit-text">
                                    {Math.round(currentPFC.fat)}
                                    <span className="text-sm text-grit-text-muted ml-0.5">g</span>
                                </p>
                                {targetPFC && (
                                    <p className="text-[10px] text-grit-text-dim mt-1">
                                        / {targetPFC.fat}g
                                    </p>
                                )}
                            </div>

                            {/* Carbs Card */}
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Wheat className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-medium text-blue-400">炭水化物</span>
                                </div>
                                <p className="text-xl font-bold text-grit-text">
                                    {Math.round(currentPFC.carbs)}
                                    <span className="text-sm text-grit-text-muted ml-0.5">g</span>
                                </p>
                                {targetPFC && (
                                    <p className="text-[10px] text-grit-text-dim mt-1">
                                        / {targetPFC.carbs}g
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Meal Breakdown by Type */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-grit-text">食事ごとのカロリー</h4>
                            {MEAL_TYPES.map(({ type, label }) => {
                                const typeMeals = getMealsForType(type);
                                const typeCalories = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
                                const typeProgress = targetPFC ? (typeCalories / targetPFC.calories) * 100 : 0;

                                return (
                                    <div key={type} className="flex items-center gap-3">
                                        <span className="text-xs text-grit-text-muted w-10">{label}</span>
                                        <div className="flex-1 h-2 bg-grit-bg rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-grit-accent rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(typeProgress * 4, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-grit-text w-16 text-right">
                                            {typeCalories.toLocaleString()} kcal
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <div className="p-4 pt-0">
                <button
                    onClick={() => onOpenManualEntry?.(currentMealType)}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-grit-accent to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    食事を記録する
                </button>
            </div>
        </div>
    );
};
