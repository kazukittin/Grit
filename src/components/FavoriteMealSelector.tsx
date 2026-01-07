import { useState, useEffect } from 'react';
import { Star, Plus, Trash2, X, Package, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import type { FavoriteMeal, MealPreset, MealPresetItem, MealType } from '../types';
import { MEAL_TYPES } from '../types';

interface FavoriteMealSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    favoriteMeals: FavoriteMeal[];
    mealPresets: MealPreset[];
    onSelectFavorite: (meal: FavoriteMeal, mealType: MealType) => void;
    onSelectPreset: (preset: MealPreset, mealType: MealType) => void;
    onDeleteFavorite: (mealId: string) => void;
    onDeletePreset: (presetId: string) => void;
    initialMealType?: MealType;
}

export const FavoriteMealSelector = ({
    isOpen,
    onClose,
    favoriteMeals,
    mealPresets,
    onSelectFavorite,
    onSelectPreset,
    onDeleteFavorite,
    onDeletePreset,
    initialMealType = 'breakfast',
}: FavoriteMealSelectorProps) => {
    const [mealType, setMealType] = useState<MealType>(initialMealType);
    const [activeTab, setActiveTab] = useState<'favorites' | 'presets'>('favorites');
    const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setMealType(initialMealType);
        }
    }, [isOpen, initialMealType]);

    const handleSelectFavorite = (meal: FavoriteMeal) => {
        onSelectFavorite(meal, mealType);
        onClose();
    };

    const handleSelectPreset = (preset: MealPreset) => {
        onSelectPreset(preset, mealType);
        onClose();
    };

    const parsePresetItems = (itemsJson: string): MealPresetItem[] => {
        try {
            return JSON.parse(itemsJson) as MealPresetItem[];
        } catch {
            return [];
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-grit-surface dark:glass-card rounded-t-3xl sm:rounded-2xl border border-grit-border dark:border-grit-glass-border shadow-xl animate-slide-up backdrop-blur-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="p-6 pb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-lg font-semibold text-grit-text">
                                よく食べるメニュー
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-grit-surface-hover flex items-center justify-center hover:bg-grit-border transition-colors"
                        >
                            <X className="w-5 h-5 text-grit-text-muted" />
                        </button>
                    </div>

                    {/* Meal Type Selector */}
                    <div className="mb-4">
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

                    {/* Tab Selector */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === 'favorites'
                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                    : 'bg-grit-bg text-grit-text-muted border border-grit-border hover:border-grit-accent'
                                }`}
                        >
                            <Star className="w-4 h-4 inline mr-1" />
                            単品 ({favoriteMeals.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('presets')}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === 'presets'
                                    ? 'bg-purple-500/20 text-purple-500 border border-purple-500/50'
                                    : 'bg-grit-bg text-grit-text-muted border border-grit-border hover:border-grit-accent'
                                }`}
                        >
                            <Package className="w-4 h-4 inline mr-1" />
                            セット ({mealPresets.length})
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {activeTab === 'favorites' && (
                        <div className="space-y-2">
                            {favoriteMeals.length === 0 ? (
                                <div className="text-center py-8 text-grit-text-muted">
                                    <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">お気に入りメニューがありません</p>
                                    <p className="text-xs mt-1">食事記録時に⭐ボタンで追加できます</p>
                                </div>
                            ) : (
                                favoriteMeals.map((meal) => (
                                    <div
                                        key={meal.$id}
                                        className="flex items-center gap-3 p-3 bg-grit-bg rounded-xl border border-grit-border hover:border-grit-accent transition-colors group"
                                    >
                                        <button
                                            onClick={() => handleSelectFavorite(meal)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="font-medium text-grit-text">{meal.name}</div>
                                            <div className="text-sm text-grit-text-muted flex items-center gap-2">
                                                <Flame className="w-3 h-3" />
                                                {meal.calories} kcal
                                                {meal.protein && <span>• P: {meal.protein}g</span>}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => onDeleteFavorite(meal.$id)}
                                            className="p-2 text-grit-negative/50 hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'presets' && (
                        <div className="space-y-2">
                            {mealPresets.length === 0 ? (
                                <div className="text-center py-8 text-grit-text-muted">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">セットメニューがありません</p>
                                    <p className="text-xs mt-1">設定画面から作成できます</p>
                                </div>
                            ) : (
                                mealPresets.map((preset) => {
                                    const items = parsePresetItems(preset.items);
                                    const isExpanded = expandedPreset === preset.$id;

                                    return (
                                        <div
                                            key={preset.$id}
                                            className="bg-grit-bg rounded-xl border border-grit-border overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3 p-3 group">
                                                <button
                                                    onClick={() => setExpandedPreset(isExpanded ? null : preset.$id)}
                                                    className="p-1 text-grit-text-muted hover:text-grit-text"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleSelectPreset(preset)}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="font-medium text-grit-text">{preset.name}</div>
                                                    <div className="text-sm text-grit-text-muted flex items-center gap-2">
                                                        <Package className="w-3 h-3" />
                                                        {items.length}品
                                                        <Flame className="w-3 h-3 ml-2" />
                                                        計 {preset.total_calories} kcal
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => onDeletePreset(preset.$id)}
                                                    className="p-2 text-grit-negative/50 hover:text-grit-negative hover:bg-grit-negative/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {isExpanded && items.length > 0 && (
                                                <div className="px-4 pb-3 pt-1 border-t border-grit-border/50">
                                                    <div className="space-y-1">
                                                        {items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-sm">
                                                                <span className="text-grit-text-muted">{item.name}</span>
                                                                <span className="text-grit-text-dim">{item.calories} kcal</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-grit-border">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-grit-surface-hover text-grit-text-muted font-medium rounded-xl hover:bg-grit-border transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        新しいメニューを入力
                    </button>
                </div>
            </div>
        </div>
    );
};
