
import React, { useContext } from 'react';
import { TripContext } from '../contexts/TripContext';
import { AppView, PrimaryTransportationMode } from '../../types'; 

interface TransportationModeSelectionPageProps {
  onNext: (mode: PrimaryTransportationMode) => void;
  onBack: () => void;
}

const TransportationModeSelectionPage: React.FC<TransportationModeSelectionPageProps> = ({ onNext, onBack }) => {
  const { setPrimaryTransportationMode } = useContext(TripContext);

  const handleModeSelection = (mode: PrimaryTransportationMode) => {
    setPrimaryTransportationMode(mode);
    onNext(mode);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Select Transportation Mode</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          How would you primarily like to travel between destinations for this trip?
        </p>
        <div className="space-y-3">
            <button 
                onClick={() => handleModeSelection('flight')} 
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors button-interactive"
            >
                ✈️ Flights
            </button>
            <button 
                onClick={() => handleModeSelection('train')} 
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors button-interactive"
            >
                🚆 Trains
            </button>
             <button 
                onClick={() => handleModeSelection('bus')} 
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors button-interactive"
            >
                🚌 Buses
            </button>
            <button 
                onClick={() => handleModeSelection('roadtrip')} 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors button-interactive"
            >
                🚗 Road Trip (Car Rental)
            </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            This selection will prioritize the type of bookings shown next. You can still add other transport types later.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors button-interactive"
          >
            Back to Itinerary
          </button>
          {/* The onNext is handled by specific mode buttons now */}
        </div>
      </div>
    </div>
  );
};

export default TransportationModeSelectionPage;
