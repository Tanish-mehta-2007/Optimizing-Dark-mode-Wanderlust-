
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Trip, GeneratedItinerary, FlightBooking, HotelBooking, CarRental, CabBooking, TrainBooking, BusBooking, TripFormData, ItineraryItem, Expense, TripParticipant, User, TripContextType as TripContextTypeInterface, UpdateTripDetailsPayload, PrimaryTransportationMode } from '../../types'; 
import { AuthContext } from './AuthContext'; 
import type { AuthContextType } from './AuthContext'; 
import { saveTrip } from '../services/storageService'; 

export const TripContext = createContext<TripContextTypeInterface>({
  currentTrip: null,
  setCurrentTrip: () => {},
  updateTripDetails: () => {},
  setPrimaryTransportationMode: () => {},
  setItinerary: () => {},
  addFlightBooking: () => {},
  updateFlightBooking: () => {},
  addHotelBooking: () => {},
  updateHotelBooking: () => {},
  setCarRental: () => {},
  updateCarRental: () => {},
  setDepartureCab: () => {},
  updateDepartureCab: () => {},
  setArrivalCab: () => {},
  updateArrivalCab: () => {},
  addTrainBooking: () => {}, 
  updateTrainBooking: () => {}, 
  addBusBooking: () => {},
  updateBusBooking: () => {},
  setPackingList: () => {},
  clearCurrentTrip: () => {},
  addItineraryEvent: () => {},
  updateItineraryEvent: () => {},
  deleteItineraryEvent: () => {},
  reorderItineraryEvents: () => {},
  setBudget: () => {},
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {},
  addParticipant: () => {},
  removeParticipant: () => {},
  itineraryHistory: [],
  itineraryHistoryPointer: -1,
  undoItineraryChange: () => {},
  redoItineraryChange: () => {},
  canUndoItinerary: () => false,
  canRedoItinerary: () => false,
  updateTripNotes: () => {}, 
  toggleLikeItineraryEvent: () => {}, 
});

interface TripProviderProps {
  children: ReactNode;
}

const getDefaultParticipant = (user: User | null): TripParticipant[] => {
  if (!user) return [];
  return [{ id: user.id, name: user.email.split('@')[0] || 'Me', isCurrentUser: true }];
};

const formatDateToYMDString = (date: Date): string => date.toISOString().split('T')[0];
const isValidDateObject = (date: Date): boolean => date instanceof Date && !isNaN(date.getTime());

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [currentTrip, setCurrentTripInternal] = useState<Trip | null>(null); 
  const { currentUser } = useContext<AuthContextType>(AuthContext); 

  const [itineraryHistory, setItineraryHistory] = useState<GeneratedItinerary[]>([]);
  const [itineraryHistoryPointer, setItineraryHistoryPointer] = useState<number>(-1);

  const setCurrentTrip = (trip: Trip | null) => {
    setCurrentTripInternal(trip);
    if (trip && trip.itinerary) {
        setItineraryHistory([JSON.parse(JSON.stringify(trip.itinerary))]);
        setItineraryHistoryPointer(0);
    } else if (!trip) {
        setItineraryHistory([]);
        setItineraryHistoryPointer(-1);
    }
  };


  const updateTripDetails = (details: UpdateTripDetailsPayload) => {
    setCurrentTripInternal(prev => { 
      const baseUserDetails = details.userId ? { userId: details.userId } : (currentUser ? { userId: currentUser.id } : {});
      
      let currentParticipants = prev?.participants || [];
      if (currentUser && !currentParticipants.some(p => p.isCurrentUser)) {
        currentParticipants = [...getDefaultParticipant(currentUser), ...currentParticipants.filter(p => !p.isCurrentUser)];
      } else if (!currentUser && currentParticipants.length === 0) {
        currentParticipants = [{id: 'anon-user', name: 'Guest Traveler', isCurrentUser: true}];
      }

      const todayDate = new Date();
      const todayAtLocalMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      const todayYMD = formatDateToYMDString(todayAtLocalMidnight);
      let effectiveDatesString = details.dates || details.prefillDates;
      let finalProcessedDates: string;

      if (!effectiveDatesString || effectiveDatesString.trim() === "" || effectiveDatesString.toLowerCase() === "to be determined") {
          if (details.source.startsWith('standalone_')) finalProcessedDates = todayYMD;
          else {
              const nextWeek = new Date(todayAtLocalMidnight);
              nextWeek.setDate(todayAtLocalMidnight.getDate() + 7);
              finalProcessedDates = `${todayYMD} to ${formatDateToYMDString(nextWeek)}`;
          }
      } else {
          const dateParts = effectiveDatesString.split(' to ');
          let startDateStr = dateParts[0]?.trim();
          let endDateStr = dateParts.length > 1 ? dateParts[1]?.trim() : undefined;
          let parsedStartDate = startDateStr ? new Date(startDateStr) : new Date(0);
          if (!isValidDateObject(parsedStartDate) || parsedStartDate < todayAtLocalMidnight) parsedStartDate = new Date(todayAtLocalMidnight);
          const finalStartDateYMD = formatDateToYMDString(parsedStartDate);

          if (details.source.startsWith('standalone_') && (!endDateStr || startDateStr === endDateStr || dateParts.length === 1)) {
              finalProcessedDates = finalStartDateYMD;
          } else {
              let parsedEndDate: Date;
              if (endDateStr) {
                  parsedEndDate = new Date(endDateStr);
                  if (!isValidDateObject(parsedEndDate) || parsedEndDate < parsedStartDate) {
                      parsedEndDate = new Date(parsedStartDate);
                      parsedEndDate.setDate(parsedStartDate.getDate() + 7);
                  }
              } else {
                  parsedEndDate = new Date(parsedStartDate);
                  parsedEndDate.setDate(parsedStartDate.getDate() + 7);
              }
              finalProcessedDates = `${finalStartDateYMD} to ${formatDateToYMDString(parsedEndDate)}`;
          }
      }

      let finalDestinations = details.destinations || (prev ? prev.destinations : []);
      if (details.prefillDestination && (!finalDestinations || finalDestinations.length === 0)) finalDestinations = [details.prefillDestination];

      const commonTripData = {
        ...baseUserDetails,
        ...details,
        destinations: finalDestinations,
        dates: finalProcessedDates,
        source: details.source,
        travelTier: details.travelTier || "lifestyle",
        travelType: details.travelType || (details.source === 'chat' ? 'Custom AI Plan' : (details.source.startsWith('standalone_') ? 'Standalone Booking' : undefined)),
        primaryTransportationMode: details.primaryTransportationMode || prev?.primaryTransportationMode,
        expenses: prev?.expenses || [],
        participants: currentParticipants,
        hotels: prev?.hotels || [],
        flights: prev?.flights || [],
        trains: prev?.trains || [], 
        buses: prev?.buses || [], 
        departureCab: details.departureCab !== undefined ? details.departureCab : prev?.departureCab,
        arrivalCab: details.arrivalCab !== undefined ? details.arrivalCab : prev?.arrivalCab, 
        carRental: prev?.carRental,
        packingList: prev?.packingList,
        notes: prev?.notes,
      };

      if (!prev || details.source.startsWith('standalone_')) { 
        return {
          id: Date.now().toString(), 
          createdAt: new Date().toISOString(), 
          ...commonTripData,
          expenses: [], participants: currentParticipants, hotels: [], flights: [], trains: [], buses: [], 
          departureCab: commonTripData.departureCab, arrivalCab: commonTripData.arrivalCab, 
          carRental: undefined, packingList: undefined, notes: undefined
        };
      }
      return { 
        ...prev, 
        ...commonTripData,
        destinations: finalDestinations.length > 0 ? finalDestinations : prev.destinations,
     };
    });
  };
  
  const setPrimaryTransportationMode = (mode: PrimaryTransportationMode) => {
    setCurrentTripInternal(prev => prev ? { ...prev, primaryTransportationMode: mode } : null);
  };

  const updateHistory = (newItinerary: GeneratedItinerary) => {
    const newHistory = itineraryHistory.slice(0, itineraryHistoryPointer + 1);
    newHistory.push(JSON.parse(JSON.stringify(newItinerary))); 
    setItineraryHistory(newHistory);
    setItineraryHistoryPointer(newHistory.length - 1);
  };

  const setItinerary = (itinerary: GeneratedItinerary) => {
    setCurrentTripInternal(prev => prev ? { ...prev, itinerary } : null);
    setItineraryHistory([JSON.parse(JSON.stringify(itinerary))]); 
    setItineraryHistoryPointer(0);
  };

  const addFlightBooking = (flight: FlightBooking) => setCurrentTripInternal(prev => prev ? { ...prev, flights: [...(prev.flights || []).filter(f => !(f.legId && f.legId === flight.legId && f.id !== flight.id)), flight] } : null);
  const updateFlightBooking = (flightId: string, updates: Partial<FlightBooking>) => setCurrentTripInternal(prev => prev && prev.flights ? { ...prev, flights: prev.flights.map(f => f.id === flightId ? { ...f, ...updates } : f) } : prev);
  const addHotelBooking = (hotel: HotelBooking) => setCurrentTripInternal(prev => prev ? { ...prev, hotels: [...(prev.hotels || []).filter(h => h.destinationCity !== hotel.destinationCity), hotel] } : null);
  const updateHotelBooking = (hotelId: string, updates: Partial<HotelBooking>) => setCurrentTripInternal(prev => prev && prev.hotels ? { ...prev, hotels: prev.hotels.map(h => h.id === hotelId ? { ...h, ...updates } : h) } : prev);
  const setCarRental = (car: CarRental | undefined) => setCurrentTripInternal(prev => prev ? { ...prev, carRental: car } : null);
  const updateCarRental = (carId: string, updates: Partial<CarRental>) => setCurrentTripInternal(prev => prev && prev.carRental && prev.carRental.id === carId ? { ...prev, carRental: { ...prev.carRental, ...updates } } : prev);
  
  const setDepartureCab = (cab: CabBooking | undefined) => setCurrentTripInternal(prev => prev ? { ...prev, departureCab: cab } : null);
  const updateDepartureCab = (cabId: string, updates: Partial<CabBooking>) => setCurrentTripInternal(prev => prev && prev.departureCab && prev.departureCab.id === cabId ? { ...prev, departureCab: { ...prev.departureCab, ...updates } } : prev);
  const setArrivalCab = (cab: CabBooking | undefined) => setCurrentTripInternal(prev => prev ? { ...prev, arrivalCab: cab } : null);
  const updateArrivalCab = (cabId: string, updates: Partial<CabBooking>) => setCurrentTripInternal(prev => prev && prev.arrivalCab && prev.arrivalCab.id === cabId ? { ...prev, arrivalCab: { ...prev.arrivalCab, ...updates } } : prev);
  
  const addTrainBooking = (train: TrainBooking) => setCurrentTripInternal(prev => prev ? { ...prev, trains: [...(prev.trains || []), train] } : null);
  const updateTrainBooking = (trainId: string, updates: Partial<TrainBooking>) => setCurrentTripInternal(prev => prev && prev.trains ? { ...prev, trains: prev.trains.map(t => t.id === trainId ? { ...t, ...updates } : t) } : prev);

  const addBusBooking = (bus: BusBooking) => setCurrentTripInternal(prev => prev ? { ...prev, buses: [...(prev.buses || []), bus] } : null);
  const updateBusBooking = (busId: string, updates: Partial<BusBooking>) => setCurrentTripInternal(prev => prev && prev.buses ? { ...prev, buses: prev.buses.map(b => b.id === busId ? { ...b, ...updates } : b) } : prev);


  const setPackingList = (list: string[]) => setCurrentTripInternal(prev => prev ? { ...prev, packingList: list } : null);
  const clearCurrentTrip = () => setCurrentTrip(null); 

  const addItineraryEvent = (dayIndex: number, event: ItineraryItem) => { if (!currentTrip || !currentTrip.itinerary) return; const newItinerary = JSON.parse(JSON.stringify(currentTrip.itinerary)); if (!newItinerary.dailyBreakdown[dayIndex]) return; newItinerary.dailyBreakdown[dayIndex].events.push(event); setCurrentTripInternal(prev => prev ? { ...prev, itinerary: newItinerary } : null); updateHistory(newItinerary); };
  const updateItineraryEvent = (dayIndex: number, eventIdentifier: string, updatedEventData: Partial<ItineraryItem>) => { if (!currentTrip || !currentTrip.itinerary) return; const newItinerary = JSON.parse(JSON.stringify(currentTrip.itinerary)); if (!newItinerary.dailyBreakdown[dayIndex]) return; const eventIndex = newItinerary.dailyBreakdown[dayIndex].events.findIndex((e: ItineraryItem) => e.identifier === eventIdentifier); if (eventIndex > -1) { newItinerary.dailyBreakdown[dayIndex].events[eventIndex] = { ...newItinerary.dailyBreakdown[dayIndex].events[eventIndex], ...updatedEventData, }; setCurrentTripInternal(prev => prev ? { ...prev, itinerary: newItinerary } : null); updateHistory(newItinerary); } };
  const deleteItineraryEvent = (dayIndex: number, eventIdentifier: string) => { if (!currentTrip || !currentTrip.itinerary) return; const newItinerary = JSON.parse(JSON.stringify(currentTrip.itinerary)); if (!newItinerary.dailyBreakdown[dayIndex]) return; newItinerary.dailyBreakdown[dayIndex].events = newItinerary.dailyBreakdown[dayIndex].events.filter((event: ItineraryItem) => event.identifier !== eventIdentifier).map((event: ItineraryItem) => ({ ...event, travelTimeToNext: undefined, })); setCurrentTripInternal(prev => prev ? { ...prev, itinerary: newItinerary } : null); updateHistory(newItinerary); };
  const reorderItineraryEvents = (dayIndex: number, oldEventIndex: number, newEventIndex: number) => { setCurrentTripInternal(prevTrip => { if (!prevTrip || !prevTrip.itinerary || !prevTrip.itinerary.dailyBreakdown[dayIndex] || oldEventIndex === newEventIndex) return prevTrip; const newItinerary = JSON.parse(JSON.stringify(prevTrip.itinerary)); const dayEvents = newItinerary.dailyBreakdown[dayIndex].events; if (oldEventIndex < 0 || oldEventIndex >= dayEvents.length || newEventIndex < 0 || newEventIndex > dayEvents.length) return prevTrip; const [movedEvent] = dayEvents.splice(oldEventIndex, 1); dayEvents.splice(newEventIndex, 0, movedEvent); newItinerary.dailyBreakdown[dayIndex].events = dayEvents.map((event: ItineraryItem) => ({ ...event, travelTimeToNext: undefined, })); if (dayEvents.length > 0) dayEvents[dayEvents.length - 1].travelTimeToNext = "N/A"; const updatedFullTrip = { ...prevTrip, itinerary: newItinerary }; updateHistory(newItinerary); if (updatedFullTrip.userId && updatedFullTrip) saveTrip(updatedFullTrip); return updatedFullTrip; }); };
  
  const undoItineraryChange = () => { if (itineraryHistoryPointer > 0) { const newPointer = itineraryHistoryPointer - 1; setItineraryHistoryPointer(newPointer); setCurrentTripInternal(prev => prev ? { ...prev, itinerary: JSON.parse(JSON.stringify(itineraryHistory[newPointer])) } : null); } };
  const redoItineraryChange = () => { if (itineraryHistoryPointer < itineraryHistory.length - 1) { const newPointer = itineraryHistoryPointer + 1; setItineraryHistoryPointer(newPointer); setCurrentTripInternal(prev => prev ? { ...prev, itinerary: JSON.parse(JSON.stringify(itineraryHistory[newPointer])) } : null); } };
  const canUndoItinerary = () => itineraryHistoryPointer > 0;
  const canRedoItinerary = () => itineraryHistoryPointer < itineraryHistory.length - 1;

  const setBudget = (amount: number) => setCurrentTripInternal(prev => prev ? { ...prev, budget: amount } : null);
  const addExpense = (expenseData: Omit<Expense, 'id'>) => { setCurrentTripInternal(prev => { if (!prev) return null; const finalPaidById = expenseData.paidById || prev.participants?.find(p=>p.isCurrentUser)?.id || prev.participants?.[0]?.id || (currentUser?.id ?? 'unknown_payer'); let finalSplitWithIds = expenseData.splitWithIds && expenseData.splitWithIds.length > 0 ? expenseData.splitWithIds : prev.participants?.map(p => p.id) || [finalPaidById]; if (finalSplitWithIds.length === 0) finalSplitWithIds = [finalPaidById]; const newExpense: Expense = { id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, ...expenseData, paidById: finalPaidById, splitWithIds: finalSplitWithIds, }; const updatedExpenses = [...(prev.expenses || []), newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); return { ...prev, expenses: updatedExpenses }; }); };
  const updateExpense = (expenseId: string, updates: Partial<Expense>) => { setCurrentTripInternal(prev => prev && prev.expenses ? { ...prev, expenses: prev.expenses.map(exp => exp.id === expenseId ? { ...exp, ...updates } : exp).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) } : prev); };
  const deleteExpense = (expenseId: string) => { setCurrentTripInternal(prev => prev && prev.expenses ? { ...prev, expenses: prev.expenses.filter(exp => exp.id !== expenseId) } : prev); };
  
  const addParticipant = (name: string) => { setCurrentTripInternal(prev => { if (!prev) return null; const newParticipant: TripParticipant = { id: `participant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, name, isCurrentUser: false, }; const updatedParticipants = [...(prev.participants || []), newParticipant]; return { ...prev, participants: updatedParticipants }; }); };
  const removeParticipant = (participantId: string) => { setCurrentTripInternal(prev => { if (!prev || !prev.participants) return prev; const participantToRemove = prev.participants.find(p => p.id === participantId); if (participantToRemove?.isCurrentUser) { alert("Cannot remove the main user of the trip."); return prev; } const updatedParticipants = prev.participants.filter(p => p.id !== participantId); const updatedExpenses = (prev.expenses || []).map(exp => { let newPaidById = exp.paidById; if (exp.paidById === participantId) newPaidById = updatedParticipants.find(p => p.isCurrentUser)?.id || updatedParticipants[0]?.id || 'unknown_payer'; let newSplitWithIds = exp.splitWithIds.filter(id => id !== participantId); if (newSplitWithIds.length === 0 && updatedParticipants.length > 0) newSplitWithIds = [newPaidById]; return { ...exp, paidById: newPaidById, splitWithIds: newSplitWithIds }; }).filter(exp => exp.splitWithIds.length > 0); return { ...prev, participants: updatedParticipants, expenses: updatedExpenses }; }); };
  
  const updateTripNotes = (notes: string) => { setCurrentTripInternal(prev => { if (!prev) return null; const updatedTrip = { ...prev, notes }; if (prev.userId && updatedTrip) saveTrip(updatedTrip); return updatedTrip; }); };
  const toggleLikeItineraryEvent = (dayIndex: number, eventIdentifier: string, userId: string) => { setCurrentTripInternal(prevTrip => { if (!prevTrip || !prevTrip.itinerary || !prevTrip.itinerary.dailyBreakdown[dayIndex]) return prevTrip; const newItinerary = JSON.parse(JSON.stringify(prevTrip.itinerary)); const eventIndex = newItinerary.dailyBreakdown[dayIndex].events.findIndex((e: ItineraryItem) => e.identifier === eventIdentifier); if (eventIndex > -1) { const eventToUpdate = newItinerary.dailyBreakdown[dayIndex].events[eventIndex]; eventToUpdate.likes = eventToUpdate.likes || []; const userLikeIndex = eventToUpdate.likes.indexOf(userId); if (userLikeIndex > -1) eventToUpdate.likes.splice(userLikeIndex, 1); else eventToUpdate.likes.push(userId); } else return prevTrip; const updatedFullTrip = { ...prevTrip, itinerary: newItinerary }; if (updatedFullTrip.userId && updatedFullTrip) saveTrip(updatedFullTrip); return updatedFullTrip; }); };

  return (
    <TripContext.Provider value={{
      currentTrip, setCurrentTrip, updateTripDetails, setPrimaryTransportationMode, setItinerary, 
      addFlightBooking, updateFlightBooking, addHotelBooking, updateHotelBooking, 
      setCarRental, updateCarRental, setDepartureCab, updateDepartureCab, setArrivalCab, updateArrivalCab,
      addTrainBooking, updateTrainBooking, addBusBooking, updateBusBooking,
      setPackingList, clearCurrentTrip,
      addItineraryEvent, updateItineraryEvent, deleteItineraryEvent, reorderItineraryEvents,
      setBudget, addExpense, updateExpense, deleteExpense, addParticipant, removeParticipant,
      itineraryHistory, itineraryHistoryPointer, undoItineraryChange, redoItineraryChange,
      canUndoItinerary, canRedoItinerary, updateTripNotes, toggleLikeItineraryEvent
    }}>
      {children}
    </TripContext.Provider>
  );
};