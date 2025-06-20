
import React from 'react';
import { Trip, FlightBooking, HotelBooking } from '../../types'; // Assuming it might use the Trip type

interface BookingOverviewProps {
  currentTrip: Trip | null;
}

const BookingOverview: React.FC<BookingOverviewProps> = ({ currentTrip }) => {
  if (!currentTrip) {
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-600 my-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center">No trip data for overview.</p>
      </div>
    );
  }

  const bookedFlights = currentTrip.flights?.filter(f => f.booked) || [];
  const bookedHotels = currentTrip.hotels?.filter(h => h.booked) || [];
  const bookedCar = currentTrip.carRental?.booked ? currentTrip.carRental : null;

  const hasBookings = bookedFlights.length > 0 || bookedHotels.length > 0 || bookedCar;

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow space-y-3 border border-slate-200 dark:border-slate-600 my-6">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-300 dark:border-slate-600">
        Current Selections
      </h4>
      {!hasBookings && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">No items selected yet.</p>
      )}
      {bookedFlights.map((flight, index) => (
        <div key={`flight-${flight.id}-${index}`} className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Flight (Leg {flight.legId?.split('-').pop() || index + 1}):</span> {flight.details} - ${flight.price.toFixed(2)}
        </div>
      ))}
      {bookedHotels.map((hotel, index) => (
        <div key={`hotel-${hotel.id}-${index}`} className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Hotel ({hotel.destinationCity.split(',')[0]}):</span> {hotel.name} - ${hotel.price.toFixed(2)}
        </div>
      ))}
      {bookedCar && (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Car:</span> {bookedCar.details} - ${bookedCar.price.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default BookingOverview;
