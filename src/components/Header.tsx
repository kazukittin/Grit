interface HeaderProps {
    level?: number;
}

export const Header = ({ }: HeaderProps) => {
    return (
        <header className="sticky top-0 z-40 bg-grit-bg/80 dark:bg-grit-bg/60 backdrop-blur-2xl border-b border-grit-border dark:border-grit-glass-border">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
                {/* Empty header - just provides spacing and border */}
            </div>
        </header>
    );
};
