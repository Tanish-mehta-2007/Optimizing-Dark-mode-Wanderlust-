
import React, { useState, useContext } from 'react';
import { TripContext } from '../contexts/TripContext';
import { FlightBooking, HotelBooking, CarRental, TrainBooking, BusBooking, AppView } from '../../types'; 
import { completePayment } from '../services/mockBookingService';
import LoadingSpinner from './common/LoadingSpinner';
import { saveTrip } from '../services/storageService';

const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400"><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15z" /><path fillRule="evenodd" d="M22.5 7.5h-21v1.5h21V7.5zM15 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM9.16 12.22a.75.75 0 10-1.06 1.06l1.06-1.06zM8.1 13.28a.75.75 0 001.06-1.06l-1.06 1.06zM5.25 12a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 015.25 12z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1.5 text-emerald-500 dark:text-emerald-400"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L10.5 12.94l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" /></svg>;


interface PaymentPageProps {
  onNext: () => void; 
  onBack: (originView?: AppView) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onNext, onBack }) => {
  const { currentTrip, updateFlightBooking, updateHotelBooking, updateCarRental, updateTrainBooking, updateBusBooking } = useContext(TripContext); 
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!currentTrip) {
    return <div className="text-center p-8 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">Error: No trip data found. Please start over.</div>;
  }

  const flightsToPay = currentTrip.flights?.filter(f => f.booked && !f.paymentCompleted) || [];
  const hotelsToPay = currentTrip.hotels?.filter(h => h.booked && !h.paymentCompleted) || [];
  const carToPay = currentTrip.carRental?.booked && !currentTrip.carRental?.paymentCompleted ? currentTrip.carRental : null;
  const trainsToPay = currentTrip.trains?.filter(t => t.booked && !t.paymentCompleted) || [];
  const busesToPay = currentTrip.buses?.filter(b => b.booked && !b.paymentCompleted) || [];


  const itemsToPay: (FlightBooking | HotelBooking | CarRental | TrainBooking | BusBooking)[] = [ 
    ...flightsToPay,
    ...hotelsToPay,
    ...(carToPay ? [carToPay] : []),
    ...trainsToPay,
    ...busesToPay,
  ];

  const alreadyPaidItems: (FlightBooking | HotelBooking | CarRental | TrainBooking | BusBooking)[] = [ 
    ...(currentTrip.flights?.filter(f => f.paymentCompleted) || []),
    ...(currentTrip.hotels?.filter(h => h.paymentCompleted) || []),
    currentTrip.carRental?.paymentCompleted ? currentTrip.carRental : null,
    ...(currentTrip.trains?.filter(t => t.paymentCompleted) || []),
    ...(currentTrip.buses?.filter(b => b.paymentCompleted) || []),
  ].filter(Boolean) as (FlightBooking | HotelBooking | CarRental | TrainBooking | BusBooking)[];


  const totalAmount = itemsToPay.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      let allSucceeded = true;
      for (const item of flightsToPay) {
        const result = await completePayment('flight', item.id);
        if (result.success) updateFlightBooking(item.id, { paymentCompleted: true });
        else { allSucceeded = false; setPaymentError(`Payment failed for flight ${item.details}.`); break; }
      }
      if (!allSucceeded) throw new Error(paymentError || "Flight payment failed");

      for (const item of hotelsToPay) {
        const result = await completePayment('hotel', item.id);
        if (result.success) updateHotelBooking(item.id, { paymentCompleted: true });
        else { allSucceeded = false; setPaymentError(`Payment failed for hotel ${item.name}.`); break; }
      }
      if (!allSucceeded) throw new Error(paymentError || "Hotel payment failed");

      if (carToPay) {
        const result = await completePayment('car', carToPay.id);
        if (result.success) updateCarRental(carToPay.id, { paymentCompleted: true });
        else { allSucceeded = false; setPaymentError(`Payment failed for car rental ${carToPay.details}.`); }
      }
      if (!allSucceeded && paymentError && !trainsToPay.length && !busesToPay.length) throw new Error(paymentError); 
      
      for (const item of trainsToPay) {
        const result = await completePayment('train', item.id);
        if (result.success) updateTrainBooking(item.id, { paymentCompleted: true });
        else { allSucceeded = false; setPaymentError(`Payment failed for train ${item.trainLine}.`); break; }
      }
      if (!allSucceeded && paymentError && !busesToPay.length) throw new Error(paymentError);

      for (const item of busesToPay) {
        const result = await completePayment('bus', item.id);
        if (result.success) updateBusBooking(item.id, { paymentCompleted: true });
        else { allSucceeded = false; setPaymentError(`Payment failed for bus ${item.busCompany}.`); break; }
      }
      if (!allSucceeded && paymentError) throw new Error(paymentError);


      if (allSucceeded) {
        setPaymentSuccess(true);
        if (currentTrip) saveTrip(currentTrip); 
        onNext(); 
      }

    } catch (err) {
      console.error("Payment processing error:", err);
      if (!paymentError) {
        setPaymentError(err instanceof Error ? err.message : "An unexpected error occurred during payment.");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const renderItemSummary = (item: FlightBooking | HotelBooking | CarRental | TrainBooking | BusBooking, typeLabel: string, isPaid: boolean = false) => {
    let title = "";
    if ('airline' in item) title = `${item.airline} ${item.flightNumber || ''}`; 
    else if ('name' in item) title = item.name; 
    else if ('carType' in item) title = item.carType || "Car Rental"; 
    else if ('trainLine' in item) title = `${item.trainLine} ${(item as TrainBooking).trainNumber || ''}`;
    else if ('busCompany' in item) title = `${item.busCompany} ${(item as BusBooking).busNumber || ''}`;

    return (
        <div key={item.id} className={`p-3 rounded-md border ${isPaid ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div className="mb-2 sm:mb-0">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{typeLabel}: {title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.details}</p>
                {'destinationCity' in item && <p className="text-xs text-slate-500 dark:text-slate-400">For: {item.destinationCity.split(',')[0]}</p>}
            </div>
            <p className={`font-semibold text-lg sm:text-base ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>${(item.price || 0).toFixed(2)}</p>
        </div>
        {isPaid && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center"><CheckCircleIcon /> Paid & Confirmed</p>}
        </div>
    );
  };


  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0 flex-1 flex flex-col justify-center"> 
        <header className="text-center py-4">
          <CreditCardIcon />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mt-2">Confirm Your Bookings</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Review your selections and proceed to simulated payment.</p>
        </header>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Order Summary</h3>
          
          {itemsToPay.length === 0 && alreadyPaidItems.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">No items selected for payment. Please go back and make your selections.</p>
          )}

          {alreadyPaidItems.length > 0 && (
              <div className="space-y-3 mb-4">
                  <h4 className="text-md font-medium text-slate-600 dark:text-slate-300">Already Paid:</h4>
                  {alreadyPaidItems.map(item => {
                      let type = "Item";
                      if (currentTrip.flights?.find(f => f.id === item.id)) type = "Flight";
                      else if (currentTrip.hotels?.find(h => h.id === item.id)) type = "Hotel";
                      else if (currentTrip.carRental?.id === item.id) type = "Car Rental";
                      else if (currentTrip.trains?.find(t => t.id === item.id)) type = "Train";
                      else if (currentTrip.buses?.find(b => b.id === item.id)) type = "Bus";
                      return renderItemSummary(item, type, true);
                  })}
              </div>
          )}

          {itemsToPay.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-medium text-slate-600 dark:text-slate-300">Items to Pay:</h4>
              {flightsToPay.map(item => renderItemSummary(item, "Flight"))}
              {hotelsToPay.map(item => renderItemSummary(item, "Hotel"))}
              {carToPay && renderItemSummary(carToPay, "Car Rental")}
              {trainsToPay.map(item => renderItemSummary(item, "Train"))}
              {busesToPay.map(item => renderItemSummary(item, "Bus"))}
              
              <div className="pt-4 border-t border-slate-300 dark:border-slate-600 mt-4">
                <div className="flex justify-between items-center text-xl font-bold text-slate-800 dark:text-slate-100">
                  <span>Total Due:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {paymentError && <p className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mt-4 text-sm">{paymentError}</p>}
          
          {!paymentSuccess && itemsToPay.length > 0 && (
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment || totalAmount === 0}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 flex items-center justify-center button-interactive"
            >
              {isProcessingPayment ? (
                <LoadingSpinner message="Processing..." size="small" />
              ) : (
                `Confirm & Pay $${totalAmount.toFixed(2)} (Simulated)`
              )}
            </button>
          )}
           {(itemsToPay.length === 0 && alreadyPaidItems.length > 0) && (
               <button
                  onClick={onNext}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 button-interactive"
              >
                  Continue
              </button>
           )}
        </div>
        
        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <button
            onClick={() => {
                let backView = AppView.ITINERARY; // Default fallback
                if (currentTrip.buses && currentTrip.buses.some(b => b.booked && !b.paymentCompleted)) {
                    backView = AppView.BUS_BOOKING;
                } else if (currentTrip.trains && currentTrip.trains.some(t => t.booked && !t.paymentCompleted)) {
                    backView = AppView.TRAIN_BOOKING;
                } else if (currentTrip.carRental?.booked && !currentTrip.carRental?.paymentCompleted) {
                    backView = AppView.CAR_BOOKING;
                } else if (currentTrip.hotels && currentTrip.hotels.some(h => h.booked && !h.paymentCompleted)) {
                    backView = AppView.HOTEL_BOOKING;
                } else if (currentTrip.flights && currentTrip.flights.some(f => f.booked && !f.paymentCompleted)) {
                    backView = AppView.FLIGHT_BOOKING;
                }
                onBack(backView);
            }} 
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors button-interactive"
          >
            Back
          </button>
          {(itemsToPay.length === 0 && alreadyPaidItems.length === 0) && (
               <button
                  onClick={onNext}
                  disabled={isProcessingPayment || (itemsToPay.length > 0 && !paymentSuccess)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 button-interactive"
              >
                  Next
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

export default PaymentPage;
