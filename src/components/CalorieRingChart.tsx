import type { PFCSummary } from '../types';

interface CalorieRingChartProps {
    current: PFCSummary;
    target: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } | null;
}

export const CalorieRingChart = ({ current, target }: CalorieRingChartProps) => {
    // Default targets if not set
    const targetCalories = target?.calories || 2000;
    const targetProtein = target?.protein || 120;
    const targetFat = target?.fat || 60;
    const targetCarbs = target?.carbs || 200;

    // Calculate percentages (cap at 100% for display)
    const caloriePercent = Math.min((current.calories / targetCalories) * 100, 100);
    const proteinPercent = Math.min((current.protein / targetProtein) * 100, 100);
    const fatPercent = Math.min((current.fat / targetFat) * 100, 100);
    const carbsPercent = Math.min((current.carbs / targetCarbs) * 100, 100);

    // SVG circle parameters
    const size = 140;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke-dashoffset for each ring
    const calorieOffset = circumference - (caloriePercent / 100) * circumference;

    // Mini ring parameters
    const miniSize = 48;
    const miniStrokeWidth = 5;
    const miniRadius = (miniSize - miniStrokeWidth) / 2;
    const miniCircumference = 2 * Math.PI * miniRadius;

    const getMiniOffset = (percent: number) => miniCircumference - (percent / 100) * miniCircumference;

    // Status color for calorie ring
    const getCalorieColor = () => {
        const actualPercent = (current.calories / targetCalories) * 100;
        if (actualPercent >= 100) return '#ef4444'; // Over limit - red
        if (actualPercent >= 80) return '#f97316';  // Close to limit - orange
        return '#22c55e'; // Good - green
    };

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center justify-between">
                {/* Main Calorie Ring */}
                <div className="flex flex-col items-center">
                    <div className="relative" style={{ width: size, height: size }}>
                        {/* Background circle */}
                        <svg
                            className="absolute inset-0 transform -rotate-90"
                            width={size}
                            height={size}
                        >
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-grit-border"
                            />
                            {/* Progress circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={getCalorieColor()}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={calorieOffset}
                                className="transition-all duration-700 ease-out"
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-grit-text">
                                {current.calories.toLocaleString()}
                            </span>
                            <span className="text-xs text-grit-text-muted">
                                / {targetCalories.toLocaleString()} kcal
                            </span>
                        </div>
                    </div>
                    <span className="mt-2 text-sm font-medium text-grit-text-muted">
                        今日のカロリー
                    </span>
                </div>

                {/* PFC Mini Rings */}
                <div className="flex flex-col gap-3">
                    {/* Protein */}
                    <div className="flex items-center gap-3">
                        <div className="relative" style={{ width: miniSize, height: miniSize }}>
                            <svg
                                className="absolute inset-0 transform -rotate-90"
                                width={miniSize}
                                height={miniSize}
                            >
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={miniStrokeWidth}
                                    className="text-grit-border"
                                />
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="#f87171"
                                    strokeWidth={miniStrokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={miniCircumference}
                                    strokeDashoffset={getMiniOffset(proteinPercent)}
                                    className="transition-all duration-700 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-grit-text">P</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-grit-text">{current.protein.toFixed(0)}g</span>
                            <span className="text-grit-text-dim"> / {targetProtein}g</span>
                        </div>
                    </div>

                    {/* Fat */}
                    <div className="flex items-center gap-3">
                        <div className="relative" style={{ width: miniSize, height: miniSize }}>
                            <svg
                                className="absolute inset-0 transform -rotate-90"
                                width={miniSize}
                                height={miniSize}
                            >
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={miniStrokeWidth}
                                    className="text-grit-border"
                                />
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="#facc15"
                                    strokeWidth={miniStrokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={miniCircumference}
                                    strokeDashoffset={getMiniOffset(fatPercent)}
                                    className="transition-all duration-700 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-grit-text">F</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-grit-text">{current.fat.toFixed(0)}g</span>
                            <span className="text-grit-text-dim"> / {targetFat}g</span>
                        </div>
                    </div>

                    {/* Carbs */}
                    <div className="flex items-center gap-3">
                        <div className="relative" style={{ width: miniSize, height: miniSize }}>
                            <svg
                                className="absolute inset-0 transform -rotate-90"
                                width={miniSize}
                                height={miniSize}
                            >
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={miniStrokeWidth}
                                    className="text-grit-border"
                                />
                                <circle
                                    cx={miniSize / 2}
                                    cy={miniSize / 2}
                                    r={miniRadius}
                                    fill="none"
                                    stroke="#60a5fa"
                                    strokeWidth={miniStrokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={miniCircumference}
                                    strokeDashoffset={getMiniOffset(carbsPercent)}
                                    className="transition-all duration-700 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-grit-text">C</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-grit-text">{current.carbs.toFixed(0)}g</span>
                            <span className="text-grit-text-dim"> / {targetCarbs}g</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remaining calories message */}
            {target && (
                <div className="mt-4 text-center">
                    {current.calories < targetCalories ? (
                        <p className="text-sm text-grit-text-muted">
                            あと <span className="font-bold text-grit-positive">{(targetCalories - current.calories).toLocaleString()} kcal</span> 摂取できます
                        </p>
                    ) : (
                        <p className="text-sm text-grit-negative">
                            {(current.calories - targetCalories).toLocaleString()} kcal オーバーしています
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
