import { Trophy } from 'lucide-react';

interface HeaderProps {
    level: number;
}

export const Header = ({ level }: HeaderProps) => {
    return (
        <header className="sticky top-0 z-40 bg-grit-bg/80 backdrop-blur-xl border-b border-grit-border">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-grit-text">Grit</span>
                </h1>
                <div className="flex items-center gap-2 bg-grit-surface px-3 py-1.5 rounded-full border border-grit-border">
                    <Trophy className="w-4 h-4 text-grit-accent" />
                    <span className="text-sm font-semibold text-grit-text">
                        Lv.{level}
                    </span>
                </div>
            </div>
        </header>
    );
};
