
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { TripContext } from '../contexts/TripContext';
import BookingCard from './BookingCard';
import LoadingSpinner from './common/LoadingSpinner';
import { FlightBooking, FlightClass, FlightLegCriteria } from '../types';
import { fetchFlightOptions } from '../services/mockBookingService';
import { FLIGHT_CLASSES, POPULAR_DESTINATIONS } from '../constants';

const FlightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400 inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>;
const CalendarIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MinusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
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

interface FlightSearchCriteria {
  legs: FlightLegCriteria[];
  passengers: number;
  flightClass: FlightClass;
}

interface FlightBookingPageProps {
  onNext: () => void;
  onBack: () => void;
  isStandaloneMode?: boolean;
}

export const FlightBookingPage: React.FC<FlightBookingPageProps> = ({ onNext, onBack, isStandaloneMode = false }) => {
  const { currentTrip, addFlightBooking, updateFlightBooking, updateTripDetails } = useContext(TripContext);
  const today = new Date().toISOString().split('T')[0];
  const flightBookingFormRef = useRef<HTMLFormElement>(null);

  const [searchCriteria, setSearchCriteria] = useState<FlightSearchCriteria>(() => {
    const initialOrigin = currentTrip?.originCity || (isStandaloneMode && currentTrip?.prefillDestination ? '' : currentTrip?.prefillDestination || '');
    const initialDestination = currentTrip?.destinations?.[0] || currentTrip?.prefillDestination || '';
    
    let initialDepartureDate = currentTrip?.dates?.split(' to ')[0] || currentTrip?.dates;
    if (currentTrip?.prefillDates && (!initialDepartureDate || initialDepartureDate.toLowerCase() === 'to be determined')) {
      initialDepartureDate = currentTrip.prefillDates;
    }
    if (!initialDepartureDate || initialDepartureDate.toLowerCase() === 'to be determined') {
        initialDepartureDate = today;
    }
    const validInitialDeparture = initialDepartureDate >= today ? initialDepartureDate : today;
  
    return {
      legs: [{
        legId: `leg-${Date.now()}`,
        origin: initialOrigin,
        destination: initialDestination,
        departureDate: validInitialDeparture,
      }],
      passengers: parseInt(currentTrip?.numberOfTravelers || '1', 10),
      flightClass: 'economy' as FlightClass,
    };
  });

  const [searchResults, setSearchResults] = useState<Record<string, FlightBooking[]>>({});
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeLegInput, setActiveLegInput] = useState<{ legId: string, inputType: 'origin' | 'destination' } | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);


  useEffect(() => {
    if (currentTrip) {
      setSearchCriteria(prev => {
        let determinedDepartureDate = currentTrip.dates?.split(' to ')[0] || currentTrip.dates;
        if (currentTrip.prefillDates && (!determinedDepartureDate || determinedDepartureDate.toLowerCase() === 'to be determined')) {
            determinedDepartureDate = currentTrip.prefillDates;
        }
        if (!determinedDepartureDate || determinedDepartureDate.toLowerCase() === 'to be determined') {
            determinedDepartureDate = today;
        }
        const validOverallStartDate = (determinedDepartureDate >= today) ? determinedDepartureDate : today;

        let newLegs: FlightLegCriteria[];

        if (isStandaloneMode) {
          newLegs = [{
            legId: prev.legs[0]?.legId || `leg-${Date.now()}`,
            origin: currentTrip.originCity || (currentTrip.prefillDestination ? '' : prev.legs[0]?.origin || ''),
            destination: currentTrip.prefillDestination || currentTrip.destinations?.[0] || prev.legs[0]?.destination || '',
            departureDate: validOverallStartDate,
          }];
        } else { 
          const numDestinations = currentTrip.destinations?.length || 0;
          if (numDestinations > 0) {
            newLegs = [];
            newLegs.push({
              legId: `leg-${Date.now()}-0`,
              origin: currentTrip.originCity || '',
              destination: currentTrip.destinations[0],
              departureDate: validOverallStartDate,
            });

            for (let i = 0; i < numDestinations - 1; i++) {
              let legDepartureDate = validOverallStartDate; 
              const prevCity = currentTrip.destinations[i];
              const itineraryDay = currentTrip.itinerary?.dailyBreakdown.find(day => 
                day.events.some(event => event.location?.toLowerCase().includes(prevCity.split(',')[0].toLowerCase())) && day.date && day.date >= legDepartureDate
              );
              if (itineraryDay?.date) {
                legDepartureDate = itineraryDay.date;
              }
              
              newLegs.push({
                legId: `leg-${Date.now()}-${i + 1}`,
                origin: currentTrip.destinations[i],
                destination: currentTrip.destinations[i+1],
                departureDate: legDepartureDate >= today ? legDepartureDate : today,
              });
            }
          } else { 
            newLegs = [{
              legId: prev.legs[0]?.legId || `leg-${Date.now()}`,
              origin: currentTrip.originCity || '',
              destination: currentTrip.prefillDestination || '',
              departureDate: validOverallStartDate,
            }];
          }
        }
        
        if (newLegs.length === 0) {
             newLegs.push({
                legId: `leg-${Date.now()}-fallback`,
                origin: currentTrip.originCity || (currentTrip.prefillDestination ? '' : ''),
                destination: currentTrip.prefillDestination || currentTrip.destinations?.[0] || '',
                departureDate: validOverallStartDate,
            });
        }
        
        return {
          ...prev,
          legs: newLegs,
          passengers: parseInt(currentTrip.numberOfTravelers || '1', 10),
          flightClass: prev.flightClass, 
        };
      });
    }
  }, [currentTrip, isStandaloneMode, today]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flightBookingFormRef.current && !flightBookingFormRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setActiveLegInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLegChange = (index: number, field: keyof Omit<FlightLegCriteria, 'legId'>, value: string) => {
    setSearchCriteria(prev => {
      const newLegs = [...prev.legs];
      const updatedLeg = { ...newLegs[index], [field]: value };

      if (field === 'departureDate' && value < today) {
        updatedLeg.departureDate = today;
      }
      
      if (field === 'destination' && index < newLegs.length - 1 && !isStandaloneMode ) { 
            newLegs[index + 1] = { ...newLegs[index + 1], origin: value };
      }
      
      if (field === 'departureDate' && index > 0 && value < newLegs[index-1].departureDate) {
        updatedLeg.departureDate = newLegs[index-1].departureDate;
      }

      newLegs[index] = updatedLeg;
      return { ...prev, legs: newLegs };
    });

    if (field === 'origin' || field === 'destination') {
      if (value.trim()) {
        const filtered = POPULAR_DESTINATIONS.filter(dest => dest.toLowerCase().includes(value.toLowerCase())).slice(0, 7);
        setAutocompleteSuggestions(filtered);
        setShowAutocomplete(filtered.length > 0);
      } else {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
      }
    }
  };
  
  const handleLegInputFocus = (legId: string, inputType: 'origin' | 'destination') => {
    setActiveLegInput({ legId, inputType });
    const leg = searchCriteria.legs.find(l => l.legId === legId);
    const currentValue = leg ? leg[inputType] : '';
    if (currentValue.trim()) {
      const filtered = POPULAR_DESTINATIONS.filter(dest => dest.toLowerCase().includes(currentValue.toLowerCase())).slice(0, 7);
      setAutocompleteSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (legIndex: number, fieldType: 'origin' | 'destination', value: string) => {
    handleLegChange(legIndex, fieldType, value);
    setShowAutocomplete(false);
    setActiveLegInput(null);
  };

  const handleAddLeg = () => {
    setSearchCriteria(prev => {
      if (prev.legs.length >= 5) return prev; 
      const lastLeg = prev.legs[prev.legs.length - 1];
      const newLegDepartureDate = lastLeg.departureDate >= today ? lastLeg.departureDate : today;
      return {
        ...prev,
        legs: [
          ...prev.legs,
          {
            legId: `leg-${Date.now()}`,
            origin: lastLeg.destination || '', 
            destination: '',
            departureDate: newLegDepartureDate,
          },
        ],
      };
    });
  };

  const handleRemoveLeg = (index: number) => {
    setSearchCriteria(prev => {
      if (prev.legs.length <= 1) return prev; 
      const newLegs = prev.legs.filter((_, i) => i !== index);
      return { ...prev, legs: newLegs };
    });
    setShowAutocomplete(false); 
  };

  const handleGlobalCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({
      ...prev,
      [name]: name === 'passengers' ? parseInt(value, 10) : value,
    }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTrip && !isStandaloneMode) {
      setSearchError("Critical trip data is missing. Cannot perform search.");
      return;
    }
    if (searchCriteria.legs.some(leg => !leg.origin || !leg.destination || !leg.departureDate)) {
        setSearchError("Please fill in all origin, destination, and departure date fields for each leg.");
        return;
    }

    setShowAutocomplete(false);
    setActiveLegInput(null);
    setSearchError(null);
    setHasSearched(true);
    const allLegsResults: Record<string, FlightBooking[]> = {};
    const newIsSearchingState: Record<string, boolean> = {};

    for (const leg of searchCriteria.legs) {
      newIsSearchingState[leg.legId] = true;
      setSearchResults(prev => ({...prev, [leg.legId]: []})); 
    }
    setIsSearching(newIsSearchingState);

    try {
      for (const leg of searchCriteria.legs) {
        const options = await fetchFlightOptions(
          leg.origin,
          leg.destination,
          leg.departureDate,
          searchCriteria.passengers,
          searchCriteria.flightClass,
          currentTrip?.travelTier,
          leg.legId
        );
        allLegsResults[leg.legId] = options;
        if (options.length === 0 && !searchError) { 
           setSearchError(prevError => prevError || `No flights found for leg: ${leg.origin} to ${leg.destination}. Try adjusting search.`);
        }
        newIsSearchingState[leg.legId] = false;
        setIsSearching(prevState => ({...prevState, [leg.legId]: false}));
        setSearchResults(prevRes => ({...prevRes, ...allLegsResults}));
      }
    } catch (err) {
      console.error("Error searching flights:", err);
      setSearchError(err instanceof Error ? err.message : "Failed to search for flights. Please try again.");
      searchCriteria.legs.forEach(leg => newIsSearchingState[leg.legId] = false);
    } finally {
       setIsSearching(newIsSearchingState);
    }
  };

  const handleSelectFlight = async (selectedOption: FlightBooking) => {
    if (!selectedOption.legId) return;
    if (!currentTrip && !isStandaloneMode) return;
    setIsProcessingSelection(selectedOption.id);

    if (currentTrip?.flights) {
        currentTrip.flights.forEach(f => {
            if (f.legId === selectedOption.legId && f.id !== selectedOption.id && f.booked) {
                updateFlightBooking(f.id, { booked: false, paymentCompleted: false });
            }
        });
    }
    addFlightBooking({ ...selectedOption, booked: true, paymentCompleted: false });
    setIsProcessingSelection(null);
  };

  const handleDeselectFlight = async (flightId: string, legId: string) => {
    setIsProcessingSelection(flightId);
    updateFlightBooking(flightId, { booked: false, paymentCompleted: false });
    setIsProcessingSelection(null);
  };

  const getSelectedFlightForLeg = (legId: string): FlightBooking | undefined => {
    return currentTrip?.flights?.find(f => f.legId === legId && f.booked);
  };

  const allLegsSelected = searchCriteria.legs.every(leg => getSelectedFlightForLeg(leg.legId));

  const handleActualNext = () => {
    if (isStandaloneMode && searchCriteria.legs.length > 0) {
      const firstLeg = searchCriteria.legs[0];
      const lastLeg = searchCriteria.legs[searchCriteria.legs.length - 1];
      
      const allDestinations = searchCriteria.legs.map(leg => leg.destination);
      let overallDates = firstLeg.departureDate;
      if (searchCriteria.legs.length > 1 && lastLeg.departureDate >= firstLeg.departureDate) {
        overallDates = `${firstLeg.departureDate} to ${lastLeg.departureDate}`;
      }

      if (
        currentTrip?.originCity !== firstLeg.origin ||
        JSON.stringify(currentTrip?.destinations) !== JSON.stringify(allDestinations) ||
        currentTrip?.dates !== overallDates
      ) {
        updateTripDetails({
          source: currentTrip?.source || 'standalone_flight', 
          originCity: firstLeg.origin,
          destinations: allDestinations,
          dates: overallDates,
          travelTier: currentTrip?.travelTier || 'lifestyle', 
          numberOfTravelers: currentTrip?.numberOfTravelers || String(searchCriteria.passengers), 
        });
      }
    }
    onNext();
  };


  if (!currentTrip && !isStandaloneMode) {
    return <div className="text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-md text-red-700 dark:text-red-300">Error: No active trip data. Please go back and start a new plan.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 py-6 sm:p-6">
      <header className="text-center py-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center justify-center">
          <FlightIcon /> {isStandaloneMode ? "Book Flights" : "Find Your Perfect Flights"}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Search and select flights {isStandaloneMode ? "for your journey" : "for each leg of your trip"}.</p>
      </header>

      <form onSubmit={handleSearch} ref={flightBookingFormRef} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        {searchCriteria.legs.map((leg, index) => (
          <div key={leg.legId} className="p-3 sm:p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-800/50 relative">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200">Leg {index + 1}</h4>
                {searchCriteria.legs.length > 1 && <button type="button" onClick={() => handleRemoveLeg(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100/50 dark:hover:bg-red-800/30 transition-colors"><MinusCircleIcon /></button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                    <label htmlFor={`origin-${leg.legId}`} className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Origin</label>
                    <input type="text" id={`origin-${leg.legId}`} value={leg.origin} onChange={(e) => handleLegChange(index, 'origin', e.target.value)} onFocus={() => handleLegInputFocus(leg.legId, 'origin')} placeholder="e.g., New York" required className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" autoComplete="off"/>
                    {activeLegInput?.legId === leg.legId && activeLegInput.inputType === 'origin' && showAutocomplete && autocompleteSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{autocompleteSuggestions.map(loc => <li key={loc} onMouseDown={() => handleAutocompleteSelect(index, 'origin', loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center"><LocationPinIcon /> {loc}</li>)}</ul></div>
                    )}
                </div>
                <div className="relative">
                    <label htmlFor={`destination-${leg.legId}`} className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Destination</label>
                    <input type="text" id={`destination-${leg.legId}`} value={leg.destination} onChange={(e) => handleLegChange(index, 'destination', e.target.value)} onFocus={() => handleLegInputFocus(leg.legId, 'destination')} placeholder="e.g., Paris" required className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" autoComplete="off"/>
                    {activeLegInput?.legId === leg.legId && activeLegInput.inputType === 'destination' && showAutocomplete && autocompleteSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{autocompleteSuggestions.map(loc => <li key={loc} onMouseDown={() => handleAutocompleteSelect(index, 'destination', loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center"><LocationPinIcon /> {loc}</li>)}</ul></div>
                    )}
                </div>
                <div>
                    <label htmlFor={`departureDate-${leg.legId}`} className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Departure Date</label>
                    <div className="relative">
                        <input type="date" id={`departureDate-${leg.legId}`} value={leg.departureDate} min={index > 0 ? searchCriteria.legs[index-1].departureDate : today} onChange={(e) => handleLegChange(index, 'departureDate', e.target.value)} onClick={handleDateInputClick} required className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"/>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon/></div>
                    </div>
                </div>
            </div>
          </div>
        ))}
        {!isStandaloneMode && searchCriteria.legs.length < 5 && <button type="button" onClick={handleAddLeg} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"><PlusCircleIcon />Add Another Leg</button>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
                <label htmlFor="passengers" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Passengers</label>
                <input type="number" name="passengers" id="passengers" value={searchCriteria.passengers} min="1" onChange={handleGlobalCriteriaChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
            </div>
            <div>
                <label htmlFor="flightClass" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Flight Class</label>
                <select name="flightClass" id="flightClass" value={searchCriteria.flightClass} onChange={handleGlobalCriteriaChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200">
                    {FLIGHT_CLASSES.map(fc => <option key={fc.value} value={fc.value}>{fc.label}</option>)}
                </select>
            </div>
        </div>
        <button type="submit" disabled={Object.values(isSearching).some(s => s)} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500">
          {(Object.values(isSearching).some(s => s)) ? <LoadingSpinner message="Searching..." size="small" /> : <><SearchIcon /> <span className="ml-2">Search Flights</span></>}
        </button>
      </form>

      {Object.values(isSearching).some(s => s) && !hasSearched && (
         <div className="flex flex-col items-center justify-center min-h-[30vh] bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
           <LoadingSpinner message="Finding perfect flights for you..." size="large" />
         </div>
      )}

      {searchError && <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">{searchError}</div>}
      
      {hasSearched && searchCriteria.legs.map((leg, legIndex) => (
          <div key={leg.legId} className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Results for Leg {legIndex + 1}: {leg.origin} to {leg.destination}</h3>
            {isSearching[leg.legId] ? <LoadingSpinner message={`Loading flights for leg ${legIndex + 1}...`}/> : 
                (searchResults[leg.legId] && searchResults[leg.legId].length > 0) ? searchResults[leg.legId].map(flight => (
                    <BookingCard<FlightBooking>
                        key={flight.id}
                        title={`${flight.airline} ${flight.flightNumber}`}
                        icon={<FlightIcon />}
                        options={[flight]}
                        onSelect={() => handleSelectFlight(flight)}
                        onDeselect={() => handleDeselectFlight(flight.id, leg.legId)}
                        selectedOptionId={getSelectedFlightForLeg(leg.legId)?.id}
                        isLoadingOptions={false}
                        isProcessingAction={isProcessingSelection === flight.id ? flight.id : null}
                    />
                )) : <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No flights found for this leg.</p>
            }
          </div>
      ))}

      <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <button onClick={onBack} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors">
          {isStandaloneMode ? "Back to Home" : "Back to Itinerary"}
        </button>
        <button onClick={handleActualNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500"
          disabled={!allLegsSelected || isProcessingSelection !== null}
        >
          Next: {isStandaloneMode ? "Payment" : "Hotels"}
        </button>
      </div>
    </div>
  );
};

// export default FlightBookingPage; // Already exported as named export
