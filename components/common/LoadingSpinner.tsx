
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading...", size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-t-2 border-b-2', 
    medium: 'h-10 w-10 border-t-4 border-b-4',
    large: 'h-14 w-14 border-t-4 border-b-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-600 dark:border-blue-400 border-solid`}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      ></div>
      {message && <p className={`mt-2 text-xs sm:text-sm font-medium ${size === 'small' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
