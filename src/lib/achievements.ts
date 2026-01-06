import type { Achievement, AchievementStats } from '../types';

// Define all available achievements
export const ACHIEVEMENTS: Achievement[] = [
    // ========== Streak Achievements ==========
    {
        id: 'first_record',
        title: 'はじめの一歩',
        description: '初めて体重を記録しました',
        icon: '🎯',
        category: 'streak',
        condition: (stats) => stats.totalDaysRecorded >= 1,
    },
    {
        id: 'week_streak',
        title: '1週間継続',
        description: '7日連続で記録しました',
        icon: '🔥',
        category: 'streak',
        condition: (stats) => stats.currentStreak >= 7,
    },
    {
        id: 'two_week_streak',
        title: '2週間継続',
        description: '14日連続で記録しました',
        icon: '⚡',
        category: 'streak',
        condition: (stats) => stats.currentStreak >= 14,
    },
    {
        id: 'month_streak',
        title: '1ヶ月継続',
        description: '30日連続で記録しました',
        icon: '🌟',
        category: 'streak',
        condition: (stats) => stats.currentStreak >= 30,
    },
    {
        id: 'three_month_streak',
        title: '3ヶ月継続',
        description: '90日連続で記録しました',
        icon: '👑',
        category: 'streak',
        condition: (stats) => stats.currentStreak >= 90,
    },
    {
        id: 'total_10_days',
        title: '記録の習慣化',
        description: '合計10日間記録しました',
        icon: '📝',
        category: 'streak',
        condition: (stats) => stats.totalDaysRecorded >= 10,
    },
    {
        id: 'total_30_days',
        title: '継続は力なり',
        description: '合計30日間記録しました',
        icon: '💪',
        category: 'streak',
        condition: (stats) => stats.totalDaysRecorded >= 30,
    },
    {
        id: 'total_100_days',
        title: '100日達成',
        description: '合計100日間記録しました',
        icon: '🏆',
        category: 'streak',
        condition: (stats) => stats.totalDaysRecorded >= 100,
    },

    // ========== Weight Achievements ==========
    {
        id: 'first_kg_lost',
        title: '最初の1kg',
        description: '1kg減量しました',
        icon: '📉',
        category: 'weight',
        condition: (stats) => stats.totalWeightLoss >= 1,
    },
    {
        id: 'three_kg_lost',
        title: '3kg達成',
        description: '3kg減量しました',
        icon: '🎉',
        category: 'weight',
        condition: (stats) => stats.totalWeightLoss >= 3,
    },
    {
        id: 'five_kg_lost',
        title: '5kg達成',
        description: '5kg減量しました',
        icon: '🌈',
        category: 'weight',
        condition: (stats) => stats.totalWeightLoss >= 5,
    },
    {
        id: 'ten_kg_lost',
        title: '10kg達成',
        description: '10kg減量しました',
        icon: '🚀',
        category: 'weight',
        condition: (stats) => stats.totalWeightLoss >= 10,
    },
    {
        id: 'goal_reached',
        title: '目標達成！',
        description: '目標体重に到達しました',
        icon: '🎊',
        category: 'weight',
        condition: (stats) =>
            stats.targetWeight !== null &&
            stats.currentWeight !== null &&
            stats.currentWeight <= stats.targetWeight,
    },
    {
        id: 'halfway_to_goal',
        title: '目標の半分',
        description: '目標体重まで半分達成しました',
        icon: '🎯',
        category: 'weight',
        condition: (stats) => {
            if (!stats.targetWeight || !stats.currentWeight || !stats.startWeight) return false;
            const totalToLose = stats.startWeight - stats.targetWeight;
            const actualLost = stats.startWeight - stats.currentWeight;
            return totalToLose > 0 && actualLost >= totalToLose / 2;
        },
    },

    // ========== Habit Achievements ==========
    {
        id: 'habit_10',
        title: '習慣の芽生え',
        description: '合計10個の習慣を達成しました',
        icon: '🌱',
        category: 'habit',
        condition: (stats) => stats.totalHabitsCompleted >= 10,
    },
    {
        id: 'habit_50',
        title: '習慣マスター',
        description: '合計50個の習慣を達成しました',
        icon: '🌿',
        category: 'habit',
        condition: (stats) => stats.totalHabitsCompleted >= 50,
    },
    {
        id: 'habit_100',
        title: '習慣の達人',
        description: '合計100個の習慣を達成しました',
        icon: '🌳',
        category: 'habit',
        condition: (stats) => stats.totalHabitsCompleted >= 100,
    },

    // ========== Workout Achievements ==========
    {
        id: 'first_workout',
        title: 'ワークアウト開始',
        description: '初めてのワークアウトを記録しました',
        icon: '🏃',
        category: 'workout',
        condition: (stats) => stats.totalWorkouts >= 1,
    },
    {
        id: 'workout_10',
        title: 'トレーニング習慣',
        description: '10回のワークアウトを達成しました',
        icon: '🏋️',
        category: 'workout',
        condition: (stats) => stats.totalWorkouts >= 10,
    },
    {
        id: 'workout_50',
        title: 'フィットネス愛好家',
        description: '50回のワークアウトを達成しました',
        icon: '💎',
        category: 'workout',
        condition: (stats) => stats.totalWorkouts >= 50,
    },

    // ========== Meal Achievements ==========
    {
        id: 'meal_tracking_start',
        title: '食事記録スタート',
        description: '初めて食事を記録しました',
        icon: '🍽️',
        category: 'meal',
        condition: (stats) => stats.totalMeals >= 1,
    },
    {
        id: 'meal_50',
        title: '食事管理者',
        description: '50食分を記録しました',
        icon: '📊',
        category: 'meal',
        condition: (stats) => stats.totalMeals >= 50,
    },
    {
        id: 'meal_200',
        title: '栄養マスター',
        description: '200食分を記録しました',
        icon: '🥗',
        category: 'meal',
        condition: (stats) => stats.totalMeals >= 200,
    },
];

// Check which achievements are unlocked based on stats
export function getUnlockedAchievements(stats: AchievementStats): Achievement[] {
    return ACHIEVEMENTS.filter((achievement) => achievement.condition(stats));
}

// Get newly unlocked achievements compared to previous state
export function getNewlyUnlockedAchievements(
    stats: AchievementStats,
    previouslyUnlockedIds: string[]
): Achievement[] {
    const currentlyUnlocked = getUnlockedAchievements(stats);
    return currentlyUnlocked.filter((a) => !previouslyUnlockedIds.includes(a.id));
}

// Calculate achievement progress for display
export function getAchievementProgress(
    achievement: Achievement,
    stats: AchievementStats
): { current: number; target: number; percentage: number } {
    switch (achievement.id) {
        case 'first_record':
            return { current: stats.totalDaysRecorded, target: 1, percentage: Math.min(100, stats.totalDaysRecorded * 100) };
        case 'week_streak':
            return { current: stats.currentStreak, target: 7, percentage: Math.min(100, (stats.currentStreak / 7) * 100) };
        case 'two_week_streak':
            return { current: stats.currentStreak, target: 14, percentage: Math.min(100, (stats.currentStreak / 14) * 100) };
        case 'month_streak':
            return { current: stats.currentStreak, target: 30, percentage: Math.min(100, (stats.currentStreak / 30) * 100) };
        case 'three_month_streak':
            return { current: stats.currentStreak, target: 90, percentage: Math.min(100, (stats.currentStreak / 90) * 100) };
        case 'total_10_days':
            return { current: stats.totalDaysRecorded, target: 10, percentage: Math.min(100, (stats.totalDaysRecorded / 10) * 100) };
        case 'total_30_days':
            return { current: stats.totalDaysRecorded, target: 30, percentage: Math.min(100, (stats.totalDaysRecorded / 30) * 100) };
        case 'total_100_days':
            return { current: stats.totalDaysRecorded, target: 100, percentage: Math.min(100, (stats.totalDaysRecorded / 100) * 100) };
        case 'first_kg_lost':
            return { current: stats.totalWeightLoss, target: 1, percentage: Math.min(100, stats.totalWeightLoss * 100) };
        case 'three_kg_lost':
            return { current: stats.totalWeightLoss, target: 3, percentage: Math.min(100, (stats.totalWeightLoss / 3) * 100) };
        case 'five_kg_lost':
            return { current: stats.totalWeightLoss, target: 5, percentage: Math.min(100, (stats.totalWeightLoss / 5) * 100) };
        case 'ten_kg_lost':
            return { current: stats.totalWeightLoss, target: 10, percentage: Math.min(100, (stats.totalWeightLoss / 10) * 100) };
        case 'habit_10':
            return { current: stats.totalHabitsCompleted, target: 10, percentage: Math.min(100, (stats.totalHabitsCompleted / 10) * 100) };
        case 'habit_50':
            return { current: stats.totalHabitsCompleted, target: 50, percentage: Math.min(100, (stats.totalHabitsCompleted / 50) * 100) };
        case 'habit_100':
            return { current: stats.totalHabitsCompleted, target: 100, percentage: Math.min(100, (stats.totalHabitsCompleted / 100) * 100) };
        case 'first_workout':
            return { current: stats.totalWorkouts, target: 1, percentage: Math.min(100, stats.totalWorkouts * 100) };
        case 'workout_10':
            return { current: stats.totalWorkouts, target: 10, percentage: Math.min(100, (stats.totalWorkouts / 10) * 100) };
        case 'workout_50':
            return { current: stats.totalWorkouts, target: 50, percentage: Math.min(100, (stats.totalWorkouts / 50) * 100) };
        case 'meal_tracking_start':
            return { current: stats.totalMeals, target: 1, percentage: Math.min(100, stats.totalMeals * 100) };
        case 'meal_50':
            return { current: stats.totalMeals, target: 50, percentage: Math.min(100, (stats.totalMeals / 50) * 100) };
        case 'meal_200':
            return { current: stats.totalMeals, target: 200, percentage: Math.min(100, (stats.totalMeals / 200) * 100) };
        default:
            return { current: 0, target: 1, percentage: 0 };
    }
}
