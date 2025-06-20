
import React, { useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TripContext } from '../contexts/TripContext';
import { ItineraryItem, DailyItinerary, GeneratedItinerary } from '../types';
import { TRAVEL_TIERS } from '../constants';
import ItineraryMap from './ItineraryMap';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import { ImagePlaceholder } from './common/ImageDisplayUtils';

// --- Icons ---
const LocationPinIcon = ({ className = "w-4 h-4 mr-1.5 text-slate-500 dark:text-slate-400 flex-shrink-0" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.4l-4.71-4.711a6.5 6.5 0 119.192-9.192A6.5 6.5 0 0110 18.4zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);
const CostIcon = ({ className = "w-4 h-4 mr-1.5 text-slate-500 dark:text-slate-400 flex-shrink-0" }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10.75 10.81V6.438a2.5 2.5 0 10-5 0v2.813A2.5 2.5 0 007.5 15h3.438A2.5 2.5 0 0013 12.938v-2.126c0-.001 0-.001 0-.002zM9.25 10.81V6.437a1 1 0 112 0v4.373a1 1 0 11-2 0z" />
    <path fillRule="evenodd" d="M5.558 3.802A6.002 6.002 0 004.5 10c0 2.292 1.288 4.262 3.167 5.243A2.502 2.502 0 009.438 13H7.5a1 1 0 01-1-1V7.5a1 1 0 011-1h1.938A2.502 2.502 0 007.667 4.757 6.002 6.002 0 005.558 3.802zM10 4.5a5.983 5.983 0 00-2.471.506A2.502 2.502 0 019.438 7H11.5a1 1 0 011 1V12a1 1 0 01-1 1h-1.062a2.502 2.502 0 01-1.771 1.743A5.983 5.983 0 0010 15.5c2.423 0 4.43-1.485 5.319-3.533A6.002 6.002 0 0010 4.5z" clipRule="evenodd" />
  </svg>
);
const CalendarIconHeader = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5 text-slate-500 dark:text-slate-400">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);
const StyleIconHeader = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5 text-slate-500 dark:text-slate-400">
    <path d="M10.75 5.008V2.882a2.502 2.502 0 00-5 0v2.126A2.502 2.502 0 007.5 7.134h0H5.75A.75.75 0 005 7.884v2.232a.75.75 0 00.75.75h1.75v0a2.5 2.5 0 001.75 2.316V16a.75.75 0 001.5 0v-2.816a2.5 2.5 0 001.75-2.316V13h0a.75.75 0 00.75-.75v-2.232a.75.75 0 00-.75-.75H12.5h0a2.502 2.502 0 001.75-2.126V5.008h0zM9.25 5.008V2.882a1 1 0 112 0v2.126a1 1 0 11-2 0z" />
    <path d="M6.25 12.25a.75.75 0 00-.75.75v2.232a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-2.232a.75.75 0 00-.75-.75h-7.5z" />
  </svg>
);
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m-3.22-.096L3.75 5.79m0 0c0-.02.017-.038.037-.056L5.03 4.232a1.875 1.875 0 011.64-.781c.535 0 1.024.21 1.39.557l8.063 8.063q.256 .255 .577 .478l.558 .417c.16.12.296.256.413.403M4.772 5.79L3.75 5.79" /></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const TravelTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const DragHandleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>;

// --- End Icons ---

const EventImageDisplay: React.FC<{ src?: string; altText: string }> = ({ src, altText }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => { setHasError(false); }, [src]);
  if (!src || hasError) return <ImagePlaceholder className="w-full h-32 sm:h-40 bg-slate-200 dark:bg-slate-700 rounded-t-lg flex items-center justify-center"/>;
  return <img src={src} alt={altText} className="w-full h-32 sm:h-40 object-cover rounded-t-lg" onError={() => setHasError(true)} loading="lazy" />;
};

// --- EventForm Component ---
interface EventFormProps {
  initialData: Partial<ItineraryItem>;
  onSave: (data: ItineraryItem) => void;
  onCancel: () => void;
  isSaving: boolean;
  formType: 'add' | 'edit';
}

const formatTimeToInput = (timeStr?: string): string => {
    if (!timeStr || typeof timeStr !== 'string') return '';
    const trimmedTimeStr = timeStr.trim();
    if (!trimmedTimeStr) return '';

    const amPmMatch = trimmedTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (amPmMatch) {
        let hours = parseInt(amPmMatch[1], 10);
        const minutes = parseInt(amPmMatch[2], 10);

        if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
            return ''; // Invalid minutes
        }
        
        const modifier = amPmMatch[3].toUpperCase();
        if (modifier === 'PM' && hours >= 1 && hours <= 11) hours += 12; // 1-11 PM -> 13-23
        if (modifier === 'AM' && hours === 12) hours = 0; // 12 AM (Midnight) -> 00
        // Hours 1-11 AM are fine as is. Hour 12 PM is fine as 12.

        if (hours < 0 || hours > 23) { 
            return ''; // Invalid hours after AM/PM conversion
        }
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const twentyFourHourMatch = trimmedTimeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
        const hours = parseInt(twentyFourHourMatch[1], 10);
        const minutes = parseInt(twentyFourHourMatch[2], 10);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return ''; // Invalid HH:mm format ranges
        }
        // Pad hours if it's single digit for HH:mm output
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return ''; // Default for "Flexible", "N/A", or any other unparsed/invalid format
};


const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel, isSaving, formType }) => {
  const [formData, setFormData] = useState<Partial<ItineraryItem>>(() => ({
    ...initialData,
    time: formatTimeToInput(initialData.time),
    activity: initialData.activity || '',
    description: initialData.description || '',
    location: initialData.location || '',
    cost: initialData.cost || '',
    imageUrl: initialData.imageUrl || '',
    travelTimeToNext: initialData.travelTimeToNext || '',
    source: initialData.source || 'user',
  }));

   useEffect(() => {
    setFormData(currentFormData => ({
      ...currentFormData,
      ...initialData,
      time: formatTimeToInput(initialData.time),
    }));
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity) {
      alert("Activity name is required.");
      return;
    }
    
    let timeToSave = formData.time; 
    if (formData.time === '') { 
        if (initialData.time && formatTimeToInput(initialData.time) === '') {
            timeToSave = initialData.time;
        } else {
            timeToSave = "Flexible"; 
        }
    }

    const eventToSave: ItineraryItem = {
      identifier: formData.identifier || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      time: timeToSave!,
      activity: formData.activity!,
      description: formData.description,
      location: formData.location,
      cost: formData.cost,
      imageUrl: formData.imageUrl,
      travelTimeToNext: formData.travelTimeToNext,
      source: 'user',
    };
    onSave(eventToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 sm:p-4 bg-slate-100 dark:bg-slate-850 rounded-b-lg -mt-px">
      <InputField label="Time" name="time" type="time" value={formData.time || ''} onChange={handleChange} />
      <InputField label="Activity*" name="activity" value={formData.activity || ''} onChange={handleChange} required placeholder="e.g., Visit Eiffel Tower" />
      <TextAreaField label="Description" name="description" value={formData.description || ''} onChange={handleChange} placeholder="e.g., Enjoy panoramic city views" />
      <InputField label="Location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., Champ de Mars, Paris" />
      <InputField label="Cost (USD)" name="cost" value={formData.cost || ''} onChange={handleChange} placeholder="e.g., $25 or Free" />
      <InputField label="Image URL" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" />
      <InputField label="Travel Time to Next (optional)" name="travelTimeToNext" value={formData.travelTimeToNext || ''} onChange={handleChange} placeholder="e.g., Approx. 15 min drive" />
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md transition">Cancel</button>
        <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition disabled:opacity-70">
          {isSaving ? <LoadingSpinner size="small" message="" /> : (formType === 'add' ? 'Add Event' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
};

const InputField: React.FC<{label:string, name:string, value:string, onChange:any, type?:string, required?:boolean, placeholder?: string}> = 
  ({label, name, value, onChange, type="text", required=false, placeholder}) => (
  <div>
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5">{label}</label>
    <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
           className="w-full p-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
  </div>
);
const TextAreaField: React.FC<{label:string, name:string, value:string, onChange:any, placeholder?: string}> = 
  ({label, name, value, onChange, placeholder}) => (
  <div>
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5">{label}</label>
    <textarea name={name} id={name} value={value} onChange={onChange} rows={2} placeholder={placeholder}
              className="w-full p-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none" />
  </div>
);
// --- End EventForm Component ---


interface ItineraryDisplayProps {
  onNext: () => void;
  onBack: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ onNext, onBack }) => {
  const { 
    currentTrip, 
    addItineraryEvent, 
    updateItineraryEvent, 
    deleteItineraryEvent, 
    reorderItineraryEvents,
    undoItineraryChange,
    redoItineraryChange,
    canUndoItinerary,
    canRedoItinerary 
  } = useContext(TripContext);
  const [activeEventIdentifier, setActiveEventIdentifier] = useState<string | null>(null);
  const itineraryScrollRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  
  const [editingEventIdentifier, setEditingEventIdentifier] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [dayIndexForNewEvent, setDayIndexForNewEvent] = useState<number | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dragItem = useRef<{dayIndex: number, eventIndex: number} | null>(null);
  const dragOverItem = useRef<{dayIndex: number, eventIndex: number} | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);


  const processedItinerary: GeneratedItinerary | null = useMemo(() => {
    if (!currentTrip?.itinerary) return null;
    return {
      ...currentTrip.itinerary,
      dailyBreakdown: currentTrip.itinerary.dailyBreakdown.map((day, dayIndex) => ({
        ...day,
        events: day.events.map((event, eventIndex) => ({
          ...event,
          identifier: event.identifier || `event-${dayIndex}-${eventIndex}-${Date.now()}`, 
          source: event.source || 'ai',
        })),
      })),
    };
  }, [currentTrip?.itinerary]);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const identifier = (entry.target as HTMLElement).dataset.eventIdentifier;
          if (identifier && editingEventIdentifier !== identifier) { 
            setActiveEventIdentifier(identifier);
          }
        }
      });
    };
    const observerOptions = { root: itineraryScrollRef.current, rootMargin: "-40% 0px -60% 0px", threshold: 0.1 };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentEventRefs = eventRefs.current;
    currentEventRefs.forEach(el => { if (el) observer.observe(el); });
    return () => { currentEventRefs.forEach(el => { if (el) observer.unobserve(el); }); observer.disconnect(); };
  }, [processedItinerary, editingEventIdentifier]); 

  const handleEditEvent = (eventIdentifier: string) => {
    setSaveError(null);
    setEditingEventIdentifier(eventIdentifier);
  };

  const handleCancelEdit = () => {
    setEditingEventIdentifier(null);
    setSaveError(null);
  };

  const handleSaveEditedEvent = async (dayIndex: number, eventData: ItineraryItem) => {
    setIsSavingEvent(true);
    setSaveError(null);
    try {
      await updateItineraryEvent(dayIndex, eventData.identifier, { ...eventData, source: 'user' });
      setEditingEventIdentifier(null);
    } catch (error) {
      console.error("Failed to save event:", error);
      setSaveError("Failed to save event. Please try again.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = (dayIndex: number, eventIdentifier: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteItineraryEvent(dayIndex, eventIdentifier);
    }
  };

  const handleOpenAddEventModal = (dayIndex: number) => {
    setSaveError(null);
    setDayIndexForNewEvent(dayIndex);
    setIsAddEventModalOpen(true);
  };

  const handleCloseAddEventModal = () => {
    setIsAddEventModalOpen(false);
    setDayIndexForNewEvent(null);
    setSaveError(null);
  };

  const handleSaveNewEvent = async (eventData: ItineraryItem) => {
    if (dayIndexForNewEvent === null) return;
    setIsSavingEvent(true);
    setSaveError(null);
    try {
      await addItineraryEvent(dayIndexForNewEvent, { ...eventData, source: 'user' });
      handleCloseAddEventModal();
    } catch (error) {
      console.error("Failed to add event:", error);
      setSaveError("Failed to add event. Please try again.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dayIdx: number, eventIdx: number, eventId: string) => {
    dragItem.current = { dayIndex: dayIdx, eventIndex: eventIdx };
    setIsDragging(eventId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({dayIndex: dayIdx, eventIndex: eventIdx, eventIdentifier: eventId})); 
    (e.target as HTMLDivElement).style.opacity = '0.6';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, dayIdx: number, eventIdx: number) => {
    e.preventDefault(); 
    dragOverItem.current = { dayIndex: dayIdx, eventIndex: eventIdx };
    const targetElement = e.currentTarget as HTMLDivElement;
    targetElement.parentElement?.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => el.remove());
    const rect = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const midY = rect.top + rect.height / 2;
    const indicatorPositionClass = mouseY > midY ? 'drop-indicator-bottom' : 'drop-indicator-top';
    const existingIndicator = targetElement.querySelector(`.${indicatorPositionClass}`);
    if (!existingIndicator) {
        const newIndicator = document.createElement('div'); 
        newIndicator.className = `absolute left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400 z-20 ${indicatorPositionClass}`;
        newIndicator.style[indicatorPositionClass === 'drop-indicator-top' ? 'top' : 'bottom'] = '-1px';
        targetElement.style.position = 'relative'; 
        targetElement.appendChild(newIndicator);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => el.remove());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => el.remove());
    
    if (dragItem.current && dragOverItem.current) {
        if (dragItem.current.dayIndex === dragOverItem.current.dayIndex) {
            const dayIndex = dragItem.current.dayIndex;
            const oldEventIndex = dragItem.current.eventIndex;
            
            const targetElement = e.currentTarget as HTMLDivElement;
            const rect = targetElement.getBoundingClientRect();
            const mouseY = e.clientY;
            const midY = rect.top + rect.height / 2;
            
            let insertionIndex = dragOverItem.current.eventIndex;
            if (mouseY > midY) { // Dropped on the bottom half of the target
                insertionIndex = dragOverItem.current.eventIndex + 1;
            }
            
            reorderItineraryEvents(dayIndex, oldEventIndex, insertionIndex);
        }
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).style.opacity = '1';
    setIsDragging(null);
    dragItem.current = null;
    dragOverItem.current = null;
    document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => el.remove());
  };

  if (!currentTrip || !processedItinerary) {
    return (
      <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">No Itinerary Data</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">It seems an itinerary hasn't been generated or loaded.</p>
        <button onClick={onBack} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105">Back to Planner</button>
      </div>
    );
  }

  const { title, destinations, duration, dailyBreakdown, estimatedTotalCost } = processedItinerary;
  const { travelTier } = currentTrip;
  const selectedTierDetails = TRAVEL_TIERS.find(t => t.id === travelTier);
  
  const displayDestinations = destinations.join(' → ');

  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl max-w-full mx-auto text-slate-700 dark:text-slate-200">
      <div className="text-center mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-700 pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400">{title || `Your Awesome Trip to ${displayDestinations}`}</h1>
        <div className="mt-2 sm:mt-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm space-y-1 sm:flex sm:items-center sm:justify-center sm:space-x-3 sm:space-y-0">
          <span className="inline-flex items-center"><CalendarIconHeader /> <span className="font-medium mr-1">Duration:</span> {duration}</span>
          {selectedTierDetails && (<span className="inline-flex items-center"><StyleIconHeader /> <span className="font-medium mr-1">Travel Style:</span> {selectedTierDetails.name}</span>)}
        </div>
        {typeof estimatedTotalCost === 'number' && (<p className="font-semibold mt-1 sm:mt-2 text-sm sm:text-base">AI Estimated Cost: <span className="text-emerald-600 dark:text-emerald-400">${estimatedTotalCost.toFixed(2)} USD</span></p>)}
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[calc(100vh-20rem)] min-h-[450px] sm:min-h-[500px]">
        <div className="md:w-2/5 h-60 sm:h-72 md:h-full rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 sticky md:top-4">
          <ItineraryMap dailyBreakdown={dailyBreakdown} destinations={destinations} activeEventIdentifier={activeEventIdentifier} />
        </div>

        <div ref={itineraryScrollRef} className="md:w-3/5 md:h-full overflow-y-auto space-y-1 pr-0 sm:pr-1 custom-scrollbar">
          {dailyBreakdown.map((day: DailyItinerary, dayIndex: number) => (
            <div key={day.day + dayIndex} className="mb-4 sm:mb-6">
              <div className="sticky top-0 bg-white dark:bg-slate-900 py-2 sm:py-3 z-10 border-b-2 border-blue-300 dark:border-blue-600 flex justify-between items-center mb-2 sm:mb-3">
                <h3 className="text-md sm:text-lg font-semibold text-blue-700 dark:text-blue-400">
                  {day.day} {day.date && <span className="text-sm text-slate-500 dark:text-slate-400">({day.date})</span>}
                </h3>
                <button 
                  onClick={() => handleOpenAddEventModal(dayIndex)} 
                  className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium rounded-md bg-blue-50 dark:bg-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-700/80 transition p-1 sm:p-1.5"
                  title="Add event to this day"
                  aria-label="Add event to this day"
                >
                  <AddIcon /> 
                  <span className="hidden sm:inline sm:ml-0.5">Add Event</span>
                </button>
              </div>
              {day.events.length > 0 ? (
                <div className="space-y-2 sm:space-y-3"> 
                  {day.events.map((event: ItineraryItem, eventIdx: number) => {
                    const isEditingThisEvent = editingEventIdentifier === event.identifier;
                    const isLastEventOfDay = eventIdx === day.events.length - 1;
                    const canEditEvent = event.source === 'user';

                    return (
                    <React.Fragment key={event.identifier}>
                      <div 
                        ref={(el: HTMLDivElement | null) => { if (event.identifier) { if (el) eventRefs.current.set(event.identifier, el); else eventRefs.current.delete(event.identifier); }}}
                        data-event-identifier={event.identifier}
                        draggable={!isEditingThisEvent}
                        onDragStart={(e) => !isEditingThisEvent && handleDragStart(e, dayIndex, eventIdx, event.identifier)}
                        onDragOver={(e) => !isEditingThisEvent && handleDragOver(e, dayIndex, eventIdx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => !isEditingThisEvent && handleDrop(e)}
                        onDragEnd={handleDragEnd}
                        className={`bg-slate-50 dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ease-in-out
                                  ${activeEventIdentifier === event.identifier && !isEditingThisEvent && !isDragging ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-blue-500 dark:ring-blue-400 shadow-xl scale-[1.01]' : ''}
                                  ${isEditingThisEvent ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-sky-500 dark:ring-sky-400 shadow-xl' : 'hover:shadow-lg'}
                                  ${isDragging === event.identifier ? 'opacity-50 border-sky-400' : ''}
                                  ${!isEditingThisEvent ? 'cursor-grab' : ''}
                                  `}
                      >
                        {!isEditingThisEvent ? (
                          <>
                            <EventImageDisplay src={event.imageUrl} altText={`Visual for ${event.activity}`} />
                            <div className="p-2.5 sm:p-3">
                              <div className="flex justify-between items-start mb-1.5">
                                <div className="flex-grow">
                                  {event.time && event.time !== "Flexible" && event.time !== "N/A" && <p className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">{event.time}</p>}
                                  <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100">{event.activity}</h4>
                                </div>
                                  <div className="flex space-x-1 shrink-0 ml-1.5">
                                      {canEditEvent && (
                                        <button onClick={() => handleEditEvent(event.identifier)} className="p-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit Event"><EditIcon /></button>
                                      )}
                                      <button onClick={() => handleDeleteEvent(dayIndex, event.identifier)} className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Delete Event"><DeleteIcon /></button>
                                      <button className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-grab" title="Drag to reorder"><DragHandleIcon /></button>
                                  </div>
                              </div>
                              {event.description && (<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 mb-2 italic">"{event.description}"</p>)}
                              <div className="space-y-1 text-[11px] sm:text-xs">
                                  {event.location && (
                                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                                          <LocationPinIcon />
                                          <span>{event.location}</span>
                                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="ml-1.5 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-[10px] sm:text-xs" aria-label={`View ${event.location} on Google Maps`}>(Map)</a>
                                      </div>
                                  )}
                                  {event.cost && (<p className="flex items-center text-slate-600 dark:text-slate-300"><CostIcon />{event.cost}</p>)}
                              </div>
                            </div>
                          </>
                        ) : (
                          <EventForm 
                              initialData={event} 
                              onSave={(data) => handleSaveEditedEvent(dayIndex, data)}
                              onCancel={handleCancelEdit}
                              isSaving={isSavingEvent}
                              formType="edit"
                          />
                        )}
                      </div>
                       {(!isLastEventOfDay || (isLastEventOfDay && day.events.length > 1 )) && (event.travelTimeToNext || event.travelTimeToNext === undefined) && (
                         <div className="flex items-center justify-center my-2 sm:my-2.5 py-0.5 px-2 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                            <div className="flex-grow border-t-2 border-dashed border-slate-300 dark:border-slate-600 mr-1.5 sm:mr-2"></div>
                            <TravelTimeIcon />
                            <span className={`${event.travelTimeToNext === undefined ? 'italic' : ''}`}>
                                {event.travelTimeToNext !== undefined ? event.travelTimeToNext : (isLastEventOfDay && day.events.length > 1 ? "End of day" : "Travel time missing")}
                            </span>
                             {!isLastEventOfDay && <div className="flex-grow border-t-2 border-dashed border-slate-300 dark:border-slate-600 ml-1.5 sm:ml-2"></div>}
                        </div>
                      )}
                    </React.Fragment>
                  )})}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 italic p-2 sm:p-3 mt-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-md">No events planned for this day yet. Click "Add Event" to get started!</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {isAddEventModalOpen && (
        <Modal
          isOpen={isAddEventModalOpen}
          onClose={handleCloseAddEventModal}
          title={`Add Event to ${dailyBreakdown[dayIndexForNewEvent!]?.day || 'Day'}`}
          size="md"
        >
          {saveError && <p className="text-red-500 text-sm mb-2">{saveError}</p>}
          <EventForm
            initialData={{identifier: `new-evt-${Date.now()}`, source: 'user'}} 
            onSave={handleSaveNewEvent}
            onCancel={handleCloseAddEventModal}
            isSaving={isSavingEvent}
            formType="add"
          />
        </Modal>
      )}
      
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
        <button onClick={onBack} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg shadow-sm transition-colors duration-200">Back</button>
        <div className="flex items-center gap-2">
            <button 
                onClick={undoItineraryChange} 
                disabled={!canUndoItinerary()}
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo last change"
            >
                <UndoIcon /> Undo
            </button>
            <button 
                onClick={redoItineraryChange} 
                disabled={!canRedoItinerary()}
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo last undone change"
            >
                <RedoIcon /> Redo
            </button>
        </div>
        <button onClick={onNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg shadow-md transition-colors duration-200 transform hover:scale-105">Proceed to Bookings</button>
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

export default ItineraryDisplay;
