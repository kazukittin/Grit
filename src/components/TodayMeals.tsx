import { useState } from 'react';
import { Utensils, Plus, Sunrise, Sun, Sunset, Cookie, Flame, Edit3, Trash2 } from 'lucide-react';
import type { MealLog, MealType } from '../types';
import { MEAL_TYPES } from '../types';

interface TodayMealsProps {
    meals: MealLog[];
    onAddMeal: (mealType: MealType) => void;
    onEditMeal: (meal: MealLog) => void;
    onDeleteMeal: (mealId: string) => Promise<void>;
}

const MealIcon = ({ type }: { type: 'sunrise' | 'sun' | 'sunset' | 'cookie' }) => {
    switch (type) {
        case 'sunrise':
            return <Sunrise className="w-5 h-5" />;
        case 'sun':
            return <Sun className="w-5 h-5" />;
        case 'sunset':
            return <Sunset className="w-5 h-5" />;
        case 'cookie':
            return <Cookie className="w-5 h-5" />;
    }
};

export const TodayMeals = ({ meals, onAddMeal, onEditMeal, onDeleteMeal }: TodayMealsProps) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Calculate total calories
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

    // Group meals by type
    const getMealsForType = (type: MealType) => meals.filter(m => m.meal_type === type);

    const handleDelete = async (mealId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('この食事を削除しますか？')) return;

        setDeletingId(mealId);
        await onDeleteMeal(mealId);
        setDeletingId(null);
    };

    return (
        <div className="bg-grit-surface dark:glass-card rounded-2xl p-6 border border-grit-border animate-fade-in backdrop-blur-xl">
            {/* Header with total calories */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-grit-accent" />
                    <h2 className="text-lg font-semibold text-grit-text">今日の食事</h2>
                </div>
                <div className="flex items-center gap-2 bg-grit-accent/10 px-3 py-1.5 rounded-full">
                    <Flame className="w-4 h-4 text-grit-accent" />
                    <span className="text-sm font-bold text-grit-accent">
                        {totalCalories.toLocaleString()} kcal
                    </span>
                </div>
            </div>

            {/* Meal sections */}
            <div className="space-y-4">
                {MEAL_TYPES.map(({ type, label, icon }) => {
                    const typeMeals = getMealsForType(type);
                    const typeCalories = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

                    return (
                        <div
                            key={type}
                            className="rounded-xl border border-grit-border bg-grit-bg p-4"
                        >
                            {/* Section header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-grit-accent">
                                        <MealIcon type={icon} />
                                    </span>
                                    <span className="font-medium text-grit-text">{label}</span>
                                    {typeCalories > 0 && (
                                        <span className="text-xs text-grit-text-muted">
                                            ({typeCalories} kcal)
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

                            {/* Meal items */}
                            {typeMeals.length > 0 ? (
                                <div className="space-y-2">
                                    {typeMeals.map(meal => (
                                        <div
                                            key={meal.$id}
                                            onClick={() => onEditMeal(meal)}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-grit-surface hover:bg-grit-surface-hover transition-colors cursor-pointer group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm text-grit-text truncate block">
                                                    {meal.food_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {meal.calories > 0 && (
                                                    <span className="text-xs text-grit-text-muted whitespace-nowrap">
                                                        {meal.calories} kcal
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditMeal(meal);
                                                        }}
                                                        className="p-1 text-grit-text-muted hover:text-grit-accent rounded transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(meal.$id, e)}
                                                        disabled={deletingId === meal.$id}
                                                        className="p-1 text-grit-text-muted hover:text-grit-negative rounded transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-grit-text-dim text-center py-2">
                                    まだ記録がありません
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
