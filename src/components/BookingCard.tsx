import React, { useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';

interface BookingOption {
  id: string;
  details: string;
  price: number;
  name?: string; 
  // booked?: boolean; // This will be determined by selectedOptionId or parent state
  // paymentCompleted?: boolean; // Payment handled separately
}

interface BookingCardProps<T extends BookingOption> {
  title: string;
  icon: React.ReactNode;
  options: T[];
  onSelect: (option: T) => Promise<void>; // Renamed from onBook, takes the full option
  onDeselect: (optionId: string) => Promise<void>;
  selectedOptionId?: string; 
  isLoadingOptions: boolean;
  isProcessingAction: string | null; // ID of option being processed (select/deselect)
}

const BookingCard = <T extends BookingOption,>({ 
  title, 
  icon, 
  options, 
  onSelect,
  onDeselect,
  selectedOptionId,
  isLoadingOptions,
  isProcessingAction,
}: BookingCardProps<T>) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleSelect = async (option: T) => {
    setError(null);
    try {
      await onSelect(option);
    } catch (err) {
      setError(err instanceof Error ? err.message : `An error occurred while selecting ${title.toLowerCase()}.`);
    }
  };

  const handleDeselect = async (optionId: string) => {
    setError(null);
    try {
      await onDeselect(optionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : `An error occurred while deselecting ${title.toLowerCase()}.`);
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <LoadingSpinner message={`Fetching ${title} options...`} size="medium" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
      <div className="flex items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
        <span className="mr-3">{icon}</span>
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm shadow">{error}</div>}
      
      {options.length > 0 ? (
        <div className="space-y-4">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCurrentlyProcessing = isProcessingAction === option.id;
            const canInteract = !isProcessingAction || isCurrentlyProcessing; // Can interact if no action ongoing, or if it's this item

            return (
              <div 
                key={option.id} 
                className={`p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out border card-interactive-lift
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-400 dark:border-blue-500 ring-2 ring-blue-500 dark:ring-blue-400' : 
                  'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'}`}
              >
                <h4 className="font-semibold text-md sm:text-lg text-slate-800 dark:text-slate-100">{option.name || option.details.split(',')[0]}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 my-1">{option.details}</p>
                <p className="text-lg sm:text-xl font-bold mt-2 text-blue-600 dark:text-blue-400">${option.price.toFixed(2)}</p>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-end items-stretch sm:items-center">
                  {isCurrentlyProcessing ? (
                     <LoadingSpinner message={isSelected ? "Deselecting..." : "Selecting..."} size="small"/>
                  ) : isSelected ? (
                    <button
                        onClick={() => handleDeselect(option.id)}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 button-interactive"
                        disabled={!canInteract}
                      >
                        Deselect Option
                      </button>
                  ) : (
                    <button
                      onClick={() => handleSelect(option)}
                      className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 button-interactive
                                 ${selectedOptionId && selectedOptionId !== option.id ? 
                                  'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 
                                  'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      disabled={!canInteract || (selectedOptionId !== undefined && selectedOptionId !== option.id)}
                      title={selectedOptionId && selectedOptionId !== option.id ? `A ${title.slice(0,-1)} is already selected. Deselect first to choose another.` : `Select this ${title.slice(0,-1)}`}
                    >
                      Select This Option
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No {title.toLowerCase()} options currently available for this trip simulation.</p>
      )}
    </div>
  );
};

export default BookingCard;