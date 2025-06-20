
import React, { useState, useEffect, useContext } from 'react';
import { TripContext } from '../contexts/TripContext';
import { AuthContext } from '../contexts/AuthContext';
// import type { AuthContextType } from '../contexts/AuthContext'; // Type is inferred
import { getSavedTrips, deleteTrip } from '../services/storageService';
import { Trip, FlightBooking, HotelBooking, CarRental, AppView } from '../types';
import Modal from './common/Modal';
import { TRAVEL_TIERS } from '../constants';
import { fetchFlightStatus } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';

interface MyTripsDisplayProps {
  onPlanNewTrip: () => void;
  onViewTripDetails: (tripId: string) => void;
}

// Icons
const PlaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-sky-600 dark:text-sky-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-lime-600 dark:text-lime-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-slate-500 dark:text-slate-400"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
const StyleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-slate-500 dark:text-slate-400"><path d="M10.75 5.008V2.882a2.502 2.502 0 00-5 0v2.126A2.502 2.502 0 007.5 7.134h0H5.75A.75.75 0 005 7.884v2.232a.75.75 0 00.75.75h1.75v0a2.5 2.5 0 001.75 2.316V16a.75.75 0 001.5 0v-2.816a2.5 2.5 0 001.75-2.316V13h0a.75.75 0 00.75-.75v-2.232a.75.75 0 00-.75-.75H12.5h0a2.502 2.502 0 001.75-2.126V5.008h0zM9.25 5.008V2.882a1 1 0 112 0v2.126a1 1 0 11-2 0z" /><path d="M6.25 12.25a.75.75 0 00-.75.75v2.232a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-2.232a.75.75 0 00-.75-.75h-7.5z" /></svg>;
const SuitcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 dark:text-blue-500 opacity-60"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>;
const AlbumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-500 opacity-60"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;

const MyTripsDisplay: React.FC<MyTripsDisplayProps> = ({ onPlanNewTrip, onViewTripDetails }) => {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const { setCurrentTrip } = useContext(TripContext);
  const { currentUser } = useContext(AuthContext); 
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  useEffect(() => {
    if (currentUser) setAllTrips(getSavedTrips(currentUser.id));
    else setAllTrips([]);
  }, [currentUser]);

  const upcomingTrips = allTrips.filter(trip => new Date((trip.dates.split(' to ')[1] || trip.dates.split(' to ')[0]) + 'T23:59:59') >= new Date());
  const pastTrips = allTrips.filter(trip => new Date((trip.dates.split(' to ')[1] || trip.dates.split(' to ')[0]) + 'T23:59:59') < new Date())
    .sort((a, b) => new Date((b.dates.split(' to ')[1] || b.dates.split(' to ')[0]) + 'T23:59:59').getTime() - new Date((a.dates.split(' to ')[1] || a.dates.split(' to ')[0]) + 'T23:59:59').getTime());

  const handleSelectAndResumeTrip = (trip: Trip) => { setCurrentTrip(trip); /* Navigation handled by App.tsx */ };
  const openDeleteConfirmModal = (trip: Trip) => { setTripToDelete(trip); setIsConfirmDeleteModalOpen(true); };
  const confirmDeleteTrip = () => {
    if (tripToDelete && currentUser) {
      deleteTrip(currentUser.id, tripToDelete.id);
      setAllTrips(getSavedTrips(currentUser.id));
      setIsConfirmDeleteModalOpen(false);
      setTripToDelete(null);
    }
  };

  const renderTripCard = (trip: Trip) => {
    const tier = TRAVEL_TIERS.find(t => t.id === trip.travelTier);
    const destinationsDisplay = trip.destinations.join(' → ');
    const titleDisplay = trip.itinerary?.title || destinationsDisplay;
    return (
      <div key={trip.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden item-card-animate-in card-interactive-lift">
        <div className="p-4 sm:p-5 flex-grow">
          <h3 className="text-md sm:text-lg font-semibold text-blue-700 dark:text-blue-400 truncate mb-1 sm:mb-1.5" title={titleDisplay}>{titleDisplay}</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center"><CalendarIcon /> {trip.dates}</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 flex items-center"><StyleIcon /> {tier?.name || trip.travelTier}</p>
          <div className="space-y-1">
            {trip.flights?.some(f => f.booked) && <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center"><PlaneIcon /> Flight Booked</p>}
            {trip.hotels?.some(h => h.booked) && <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center"><HotelIcon /> Hotel Booked</p>}
            {trip.carRental?.booked && <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center"><CarIcon /> Car Booked</p>}
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
          <button 
            onClick={() => onViewTripDetails(trip.id)} 
            className="text-xs py-1.5 sm:py-2 px-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md font-medium button-interactive"
          >
            Details
          </button>
          <button 
            onClick={() => handleSelectAndResumeTrip(trip)} 
            className="text-xs py-1.5 sm:py-2 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium button-interactive"
          >
            Resume
          </button>
          <button 
            onClick={() => openDeleteConfirmModal(trip)} 
            className="text-xs py-1.5 sm:py-2 px-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium button-interactive"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const EmptyState: React.FC<{ title: string, message: string, icon: React.ReactNode }> = ({ title, message, icon }) => (
    <div className="text-center py-10 sm:py-12 px-4 sm:px-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 item-card-animate-in">
      <div className="mb-3 sm:mb-4">{icon}</div>
      <p className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-200 mt-2 sm:mt-3">{title}</p>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">My Trips</h1>
          <button
            onClick={onPlanNewTrip}
            className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg shadow-md transition-colors transform hover:scale-105 focus:outline-none button-interactive"
          >
            + Plan New Trip
          </button>
        </header>

        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 sm:mb-6">Upcoming Trips</h2>
          {upcomingTrips.length === 0 
            ? <EmptyState title="No Upcoming Adventures" message="Time to plan your next escape!" icon={<SuitcaseIcon />} />
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{upcomingTrips.map(renderTripCard)}</div>
          }
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 sm:mb-6">Past Memories</h2>
          {pastTrips.length === 0 
            ? <EmptyState title="No Past Expeditions" message="Your travel history will appear here." icon={<AlbumIcon />} />
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{pastTrips.map(renderTripCard)}</div>
          }
        </section>
      </div>

      {tripToDelete && (
        <Modal
          isOpen={isConfirmDeleteModalOpen}
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          title="Confirm Delete Trip"
          size="sm"
          footerActions={
            <>
              <button 
                onClick={() => setIsConfirmDeleteModalOpen(false)} 
                className="w-full sm:w-auto mb-2 sm:mb-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 font-medium button-interactive"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTrip} 
                className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium button-interactive"
              >
                Delete Trip
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">Are you sure you want to permanently delete your trip to <span className="font-semibold">{tripToDelete.itinerary?.title || tripToDelete.destinations.join(', ')}</span>? This action cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default MyTripsDisplay;