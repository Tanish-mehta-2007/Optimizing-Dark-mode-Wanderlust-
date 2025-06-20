
import React from 'react';
import { Coordinates, NearbyPlaceSuggestion } from '../../types';
// Removed LoadingSpinner import as it's no longer used in this simplified version

// Google Maps type aliases and specific logic are removed.

interface NearbySuggestionsMapProps {
  userLocation: Coordinates | null;
  suggestions: NearbyPlaceSuggestion[];
  selectedSuggestionId: string | null;
  onSuggestionMarkerClick: (suggestionId: string) => void;
}

const NearbySuggestionsMap: React.FC<NearbySuggestionsMapProps> = ({
  userLocation,
  suggestions,
  selectedSuggestionId,
  onSuggestionMarkerClick,
}) => {
  // All Google Maps related state and useEffects have been removed.
  // The component now just renders a placeholder.

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
      <p className="text-slate-500 dark:text-slate-400 text-sm italic text-center">
        Map functionality for nearby suggestions is currently unavailable.
      </p>
    </div>
  );
};

export default NearbySuggestionsMap;
