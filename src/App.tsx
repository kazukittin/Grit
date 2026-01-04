import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { WeeklyChart } from './components/WeeklyChart';
import { DailyHabits } from './components/DailyHabits';
import { RecordModal } from './components/RecordModal';
import { FloatingButton } from './components/FloatingButton';
import {
  loadData,
  addWeightLog,
  toggleHabit,
  getLevel,
  getWeeklyLogs,
  getLatestLog,
  getPreviousLog,
} from './utils/storage';
import type { AppData, WeightLog } from './types';

function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestLog, setLatestLog] = useState<WeightLog | null>(null);
  const [previousLog, setPreviousLog] = useState<WeightLog | null>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<WeightLog[]>([]);
  const [level, setLevel] = useState(1);

  const refreshData = useCallback(() => {
    const newData = loadData();
    setData(newData);
    setLatestLog(getLatestLog());
    setPreviousLog(getPreviousLog());
    setWeeklyLogs(getWeeklyLogs());
    setLevel(getLevel());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleToggleHabit = useCallback(
    (id: string) => {
      toggleHabit(id);
      refreshData();
    },
    [refreshData]
  );

  const handleSaveRecord = useCallback(
    (record: { date: string; weight: number; bodyFat?: number }) => {
      addWeightLog(record);
      refreshData();
    },
    [refreshData]
  );

  const weightDiff =
    latestLog && previousLog ? latestLog.weight - previousLog.weight : null;

  return (
    <div className="min-h-screen bg-grit-bg pb-24">
      <Header level={level} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <SummaryCard
          latestWeight={latestLog?.weight ?? null}
          weightDiff={weightDiff}
        />

        <WeeklyChart logs={weeklyLogs} />

        <DailyHabits
          habits={data.dailyHabits.habits}
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

export default App;
