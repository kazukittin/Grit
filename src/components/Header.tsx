import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface HeaderProps {
    level?: number;
}

export const Header = ({ }: HeaderProps) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-grit-bg/80 dark:bg-grit-bg/60 backdrop-blur-2xl border-b border-grit-border dark:border-grit-glass-border">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-end">
                <button
                    onClick={() => navigate('/settings')}
                    className="w-9 h-9 rounded-full bg-grit-surface border border-grit-border flex items-center justify-center hover:bg-grit-surface-hover transition-colors"
                    aria-label="設定"
                >
                    <Settings className="w-4 h-4 text-grit-text-muted" />
                </button>
            </div>
        </header>
    );
};
