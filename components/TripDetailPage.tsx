
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { TripContext } from '../contexts/TripContext';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext'; // Import AuthContextType
import { getTripById, saveTrip } from '../services/storageService';
import { Trip, ItineraryItem, FlightStatusData, PlaceSuggestion, DailyItinerary, FlightBooking, HotelBooking, CarRental, TrainBooking, BookingSource } from '../types';
import ItineraryMap from './ItineraryMap';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import { fetchFlightStatus, fetchPlaceSuggestions } from '../services/geminiService';
import { ImageWithFallback, ImagePlaceholder } from './common/ImageDisplayUtils';

// --- Icons ---
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const FlightIcon = ({className = "w-5 h-5 mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const HotelIcon = ({className = "w-5 h-5 mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
const CarIcon = ({className = "w-5 h-5 mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;
const TrainIcon = ({className = "w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M5.25 6.75V17.25m13.5-10.5v10.5m-13.5 0L5.25 15M12 17.25l-1.5-2.25M18.75 17.25l-1.5-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5A6.75 6.75 0 019.75 6.75h4.5A6.75 6.75 0 0121 13.5" /></svg>;
const BudgetIcon = ({className = "w-5 h-5 mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const SuggestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.995 15.995 0 01-5.25 0M10.5 14.25h3M12 12.75a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-4.5 0v3.75a2.25 2.25 0 002.25 2.25z" /></svg>;
const AddToItineraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const EditIcon = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const DeleteIcon = ({className="w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m-3.22-.096L3.75 5.79m0 0c0-.02.017-.038.037-.056L5.03 4.232a1.875 1.875 0 011.64-.781c.535 0 1.024.21 1.39.557l8.063 8.063q.256 .255 .577 .478l.558 .417c.16.12.296.256.413.403M4.772 5.79L3.75 5.79" /></svg>;
const AddIcon = ({className = "w-4 h-4"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const DragHandleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 cursor-grab"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
const HeartIconOutline = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const HeartIconSolid = ({ className = "w-4 h-4 text-red-500" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1"><path d="M13 4.5a2.5 2.5 0 11.702 4.229l-4.11 2.055a2.5 2.5 0 110 2.432l4.11 2.055A2.5 2.5 0 1113 15.5V4.5z" /><path d="M3 4.5a2.5 2.5 0 115 0V15.5a2.5 2.5 0 11-5 0V4.5z" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>;

interface TripDetailPageProps { tripId: string; onNavigateBack: () => void; }
interface EventFormProps { initialData: Partial<ItineraryItem>; onSave: (data: ItineraryItem) => void; onCancel: () => void; isSaving: boolean;}

// Simplified Event Form for brevity. Can be expanded or refactored.
const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<ItineraryItem>>(initialData);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity) { alert("Activity name is required."); return; }
    onSave({
      identifier: formData.identifier || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      time: formData.time || "Flexible", activity: formData.activity!, description: formData.description,
      location: formData.location, cost: formData.cost, imageUrl: formData.imageUrl, source: 'user',
      likes: formData.likes || [] // Ensure likes is initialized
    });
  };
   return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-b-md -mt-px">
      <input type="time" name="time" value={formData.time || ''} onChange={handleChange} className="w-full p-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-600" placeholder="Time"/>
      <input type="text" name="activity" value={formData.activity || ''} onChange={handleChange} required className="w-full p-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-600" placeholder="Activity Name*"/>
      <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md resize-none dark:bg-slate-600" placeholder="Description" rows={2}></textarea>
      <div className="flex justify-end space-x-2 pt-1">
        <button type="button" onClick={onCancel} disabled={isSaving} className="px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md transition button-interactive">Cancel</button>
        <button type="submit" disabled={isSaving} className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-70 button-interactive">
          {isSaving ? <LoadingSpinner size="small" message="" /> : 'Save'}
        </button>
      </div>
    </form>
  );
};


const PlaceDetailCard: React.FC<{event: ItineraryItem | null, onClose: () => void}> = ({event, onClose}) => {
    if (!event) return null;
    return (
        <div className="bg-white dark:bg-slate-800 p-4 shadow-lg rounded-t-lg border-t border-x border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                   <span className="text-blue-500 mr-2 text-xl">📍</span> {/* Using emoji as placeholder */}
                   {event.activity}
                </h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 button-interactive"><CloseIcon/></button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{event.description || "No description available."}</p>
            {event.location && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Address: {event.location}</p>}
            {/* Placeholder for other details like ratings, hours, etc. */}
             <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.activity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium interactive-element" // Added interactive-element
                    role="link" // Explicit role for <a> that acts like a link
                    tabIndex={0} // Make it focusable
                >
                    Open in Google Maps <ExternalLinkIcon/>
                </a>
            </div>
        </div>
    );
}

export const TripDetailPage: React.FC<TripDetailPageProps> = ({ tripId, onNavigateBack }) => {
  const { currentUser } = useContext<AuthContextType>(AuthContext);
  const { addItineraryEvent, updateItineraryEvent, deleteItineraryEvent, reorderItineraryEvents, updateTripNotes, updateFlightBooking, toggleLikeItineraryEvent } = useContext(TripContext);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [activeEventIdentifier, setActiveEventIdentifier] = useState<string | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<ItineraryItem | null>(null);
  
  const [editingEventIdentifier, setEditingEventIdentifier] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [dayIndexForNewEvent, setDayIndexForNewEvent] = useState<number | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  
  const [flightStatusChecks, setFlightStatusChecks] = useState<Record<string, {isLoading: boolean, data?: FlightStatusData, error?: string}>>({});
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const dragItem = useRef<{dayIndex: number, eventIndex: number} | null>(null);
  const dragOverItem = useRef<{dayIndex: number, eventIndex: number} | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatusMessage, setExportStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && tripId) {
      setIsLoading(true);
      const fetchedTrip = getTripById(currentUser.id, tripId);
      if (fetchedTrip) {
        setTrip(fetchedTrip);
        setNotes(fetchedTrip.notes || '');
        if (fetchedTrip.destinations.length > 0) {
          fetchSuggestionsForTrip(fetchedTrip.destinations[0]); 
        }
      } else {
        setError("Trip not found.");
      }
      setIsLoading(false);
    }
  }, [tripId, currentUser]);

  useEffect(() => {
    if (activeEventIdentifier && trip?.itinerary) {
        for (const day of trip.itinerary.dailyBreakdown) {
            const foundEvent = day.events.find(e => e.identifier === activeEventIdentifier);
            if (foundEvent) {
                setSelectedEventForDetail(foundEvent);
                return;
            }
        }
    }
    setSelectedEventForDetail(null);
  }, [activeEventIdentifier, trip]);


  const fetchSuggestionsForTrip = async (destination: string) => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await fetchPlaceSuggestions(destination);
      setPlaceSuggestions(suggestions);
    } catch (err) { console.error("Failed to fetch place suggestions:", err); }
    finally { setIsLoadingSuggestions(false); }
  };

  const handleSaveNotes = () => {
    if (trip && currentUser) { updateTripNotes(notes); saveTrip({ ...trip, notes }); alert("Notes saved!"); }
  };
  
  const handleCheckFlightStatus = async (flight: FlightBooking) => {
    setFlightStatusChecks(prev => ({ ...prev, [flight.id]: { isLoading: true } }));
    try {
      const statusData = await fetchFlightStatus(flight.airline, flight.flightNumber, flight.departureDate);
      updateFlightBooking(flight.id, { status: statusData.status, statusData });
      setFlightStatusChecks(prev => ({ ...prev, [flight.id]: { isLoading: false, data: statusData } }));
    } catch (err) {
      setFlightStatusChecks(prev => ({ ...prev, [flight.id]: { isLoading: false, error: err instanceof Error ? err.message : "Failed to get status" } }));
    }
  };
  
  const handleSaveEvent = async (dayIndex: number, eventData: ItineraryItem) => {
    setIsSavingEvent(true);
    try {
      if (editingEventIdentifier && editingEventIdentifier !== `new-suggest-${eventData.identifier}`) {
        await updateItineraryEvent(dayIndex, eventData.identifier, eventData);
      } else {
        await addItineraryEvent(dayIndex, eventData);
      }
      if(trip && currentUser) { // Added currentUser check
        const currentFullTrip = getTripById(currentUser.id, tripId); // Fetch latest version
        if (currentFullTrip) saveTrip(currentFullTrip); // Save the latest version after context update
      }
      setEditingEventIdentifier(null);
      setIsAddEventModalOpen(false);
    } catch (err) { console.error("Failed to save event:", err); }
    finally { setIsSavingEvent(false); }
  };

  const handleAddSuggestedPlaceToItinerary = (suggestion: PlaceSuggestion) => {
    const targetDayIndex = 0; 
    const newEvent: ItineraryItem = {
        identifier: `suggested-${suggestion.id}-${Date.now()}`,
        time: "Flexible",
        activity: suggestion.name,
        description: suggestion.description,
        location: suggestion.name, 
        imageUrl: suggestion.imageUrl,
        source: 'user', 
        likes: [],
    };
    addItineraryEvent(targetDayIndex, newEvent);
    if(trip && currentUser) { // Added currentUser check
        const currentFullTrip = getTripById(currentUser.id, tripId);
        if (currentFullTrip) saveTrip(currentFullTrip);
    }
    alert(`${suggestion.name} added to Day ${targetDayIndex + 1}!`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dayIdx: number, eventIdx: number, eventId: string) => { dragItem.current = { dayIndex: dayIdx, eventIndex: eventIdx }; setIsDragging(eventId); e.dataTransfer.effectAllowed = 'move'; (e.target as HTMLDivElement).style.opacity = '0.6';};
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, dayIdx: number, eventIdx: number) => { e.preventDefault(); dragOverItem.current = { dayIndex: dayIdx, eventIndex: eventIdx };};
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragItem.current && dragOverItem.current && dragItem.current.dayIndex === dragOverItem.current.dayIndex) {
      reorderItineraryEvents(dragItem.current.dayIndex, dragItem.current.eventIndex, dragOverItem.current.eventIndex);
      if(trip && currentUser) { // Added currentUser check
        const currentFullTrip = getTripById(currentUser.id, tripId);
        if (currentFullTrip) saveTrip(currentFullTrip);
      }
    }
    dragItem.current = null; dragOverItem.current = null; setIsDragging(null);
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => { (e.target as HTMLDivElement).style.opacity = '1'; setIsDragging(null);};
  
  const handleLikeToggle = (dayIndex: number, eventIdentifier: string) => {
    if (!currentUser) {
      alert("Please log in to like items.");
      return;
    }
    toggleLikeItineraryEvent(dayIndex, eventIdentifier, currentUser.id);
  };

  const handleShareTrip = () => {
    setIsShareModalOpen(true);
  };

  const handleExportTrip = () => {
    setExportStatusMessage(null);
    setIsExportModalOpen(true);
  };
  
  const handleMockExport = (type: string) => {
    setExportStatusMessage(`Simulating ${type} export... This feature is coming soon!`);
  };


  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Loading trip details..." /></div>;
  if (error) return <div className="text-center p-8 text-red-500">{error} <button onClick={onNavigateBack} className="text-blue-500 button-interactive">Go Back</button></div>;
  if (!trip) return <div className="text-center p-8">Trip data is unavailable. <button onClick={onNavigateBack} className="text-blue-500 button-interactive">Go Back</button></div>;

  // --- Calculations for Reservations & Budget Snippet ---
  const numFlights = trip.flights?.filter(f => f.booked).length || 0;
  const numHotels = trip.hotels?.filter(h => h.booked).length || 0;
  const numCars = trip.carRental?.booked ? 1 : 0;
  const numTrains = trip.trains?.filter(t => t.booked).length || 0;
  const numAttachments = 0;
  const numOther = 0;

  return (
    <div className="max-w-full mx-auto bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Top Bar (simplified, actual app might have a more complex shared header) */}
      <div className="bg-white dark:bg-slate-800 shadow-sm py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={onNavigateBack} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium group button-interactive">
            <BackArrowIcon /> Back to My Trips
            </button>
            {/* Placeholder for Share, Export, etc. */}
            <div className="flex items-center space-x-2">
                 <button onClick={handleShareTrip} className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md button-interactive flex items-center"><ShareIcon/> Share</button>
                 <button onClick={handleExportTrip} className="px-3 py-1.5 text-xs bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md button-interactive flex items-center"><ExportIcon/> Export</button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left Pane: Scrollable Itinerary Content */}
        <div className="lg:w-[55%] xl:w-[60%] h-screen-minus-header overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar-detail">
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{trip.itinerary?.title || "Trip Details"}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{trip.dates}</p>
            </div>

            {/* Reservations & Budget Snippet */}
            <section className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center text-xs sm:text-sm">
                        <FlightIcon className="text-sky-500 w-4 h-4 mr-1.5"/> {numFlights} Flights
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                        <HotelIcon className="text-purple-500 w-4 h-4 mr-1.5"/> {numHotels} Lodging
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                        <CarIcon className="text-lime-500 w-4 h-4 mr-1.5"/> {numCars} Rental Cars
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                        <TrainIcon className="w-4 h-4 mr-1.5"/> {numTrains} Trains
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-slate-400 dark:text-slate-500"><span className="w-4 h-4 mr-1.5">📎</span> {numAttachments} Attachments</div>
                    <div className="flex items-center text-xs sm:text-sm text-slate-400 dark:text-slate-500"><span className="w-4 h-4 mr-1.5">⋯</span> {numOther} Other</div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                    <span className="font-semibold text-sm sm:text-md text-slate-700 dark:text-slate-200 flex items-center"><BudgetIcon className="text-emerald-500 w-4 h-4 mr-1.5"/> Budgeting</span>
                    <div>
                        <span className="text-md sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">${(trip.budget || 0).toFixed(2)}</span>
                        {/* <a href="#" className="text-xs text-blue-500 hover:underline ml-2">View details</a> */}
                    </div>
                </div>
            </section>

            {/* Itinerary Day by Day */}
            {trip.itinerary?.dailyBreakdown.map((day: DailyItinerary, dayIdx: number) => (
                <section key={`day-${dayIdx}`} className="pt-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{day.day} {day.date && <span className="text-base text-slate-500 dark:text-slate-400">({day.date})</span>}</h3>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                            <button className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 button-interactive">Auto-fill day</button>
                            <button className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md button-interactive">Optimize route <span className="text-[10px] bg-amber-400 text-black px-1 rounded-sm ml-1">PRO</span></button>
                        </div>
                    </div>
                     {/* Placeholder for day summary: <p className="text-xs text-slate-400 mb-2">1 hr 30 min, 9.8 mi</p> */}
                     <div className="space-y-3">
                        {day.events.map((event, eventIdx) => {
                           const userHasLiked = currentUser && event.likes?.includes(currentUser.id);
                           return (
                            <div 
                                key={event.identifier} 
                                draggable={!editingEventIdentifier}
                                onDragStart={(e) => !editingEventIdentifier && handleDragStart(e, dayIdx, eventIdx, event.identifier)} 
                                onDragOver={(e) => !editingEventIdentifier && handleDragOver(e, dayIdx, eventIdx)} 
                                onDrop={(e) => !editingEventIdentifier && handleDrop(e)} 
                                onDragEnd={handleDragEnd}
                                onClick={() => setActiveEventIdentifier(event.identifier)}
                                className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow border transition-all duration-150 ease-in-out
                                            ${isDragging === event.identifier ? 'opacity-50 border-sky-400' : 'border-slate-200 dark:border-slate-700'}
                                            ${activeEventIdentifier === event.identifier && !editingEventIdentifier ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                                            ${editingEventIdentifier === event.identifier ? 'ring-2 ring-sky-500 dark:ring-sky-400' : 'hover:shadow-md'}
                                            list-item-interactive interactive-element`} // Added interactive-element
                                role="button" // Added role
                                tabIndex={0} // Added tabIndex
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveEventIdentifier(event.identifier)} // Added onKeyDown
                            >
                                <div className="flex items-start space-x-3">
                                    <span className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400 w-5 text-center">{eventIdx + 1}</span>
                                    {event.imageUrl && <ImageWithFallback src={event.imageUrl} alt={event.activity} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0" placeholderClassName="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0"/> }
                                    {!event.imageUrl && event.source === 'user' &&  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0"><ImagePlaceholder className="w-full h-full"/></div>}
                                    
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{event.activity}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{event.description}</p>
                                        {event.travelTimeToNext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{event.travelTimeToNext} • Directions</p>}
                                        <div className="flex items-center mt-1.5">
                                            <button onClick={(e) => {e.stopPropagation(); handleLikeToggle(dayIdx, event.identifier);}} className="p-1 -ml-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full button-interactive" title="Like this place">
                                                {userHasLiked ? <HeartIconSolid /> : <HeartIconOutline />}
                                            </button>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-0.5">{(event.likes?.length || 0)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 shrink-0">
                                        {event.source === 'user' && <button onClick={(e) => {e.stopPropagation(); setEditingEventIdentifier(event.identifier);}} className="p-1 text-slate-500 hover:text-blue-600 rounded button-interactive"><EditIcon/></button> }
                                        <button onClick={(e) => {e.stopPropagation(); deleteItineraryEvent(dayIdx, event.identifier); if(trip && currentUser) saveTrip(trip); }} className="p-1 text-slate-500 hover:text-red-600 rounded button-interactive"><DeleteIcon/></button>
                                        {!editingEventIdentifier && <div className="p-1 text-slate-400 cursor-grab"><DragHandleIcon/></div>}
                                    </div>
                                </div>
                                {editingEventIdentifier === event.identifier && (
                                    <EventForm initialData={event} onSave={(data) => handleSaveEvent(dayIdx, data)} onCancel={() => setEditingEventIdentifier(null)} isSaving={isSavingEvent} />
                                )}
                            </div>
                        )})}
                        <button onClick={() => { setDayIndexForNewEvent(dayIdx); setIsAddEventModalOpen(true); }} className="w-full mt-2 p-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center button-interactive">
                            <AddIcon className="w-3.5 h-3.5 mr-1"/> Add a place
                        </button>
                     </div>
                </section>
            ))}

            {/* Recommended Places Section */}
            <section className="pt-4">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"><SuggestionIcon/> Recommended places</h3>
                 {isLoadingSuggestions ? <LoadingSpinner message="Loading suggestions..."/> : (
                    placeSuggestions.length > 0 ? (
                        <div className="flex overflow-x-auto space-x-3 pb-3 custom-scrollbar-horizontal">
                            {placeSuggestions.map(place => (
                                <div key={place.id} className="flex-none w-40 sm:w-48 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden card-interactive-lift">
                                    <ImageWithFallback src={place.imageUrl} alt={place.name} className="w-full h-20 sm:h-24 object-cover" placeholderClassName="w-full h-20 sm:h-24 bg-slate-200 dark:bg-slate-700 flex items-center justify-center"/>
                                    <div className="p-2">
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{place.name}</p>
                                        <button onClick={() => handleAddSuggestedPlaceToItinerary(place)} className="mt-1 w-full text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-200 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-600 flex items-center justify-center button-interactive">
                                           <AddToItineraryIcon/> Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 italic">No recommendations available for this destination's primary city.</p>
                )}
            </section>

            {/* Notes Section */}
            <section className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center"><NotesIcon /> Notes</h3>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes for your trip..." className="w-full h-24 p-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md resize-none"/>
                <button onClick={handleSaveNotes} className="mt-2 px-3 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-md button-interactive">Save Notes</button>
            </section>

            {/* Flight Status Section */}
             {trip.flights && trip.flights.filter(f=>f.booked).length > 0 && (
              <section className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"><FlightIcon className="text-blue-500"/> Flight Status</h3>
                <div className="space-y-3">
                  {trip.flights.filter(f=>f.booked).map(flight => (
                    <div key={flight.id} className="p-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700/50 text-xs">
                      <p className="font-medium text-slate-600 dark:text-slate-300">{flight.airline} {flight.flightNumber}</p>
                      <p className="text-slate-500 dark:text-slate-400">{flight.origin} → {flight.destination} | {new Date(flight.departureDate + 'T' + (flight.departureTime || '00:00')).toLocaleDateString()}</p>
                      <button onClick={() => handleCheckFlightStatus(flight)} disabled={flightStatusChecks[flight.id]?.isLoading} className="mt-1 px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-600 disabled:opacity-50 button-interactive">
                        {flightStatusChecks[flight.id]?.isLoading ? 'Checking...' : 'Check Status'}
                      </button>
                      {flightStatusChecks[flight.id]?.data && ( /* Display fresh status */
                        <div className="mt-1 text-[10px] p-1 bg-blue-50 dark:bg-blue-900/30 rounded-sm border-l-2 border-blue-400 dark:border-blue-500">
                          <p><strong>Status:</strong> {flightStatusChecks[flight.id]?.data!.status}</p>
                          {flightStatusChecks[flight.id]?.data!.details && <p><strong>Details:</strong> {flightStatusChecks[flight.id]?.data!.details}</p>}
                        </div>
                      )}
                      {flight.statusData && !flightStatusChecks[flight.id]?.data && ( /* Display stored status if available and not freshly checked */
                        <div className="mt-1 text-[10px] p-1 bg-blue-50 dark:bg-blue-900/30 rounded-sm border-l-2 border-blue-400 dark:border-blue-500">
                          <p><strong>Last Known Status:</strong> {flight.statusData.status}</p>
                        </div>
                      )}
                      {flightStatusChecks[flight.id]?.error && <p className="text-[10px] text-red-500 mt-1">{flightStatusChecks[flight.id]?.error}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>

        {/* Right Pane: Map & Selected Place Detail */}
        <div className="lg:w-[45%] xl:w-[40%] h-auto lg:h-screen-minus-header lg:sticky lg:top-[calc(var(--header-height,64px)+1.5rem)] p-4 lg:p-4 lg:pl-0 flex flex-col">
          <div className="h-64 sm:h-72 md:h-80 lg:h-[45%] xl:h-1/2 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 mb-4">
            <ItineraryMap dailyBreakdown={trip.itinerary?.dailyBreakdown || []} destinations={trip.destinations} activeEventIdentifier={activeEventIdentifier} />
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar-detail-right min-h-[200px] lg:min-h-0">
            {selectedEventForDetail ? (
                <PlaceDetailCard event={selectedEventForDetail} onClose={() => setActiveEventIdentifier(null)} />
            ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Select an item from the itinerary to see details here.</div>
            )}
          </div>
        </div>
      </div>
      
      {isAddEventModalOpen && dayIndexForNewEvent !== null && (
        <Modal isOpen={isAddEventModalOpen} onClose={() => {setIsAddEventModalOpen(false); setEditingEventIdentifier(null);}} title={`Add Event to Day ${dayIndexForNewEvent + 1}`}>
          <EventForm initialData={{likes: []}} onSave={(data) => handleSaveEvent(dayIndexForNewEvent, data)} onCancel={() => {setIsAddEventModalOpen(false); setEditingEventIdentifier(null);}} isSaving={isSavingEvent} />
        </Modal>
      )}

      {isShareModalOpen && trip && (
        <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Your Trip">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Share this amazing trip with your friends and family!</p>
            <div>
              <label htmlFor="shareLink" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Shareable Link (mock):</label>
              <input 
                id="shareLink" 
                type="text" 
                readOnly 
                value={`https://wanderlust.ai/trip/${trip.id}`} 
                className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-200" 
                onFocus={(e) => e.target.select()}
              />
            </div>
            <a 
              href={`mailto:?subject=Check out my trip to ${trip.destinations.join(', ')}!&body=I'm planning an awesome trip to ${trip.destinations.join(', ')} from ${trip.dates}. Check out the details here (mock link): https://wanderlust.ai/trip/${trip.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm button-interactive"
            >
              <EmailIcon /> Email Trip
            </a>
             <p className="text-xs text-slate-500 dark:text-slate-400">Tip: You can also take a screenshot to share visually!</p>
          </div>
        </Modal>
      )}

      {isExportModalOpen && trip && (
        <Modal isOpen={isExportModalOpen} onClose={() => {setIsExportModalOpen(false); setExportStatusMessage(null);}} title="Export Trip">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">Choose an export format:</p>
            <button 
              onClick={() => handleMockExport('PDF')} 
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md text-sm button-interactive"
            >
              Export as PDF (Mock)
            </button>
            <button 
              onClick={() => handleMockExport('Calendar (ICS)')} 
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md text-sm button-interactive"
            >
              Export as Calendar (ICS) (Mock)
            </button>
            {exportStatusMessage && <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">{exportStatusMessage}</p>}
          </div>
        </Modal>
      )}

      <style>{`
        .h-screen-minus-header { height: calc(100vh - var(--header-height, 64px)); /* Default header height 64px */ }
        .custom-scrollbar-detail::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-detail::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-detail::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
        .dark .custom-scrollbar-detail::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar-detail-right::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-detail-right::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-detail-right::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
        .dark .custom-scrollbar-detail-right::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: #475569; }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
      `}</style>
    </div>
  );
};
export default TripDetailPage;
