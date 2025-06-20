
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Coordinates, NearbyPlaceSuggestion, AppView } from '../types';
import { getCurrentLocation } from '../services/geolocationService';
import { fetchNearbyPlaces } from '../services/googleMapsApiService.ts';
import LoadingSpinner from './common/LoadingSpinner';
import NearbySuggestionsMap from './NearbySuggestionsMap';
import { ImageWithFallback } from './common/ImageDisplayUtils';

interface NearbySuggestionsPageProps {
  navigateTo: (view: AppView) => void;
}

// --- Icons ---
const SearchIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;


type FilterTab = "All" | "Eat & Drink" | "See & Do";

const NearbySuggestionsPage: React.FC<NearbySuggestionsPageProps> = ({ navigateTo }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [allSuggestions, setAllSuggestions] = useState<NearbyPlaceSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("All");
  const [searchTerm, setSearchTerm] = useState("Nearby"); // For the search bar visual

  const mapGoogleCategoryToFilterTab = (googleCategory: string): FilterTab | null => {
    const cat = googleCategory.toLowerCase();
    if (['restaurant', 'cafe', 'bar', 'bakery', 'meal_delivery', 'meal_takeaway', 'food'].some(term => cat.includes(term))) {
      return "Eat & Drink";
    }
    if (['park', 'museum', 'tourist_attraction', 'art_gallery', 'landmark', 'zoo', 'aquarium', 'amusement_park', 'library', 'movie_theater', 'stadium', 'point_of_interest', 'establishment'].some(term => cat.includes(term))) {
      return "See & Do";
    }
    return null;
  };
  
  const filteredSuggestions = useMemo(() => {
    if (activeFilterTab === "All") {
      return allSuggestions;
    }
    return allSuggestions.filter(suggestion => {
      const mappedTab = mapGoogleCategoryToFilterTab(suggestion.category);
      return mappedTab === activeFilterTab;
    });
  }, [allSuggestions, activeFilterTab]);


  const fetchUserLocationAndThenSuggestions = useCallback(async () => {
    setIsLoadingLocation(true);
    setError(null);
    setAllSuggestions([]);
    setSelectedSuggestionId(null);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setIsLoadingLocation(false);
      fetchNearbySuggestionsFromGoogle(location);
    } catch (err) {
      let errorMessage = "Failed to get user location.";
      if (err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLocationAndThenSuggestions();
  }, [fetchUserLocationAndThenSuggestions]);

  const fetchNearbySuggestionsFromGoogle = async (location: Coordinates) => {
    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const fetchedSuggestions = await fetchNearbyPlaces(location);
      setAllSuggestions(fetchedSuggestions.map(s => ({...s, rating: (3.8 + Math.random()*1.2).toFixed(1), distance: (0.1 + Math.random()*2).toFixed(1) + " mi" }))); // Mock rating & distance
      if (fetchedSuggestions.length === 0 && !error) {
        setError("No specific suggestions found within 2km. Try exploring a wider area!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch nearby suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleRefresh = () => {
    fetchUserLocationAndThenSuggestions();
  };

  const handleSuggestionSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionId(suggestionId);
  }, []);
  
  const renderErrorMessage = () => {
    if (!error) return null;
     let displayMessage = error;
     if (error.includes("User denied the request for Geolocation")) {
      displayMessage = "Location permission was denied. Please enable location access for this site in your browser settings and then refresh.";
    } else if (error.includes("Geolocation is not supported")) {
      displayMessage = "Your browser does not support geolocation. This feature cannot be used.";
    } else if (error.includes("Location information is unavailable") || error.includes("timed out")) {
        displayMessage = "Could not determine your location. Please ensure your device's location services are on and try refreshing."
    }
    return (
      <div className="col-span-full p-4 m-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-600 dark:text-red-300 rounded-md text-center">
        {displayMessage}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Left Column */}
      <div className="w-full md:w-[420px] lg:w-[450px] bg-white dark:bg-slate-900 flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <button 
                onClick={() => navigateTo(AppView.HOME)} 
                className="mb-3 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group"
            >
                <BackArrowIcon /> Back
            </button>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
                </div>
                <input
                type="text"
                value={searchTerm}
                readOnly 
                onClick={handleRefresh} // Refresh on click of search bar for now
                className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Nearby"
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button onClick={handleRefresh} disabled={isLoadingLocation || isLoadingSuggestions} className="p-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 transition-colors" title="Refresh suggestions">
                        {isLoadingLocation || isLoadingSuggestions ? <LoadingSpinner size="small" message="" /> : <RefreshIcon />}
                    </button>
                 </div>
            </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex space-x-1">
            {(["All", "Eat & Drink", "See & Do"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${activeFilterTab === tab
                    ? 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoadingLocation ? (
          <div className="flex-grow flex items-center justify-center p-4"><LoadingSpinner message="Getting location..." /></div>
        ) : error && filteredSuggestions.length === 0 ? (
          <div className="flex-grow flex items-center justify-center p-4">{renderErrorMessage()}</div>
        ) : isLoadingSuggestions ? (
           <div className="flex-grow flex items-center justify-center p-4"><LoadingSpinner message="Finding places..." /></div>
        ) : (
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar-nearby">
            {filteredSuggestions.length === 0 && !error && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-10">
                No places found for "{activeFilterTab}". Try a different filter or refresh.
              </p>
            )}
            {filteredSuggestions.map(place => (
              <div
                key={place.id}
                id={`suggestion-${place.id}`}
                onClick={() => handleSuggestionSelect(place.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSuggestionSelect(place.id);}}
                role="button"
                tabIndex={0}
                aria-pressed={selectedSuggestionId === place.id}
                className={`p-3 bg-white dark:bg-slate-850 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out flex items-center space-x-3
                            ${selectedSuggestionId === place.id
                                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400 shadow-md'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                            }`}
              >
                <ImageWithFallback 
                    src={undefined} // No images in NearbyPlaceSuggestion type yet
                    alt={place.name} 
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    placeholderClassName="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0"
                />
                <div className="flex-grow overflow-hidden">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate" title={place.name}>{place.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{place.rating || 'N/A'}</span> {/* Mocked rating */}
                    <span className="mx-1">&bull;</span>
                    <span className="capitalize">{place.category.replace(/_/g, ' ')}</span>
                    <span className="mx-1">&bull;</span>
                    <span>{place.distance || 'N/A'}</span> {/* Mocked distance */}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Map */}
      <div className="flex-grow h-full md:h-screen relative">
        {!isLoadingLocation && userLocation ? (
          <NearbySuggestionsMap
            userLocation={userLocation}
            suggestions={filteredSuggestions} // Pass filtered suggestions to map
            selectedSuggestionId={selectedSuggestionId}
            onSuggestionMarkerClick={handleSuggestionSelect}
          />
        ) : !isLoadingLocation && !userLocation && error ? (
           <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 p-4">
             <p className="text-slate-500 dark:text-slate-400 text-center">Map cannot be displayed: {error}</p>
           </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <LoadingSpinner message="Loading map..." />
          </div>
        )}
      </div>
       <style>{`
        .custom-scrollbar-nearby::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-nearby::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-nearby::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; } /* slate-400 */
        .dark .custom-scrollbar-nearby::-webkit-scrollbar-thumb { background: #4b5563; } /* slate-600 */
      `}</style>
    </div>
  );
};

export default NearbySuggestionsPage;
