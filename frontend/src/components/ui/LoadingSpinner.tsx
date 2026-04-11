import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <svg
      className={cn(
        'animate-spin text-primary',
        sizes[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-text-secondary font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

// Skeleton loading components
export const Skeleton = ({ 
  className,
  variant = 'default'
}: { 
  className?: string;
  variant?: 'default' | 'circle' | 'text';
}) => {
  const variants = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div 
      className={cn(
        'skeleton bg-gray-200 animate-pulse',
        variants[variant],
        className
      )} 
    />
  );
};

// Product card skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" variant="text" />
      <Skeleton className="h-4 w-1/2" variant="text" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" variant="text" />
        <Skeleton className="h-10 w-10 rounded-full" variant="circle" />
      </div>
    </div>
  </div>
);
