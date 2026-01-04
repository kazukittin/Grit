import { Plus } from 'lucide-react';

interface FloatingButtonProps {
    onClick: () => void;
}

export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-grit-accent to-grit-accent-dark text-white rounded-full shadow-lg shadow-grit-accent/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
            aria-label="記録を追加"
        >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
    );
};
