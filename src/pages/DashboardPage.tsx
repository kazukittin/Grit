import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { DailyHabits } from '../components/DailyHabits';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { RecordModal } from '../components/RecordModal';
import { FloatingButton } from '../components/FloatingButton';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getOrCreateProfile,
    getWeightLogs,
    getWeightLogsInRange,
    addWeightLog,
    getHabits,
    getHabitLogsForDate,
    toggleHabitLog,
    getRecordedDaysCount,
    getHeatmapData,
    initializeDefaultHabits,
} from '../services/api';
import type { Profile, WeightLog, DailyHabitStatus, HeatmapDay } from '../types';

export function DashboardPage() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [latestLog, setLatestLog] = useState<WeightLog | null>(null);
    const [previousLog, setPreviousLog] = useState<WeightLog | null>(null);
    const [weeklyLogs, setWeeklyLogs] = useState<WeightLog[]>([]);
    const [dailyHabits, setDailyHabits] = useState<DailyHabitStatus[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
    const [level, setLevel] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const loadData = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        try {
            // Load or create profile
            const profileData = await getOrCreateProfile(user.$id);
            setProfile(profileData);

            // Load weight logs
            const logs = await getWeightLogs(user.$id, 2);
            setLatestLog(logs[0] || null);
            setPreviousLog(logs[1] || null);

            // Load weekly logs
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 6);
            const weeklyData = await getWeightLogsInRange(
                user.$id,
                weekAgo.toISOString().split('T')[0],
                today
            );
            setWeeklyLogs(weeklyData);

            // Load habits and today's logs
            let habits = await getHabits(user.$id);

            // Initialize default habits if none exist
            if (habits.length === 0) {
                await initializeDefaultHabits(user.$id);
                habits = await getHabits(user.$id);
            }

            const habitLogs = await getHabitLogsForDate(user.$id, today);
            const habitLogsMap = new Map(habitLogs.map(l => [l.habit_id, l]));

            const dailyHabitStatuses: DailyHabitStatus[] = habits.map(habit => ({
                habit,
                completed: habitLogsMap.get(habit.$id)?.completed || false,
                logId: habitLogsMap.get(habit.$id)?.$id,
            }));
            setDailyHabits(dailyHabitStatuses);

            // Load level
            const recordedDays = await getRecordedDaysCount(user.$id);
            setLevel(Math.floor(recordedDays / 5) + 1);

            // Load heatmap data
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const heatmap = await getHeatmapData(
                user.$id,
                threeMonthsAgo.toISOString().split('T')[0],
                today
            );
            setHeatmapData(heatmap);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, today]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleHabit = useCallback(async (habitId: string, completed: boolean) => {
        if (!user) return;

        // Optimistic update
        setDailyHabits(prev =>
            prev.map(h =>
                h.habit.$id === habitId ? { ...h, completed } : h
            )
        );

        const success = await toggleHabitLog(user.$id, habitId, today, completed);
        if (!success) {
            // Revert on failure
            setDailyHabits(prev =>
                prev.map(h =>
                    h.habit.$id === habitId ? { ...h, completed: !completed } : h
                )
            );
        }
    }, [user, today]);

    const handleSaveRecord = useCallback(async (record: { date: string; weight: number; bodyFat?: number }) => {
        if (!user) return;

        const newLog = await addWeightLog(user.$id, record.weight, record.bodyFat, record.date);
        if (newLog) {
            await loadData();
        }
        setIsModalOpen(false);
    }, [user, loadData]);

    const weightDiff =
        latestLog && previousLog ? latestLog.weight - previousLog.weight : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-grit-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-grit-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grit-bg pb-24">
            <Header level={level} />

            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
                <SummaryCard
                    latestWeight={latestLog?.weight ?? null}
                    weightDiff={weightDiff}
                    targetWeight={profile?.target_weight ?? null}
                />

                <WeeklyChart
                    logs={weeklyLogs}
                    targetWeight={profile?.target_weight}
                />

                <ContributionHeatmap data={heatmapData} months={3} />

                <DailyHabits
                    habits={dailyHabits}
                    onToggle={handleToggleHabit}
                />
            </main>

            <FloatingButton onClick={() => setIsModalOpen(true)} />

            <RecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRecord}
            />
        </div>
    );
}
