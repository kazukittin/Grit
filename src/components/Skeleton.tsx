import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animate?: boolean;
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animate = true,
}: SkeletonProps) {
    const baseClasses = 'bg-grit-border/50';
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-xl',
    };

    const style: React.CSSProperties = {
        width: width ?? '100%',
        height: height ?? (variant === 'text' ? '1em' : '100%'),
    };

    if (!animate) {
        return (
            <div
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                style={style}
            />
        );
    }

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
            animate={{
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-card rounded-2xl p-5 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="60%" height={20} />
            </div>
            <Skeleton variant="rounded" height={120} className="mb-3" />
            <Skeleton variant="text" width="80%" className="mb-2" />
            <Skeleton variant="text" width="40%" />
        </div>
    );
}

export function SkeletonSummaryCard() {
    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <Skeleton variant="text" width={80} height={16} className="mb-2" />
                    <Skeleton variant="text" width={150} height={48} className="mb-2" />
                    <Skeleton variant="text" width={100} height={20} />
                </div>
                <Skeleton variant="circular" width={60} height={60} />
            </div>
        </div>
    );
}

export function SkeletonChart() {
    return (
        <div className="glass-card rounded-2xl p-5">
            <Skeleton variant="text" width={120} height={24} className="mb-4" />
            <Skeleton variant="rounded" height={200} />
        </div>
    );
}

export function SkeletonHabits() {
    return (
        <div className="glass-card rounded-2xl p-5">
            <Skeleton variant="text" width={100} height={24} className="mb-4" />
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width="70%" height={20} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonHeatmap() {
    return (
        <div className="glass-card rounded-2xl p-5">
            <Skeleton variant="text" width={140} height={24} className="mb-4" />
            <div className="grid grid-cols-13 gap-1">
                {Array.from({ length: 91 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" width={12} height={12} />
                ))}
            </div>
        </div>
    );
}

export function SkeletonCalorieRing() {
    return (
        <div className="glass-card rounded-2xl p-5">
            <Skeleton variant="text" width={120} height={24} className="mb-4" />
            <div className="flex justify-center mb-4">
                <Skeleton variant="circular" width={180} height={180} />
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                        <Skeleton variant="text" width="100%" height={16} className="mb-1" />
                        <Skeleton variant="text" width="60%" height={24} className="mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonMeals() {
    return (
        <div className="glass-card rounded-2xl p-5">
            <Skeleton variant="text" width={100} height={24} className="mb-4" />
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-grit-surface-hover rounded-xl">
                        <div className="flex items-center gap-3">
                            <Skeleton variant="circular" width={32} height={32} />
                            <div>
                                <Skeleton variant="text" width={80} height={16} className="mb-1" />
                                <Skeleton variant="text" width={60} height={14} />
                            </div>
                        </div>
                        <Skeleton variant="rounded" width={60} height={28} />
                    </div>
                ))}
            </div>
        </div>
    );
}
