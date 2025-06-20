
import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { TripContext } from '../contexts/TripContext';
import { generateItinerary } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { TRAVEL_TYPES, TRAVEL_TIERS, POPULAR_DESTINATIONS } from '../constants';
import { TripFormData, UserPreferences, Coordinates } from '../../types';
import { getUserPreferences } from '../services/storageService';
// Removed ItineraryMap import

const LocationPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.4l-4.71-4.711a6.5 6.5 0 119.192-9.192A6.5 6.5 0 0110 18.4zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const CalendarIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MinusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
// const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400"><path d="M5.75 3A2.25 2.25 0 003.5 5.25v9.5A2.25 2.25 0 005.75 17h8.5A2.25 2.25 0 0016.5 14.75v-9.5A2.25 2.25 0 0014.25 3H5.75zM4.5 5.25c0-.69.56-1.25 1.25-1.25h8.5c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /><path d="M7.5 6.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zM7 9.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM7 12.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" /></svg>; // SummaryIcon not used if summary pane removed

interface StructuredItineraryBuilderPageProps {
  onItineraryGenerated: () => void;
}

const StructuredItineraryBuilderPage: React.FC<StructuredItineraryBuilderPageProps> = ({ onItineraryGenerated }) => {
  const { updateTripDetails, setItinerary, currentTrip } = useContext(TripContext);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<TripFormData>(() => {
    const prefs = getUserPreferences();
    const initialStartDate = today;
    const initialEndDate = new Date(new Date(initialStartDate).setDate(new Date(initialStartDate).getDate() + 7)).toISOString().split('T')[0];
    return {
      travelType: TRAVEL_TYPES[0],
      originCity: currentTrip?.originCity || '',
      destinations: currentTrip?.destinations?.length ? currentTrip.destinations : [''],
      startDate: initialStartDate,
      endDate: initialEndDate,
      numberOfTravelers: currentTrip?.numberOfTravelers || '1',
      travelTier: currentTrip?.travelTier || prefs?.defaultTravelTier || TRAVEL_TIERS[0].id,
      specialOccasion: currentTrip?.specialOccasion || '',
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showOriginAutocomplete, setShowOriginAutocomplete] = useState(false);
  const [filteredOriginSuggestions, setFilteredOriginSuggestions] = useState<string[]>([]);
  const originInputContainerRef = useRef<HTMLDivElement>(null);

  const [activeDestinationIndex, setActiveDestinationIndex] = useState<number | null>(null);
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState<string[]>([]);
  const destinationInputContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  // const [mapLocations, setMapLocations] = useState<(string | Coordinates)[]>([]); // Removed mapLocations state

  useEffect(() => {
    if (currentTrip && currentTrip.source === 'form') {
        const datesParts = currentTrip.dates?.split(' to ') || [today, today];
        const parsedStartDate = new Date(datesParts[0] < today ? today : datesParts[0]);
        const parsedEndDate = datesParts[1] ? new Date(datesParts[1]) : new Date(new Date(parsedStartDate).setDate(parsedStartDate.getDate() + 7));
        if (parsedEndDate < parsedStartDate) parsedEndDate.setDate(parsedStartDate.getDate());
        
        setFormData(prev => ({
            ...prev,
            travelType: currentTrip.travelType || TRAVEL_TYPES[0],
            originCity: currentTrip.originCity || '',
            destinations: currentTrip.destinations?.length ? currentTrip.destinations : [''],
            startDate: parsedStartDate.toISOString().split('T')[0],
            endDate: parsedEndDate.toISOString().split('T')[0],
            numberOfTravelers: currentTrip.numberOfTravelers || '1',
            travelTier: currentTrip.travelTier || TRAVEL_TIERS[0].id,
            specialOccasion: currentTrip.specialOccasion || '',
        }));
    }
  }, [currentTrip, today]);

  // Removed: This useEffect was for updating mapLocations
  // useEffect(() => { 
  //   const newMapLocations: (string | Coordinates)[] = [];
  //   if (formData.originCity.trim()) newMapLocations.push(formData.originCity);
  //   formData.destinations.forEach(dest => { if (dest.trim()) newMapLocations.push(dest); });
  //   setMapLocations(newMapLocations);
  // }, [formData.originCity, formData.destinations]);

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setFormData(prev => ({ ...prev, destinations: newDestinations }));
    if (value.trim()) {
        setFilteredDestinationSuggestions(POPULAR_DESTINATIONS.filter(d => d.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
        setActiveDestinationIndex(index);
    } else {
        setActiveDestinationIndex(null);
        setFilteredDestinationSuggestions([]);
    }
  };

  const handleAddDestination = () => {
    if (formData.destinations.length < 5) {
        setFormData(prev => ({ ...prev, destinations: [...prev.destinations, ''] }));
    }
  };

  const handleRemoveDestination = (index: number) => {
    if (formData.destinations.length <= 1) return;
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, destinations: newDestinations }));
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; // Type assertion
    const { name, value } = target;
    setFormData(prev => {
        let newState = { ...prev, [name]: value };
        if (name === "startDate") {
            const newStartDate = value < today ? today : value;
            newState.startDate = newStartDate;
            if (newState.endDate && newStartDate > newState.endDate) newState.endDate = newStartDate;
        }
        if (name === "endDate" && newState.startDate && value < newState.startDate) newState.endDate = newState.startDate;
        return newState;
    });
    if (name === 'originCity') {
        if (value.trim()) {
            setFilteredOriginSuggestions(POPULAR_DESTINATIONS.filter(d => d.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
            setShowOriginAutocomplete(true);
        } else setShowOriginAutocomplete(false);
    }
  }, [today]);
  
  const handleOriginAutocompleteSelect = (location: string) => {
    setFormData(prev => ({ ...prev, originCity: location }));
    setShowOriginAutocomplete(false);
  };

  const handleDestinationAutocompleteSelect = (index: number, location: string) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = location;
    setFormData(prev => ({ ...prev, destinations: newDestinations }));
    setActiveDestinationIndex(null);
  };
  
  const handleTierChange = useCallback((tierId: string) => setFormData(prev => ({ ...prev, travelTier: tierId })), []);
  
  const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = event.currentTarget;
    if (inputElement && typeof inputElement.showPicker === 'function') {
      try { inputElement.showPicker(); } catch (e) { console.warn("Could not programmatically open date picker:", e); }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originInputContainerRef.current && !originInputContainerRef.current.contains(event.target as Node)) setShowOriginAutocomplete(false);
      if (!destinationInputContainerRefs.current.some(ref => ref && ref.contains(event.target as Node))) setActiveDestinationIndex(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalDestinations = formData.destinations.filter(d => d.trim());
    if (!formData.originCity || finalDestinations.length === 0) {
        setError("Origin city and at least one destination are required.");
        return;
    }
    setIsLoading(true);
    try {
      updateTripDetails({
        source: 'form', originCity: formData.originCity, destinations: finalDestinations,
        dates: `${formData.startDate} to ${formData.endDate}`, travelType: formData.travelType,
        travelTier: formData.travelTier, specialOccasion: formData.specialOccasion || undefined,
        numberOfTravelers: formData.numberOfTravelers,
      });
      const itinerary = await generateItinerary({ ...formData, destinations: finalDestinations });
      setItinerary(itinerary);
      onItineraryGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Removed selectedTierDetails as summary pane is removed

  const FormInputGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={`space-y-4 ${className || ''}`}>{children}</div>;
  const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        <input id={id} {...props} className={`w-full p-3 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 ${props.className || ''}`} />
    </div>
  );
  const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {label: string}> = ({label, id, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        <select id={id} {...props} className={`w-full p-3 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-700 dark:text-slate-200 ${props.className || ''}`}>
            {children}
        </select>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar">
      <div className="p-4 sm:p-6"> {/* Full width */}
        <div className="max-w-2xl mx-auto"> {/* Centered content */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Let's Plan Your Adventure!</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Fill in the details below to get started.</p>
            </header>
            {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-800/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="bg-white dark:bg-slate-800/70 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Where & When?</h2>
                    <FormInputGroup>
                        <div className="relative" ref={originInputContainerRef}>
                            <FormInput label="From (Origin City)" type="text" id="originCity" name="originCity" value={formData.originCity} onChange={handleChange} onFocus={() => {if(formData.originCity.trim()) setShowOriginAutocomplete(true);}} placeholder="e.g., New York, USA" required autoComplete="off"/>
                            {showOriginAutocomplete && filteredOriginSuggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"><ul className="py-1">{filteredOriginSuggestions.map(loc => <li key={`orig-${loc}`} onMouseDown={() => handleOriginAutocompleteSelect(loc)} className="px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-600/50 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon/>{loc}</li>)}</ul></div>)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">To (Destination Cities - max 5)</label>
                            {formData.destinations.map((destination, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2.5" ref={el => { destinationInputContainerRefs.current[index] = el; }}>
                                    <div className="relative flex-grow"><input type="text" id={`destination-${index}`} value={destination} onChange={(e) => handleDestinationChange(index, e.target.value)} onFocus={() => {if(destination.trim()) setActiveDestinationIndex(index);}} placeholder={`City ${index + 1}`} required autoComplete="off" className="w-full p-3 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-slate-700 dark:text-slate-200"/>
                                    {activeDestinationIndex === index && filteredDestinationSuggestions.length > 0 && (<div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto"><ul className="py-1">{filteredDestinationSuggestions.map(dest => <li key={`dest-${index}-${dest}`} onMouseDown={() => handleDestinationAutocompleteSelect(index, dest)} className="px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-600/50 cursor-pointer flex items-center list-item-interactive"><LocationPinIcon/>{dest}</li>)}</ul></div>)}</div>
                                    {formData.destinations.length > 1 && <button type="button" onClick={() => handleRemoveDestination(index)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100/50 dark:hover:bg-red-800/30 transition-colors button-interactive"><MinusCircleIcon/></button>}
                                </div>))}
                            {formData.destinations.length < 5 && <button type="button" onClick={handleAddDestination} className="mt-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center button-interactive"><PlusCircleIcon/>Add another city</button>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label><div className="relative"><input type="date" id="startDate" name="startDate" value={formData.startDate} min={today} onChange={handleChange} onClick={handleDateInputClick} required className="appearance-none w-full p-3 pr-10 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm cursor-pointer text-slate-700 dark:text-slate-200"/><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon/></div></div></div>
                            <div><label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label><div className="relative"><input type="date" id="endDate" name="endDate" value={formData.endDate} min={formData.startDate || today} onChange={handleChange} onClick={handleDateInputClick} required className="appearance-none w-full p-3 pr-10 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm cursor-pointer text-slate-700 dark:text-slate-200"/><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon/></div></div></div>
                        </div>
                    </FormInputGroup>
                </section>
                <section className="bg-white dark:bg-slate-800/70 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Travel Details</h2>
                    <FormInputGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect label="Travelers" id="numberOfTravelers" name="numberOfTravelers" value={formData.numberOfTravelers} onChange={handleChange}>{[...Array(10).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}<option value="10+">10+</option></FormSelect>
                        <FormSelect label="Travel Type" id="travelType" name="travelType" value={formData.travelType} onChange={handleChange}>{TRAVEL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</FormSelect>
                    </FormInputGroup>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Travel Style</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            {TRAVEL_TIERS.map(tier => (<button type="button" key={tier.id} onClick={() => handleTierChange(tier.id)} aria-pressed={formData.travelTier === tier.id} className={`p-2 sm:p-3 rounded-lg text-left transition-all border-2 shadow-sm button-interactive ${formData.travelTier === tier.id ? 'bg-blue-600 dark:bg-blue-500 border-blue-700 text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-blue-500' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}`}><h4 className="font-semibold text-xs sm:text-sm">{tier.name}</h4><p className={`text-[10px] sm:text-xs ${formData.travelTier === tier.id ? 'text-blue-100 dark:text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>{tier.description}</p></button>))}
                        </div>
                    </div>
                    <div className="mt-4"><FormInput label="Special Occasion (Optional)" type="text" id="specialOccasion" name="specialOccasion" value={formData.specialOccasion} onChange={handleChange} placeholder="e.g., Anniversary, Birthday"/></div>
                </section>
                <div className="pt-4"><button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg shadow-md transition-colors disabled:opacity-70 flex items-center justify-center text-base button-interactive">{isLoading ? <LoadingSpinner message="Crafting your journey..." size="small"/> : 'Generate Itinerary'}</button></div>
            </form>
        </div>
      </div>
       <style>{`
        .h-screen-minus-header { height: calc(100vh - var(--header-height, 64px)); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  );
};
export default StructuredItineraryBuilderPage;