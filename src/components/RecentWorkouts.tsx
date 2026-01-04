import { Clock, Dumbbell, Calendar } from 'lucide-react';
import type { WorkoutLog } from '../types';

interface RecentWorkoutsProps {
    logs: WorkoutLog[];
}

export const RecentWorkouts = ({ logs }: RecentWorkoutsProps) => {
    if (logs.length === 0) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
    };

    return (
        <div className="bg-grit-surface rounded-2xl p-6 border border-grit-border animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-grit-accent" />
                <h2 className="text-lg font-semibold text-grit-text">最近のワークアウト</h2>
            </div>

            <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                    <div
                        key={log.$id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-grit-surface-hover border border-grit-border"
                    >
                        <div className="w-10 h-10 rounded-lg bg-grit-accent/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-grit-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-grit-text truncate">{log.title}</h4>
                            <p className="text-xs text-grit-text-muted">{formatDate(log.date)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-grit-text-muted">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{log.duration_min}分</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
