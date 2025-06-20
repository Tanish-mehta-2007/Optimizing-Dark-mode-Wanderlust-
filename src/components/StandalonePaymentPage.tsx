import React, { useState, useEffect, useContext } from 'react';
import { TripContext } from '../contexts/TripContext';
import { FlightBooking, HotelBooking, CarRental, AppView, TrainBooking, BusBooking, CabBooking } from '../../types'; // Added TrainBooking, BusBooking, CabBooking
import { completePayment } from '../services/mockBookingService';
import LoadingSpinner from './common/LoadingSpinner';
import { saveTrip } from '../services/storageService';

// Icons
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-blue-600 dark:text-blue-400"><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15z" /><path fillRule="evenodd" d="M22.5 7.5h-21v1.5h21V7.5zM15 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM9.16 12.22a.75.75 0 10-1.06 1.06l1.06-1.06zM8.1 13.28a.75.75 0 001.06-1.06l-1.06 1.06zM5.25 12a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 015.25 12z" clipRule="evenodd" /></svg>;
const FlightIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const HotelIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
const CarIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;
const TrainIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M5.25 6.75V17.25m13.5-10.5v10.5m-13.5 0L5.25 15M12 17.25l-1.5-2.25M18.75 17.25l-1.5-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5A6.75 6.75 0 019.75 6.75h4.5A6.75 6.75 0 0121 13.5" /></svg>;
const BusIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m0-2.25h.008v.008h-.008V12m0 0c0-2.414-1.093-4.53-2.764-5.858M3.375 16.5c1.135 0 2.187.229 3.137.635m11.49-.492c.95.406 1.992.635 3.137.635M12 4.5V2.25m0 2.25V2.25m0 2.25v2.25M5.25 6.75C5.25 9.96 8.28 12.45 12 12.45s6.75-2.49 6.75-5.7S15.72 1.5 12 1.5S5.25 3.04 5.25 6.75z" /></svg>;
const CabIconMini = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5c0-.966-.351-1.837-.936-2.514A3.695 3.695 0 0012 10.5c-.711 0-1.385.174-1.96.486-.585.677-.94 1.548-.94 2.514V21m3-8.25V9M10.5 9V3.75A1.5 1.5 0 0112 2.25h.008c.828 0 1.5.672 1.5 1.5V9M10.5 21h3m-3-3h3M7.5 6.313A11.963 11.963 0 006 6.687c1.656-.323 3.223-.886 4.5-1.748M16.5 6.313A11.963 11.963 0 0118 6.687c-1.656-.323-3.223-.886-4.5-1.748" /></svg>;


interface StandalonePaymentPageProps {
  onPaymentSuccess: (originalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_train' | 'standalone_bus' | 'standalone_cab', destination: string, dates?: string) => void;
  onBack: () => void;
}

const StandalonePaymentPage: React.FC<StandalonePaymentPageProps> = ({ onPaymentSuccess, onBack }) => {
  const { currentTrip, updateFlightBooking, updateHotelBooking, updateCarRental, updateTrainBooking, updateBusBooking, updateDepartureCab, updateArrivalCab } = useContext(TripContext);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [itemToPay, setItemToPay] = useState<FlightBooking | HotelBooking | CarRental | TrainBooking | BusBooking | CabBooking | null>(null);
  const [itemType, setItemType] = useState<'flight' | 'hotel' | 'car' | 'train' | 'bus' | 'cab' | null>(null);

  useEffect(() => {
    if (currentTrip) {
      if (currentTrip.source === 'standalone_flight' && currentTrip.flights) {
        const flight = currentTrip.flights.find(f => f.booked && !f.paymentCompleted);
        if (flight) { setItemToPay(flight); setItemType('flight'); }
      } else if (currentTrip.source === 'standalone_hotel' && currentTrip.hotels) {
        const hotel = currentTrip.hotels.find(h => h.booked && !h.paymentCompleted);
        if (hotel) { setItemToPay(hotel); setItemType('hotel'); }
      } else if (currentTrip.source === 'standalone_car' && currentTrip.carRental) {
        if (currentTrip.carRental.booked && !currentTrip.carRental.paymentCompleted) {
          setItemToPay(currentTrip.carRental); setItemType('car');
        }
      } else if (currentTrip.source === 'standalone_train' && currentTrip.trains) {
        const train = currentTrip.trains.find(t => t.booked && !t.paymentCompleted);
        if (train) { setItemToPay(train); setItemType('train'); }
      } else if (currentTrip.source === 'standalone_bus' && currentTrip.buses) {
        const bus = currentTrip.buses.find(b => b.booked && !b.paymentCompleted);
        if (bus) { setItemToPay(bus); setItemType('bus'); }
      } else if (currentTrip.source === 'standalone_cab') {
        const cab = currentTrip.bookingIntent === 'arrival_cab' ? currentTrip.arrivalCab : currentTrip.departureCab;
        if (cab && cab.booked && !cab.paymentCompleted) {
          setItemToPay(cab); setItemType('cab');
        }
      }
    }
  }, [currentTrip]);

  const handleConfirmPayment = async () => {
    if (!itemToPay || !itemType || !currentTrip) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const result = await completePayment(itemType, itemToPay.id);
      if (result.success) {
        if (itemType === 'flight') updateFlightBooking(itemToPay.id, { paymentCompleted: true });
        else if (itemType === 'hotel') updateHotelBooking(itemToPay.id, { paymentCompleted: true });
        else if (itemType === 'car') updateCarRental(itemToPay.id, { paymentCompleted: true });
        else if (itemType === 'train') updateTrainBooking(itemToPay.id, { paymentCompleted: true });
        else if (itemType === 'bus') updateBusBooking(itemToPay.id, { paymentCompleted: true });
        else if (itemType === 'cab') {
          if (currentTrip.bookingIntent === 'arrival_cab' && currentTrip.arrivalCab?.id === itemToPay.id) {
            updateArrivalCab(itemToPay.id, { paymentCompleted: true });
          } else if (currentTrip.departureCab?.id === itemToPay.id) {
            updateDepartureCab(itemToPay.id, { paymentCompleted: true });
          }
        }
        
        saveTrip(currentTrip); 

        let destination = 'Unknown';
        if ('destinationCity' in itemToPay && itemToPay.destinationCity) destination = itemToPay.destinationCity;
        else if ('destination' in itemToPay && (itemToPay as FlightBooking).destination) destination = (itemToPay as FlightBooking).destination!;
        else if ('dropoffLocation' in itemToPay && (itemToPay as CabBooking | CarRental).dropoffLocation) destination = (itemToPay as CabBooking | CarRental).dropoffLocation!; 
        else if ('pickupLocation' in itemToPay && (itemToPay as CarRental).pickupLocation) destination = (itemToPay as CarRental).pickupLocation!; 
        
        onPaymentSuccess(currentTrip.source as 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_train' | 'standalone_bus' | 'standalone_cab', destination, currentTrip.dates);
      } else {
        setPaymentError(`Payment failed for the selected ${itemType}.`);
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : `An unexpected error occurred during payment for the ${itemType}.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderItemSummary = () => {
    if (!itemToPay || !itemType) return <p className="text-slate-500 dark:text-slate-400">No item selected for payment.</p>;
    
    let title = "";
    let icon: React.ReactNode = null;
    if (itemType === 'flight') { const flight = itemToPay as FlightBooking; title = `${flight.airline} ${flight.flightNumber || ''}`; icon = <FlightIconMini />; } 
    else if (itemType === 'hotel') { title = (itemToPay as HotelBooking).name; icon = <HotelIconMini />; } 
    else if (itemType === 'car') { title = (itemToPay as CarRental).carType || "Car Rental"; icon = <CarIconMini />; }
    else if (itemType === 'train') { title = (itemToPay as TrainBooking).trainLine || "Train Ticket"; icon = <TrainIconMini />; }
    else if (itemType === 'bus') { title = (itemToPay as BusBooking).busCompany || "Bus Ticket"; icon = <BusIconMini />; }
    else if (itemType === 'cab') { title = (itemToPay as CabBooking).carModel || "Cab Ride"; icon = <CabIconMini />; }


    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
        <div className="flex items-center mb-2">
          {icon}
          <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{title}</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{itemToPay.details}</p>
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${itemToPay.price.toFixed(2)}</p>
      </div>
    );
  };
  
  if (!itemToPay) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Payment</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">No item is currently selected for payment. Please go back and select an item to book.</p>
        <button onClick={onBack} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm transition-colors button-interactive">
          Go Back
        </button>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="max-w-lg mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <header className="text-center space-y-3">
          <CreditCardIcon />
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">Confirm Your Booking</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Please review your selected item and proceed to payment.</p>
        </header>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Item to Pay</h2>
          {renderItemSummary()}
          {paymentError && <p className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mt-4 text-sm">{paymentError}</p>}
          
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessingPayment || !itemToPay}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 flex items-center justify-center button-interactive"
          >
            {isProcessingPayment ? (
              <LoadingSpinner message="Processing..." size="small" />
            ) : (
              `Confirm & Pay $${itemToPay.price.toFixed(2)} (Simulated)`
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            disabled={isProcessingPayment}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm transition-colors button-interactive"
          >
            Back to Selection
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
export default StandalonePaymentPage;
