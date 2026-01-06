import { useState, useEffect } from 'react';
import { X, Utensils, Flame } from 'lucide-react';
import type { MealLog, MealType } from '../types';
import { MEAL_TYPES } from '../types';

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (foodName: string, calories: number, mealType: MealType) => Promise<void>;
    onUpdate?: (logId: string, foodName: string, calories: number) => Promise<void>;
    initialMealType?: MealType;
    editingMeal?: MealLog | null;
}

export const MealModal = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    initialMealType = 'breakfast',
    editingMeal
}: MealModalProps) => {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [mealType, setMealType] = useState<MealType>(initialMealType);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingMeal) {
                setFoodName(editingMeal.food_name);
                setCalories(editingMeal.calories > 0 ? editingMeal.calories.toString() : '');
                setMealType(editingMeal.meal_type);
            } else {
                setFoodName('');
                setCalories('');
                setMealType(initialMealType);
            }
        }
    }, [isOpen, editingMeal, initialMealType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!foodName.trim()) return;

        setIsSaving(true);
        const caloriesNum = parseInt(calories) || 0;

        if (editingMeal && onUpdate) {
            await onUpdate(editingMeal.$id, foodName.trim(), caloriesNum);
        } else {
            await onSave(foodName.trim(), caloriesNum, mealType);
        }

        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const getMealLabel = (type: MealType) => MEAL_TYPES.find(m => m.type === type)?.label || '';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-grit-surface dark:glass-card rounded-t-3xl sm:rounded-2xl border border-grit-border dark:border-grit-glass-border shadow-xl animate-slide-up backdrop-blur-2xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-grit-accent" />
                            <h2 className="text-lg font-semibold text-grit-text">
                                {editingMeal ? '食事を編集' : '食事を記録'}
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
                        {/* Meal Type Selector (only for new entries) */}
                        {!editingMeal && (
                            <div>
                                <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                    食事タイプ
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {MEAL_TYPES.map(({ type, label }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setMealType(type)}
                                            className={`px-3 py-2 text-sm rounded-xl border transition-colors ${mealType === type
                                                ? 'bg-grit-accent text-white border-grit-accent'
                                                : 'bg-grit-bg text-grit-text-muted border-grit-border hover:border-grit-accent'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Editing indicator */}
                        {editingMeal && (
                            <div className="px-3 py-2 bg-grit-accent/10 rounded-lg text-sm text-grit-accent">
                                {getMealLabel(editingMeal.meal_type)}の記録を編集中
                            </div>
                        )}

                        {/* Food Name */}
                        <div>
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                メニュー名
                            </label>
                            <input
                                type="text"
                                value={foodName}
                                onChange={(e) => setFoodName(e.target.value)}
                                placeholder="例: サラダチキン、玄米ごはん"
                                className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Calories */}
                        <div>
                            <label className="block text-sm font-medium text-grit-text-muted mb-2">
                                <Flame className="w-4 h-4 inline mr-1" />
                                カロリー（任意）
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    max="10000"
                                    className="w-full px-4 py-3 bg-grit-bg border border-grit-border rounded-xl text-grit-text placeholder:text-grit-text-dim focus:outline-none focus:border-grit-accent transition-colors pr-16"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grit-text-muted">
                                    kcal
                                </span>
                            </div>
                            <p className="text-xs text-grit-text-dim mt-1">
                                わからない場合は空欄でOKです
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!foodName.trim() || isSaving}
                            className="w-full py-4 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white font-semibold rounded-xl shadow-lg shadow-grit-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isSaving ? '保存中...' : editingMeal ? '更新する' : '記録する'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
