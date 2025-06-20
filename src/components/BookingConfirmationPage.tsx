
import React, { useContext, useEffect, useState } from 'react';
import { TripContext } from '../contexts/TripContext';
import { FlightBooking, HotelBooking, CarRental } from '../../types';
import { getMockHotelSuggestionsForCity, getMockFlightSuggestionsToCity, getMockCarSuggestionsInCity } from '../services/mockBookingService';

// Icons
const CheckCircleIconSolid = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 dark:text-emerald-400"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L10.5 12.94l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" /></svg>;
const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
const FlightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-sky-500 dark:text-sky-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-lime-500 dark:text-lime-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;
const CheckCircleItemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5 text-emerald-500 dark:text-emerald-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>;
const PlanTripButtonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.25a.75.75 0 00-1.5 0v4.59L7.72 7.72a.75.75 0 00-1.06 1.06l3.25 3.25a.75.75 0 001.06 0l3.25-3.25a.75.75 0 10-1.06-1.06L10.75 9.34V4.75z" clipRule="evenodd" />
  </svg>
);


interface CompatibleCrossSellContextType {
  originalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_bus';
  destination: string;
  dates?: string;
}

interface BookingConfirmationPageProps {
  onNextFullTrip: () => void;
  onSkipCrossSellAndGoHome: () => void;
  onNavigateToStandaloneFlight: (prefill?: { destination?: string; dates?: string }) => void;
  onNavigateToStandaloneHotel: (prefill?: { destination?: string; dates?: string }) => void;
  onNavigateToStandaloneCar: (prefill?: { destination?: string; dates?: string }) => void;
  onPlanFullTripFromCrossSell: (destination: string, dates?: string) => void;
  crossSellContext: CompatibleCrossSellContextType | null; 
}

interface MockSuggestion {
  id: string;
  name: string;
  shortDescription: string;
  priceDisplay: string; 
}

const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  onNextFullTrip,
  onSkipCrossSellAndGoHome,
  onNavigateToStandaloneFlight,
  onNavigateToStandaloneHotel,
  onNavigateToStandaloneCar,
  onPlanFullTripFromCrossSell, 
  crossSellContext,
}) => {
  const { currentTrip } = useContext(TripContext);
  const [hotelSuggestions, setHotelSuggestions] = useState<MockSuggestion[]>([]);
  const [flightSuggestions, setFlightSuggestions] = useState<MockSuggestion[]>([]);
  const [carSuggestions, setCarSuggestions] = useState<MockSuggestion[]>([]);

  const isStandaloneBooking = !!crossSellContext;

  useEffect(() => {
    if (isStandaloneBooking && crossSellContext) {
      const { originalSource, destination } = crossSellContext;
      if (originalSource !== 'standalone_hotel') {
        setHotelSuggestions(getMockHotelSuggestionsForCity(destination));
      } else { setHotelSuggestions([]); }
      if (originalSource !== 'standalone_flight') {
        setFlightSuggestions(getMockFlightSuggestionsToCity(destination, currentTrip?.originCity));
      } else { setFlightSuggestions([]); }
      if (originalSource !== 'standalone_car') {
        setCarSuggestions(getMockCarSuggestionsInCity(destination));
      } else { setCarSuggestions([]); }
    }
  }, [crossSellContext, isStandaloneBooking, currentTrip?.originCity]);

  if (!currentTrip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
        <p className="text-slate-600 dark:text-slate-300">No trip data found. Cannot display confirmation.</p>
        <button onClick={onSkipCrossSellAndGoHome} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 button-interactive">
          Go to Home
        </button>
      </div>
    );
  }

  const confirmedFlights = currentTrip.flights?.filter(f => f.paymentCompleted) || [];
  const confirmedHotels = currentTrip.hotels?.filter(h => h.paymentCompleted) || [];
  const confirmedCar = currentTrip.carRental?.paymentCompleted ? currentTrip.carRental : null;

  const hasAnyConfirmedBookings = confirmedFlights.length > 0 || confirmedHotels.length > 0 || !!confirmedCar;

  const renderItemSummary = (item: FlightBooking | HotelBooking | CarRental, typeLabel: string) => {
    let title = "";
    if ('airline' in item) title = `${item.airline} ${item.flightNumber || ''}`;
    else if ('name' in item) title = item.name;
    else if ('carType' in item) title = item.carType || "Car Rental";

    return (
      <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
          <div className="mb-2 sm:mb-0">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center"><CheckCircleItemIcon /> {typeLabel}: {title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">{item.details}</p>
            {'destinationCity' in item && <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">For: {item.destinationCity.split(',')[0]}</p>}
          </div>
          <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base">${item.price.toFixed(2)}</p>
        </div>
      </div>
    );
  };

  const SuggestionCard: React.FC<{ suggestion: MockSuggestion, onBook: () => void, icon: React.ReactNode, itemType: string }> = ({ suggestion, onBook, icon, itemType }) => (
    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 flex flex-col card-interactive-lift">
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100">{suggestion.name}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 flex-grow">{suggestion.shortDescription}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">{suggestion.priceDisplay}</p>
      <button onClick={onBook} className="mt-auto w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors button-interactive">
        Book {itemType}
      </button>
    </div>
  );
  
  let headerMessage = "Booking Confirmed!";
  if (isStandaloneBooking && crossSellContext) {
    if (crossSellContext.originalSource === 'standalone_flight') headerMessage = `Your flight to ${crossSellContext.destination.split(',')[0]} is confirmed!`;
    else if (crossSellContext.originalSource === 'standalone_hotel') headerMessage = `Your hotel in ${crossSellContext.destination.split(',')[0]} is booked!`;
    else if (crossSellContext.originalSource === 'standalone_car') headerMessage = `Your car rental in ${crossSellContext.destination.split(',')[0]} is secured!`;
  }


  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 flex-1 flex flex-col">
        <header className="text-center space-y-4">
          <CheckCircleIconSolid />
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {headerMessage}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-md">
            Your arrangements are set. Get ready for an amazing trip!
          </p>
        </header>

        <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Your Confirmed Bookings</h2>
          {hasAnyConfirmedBookings ? (
              <div className="space-y-3">
              {confirmedFlights.map(item => renderItemSummary(item, "Flight"))}
              {confirmedHotels.map(item => renderItemSummary(item, "Hotel"))}
              {confirmedCar && renderItemSummary(confirmedCar, "Car Rental")}
              </div>
          ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-center py-3">No bookings were confirmed in this transaction.</p>
          )}
        </section>

        {isStandaloneBooking && crossSellContext && (
          <>
            <p className="text-center text-lg font-medium text-slate-700 dark:text-slate-200 pt-4">
              Complete your trip to {crossSellContext.destination.split(',')[0]}?
            </p>
            {hotelSuggestions.length > 0 && (
              <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">Need a Hotel?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotelSuggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onBook={() => onNavigateToStandaloneHotel({destination: crossSellContext.destination, dates: crossSellContext.dates})} icon={<HotelIcon />} itemType="Hotel" />)}
                </div>
              </section>
            )}
            {flightSuggestions.length > 0 && (
              <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 mb-3">Arrange Other Flights?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flightSuggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onBook={() => onNavigateToStandaloneFlight({destination: crossSellContext.destination, dates: crossSellContext.dates})} icon={<FlightIcon />} itemType="Flights" />)}
                </div>
              </section>
            )}
            {carSuggestions.length > 0 && (
              <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-lime-600 dark:text-lime-400 mb-3">Rent a Car?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carSuggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onBook={() => onNavigateToStandaloneCar({destination: crossSellContext.destination, dates: crossSellContext.dates})} icon={<CarIcon />} itemType="Car" />)}
                </div>
              </section>
            )}
            {/* New "Plan Full Trip" button */}
           <div className="mt-6 text-center">
                <button
                    onClick={() => onPlanFullTripFromCrossSell(crossSellContext.destination, crossSellContext.dates)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors transform hover:scale-105 button-interactive"
                >
                    <PlanTripButtonIcon /> Plan Full Trip to {crossSellContext.destination.split(',')[0]}
                </button>
            </div>
        </>
        )}
        
        <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-auto"> {/* mt-auto for pushing to bottom */}
          {isStandaloneBooking ? (
              <button
                  onClick={onSkipCrossSellAndGoHome}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md transition-colors button-interactive"
              >
                  Finish & Go Home
              </button>
          ) : (
              <button
                  onClick={onNextFullTrip}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors transform hover:scale-105 button-interactive"
              >
                  Next: Create Packing List
              </button>
          )}
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

export default BookingConfirmationPage;
