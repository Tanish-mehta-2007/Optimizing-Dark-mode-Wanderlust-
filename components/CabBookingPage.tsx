
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { TripContext } from '../contexts/TripContext';
import BookingCard from './BookingCard';
import LoadingSpinner from './common/LoadingSpinner';
import { CabBooking, UserPreferences, AppView } from '../types';
import { fetchCabOptions, bookCab } from '../services/mockBookingService';
import { POPULAR_DESTINATIONS } from '../constants';
import { getCurrentLocation } from '../services/geolocationService'; // Import geolocation service
import { reverseGeocodeCoordinates } from '../services/googleMapsApiService'; // For reverse geocoding

// --- Icons ---
const CabIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400 inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5c0-.966-.351-1.837-.936-2.514A3.695 3.695 0 0012 10.5c-.711 0-1.385.174-1.96.486-.585.677-.94 1.548-.94 2.514V21m3-8.25V9M10.5 9V3.75A1.5 1.5 0 0112 2.25h.008c.828 0 1.5.672 1.5 1.5V9M10.5 21h3m-3-3h3M7.5 6.313A11.963 11.963 0 006 6.687c1.656-.323 3.223-.886 4.5-1.748M16.5 6.313A11.963 11.963 0 0118 6.687c-1.656-.323-3.223-.886-4.5-1.748" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>;
const CalendarIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);
const LocationPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.4l-4.71-4.711a6.5 6.5 0 119.192-9.192A6.5 6.5 0 0110 18.4zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
  const inputElement = event.currentTarget;
  if (inputElement && typeof inputElement.showPicker === 'function') {
    try { inputElement.showPicker(); } catch (e) { console.warn("Could not programmatically open date picker:", e); }
  }
};

interface CabSearchCriteria {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
}

interface CabBookingPageProps {
  onNext: () => void;
  onBack: () => void;
  userPreferences: UserPreferences;
}

const CabBookingPage: React.FC<CabBookingPageProps> = ({ onNext, onBack, userPreferences }) => {
  const { currentTrip, setDepartureCab, updateTripDetails } = useContext(TripContext); // Removed setArrivalCab for now as current flow focuses on departure
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().substring(0,5);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchCriteria, setSearchCriteria] = useState<CabSearchCriteria>({
    pickupLocation: currentTrip?.prefillPickup || '',
    dropoffLocation: currentTrip?.prefillDropoff || '',
    pickupDate: currentTrip?.prefillDateTime?.split('T')[0] || today,
    pickupTime: currentTrip?.prefillDateTime?.split('T')[1]?.substring(0,5) || currentTime,
  });

  const [searchResults, setSearchResults] = useState<CabBooking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string|null>(null);


  const [activeLocationInput, setActiveLocationInput] = useState<'pickupLocation' | 'dropoffLocation' | null>(null);
  const [locationAutocompleteSuggestions, setLocationAutocompleteSuggestions] = useState<string[]>([]);
  const [showLocationAutocomplete, setShowLocationAutocomplete] = useState(false);

  useEffect(() => {
    // Pre-fill from currentTrip if available (e.g., from AI Chat or Notification)
    if (currentTrip?.source === 'standalone_cab') {
      const newPickupLocation = currentTrip.prefillPickup || '';
      setSearchCriteria({
        pickupLocation: newPickupLocation,
        dropoffLocation: currentTrip.prefillDropoff || '',
        pickupDate: currentTrip.prefillDateTime?.split('T')[0] || today,
        pickupTime: currentTrip.prefillDateTime?.split('T')[1]?.substring(0,5) || currentTime,
      });

      if (newPickupLocation.toLowerCase() === "current location") {
        setIsGeolocating(true);
        setGeolocationError(null);
        getCurrentLocation()
          .then(coords => reverseGeocodeCoordinates(coords))
          .then(address => {
            if (address) {
              setSearchCriteria(prev => ({ ...prev, pickupLocation: address }));
            } else {
              setGeolocationError("Could not determine address from current location. Please enter manually.");
            }
          })
          .catch(err => {
            console.warn("Geolocation error:", err);
            setGeolocationError(err.message || "Failed to get current location. Please enter manually or grant permission.");
          })
          .finally(() => setIsGeolocating(false));
      }
    }
  }, [currentTrip, today, currentTime]);
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowLocationAutocomplete(false);
        setActiveLocationInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
      let newState = { ...prev, [name]: value };
      if (name === "pickupDate" && value < today) {
        newState.pickupDate = today;
        if (new Date(newState.pickupDate + 'T' + newState.pickupTime) < new Date()) {
          newState.pickupTime = currentTime;
        }
      }
      if (name === "pickupTime" && newState.pickupDate === today && value < currentTime) {
        newState.pickupTime = currentTime;
      }
      return newState;
    });
    setGeolocationError(null); // Clear geolocation error on manual input

    if (name === 'pickupLocation' || name === 'dropoffLocation') {
      setActiveLocationInput(name as 'pickupLocation' | 'dropoffLocation');
      if (value.trim()) {
        const filtered = POPULAR_DESTINATIONS.filter(dest => dest.toLowerCase().includes(value.toLowerCase())).slice(0, 7);
        setLocationAutocompleteSuggestions(filtered);
        setShowLocationAutocomplete(filtered.length > 0);
      } else {
        setLocationAutocompleteSuggestions([]);
        setShowLocationAutocomplete(false);
      }
    }
  };
  
  const handleLocationAutocompleteSelect = (location: string) => {
    if (activeLocationInput) {
      setSearchCriteria(prev => ({ ...prev, [activeLocationInput]: location }));
    }
    setShowLocationAutocomplete(false);
    setActiveLocationInput(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCriteria.pickupLocation || !searchCriteria.dropoffLocation) {
      setSearchError("Please enter both pickup and dropoff locations.");
      return;
    }
    if (searchCriteria.pickupLocation.toLowerCase() === "current location" && isGeolocating) {
        setSearchError("Still trying to get your current location. Please wait or enter manually.");
        return;
    }
     if (searchCriteria.pickupLocation.toLowerCase() === "current location" && geolocationError) {
        setSearchError("Could not get current location. Please enter pickup location manually.");
        return;
    }


    setShowLocationAutocomplete(false);
    setActiveLocationInput(null);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);

    const pickupDateTime = `${searchCriteria.pickupDate}T${searchCriteria.pickupTime}:00`;

    try {
      const options = await fetchCabOptions(
        searchCriteria.pickupLocation,
        searchCriteria.dropoffLocation,
        pickupDateTime
      );
      setSearchResults(options);
      if (options.length === 0) {
        setSearchError("No cabs found for the selected criteria. Please try different locations or times.");
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to search for cabs.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCab = async (selectedOption: CabBooking) => {
    setIsProcessingSelection(selectedOption.id);
    try {
      const cabToSet: CabBooking = {
        ...selectedOption,
        details: selectedOption.details || `${selectedOption.carModel || 'Standard Cab'} from ${selectedOption.pickupLocation} to ${selectedOption.dropoffLocation}`,
        price: selectedOption.price || selectedOption.estimatedFare,
        booked: true,
        paymentCompleted: false
      };

      // Assuming standalone cab booking always relates to departure for simplicity in this flow
      setDepartureCab(cabToSet); 
      
      if (currentTrip) {
        updateTripDetails({ // Use existing trip details and update cab specific ones
          ...currentTrip, 
          source: 'standalone_cab', // Ensure source is correct
          departureCab: cabToSet,
          // Update prefill fields if the cab search criteria were used
          prefillPickup: searchCriteria.pickupLocation,
          prefillDropoff: searchCriteria.dropoffLocation,
          prefillDateTime: `${searchCriteria.pickupDate}T${searchCriteria.pickupTime}`
        });
      } else { // If no currentTrip, create a new one focused on this cab booking
         updateTripDetails({
            source: 'standalone_cab',
            destinations: [searchCriteria.dropoffLocation], // Main destination of cab
            dates: searchCriteria.pickupDate, // Date of cab booking
            travelTier: userPreferences.defaultTravelTier || "lifestyle",
            departureCab: cabToSet,
            // Set prefill fields
            prefillPickup: searchCriteria.pickupLocation,
            prefillDropoff: searchCriteria.dropoffLocation,
            prefillDateTime: `${searchCriteria.pickupDate}T${searchCriteria.pickupTime}`
         });
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error selecting cab option.");
    } finally {
      setIsProcessingSelection(null);
    }
  };

  const handleDeselectCab = async (cabId: string) => {
    setIsProcessingSelection(cabId);
    // This assumes we are only dealing with departureCab in this standalone page context
    setDepartureCab(undefined); 
    if (currentTrip?.departureCab?.id === cabId) {
        updateTripDetails({ ...currentTrip, departureCab: undefined });
    }
    // If arrivalCab was also a possibility, would need similar logic:
    // else if (currentTrip?.arrivalCab?.id === cabId) {
    //     updateTripDetails({ ...currentTrip, arrivalCab: undefined });
    // }
    setIsProcessingSelection(null);
  };

  const selectedCab = currentTrip?.departureCab?.booked ? currentTrip.departureCab : null; // Simplified to departureCab

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0">
      <header className="text-center py-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center justify-center">
          <CabIcon /> Book Your Ride
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Enter your details to find available cabs.</p>
      </header>

      <form onSubmit={handleSearch} ref={formRef} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        {geolocationError && <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md">{geolocationError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pickup Location</label>
            <div className="flex items-center">
              <input type="text" name="pickupLocation" id="pickupLocation" value={searchCriteria.pickupLocation} onChange={handleInputChange} onFocus={() => setActiveLocationInput('pickupLocation')} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" placeholder="e.g., Current Location or Address" required autoComplete="off"/>
              {isGeolocating && <div className="ml-2"><LoadingSpinner size="small" message=""/></div>}
            </div>
             {activeLocationInput === 'pickupLocation' && showLocationAutocomplete && locationAutocompleteSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{locationAutocompleteSuggestions.map(loc => <li key={`pickup-${loc}`} onMouseDown={() => handleLocationAutocompleteSelect(loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon /> {loc}</li>)}</ul></div>
            )}
          </div>
          <div className="relative">
            <label htmlFor="dropoffLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Dropoff Location</label>
            <input type="text" name="dropoffLocation" id="dropoffLocation" value={searchCriteria.dropoffLocation} onChange={handleInputChange} onFocus={() => setActiveLocationInput('dropoffLocation')} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" placeholder="e.g., Airport or Address" required autoComplete="off"/>
            {activeLocationInput === 'dropoffLocation' && showLocationAutocomplete && locationAutocompleteSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{locationAutocompleteSuggestions.map(loc => <li key={`dropoff-${loc}`} onMouseDown={() => handleLocationAutocompleteSelect(loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon /> {loc}</li>)}</ul></div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pickup Date</label>
            <div className="relative">
                <input type="date" name="pickupDate" id="pickupDate" value={searchCriteria.pickupDate} min={today} onChange={handleInputChange} onClick={handleDateInputClick} className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer" required />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon /></div>
            </div>
          </div>
          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pickup Time</label>
            <input type="time" name="pickupTime" id="pickupTime" value={searchCriteria.pickupTime} min={searchCriteria.pickupDate === today ? currentTime : undefined} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
          </div>
        </div>
        <button type="submit" disabled={isSearching || isGeolocating} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive">
          {isSearching ? <LoadingSpinner message="Searching..." size="small" /> : <><SearchIcon /> <span className="ml-2">Find Cabs</span></>}
        </button>
      </form>

      {isSearching && !searchResults.length && (
         <div className="flex flex-col items-center justify-center min-h-[20vh] bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
           <LoadingSpinner message="Finding available cabs..." size="large" />
         </div>
      )}

      {searchError && <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">{searchError}</div>}
      
      {!isSearching && hasSearched && searchResults.length > 0 && (
        <div className="space-y-4 px-4 sm:px-0">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 mt-6 mb-2">Available Cabs ({searchResults.length})</h3>
          {searchResults.map(cab => (
            <BookingCard<CabBooking>
              key={cab.id}
              title={cab.carModel || "Cab Option"}
              icon={<CabIcon />}
              options={[{...cab, details: cab.details || `${cab.carModel || 'Standard Cab'} - ${cab.driverName || 'Driver'}`, price: cab.price || cab.estimatedFare }]} 
              onSelect={() => handleSelectCab(cab)}
              onDeselect={() => handleDeselectCab(cab.id)}
              selectedOptionId={selectedCab?.id}
              isLoadingOptions={false}
              isProcessingAction={isProcessingSelection === cab.id ? cab.id : null}
            />
          ))}
        </div>
      )}
      {!isSearching && hasSearched && searchResults.length === 0 && !searchError && (
        <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No cabs found for the selected criteria. Please try different locations or times.</p>
      )}

      <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 px-4 sm:px-0">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors button-interactive"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive"
          disabled={!selectedCab || isProcessingSelection !== null}
        >
          Confirm & Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CabBookingPage;