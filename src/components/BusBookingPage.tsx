
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { TripContext } from '../contexts/TripContext';
import BookingCard from './BookingCard';
import LoadingSpinner from './common/LoadingSpinner';
import { BusBooking, Trip, AppView } from '../../types';
import { fetchBusOptions } from '../services/mockBookingService'; 
import { POPULAR_DESTINATIONS } from '../constants';

const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400 inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m0-2.25h.008v.008h-.008V12m0 0c0-2.414-1.093-4.53-2.764-5.858M3.375 16.5c1.135 0 2.187.229 3.137.635m11.49-.492c.95.406 1.992.635 3.137.635M12 4.5V2.25m0 2.25V2.25m0 2.25v2.25M5.25 6.75C5.25 9.96 8.28 12.45 12 12.45s6.75-2.49 6.75-5.7S15.72 1.5 12 1.5S5.25 3.04 5.25 6.75z" /></svg>; 
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

interface BusSearchCriteria {
  originTerminal: string;
  destinationTerminal: string;
  departureDate: string;
  passengers: number;
}

interface BusBookingPageProps {
  onNext: () => void;
  onBack: () => void;
  isStandaloneMode?: boolean;
}

const BusBookingPage: React.FC<BusBookingPageProps> = ({ onNext, onBack, isStandaloneMode = false }) => {
  const { currentTrip, addBusBooking, updateBusBooking, updateTripDetails } = useContext(TripContext);
  const today = new Date().toISOString().split('T')[0];
  const formRef = useRef<HTMLFormElement>(null);

  const [searchCriteria, setSearchCriteria] = useState<BusSearchCriteria>({
    originTerminal: currentTrip?.originCity || currentTrip?.prefillDestination || '',
    destinationTerminal: currentTrip?.destinations?.[0] || currentTrip?.prefillDestination || '',
    departureDate: currentTrip?.prefillDates?.split(' to ')[0] || currentTrip?.dates?.split(' to ')[0] || today,
    passengers: parseInt(currentTrip?.numberOfTravelers || '1', 10),
  });

  const [searchResults, setSearchResults] = useState<BusBooking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeInput, setActiveInput] = useState<'originTerminal' | 'destinationTerminal' | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    if (currentTrip) {
        const tripStartDate = currentTrip.dates?.split(' to ')[0] || currentTrip.dates;
        const validStartDate = tripStartDate >= today ? tripStartDate : today;
      setSearchCriteria(prev => ({
        ...prev,
        originTerminal: currentTrip.originCity || currentTrip.prefillDestination || prev.originTerminal,
        destinationTerminal: currentTrip.destinations?.[0] || currentTrip.prefillDestination || prev.destinationTerminal,
        departureDate: currentTrip.prefillDates?.split(' to ')[0] || validStartDate,
        passengers: parseInt(currentTrip.numberOfTravelers || '1', 10),
      }));
    }
  }, [currentTrip, today]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setActiveInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
      let newState = { ...prev, [name]: value };
      if (name === "departureDate" && value < today) newState.departureDate = today;
      return newState;
    });
    if (name === 'originTerminal' || name === 'destinationTerminal') {
      setActiveInput(name as 'originTerminal' | 'destinationTerminal');
      if (value.trim()) {
        const filtered = POPULAR_DESTINATIONS.filter(d => d.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
        setAutocompleteSuggestions(filtered);
        setShowAutocomplete(filtered.length > 0);
      } else {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
      }
    }
  };
  
  const handleAutocompleteSelect = (value: string) => {
    if (activeInput) {
      setSearchCriteria(prev => ({ ...prev, [activeInput]: value }));
    }
    setShowAutocomplete(false);
    setActiveInput(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCriteria.originTerminal || !searchCriteria.destinationTerminal) {
      setSearchError("Please enter origin and destination terminals."); return;
    }
    setIsSearching(true); setSearchError(null); setSearchResults([]); setHasSearched(true);
    try {
      const options = await fetchBusOptions(
        searchCriteria.originTerminal, searchCriteria.destinationTerminal,
        searchCriteria.departureDate, searchCriteria.passengers,
        currentTrip?.travelTier
      );
      setSearchResults(options);
      if (options.length === 0) setSearchError("No buses found. Try different criteria.");
    } catch (err) { setSearchError(err instanceof Error ? err.message : "Failed to search for buses.");
    } finally { setIsSearching(false); }
  };

  const handleSelectBus = async (selectedOption: BusBooking) => {
     if (!currentTrip && !isStandaloneMode) return;
    setIsProcessingSelection(selectedOption.id);
    const busToSet: BusBooking = { ...selectedOption, booked: true, paymentCompleted: false, bookingSource: 'system_booked' };
    addBusBooking(busToSet);
    if (currentTrip && currentTrip.source === 'standalone_bus') { // Ensure type consistency
      updateTripDetails({ ...currentTrip, buses: [busToSet] });
    }
    setIsProcessingSelection(null);
  };

  const handleDeselectBus = async (busId: string) => {
    setIsProcessingSelection(busId);
    updateBusBooking(busId, { booked: false, paymentCompleted: false });
    setIsProcessingSelection(null);
  };
  
  const selectedBus = currentTrip?.buses?.find(b => b.booked);
  
  const handleActualNext = () => {
    if (isStandaloneMode && currentTrip?.source === 'standalone_bus') {
        updateTripDetails({ 
            ...currentTrip,
            originCity: searchCriteria.originTerminal, // Assuming terminal can be used as originCity here
            destinations: [searchCriteria.destinationTerminal],
            dates: searchCriteria.departureDate,
        });
    }
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 py-6 sm:p-6">
        <header className="text-center py-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2 flex items-center justify-center">
            <BusIcon /> {isStandaloneMode ? "Book Bus Tickets" : "Add Bus Journey"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Find and select bus options for your travel.</p>
        </header>

        <form onSubmit={handleSearch} ref={formRef} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><label htmlFor="originTerminal" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Origin Terminal</label><input type="text" name="originTerminal" id="originTerminal" value={searchCriteria.originTerminal} onChange={handleInputChange} onFocus={() => setActiveInput('originTerminal')} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="e.g., NYC Port Authority" required autoComplete="off" />
              {activeInput === 'originTerminal' && showAutocomplete && <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto">{autocompleteSuggestions.map(s => <li key={`orig-${s}`} onMouseDown={() => handleAutocompleteSelect(s)} className="px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer list-item-interactive flex items-center"><LocationPinIcon/> {s}</li>)}</ul>}
            </div>
            <div className="relative"><label htmlFor="destinationTerminal" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Destination Terminal</label><input type="text" name="destinationTerminal" id="destinationTerminal" value={searchCriteria.destinationTerminal} onChange={handleInputChange} onFocus={() => setActiveInput('destinationTerminal')} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" placeholder="e.g., Boston South Station" required autoComplete="off" />
              {activeInput === 'destinationTerminal' && showAutocomplete && <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto">{autocompleteSuggestions.map(s => <li key={`dest-${s}`} onMouseDown={() => handleAutocompleteSelect(s)} className="px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-600 cursor-pointer list-item-interactive flex items-center"><LocationPinIcon/> {s}</li>)}</ul>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="departureDateBus" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Departure Date</label><div className="relative"><input type="date" name="departureDate" id="departureDateBus" value={searchCriteria.departureDate} min={today} onChange={handleInputChange} onClick={handleDateInputClick} className="appearance-none w-full p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm cursor-pointer" required /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon /></div></div></div>
            <div><label htmlFor="passengersBus" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Passengers</label><input type="number" name="passengers" id="passengersBus" value={searchCriteria.passengers} min="1" onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" required /></div>
          </div>
          <button type="submit" disabled={isSearching} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive">
            {isSearching ? <LoadingSpinner message="Searching..." size="small" /> : <><SearchIcon /> <span className="ml-2">Search Buses</span></>}
          </button>
        </form>

        {isSearching && !hasSearched && <div className="flex justify-center p-6"><LoadingSpinner message="Finding bus options..." size="large"/></div>}
        {searchError && <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">{searchError}</div>}

        {hasSearched && !isSearching && searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Available Buses ({searchResults.length})</h3>
            {searchResults.map(bus => (
              <BookingCard<BusBooking>
                key={bus.id}
                title={`${bus.busCompany} ${bus.busNumber || ''}`}
                icon={<BusIcon />} 
                options={[{...bus, details: `${bus.details} - ${bus.seatType || 'Standard'}`, price: bus.price || 0}]}
                onSelect={() => handleSelectBus(bus)}
                onDeselect={() => handleDeselectBus(bus.id)}
                selectedOptionId={selectedBus?.id}
                isLoadingOptions={false}
                isProcessingAction={isProcessingSelection === bus.id ? bus.id : null}
              />
            ))}
          </div>
        )}
        {hasSearched && !isSearching && searchResults.length === 0 && !searchError && <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">No buses found for your search criteria.</p>}

        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <button onClick={onBack} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors button-interactive">
             Back
          </button>
          <button onClick={handleActualNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive"
            disabled={!selectedBus || isProcessingSelection !== null}>
            Next: Payment
          </button>
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

export default BusBookingPage;
