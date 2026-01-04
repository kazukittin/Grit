import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { HeatmapDay } from '../types';

interface ContributionHeatmapProps {
    data: HeatmapDay[];
    months?: number;
}

const LEVEL_COLORS = [
    'bg-grit-border',           // Level 0 - no activity
    'bg-grit-accent/20',        // Level 1
    'bg-grit-accent/40',        // Level 2
    'bg-grit-accent/70',        // Level 3
    'bg-grit-accent',           // Level 4 - max activity
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function ContributionHeatmap({ data, months = 3 }: ContributionHeatmapProps) {
    const { weeks, monthLabels } = useMemo(() => {
        // Group data by weeks
        const weeksMap: HeatmapDay[][] = [];
        let currentWeek: HeatmapDay[] = [];

        // Get today's data
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

        // Create a map for quick lookup
        const dataMap = new Map(data.map(d => [d.date, d]));

        // Fill in all dates
        const current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            const dayData = dataMap.get(dateStr) || {
                date: dateStr,
                level: 0,
                weightLogged: false,
                habitsCompleted: 0,
                habitsTotal: 0,
            };

            currentWeek.push(dayData);

            if (current.getDay() === 6) {
                weeksMap.push(currentWeek);
                currentWeek = [];
            }

            current.setDate(current.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeksMap.push(currentWeek);
        }

        // Generate month labels
        const labels: { text: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        weeksMap.forEach((week, weekIndex) => {
            const firstDay = new Date(week[0].date);
            const month = firstDay.getMonth();

            if (month !== lastMonth && firstDay.getDate() <= 7) {
                labels.push({
                    text: (month + 1) + '月',
                    weekIndex,
                });
                lastMonth = month;
            }
        });

        return { weeks: weeksMap, monthLabels: labels };
    }, [data, months]);

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">継続記録</h2>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
                {/* Month labels */}
                <div className="flex mb-1 ml-8">
                    {monthLabels.map((label, i) => (
                        <div
                            key={i}
                            className="text-xs text-grit-text-muted"
                            style={{ marginLeft: i === 0 ? `${label.weekIndex * 14}px` : `${(label.weekIndex - monthLabels[i - 1].weekIndex - 1) * 14}px` }}
                        >
                            {label.text}
                        </div>
                    ))}
                </div>

                <div className="flex">
                    {/* Weekday labels */}
                    <div className="flex flex-col justify-around text-xs text-grit-text-dim mr-2 h-[98px]">
                        {WEEKDAYS.filter((_, i) => i % 2 === 1).map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[3px]">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                {week.map((day) => {
                                    const isToday = day.date === new Date().toISOString().split('T')[0];
                                    const isFuture = new Date(day.date) > new Date();

                                    return (
                                        <div
                                            key={day.date}
                                            className={`w-[11px] h-[11px] rounded-sm transition-colors ${isFuture
                                                    ? 'bg-transparent'
                                                    : LEVEL_COLORS[day.level]
                                                } ${isToday ? 'ring-1 ring-grit-text-muted' : ''}`}
                                            title={`${day.date}: ${day.weightLogged ? '体重記録済み' : ''} ${day.habitsCompleted}/${day.habitsTotal} タスク完了`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-grit-text-dim">
                    <span>少ない</span>
                    <div className="flex gap-[2px]">
                        {LEVEL_COLORS.map((color, i) => (
                            <div key={i} className={`w-[10px] h-[10px] rounded-sm ${color}`} />
                        ))}
                    </div>
                    <span>多い</span>
                </div>
            </div>
        </div>
    );
}
