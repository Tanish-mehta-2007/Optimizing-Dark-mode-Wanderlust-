
import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { TripContext } from '../contexts/TripContext';
import BookingCard from './BookingCard';
import LoadingSpinner from './common/LoadingSpinner';
import { HotelBooking } from '../types';
import { fetchHotelOptions } from '../services/mockBookingService';
import { POPULAR_DESTINATIONS } from '../constants';

const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400 inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
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

interface HotelSearchCriteria {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: number;
  adults: number;
  children: number;
}

interface HotelBookingPageProps {
  onNext: () => void;
  onBack: () => void;
  isStandaloneMode?: boolean;
}

const HotelBookingPage: React.FC<HotelBookingPageProps> = ({ onNext, onBack, isStandaloneMode = false }) => {
  const { currentTrip, addHotelBooking, updateHotelBooking, updateTripDetails } = useContext(TripContext);
  const today = new Date().toISOString().split('T')[0];
  const destinationInputContainerRef = useRef<HTMLDivElement>(null);

  const tripCities = useMemo(() => {
    if (isStandaloneMode || !currentTrip?.destinations || currentTrip.destinations.length === 0) return [];
    return currentTrip.destinations;
  }, [currentTrip?.destinations, isStandaloneMode]);

  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const currentCityForBooking = useMemo(() => {
    if (isStandaloneMode) return currentTrip?.prefillDestination || currentTrip?.destinations?.[0] || '';
    return tripCities[activeCityIndex] || '';
  }, [isStandaloneMode, tripCities, activeCityIndex, currentTrip?.prefillDestination, currentTrip?.destinations]);


  const [searchCriteria, setSearchCriteria] = useState<HotelSearchCriteria>(() => ({
      destination: currentCityForBooking,
      checkInDate: today,
      checkOutDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // Default 3 nights
      rooms: 1,
      adults: parseInt(currentTrip?.numberOfTravelers || '1', 10),
      children: 0,
  }));

  const [searchResults, setSearchResults] = useState<HotelBooking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [showDestinationAutocomplete, setShowDestinationAutocomplete] = useState(false);
  const [destinationAutocompleteSuggestions, setDestinationAutocompleteSuggestions] = useState<string[]>([]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationInputContainerRef.current && !destinationInputContainerRef.current.contains(event.target as Node)) {
        setShowDestinationAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const deriveDatesForCity = useCallback((city: string, cityIndex: number, allDestinations: string[], overallTripDates: string, itineraryDays?: any[]) => {
    let newCheckIn = today;
    let newCheckOut = new Date(new Date(today).setDate(new Date(today).getDate() + 3)).toISOString().split('T')[0]; // Default 3 nights
    const [overallTripStart, overallTripEnd] = overallTripDates.split(' to ');

    if (itineraryDays && itineraryDays.length > 0 && city) {
        const cityNormalized = city.split(',')[0].toLowerCase();
        const daysInThisCity = itineraryDays.filter(day => day.date && day.events.some((event: any) => event.location?.toLowerCase().includes(cityNormalized)));
        
        if (daysInThisCity.length > 0) {
            daysInThisCity.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            newCheckIn = daysInThisCity[0].date >= today ? daysInThisCity[0].date : today;

            if (cityIndex === allDestinations.length - 1) { // Last city
                newCheckOut = overallTripEnd >= newCheckIn ? overallTripEnd : new Date(new Date(newCheckIn).setDate(new Date(newCheckIn).getDate() + 1)).toISOString().split('T')[0] ;
            } else {
                const nextCityNormalized = allDestinations[cityIndex + 1].split(',')[0].toLowerCase();
                const firstDayInNextCity = itineraryDays.find(day => day.date && day.events.some((event: any) => event.location?.toLowerCase().includes(nextCityNormalized)) && new Date(day.date) > new Date(newCheckIn));
                if (firstDayInNextCity?.date) {
                    newCheckOut = firstDayInNextCity.date;
                } else { // Fallback if next city not clearly in itinerary after current
                    newCheckOut = daysInThisCity[daysInThisCity.length -1].date;
                    newCheckOut = new Date(new Date(newCheckOut).setDate(new Date(newCheckOut).getDate() + 1)).toISOString().split('T')[0]; // Stay at least one night
                    if (newCheckOut > overallTripEnd) newCheckOut = overallTripEnd;
                }
            }
             if (new Date(newCheckOut) <= new Date(newCheckIn)) { // Ensure checkout is after checkin
                newCheckOut = new Date(new Date(newCheckIn).setDate(new Date(newCheckIn).getDate() + 1)).toISOString().split('T')[0];
            }
        } else { // No specific itinerary days for this city
            if (cityIndex === 0) newCheckIn = overallTripStart >= today ? overallTripStart : today;
            // For subsequent cities without specific days, it's harder. For now, use overall trip end or default duration.
            newCheckOut = overallTripEnd >= newCheckIn ? overallTripEnd : new Date(new Date(newCheckIn).setDate(new Date(newCheckIn).getDate() + 3)).toISOString().split('T')[0];
        }
    } else { // Standalone or no itinerary
        newCheckIn = (currentTrip?.prefillDates?.split(' to ')[0] || overallTripStart || today);
        newCheckIn = newCheckIn >= today ? newCheckIn : today;
        const prefillEndDate = currentTrip?.prefillDates?.split(' to ')[1] || currentTrip?.prefillDates;
        newCheckOut = prefillEndDate || overallTripEnd || new Date(new Date(newCheckIn).setDate(new Date(newCheckIn).getDate() + 3)).toISOString().split('T')[0];
        if (new Date(newCheckOut) <= new Date(newCheckIn)) {
            newCheckOut = new Date(new Date(newCheckIn).setDate(new Date(newCheckIn).getDate() + 1)).toISOString().split('T')[0];
        }
    }
    return { checkInDate: newCheckIn, checkOutDate: newCheckOut };
  }, [currentTrip?.prefillDates, today]);


  useEffect(() => {
    if (currentTrip) {
      const cityForDates = isStandaloneMode ? (currentTrip.prefillDestination || currentTrip.destinations?.[0] || '') : tripCities[activeCityIndex];
      const { checkInDate, checkOutDate } = deriveDatesForCity(
          cityForDates, 
          activeCityIndex, 
          tripCities, 
          currentTrip.dates || `${today} to ${today}`, 
          currentTrip.itinerary?.dailyBreakdown
      );
      setSearchCriteria(prev => ({
        ...prev,
        destination: currentCityForBooking,
        checkInDate,
        checkOutDate,
        adults: parseInt(currentTrip.numberOfTravelers || '1', 10),
      }));
      setSearchResults([]); 
      setHasSearched(false);
      setSearchError(null);
    }
  }, [currentTrip, activeCityIndex, tripCities, isStandaloneMode, today, deriveDatesForCity, currentCityForBooking]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
        let newState = {
          ...prev,
          [name]: ['rooms', 'adults', 'children'].includes(name) ? parseInt(value, 10) : value,
        };
        if (name === "checkInDate") {
            const newCheckInDate = value < today ? today : value;
            newState.checkInDate = newCheckInDate;
            if (newState.checkOutDate && newCheckInDate > newState.checkOutDate) {
                newState.checkOutDate = newCheckInDate;
            }
        }
        if (name === "checkOutDate" && newState.checkInDate && value < newState.checkInDate) {
            newState.checkOutDate = newState.checkInDate;
        }
      return newState;
    });
    
    if (name === 'destination') {
      if (value.trim()) {
        const filtered = POPULAR_DESTINATIONS.filter(dest => dest.toLowerCase().includes(value.toLowerCase())).slice(0, 7);
        setDestinationAutocompleteSuggestions(filtered);
        setShowDestinationAutocomplete(filtered.length > 0);
      } else {
        setDestinationAutocompleteSuggestions([]);
        setShowDestinationAutocomplete(false);
      }
    }
  };
  
  const handleDestinationAutocompleteSelect = (destination: string) => {
    setSearchCriteria(prev => ({ ...prev, destination }));
    setShowDestinationAutocomplete(false);
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
     if (!currentTrip && !isStandaloneMode) {
      setSearchError("Critical trip data is missing. Cannot perform search.");
      return;
    }
    if (!searchCriteria.destination) {
        setSearchError("Please select a destination city for hotel booking.");
        return;
    }
    setShowDestinationAutocomplete(false);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);

    try {
      const options = await fetchHotelOptions(
        searchCriteria.destination,
        searchCriteria.checkInDate,
        searchCriteria.checkOutDate,
        searchCriteria.rooms,
        searchCriteria.adults,
        searchCriteria.children,
        currentTrip?.travelTier
      );
      setSearchResults(options);
       if (options.length === 0) {
        setSearchError("No hotels found matching your criteria. Try adjusting your search.");
      }
    } catch (err) {
      console.error("Error searching hotels:", err);
      setSearchError(err instanceof Error ? err.message : "Failed to search for hotels. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchCriteria, currentTrip, isStandaloneMode]);


  const handleSelectHotel = async (selectedOption: HotelBooking) => {
    if (!currentTrip && !isStandaloneMode) return;
    setIsProcessingSelection(selectedOption.id);
    addHotelBooking({ ...selectedOption, booked: true, paymentCompleted: false, destinationCity: searchCriteria.destination });
    setIsProcessingSelection(null);
  };

  const handleDeselectHotel = async (hotelId: string) => {
    const hotelToDeselect = currentTrip?.hotels?.find(h => h.id === hotelId && h.destinationCity === searchCriteria.destination);
    if (!hotelToDeselect) return;

    setIsProcessingSelection(hotelId);
    updateHotelBooking(hotelId, { booked: false, paymentCompleted: false });
    setIsProcessingSelection(null);
  };

  const selectedHotelForCurrentCity = currentTrip?.hotels?.find(h => h.destinationCity === searchCriteria.destination && h.booked);

  const handleNextNavigation = () => {
     if (isStandaloneMode && searchCriteria.destination) {
        if (!currentTrip?.destinations || currentTrip.destinations.length === 0 || currentTrip.destinations[0] !== searchCriteria.destination || currentTrip.dates !== `${searchCriteria.checkInDate} to ${searchCriteria.checkOutDate}`) {
            updateTripDetails({
                source: currentTrip?.source || 'standalone_hotel',
                destinations: [searchCriteria.destination],
                dates: `${searchCriteria.checkInDate} to ${searchCriteria.checkOutDate}`,
                travelTier: currentTrip?.travelTier || 'lifestyle',
                numberOfTravelers: currentTrip?.numberOfTravelers || String(searchCriteria.adults + searchCriteria.children)
            });
        }
    }

    if (isStandaloneMode) {
      onNext(); 
      return;
    }
    if (activeCityIndex < tripCities.length - 1) {
      setActiveCityIndex(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const allCitiesDone = isStandaloneMode || activeCityIndex >= tripCities.length - 1;
  const nextButtonText = isStandaloneMode ? "Next: Payment" : (allCitiesDone ? "Next: Car Rental" : `Next: Hotel for ${tripCities[activeCityIndex+1]?.split(',')[0] || ''}`);


  if (!currentTrip && !isStandaloneMode) {
    return <div className="text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-md text-red-700 dark:text-red-300">Error: No active trip data.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0">
      <header className="text-center py-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center justify-center">
          <HotelIcon /> {isStandaloneMode ? "Book a Hotel" : `Hotel for ${searchCriteria.destination.split(',')[0] || 'Your Destination'}`}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Search and select hotels {isStandaloneMode ? "for your needs" : `for your stay in ${searchCriteria.destination.split(',')[0] || 'this city'}`}.</p>
      </header>

      {!isStandaloneMode && tripCities.length > 1 && (
        <div className="mb-6 px-4 sm:px-0">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Select city for hotel booking:</label>
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            {tripCities.map((city, index) => (
              <button
                key={city}
                onClick={() => setActiveCityIndex(index)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors
                            ${activeCityIndex === index
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                            }`}
              >
                {city.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <div ref={destinationInputContainerRef} className="relative">
            <label htmlFor="destinationHotel" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Destination</label>
            <input 
              type="text" 
              name="destination" 
              id="destinationHotel" 
              value={searchCriteria.destination} 
              onChange={handleInputChange} 
              onFocus={() => { if (searchCriteria.destination.trim()) setShowDestinationAutocomplete(true); }}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
              placeholder="e.g., Paris" required 
              readOnly={!isStandaloneMode && tripCities.length > 0 && !!tripCities[activeCityIndex]} 
              autoComplete="off"
            />
            {showDestinationAutocomplete && destinationAutocompleteSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <ul className="py-1">{destinationAutocompleteSuggestions.map(loc => <li key={loc} onMouseDown={() => handleDestinationAutocompleteSelect(loc)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer flex items-center"><LocationPinIcon /> {loc}</li>)}</ul>
              </div>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Check-in Date</label>
            <div className="relative">
                <input type="date" name="checkInDate" id="checkInDate" value={searchCriteria.checkInDate} min={today} onChange={handleInputChange} onClick={handleDateInputClick} className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer" required />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon /></div>
            </div>
          </div>
          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Check-out Date</label>
            <div className="relative">
                <input type="date" name="checkOutDate" id="checkOutDate" value={searchCriteria.checkOutDate} min={searchCriteria.checkInDate || today} onChange={handleInputChange} onClick={handleDateInputClick} className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer" required />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon /></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rooms" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Rooms</label>
            <input type="number" name="rooms" id="rooms" value={searchCriteria.rooms} min="1" onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
          </div>
          <div>
            <label htmlFor="adults" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Adults</label>
            <input type="number" name="adults" id="adults" value={searchCriteria.adults} min="1" onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" required />
          </div>
          <div>
            <label htmlFor="children" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Children</label>
            <input type="number" name="children" id="children" value={searchCriteria.children} min="0" onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200" />
          </div>
        </div>
        <button type="submit" disabled={isSearching || !searchCriteria.destination} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500">
          {isSearching ? <LoadingSpinner message="Searching..." size="small" /> : <><SearchIcon /> <span className="ml-2">Search Hotels</span></>}
        </button>
      </form>

      {isSearching && !searchResults.length && (
         <div className="flex flex-col items-center justify-center min-h-[30vh] bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
           <LoadingSpinner message="Finding perfect hotels for you..." size="large" />
         </div>
      )}

      {searchError && <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">{searchError}</div>}

      {!isSearching && hasSearched && searchResults.length > 0 && (
        <div className="space-y-4 px-4 sm:px-0">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 mt-6 mb-2">Search Results for {searchCriteria.destination} ({searchResults.length})</h3>
          {searchResults.map(hotel => (
            <BookingCard<HotelBooking>
              key={hotel.id}
              title={hotel.name}
              icon={<HotelIcon />}
              options={[hotel]}
              onSelect={() => handleSelectHotel(hotel)}
              onDeselect={() => handleDeselectHotel(hotel.id)}
              selectedOptionId={selectedHotelForCurrentCity?.id}
              isLoadingOptions={false}
              isProcessingAction={isProcessingSelection === hotel.id ? hotel.id : null}
            />
          ))}
        </div>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && !searchError && (
        <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No hotels found for {searchCriteria.destination.split(',')[0]} matching your criteria.</p>
      )}


      <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 px-4 sm:px-0">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors"
        >
          {isStandaloneMode ? "Back to Home" : "Back to Flights"}
        </button>
        <button
          onClick={handleNextNavigation}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500"
          disabled={(!selectedHotelForCurrentCity && !isStandaloneMode && tripCities.length > 0 && activeCityIndex < tripCities.length) || isProcessingSelection !== null}
        >
          {nextButtonText}
        </button>
      </div>
    </div>
  );
};

export default HotelBookingPage;
