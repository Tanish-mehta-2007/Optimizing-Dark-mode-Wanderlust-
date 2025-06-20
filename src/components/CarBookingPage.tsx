
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { TripContext } from '../contexts/TripContext';
import BookingCard from './BookingCard';
import LoadingSpinner from './common/LoadingSpinner';
import Modal from './common/Modal';
import { CarRental, UserPreferences, AppView } from '../../types'; // Added AppView
import { fetchCarRentalOptions } from '../services/mockBookingService';
import { POPULAR_DESTINATIONS } from '../constants';

const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400 inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;
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
    try {
      inputElement.showPicker();
    } catch (e) {
      console.warn("Could not programmatically open date picker:", e);
    }
  }
};

interface CarSearchCriteria {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
}

interface CarBookingPageProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isStandaloneMode?: boolean;
  userPreferences?: UserPreferences; 
}

const CarBookingPage: React.FC<CarBookingPageProps> = ({ onNext, onBack, onSkip, isStandaloneMode = false, userPreferences }) => {
  const { currentTrip, setCarRental, updateCarRental, updateTripDetails } = useContext(TripContext);
  const today = new Date().toISOString().split('T')[0];
  const carBookingFormRef = useRef<HTMLFormElement>(null);


  const getInitialPickupDate = useCallback(() => {
    const tripDates = currentTrip?.dates;
    let pickupDate = today;
    if (tripDates) {
      const parts = tripDates.split(' to ');
      const startDate = parts[0];
      if (startDate && startDate >= today) {
        pickupDate = startDate;
      }
    }
    return pickupDate;
  }, [currentTrip?.dates, today]);

  const getInitialDropoffDate = useCallback((pickup: string) => {
    const tripDates = currentTrip?.dates;
    let dropoffDate = new Date(new Date(pickup).setDate(new Date(pickup).getDate() + 7)).toISOString().split('T')[0];
     if (tripDates) {
      const parts = tripDates.split(' to ');
      const endDate = parts[1] || parts[0]; 
      if (endDate && endDate >= pickup) {
        dropoffDate = endDate;
      }
    }
    if (new Date(dropoffDate) < new Date(pickup)) {
        dropoffDate = pickup;
    }
    return dropoffDate;
  }, [currentTrip?.dates]);

  const [searchCriteria, setSearchCriteria] = useState<CarSearchCriteria>(() => {
    const initialPickup = getInitialPickupDate();
    const initialDropoff = getInitialDropoffDate(initialPickup);
    return {
      pickupLocation: currentTrip?.destinations?.[0] || currentTrip?.prefillDestination || '',
      dropoffLocation: currentTrip?.destinations?.[currentTrip.destinations.length -1] || currentTrip?.prefillDestination || currentTrip?.destinations?.[0] || '',
      pickupDate: initialPickup,
      pickupTime: '10:00',
      dropoffDate: initialDropoff,
      dropoffTime: '10:00',
      driverAge: userPreferences?.age || 30, 
    };
  });

  const [searchResults, setSearchResults] = useState<CarRental[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState<string | null>(null);

  const [showCarRentalPrompt, setShowCarRentalPrompt] = useState(isStandaloneMode ? false : true);
  const [userWantsCarRental, setUserWantsCarRental] = useState<boolean | null>(isStandaloneMode ? true : null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [activeLocationInput, setActiveLocationInput] = useState<'pickupLocation' | 'dropoffLocation' | null>(null);
  const [locationAutocompleteSuggestions, setLocationAutocompleteSuggestions] = useState<string[]>([]);
  const [showLocationAutocomplete, setShowLocationAutocomplete] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
        let newState = {
          ...prev,
          [name]: name === 'driverAge' ? parseInt(value, 10) : value,
        };
        if (name === "pickupDate") {
            const newPickupDate = value < today ? today : value;
            newState.pickupDate = newPickupDate;
            if (newState.dropoffDate && newPickupDate > newState.dropoffDate) {
                newState.dropoffDate = newPickupDate;
            }
        }
        if (name === "dropoffDate" && newState.pickupDate && value < newState.pickupDate) {
            newState.dropoffDate = newState.pickupDate;
        }
      return newState;
    });
    
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
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carBookingFormRef.current && !carBookingFormRef.current.contains(event.target as Node)) {
        setShowLocationAutocomplete(false);
        setActiveLocationInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCarSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTrip && !isStandaloneMode) {
      setSearchError("Critical trip data is missing. Cannot perform search.");
      return;
    }
    setShowLocationAutocomplete(false);
    setActiveLocationInput(null);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);

    try {
      const options = await fetchCarRentalOptions(
        searchCriteria.pickupLocation,
        searchCriteria.dropoffLocation || searchCriteria.pickupLocation, 
        searchCriteria.pickupDate,
        searchCriteria.pickupTime,
        searchCriteria.dropoffDate,
        searchCriteria.dropoffTime,
        searchCriteria.driverAge,
        currentTrip?.travelTier
      );
      setSearchResults(options);
      if (options.length === 0) {
        setSearchError("No cars found matching your criteria. Try adjusting your search.");
      }
    } catch (err) {
      console.error("Error searching cars:", err);
      setSearchError(err instanceof Error ? err.message : "Failed to search for cars. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchCriteria, currentTrip, isStandaloneMode]);

  useEffect(() => {
    if (currentTrip) {
      setSearchCriteria(prev => {
        const newPickup = getInitialPickupDate();
        const newDropoff = getInitialDropoffDate(newPickup);
        return {
          ...prev,
          pickupLocation: currentTrip.prefillDestination || currentTrip.destinations?.[0] || prev.pickupLocation,
          dropoffLocation: currentTrip.prefillDestination || currentTrip.destinations?.[currentTrip.destinations.length -1] || currentTrip.destinations?.[0] || prev.dropoffLocation,
          pickupDate: prev.pickupDate || newPickup,
          dropoffDate: prev.dropoffDate || newDropoff,
          driverAge: userPreferences?.age || prev.driverAge, 
        };
      });
    } else if (isStandaloneMode) {
        setSearchCriteria(prev => {
            const pickup = prev.pickupDate < today ? today : prev.pickupDate;
            let dropoff = prev.dropoffDate < pickup ? pickup : prev.dropoffDate;
            if (new Date(dropoff) < new Date(pickup)) {
                dropoff = new Date(new Date(pickup).setDate(new Date(pickup).getDate() + 7)).toISOString().split('T')[0];
            }
            return { 
                ...prev, 
                pickupDate: pickup, 
                dropoffDate: dropoff,
                driverAge: userPreferences?.age || prev.driverAge 
            };
        });
    }


    if (currentTrip?.carRental?.booked) {
      setUserWantsCarRental(true);
    } else if (userWantsCarRental === null && !isStandaloneMode) {
        const timer = setTimeout(() => setShowCarRentalPrompt(true), 300);
        return () => clearTimeout(timer);
    }
  }, [currentTrip, userWantsCarRental, isStandaloneMode, today, getInitialPickupDate, getInitialDropoffDate, userPreferences]);


  const handleCarRentalDecision = (decision: boolean) => {
    setUserWantsCarRental(decision);
    setShowCarRentalPrompt(false);
    if (!decision) {
      if (currentTrip?.carRental) {
        setCarRental(undefined);
      }
    }
  };

  const handleSelectCar = async (selectedOption: CarRental) => {
    if (!currentTrip && !isStandaloneMode) return;
    setIsProcessingSelection(selectedOption.id);
    setCarRental({ ...selectedOption, booked: true, paymentCompleted: false });
    setIsProcessingSelection(null);
  };

  const handleDeselectCar = async (carId: string) => {
    if (!currentTrip?.carRental || currentTrip.carRental.id !== carId) return;
    setIsProcessingSelection(carId);
    if (currentTrip.carRental && currentTrip.carRental.id === carId) {
       setCarRental({ ...currentTrip.carRental, booked: false, paymentCompleted: false });
    }
    setIsProcessingSelection(null);
  };

  const selectedCarForTrip = currentTrip?.carRental?.booked ? currentTrip.carRental : null;

  const handleActualNext = () => {
    if (isStandaloneMode && searchCriteria.pickupLocation) {
        if (!currentTrip?.destinations || currentTrip.destinations.length === 0 || currentTrip.destinations[0] !== searchCriteria.pickupLocation || currentTrip.dates !== `${searchCriteria.pickupDate} to ${searchCriteria.dropoffDate}`) {
            updateTripDetails({
                source: currentTrip?.source || 'standalone_car',
                destinations: [searchCriteria.pickupLocation], 
                dates: `${searchCriteria.pickupDate} to ${searchCriteria.dropoffDate}`,
                travelTier: currentTrip?.travelTier || 'lifestyle',
                numberOfTravelers: currentTrip?.numberOfTravelers || '1',
            });
        }
    }
    onNext(); // Navigates to AppView.TRAIN_BOOKING in full trip or payment page in standalone
  };

  const handleActualSkip = () => {
     if (isStandaloneMode && searchCriteria.pickupLocation) { 
        if (!currentTrip?.destinations || currentTrip.destinations.length === 0 || currentTrip.destinations[0] !== searchCriteria.pickupLocation || currentTrip.dates !== `${searchCriteria.pickupDate} to ${searchCriteria.dropoffDate}`) {
             updateTripDetails({
                source: currentTrip?.source || 'standalone_car',
                destinations: [searchCriteria.pickupLocation],
                dates: `${searchCriteria.pickupDate} to ${searchCriteria.dropoffDate}`,
                travelTier: currentTrip?.travelTier || 'lifestyle',
                numberOfTravelers: currentTrip?.numberOfTravelers || '1',
            });
        }
    }
    onSkip(); // Navigates to AppView.TRAIN_BOOKING in full trip or payment page in standalone
  }


  if (!currentTrip && !isStandaloneMode) {
    return <div className="text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-md text-red-700 dark:text-red-300">Error: No active trip data.</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0">
        <header className="text-center py-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center justify-center">
          <CarIcon /> {isStandaloneMode ? "Rent a Car" : "Need a Ride?"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Search for car rentals or skip this step.</p>
        </header>

        {userWantsCarRental === null && showCarRentalPrompt && !isStandaloneMode && (
          <Modal
            isOpen={showCarRentalPrompt}
            onClose={() => handleCarRentalDecision(false)}
            title="Rent a Car?"
            size="sm"
            footerActions={
              <>
                <button onClick={() => handleCarRentalDecision(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition button-interactive">No, Thanks</button>
                <button onClick={() => handleCarRentalDecision(true)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition button-interactive">Yes, Show Options!</button>
              </>
            }
          >
            <p className="text-center text-slate-700 dark:text-slate-200">Would you like to add a car rental to your trip for {currentTrip?.destinations?.[0]?.split(',')[0] || 'your destination'}?</p>
          </Modal>
        )}

        {userWantsCarRental === false && !isSearching && !isStandaloneMode && (
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow">
              <p className="text-slate-600 dark:text-slate-300">Okay, no car rental will be added.</p>
          </div>
        )}

        {userWantsCarRental && (
          <form onSubmit={handleCarSearch} ref={carBookingFormRef} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="pickupLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pick-up Location</label>
                <input 
                  type="text" 
                  name="pickupLocation" 
                  id="pickupLocation" 
                  value={searchCriteria.pickupLocation} 
                  onChange={handleInputChange} 
                  onFocus={() => setActiveLocationInput('pickupLocation')}
                  className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
                  required 
                  autoComplete="off"
                />
                {activeLocationInput === 'pickupLocation' && showLocationAutocomplete && locationAutocompleteSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{locationAutocompleteSuggestions.map(loc => <li key={loc} onMouseDown={() => handleLocationAutocompleteSelect(loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon /> {loc}</li>)}</ul></div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="dropoffLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Drop-off Location</label>
                <input 
                  type="text" 
                  name="dropoffLocation" 
                  id="dropoffLocation" 
                  value={searchCriteria.dropoffLocation} 
                  onChange={handleInputChange} 
                  onFocus={() => setActiveLocationInput('dropoffLocation')}
                  className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
                  autoComplete="off"
                />
                {activeLocationInput === 'dropoffLocation' && showLocationAutocomplete && locationAutocompleteSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{locationAutocompleteSuggestions.map(loc => <li key={loc} onMouseDown={() => handleLocationAutocompleteSelect(loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon /> {loc}</li>)}</ul></div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pick-up Date</label>
                 <div className="relative">
                      <input
                          type="date"
                          name="pickupDate"
                          id="pickupDate"
                          value={searchCriteria.pickupDate}
                          min={today}
                          onChange={handleInputChange}
                          onClick={handleDateInputClick}
                          className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                          required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <CalendarIcon />
                      </div>
                  </div>
              </div>
              <div>
                <label htmlFor="pickupTime" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Pick-up Time</label>
                <input type="time" name="pickupTime" id="pickupTime" value={searchCriteria.pickupTime} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
              </div>
              <div>
                <label htmlFor="dropoffDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Drop-off Date</label>
                <div className="relative">
                    <input
                      type="date"
                      name="dropoffDate"
                      id="dropoffDate"
                      value={searchCriteria.dropoffDate}
                      min={searchCriteria.pickupDate || today}
                      onChange={handleInputChange}
                      onClick={handleDateInputClick}
                      className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CalendarIcon />
                    </div>
                </div>
              </div>
              <div>
                <label htmlFor="dropoffTime" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Drop-off Time</label>
                <input type="time" name="dropoffTime" id="dropoffTime" value={searchCriteria.dropoffTime} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
              </div>
            </div>
             <div>
              <label htmlFor="driverAge" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Driver's Age</label>
              <input 
                  type="number" 
                  name="driverAge" 
                  id="driverAge" 
                  value={searchCriteria.driverAge} 
                  min="18" 
                  max="99" 
                  onChange={handleInputChange} 
                  className="w-full md:w-1/2 p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
                  required
              />
            </div>
            <button type="submit" disabled={isSearching} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive">
              {isSearching ? <LoadingSpinner message="Searching..." size="small" /> : <><SearchIcon /> <span className="ml-2">Search Cars</span></>}
            </button>
          </form>
        )}

        {isSearching && userWantsCarRental && !searchResults.length && (
           <div className="flex flex-col items-center justify-center min-h-[30vh] bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
             <LoadingSpinner message="Finding best car deals..." size="large" />
           </div>
        )}
        
        {searchError && userWantsCarRental && <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">{searchError}</div>}

        {!isSearching && hasSearched && userWantsCarRental && searchResults.length > 0 && (
          <div className="space-y-4 px-4 sm:px-0">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 mt-6 mb-2">Search Results ({searchResults.length})</h3>
            {searchResults.map(car => (
              <BookingCard<CarRental>
                key={car.id}
                title={car.carType || "Car Rental"}
                icon={<CarIcon />}
                options={[car]}
                onSelect={() => handleSelectCar(car)}
                onDeselect={() => handleDeselectCar(car.id)}
                selectedOptionId={selectedCarForTrip?.id}
                isLoadingOptions={false}
                isProcessingAction={isProcessingSelection === car.id ? car.id : null}
              />
            ))}
          </div>
        )}
        {!isSearching && hasSearched && userWantsCarRental && searchResults.length === 0 && !searchError && (
          <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No cars found matching your criteria.</p>
        )}

        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 px-4 sm:px-0">
          <button
            onClick={onBack}
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors button-interactive"
          >
            {isStandaloneMode ? "Back to Home" : "Back to Hotels"}
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {!isStandaloneMode && (
                  <button
                      onClick={handleActualSkip}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg shadow-md transition-colors button-interactive"
                  >
                      Skip Car Rental
                  </button>
              )}
              <button
                  onClick={handleActualNext}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive"
                  disabled={(!selectedCarForTrip && userWantsCarRental && hasSearched && searchResults.length > 0 ) || isProcessingSelection !== null}
              >
                  {isStandaloneMode ? "Next: Payment" : "Next: Train Booking"}
              </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

export default CarBookingPage;
