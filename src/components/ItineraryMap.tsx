
import React from 'react';
import { DailyItinerary, Coordinates, ItineraryItem } from '../../types';
// Removed LoadingSpinner import as it's no longer used in this simplified version
// Removed geocodeLocation and simplify imports as they are no longer used

// Google Maps type aliases and specific logic are removed.

interface ItineraryMapProps {
  dailyBreakdown?: DailyItinerary[];
  destinations?: string[]; 
  activeEventIdentifier?: string | null;
  initialLocations?: (string | Coordinates)[];
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ dailyBreakdown, destinations, activeEventIdentifier, initialLocations }) => {
  // All Google Maps related state and useEffects have been removed.
  // The component now just renders a placeholder.

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
      <p className="text-slate-500 dark:text-slate-400 text-sm italic text-center">
        Map functionality is currently unavailable.
      </p>
    </div>
  );
};
export default ItineraryMap;
