
import { FlightBooking, HotelBooking, CarRental, CabBooking, TrainBooking, BusBooking, FlightClass, CabBookingStatus, BookingSource } from '../../types';
import { MOCK_FLIGHT_OPTIONS_BASE, MOCK_HOTEL_OPTIONS_BASE, MOCK_CAR_RENTAL_OPTIONS_BASE, MOCK_CAB_OPTIONS_BASE, MOCK_TRAIN_OPTIONS_BASE, MOCK_BUS_OPTIONS_BASE } from '../constants';

const simulateApiCall = <T,>(data: T, delay: number = 700): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const generateRandomPrice = (basePrice: number, tier?: string, factor?: number): number => {
  let multiplier = 1.0;
  if (tier === 'budget') multiplier *= 0.8;
  if (tier === 'luxury') multiplier *= 1.5;
  if (factor) multiplier *= factor;
  return Math.round(basePrice * multiplier * (0.9 + Math.random() * 0.2)); // +/- 10% variation
};

// Modified to fetch options for a single leg
export const fetchFlightOptions = async (
  origin: string, 
  destination: string, 
  departureDate: string, 
  passengers: number,
  flightClass: FlightClass,
  travelTier?: string,
  legId?: string 
): Promise<FlightBooking[]> => {
  console.log(`Fetching flight options for leg ${legId || '(single)'}: ${origin} to ${destination}, Date: ${departureDate}, Pax: ${passengers}, Class: ${flightClass}, Tier: ${travelTier}`);
  
  const options: FlightBooking[] = MOCK_FLIGHT_OPTIONS_BASE
    .filter(f => flightClass === 'economy' ? f.price < 800 : flightClass === 'premium_economy' ? f.price > 400 && f.price < 1000 : flightClass === 'business' ? f.price > 600 && f.price < 1500 : f.price > 1000) 
    .map((baseFlight, index) => {
      let priceFactor = 1.0;
      if (baseFlight.flightClass === 'premium_economy') priceFactor = 1.5;
      else if (baseFlight.flightClass === 'business') priceFactor = 2.5;
      else if (baseFlight.flightClass === 'first') priceFactor = 4.0;

      if (passengers > 1) priceFactor *= (1 + (passengers -1) * 0.05);

      const depDateOnly = new Date(departureDate + 'T00:00:00'); 
      const today = new Date();
      today.setHours(0,0,0,0); 
      const diffDays = (depDateOnly.getTime() - today.getTime()) / (1000 * 3600 * 24);

      if (diffDays < 7) priceFactor *= 1.3; 
      else if (diffDays > 60) priceFactor *= 0.9;
      
      const uniqueFlightIdPart = legId ? legId.slice(-3) : index;
      const randomizedDepartureHour = (parseInt(baseFlight.departureTime.substring(0,2)) + index % 2 + 24)%24;


      return {
        ...baseFlight,
        id: `${baseFlight.id}-${uniqueFlightIdPart}-${flightClass}`, 
        origin: origin,
        destination: destination,
        departureDate: departureDate, 
        details: `${baseFlight.airline}, ${flightClass.replace('_', ' ')}, ${baseFlight.stops === 0 ? 'Direct' : `${baseFlight.stops} Stop(s)`} from ${origin} to ${destination} on ${new Date(departureDate+'T00:00:00').toLocaleDateString()}`,
        price: generateRandomPrice(baseFlight.price, travelTier, priceFactor),
        booked: false,
        paymentCompleted: false,
        flightClass: flightClass,
        departureTime: `${randomizedDepartureHour.toString().padStart(2, '0')}:${baseFlight.departureTime.substring(3,5)}`, 
        arrivalTime: `${((randomizedDepartureHour + parseInt(baseFlight.duration.substring(0,1)))%24).toString().padStart(2, '0')}:${baseFlight.arrivalTime.substring(3,5)}`, 
        legId: legId, 
        bookingSource: 'system_booked' as BookingSource,
      };
    })
    .sort(() => Math.random() - 0.5) 
    .slice(0, Math.floor(Math.random() * 2) + 2); 

  return simulateApiCall(options);
};


export const fetchHotelOptions = async (
  destination: string, 
  checkInDate: string, 
  checkOutDate: string, 
  rooms: number, 
  adults: number, 
  children: number,
  travelTier?: string
): Promise<HotelBooking[]> => {
  console.log(`Fetching hotel options for ${destination}, Dates: ${checkInDate}-${checkOutDate}, Rooms: ${rooms}, Adults: ${adults}, Children: ${children}, Tier: ${travelTier}`);
  
  const options: HotelBooking[] = MOCK_HOTEL_OPTIONS_BASE
    .map((baseHotel, index) => {
      let priceFactor = 1.0;
      if (rooms > 1) priceFactor *= rooms * 0.9; 
      if (adults + children > 2) priceFactor *= (1 + (adults + children - 2) * 0.1);

      const checkIn = new Date(checkInDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffDays = (checkIn.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 7) priceFactor *= 1.2; 

      return {
        ...baseHotel,
        id: `${baseHotel.id}-${destination.replace(/\s/g, '')}-${index}`, 
        details: `${baseHotel.starRating} Star, ${baseHotel.location}, ${baseHotel.amenities?.slice(0,2).join(', ')}`,
        price: generateRandomPrice(baseHotel.price, travelTier, priceFactor), 
        booked: false,
        paymentCompleted: false,
        numberOfGuests: adults + children,
        roomType: rooms > 1 ? `${rooms} x ${baseHotel.roomType}` : baseHotel.roomType,
        destinationCity: destination, 
        bookingSource: 'system_booked' as BookingSource,
      };
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 3);

  return simulateApiCall(options);
};


export const fetchCarRentalOptions = async (
  pickupLocation: string,
  dropoffLocation: string, 
  pickupDate: string,
  pickupTime: string,
  dropoffDate: string,
  dropoffTime: string,
  driverAge?: number, 
  travelTier?: string
): Promise<CarRental[]> => {
  console.log(`Fetching car options: ${pickupLocation} to ${dropoffLocation}, Dates: ${pickupDate} ${pickupTime} - ${dropoffDate} ${dropoffTime}, Age: ${driverAge}, Tier: ${travelTier}`);
  
  const options: CarRental[] = MOCK_CAR_RENTAL_OPTIONS_BASE
    .map((baseCar, index) => {
      let priceFactor = 1.0;
      if (driverAge && driverAge < 25) priceFactor *= 1.3; 
      
      const pDate = new Date(pickupDate + 'T00:00:00');
      const dDate = new Date(dropoffDate + 'T00:00:00');
      const rentalDays = Math.max(1, (dDate.getTime() - pDate.getTime()) / (1000 * 3600 * 24));
      priceFactor *= rentalDays;

      return {
        ...baseCar,
        id: `${baseCar.id}-${pickupLocation.replace(/\s/g, '')}-${index}`,
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        details: `${baseCar.carType}, ${baseCar.supplier}, ${baseCar.transmission}, ${baseCar.mileage} mileage`,
        price: generateRandomPrice(baseCar.price, travelTier, priceFactor), 
        booked: false,
        paymentCompleted: false,
        bookingSource: 'system_booked' as BookingSource,
      };
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 2); 

  return simulateApiCall(options);
};

export const fetchCabOptions = async (
  pickupLocation: string,
  dropoffLocation: string,
  pickupDateTime: string // ISO string
): Promise<CabBooking[]> => {
  console.log(`Fetching cab options: ${pickupLocation} to ${dropoffLocation} at ${pickupDateTime}`);
  const options: CabBooking[] = MOCK_CAB_OPTIONS_BASE.map((baseCab, index) => {
    const generatedPrice = generateRandomPrice(baseCab.estimatedFare, undefined, 1 + Math.random() * 0.5);
    return {
      ...baseCab,
      id: `CAB-${Date.now()}-${index}`,
      pickupLocation,
      dropoffLocation,
      pickupDateTime,
      status: 'Pending' as CabBookingStatus,
      booked: false,
      paymentCompleted: false,
      estimatedFare: generatedPrice,
      price: generatedPrice, // For BookingCard compatibility
      details: `${baseCab.carModel || 'Standard Cab'} with ${baseCab.driverName || 'a friendly driver'}`, // For BookingCard
      bookingSource: 'system_booked' as BookingSource,
    };
  })
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.floor(Math.random() * 2) + 2); // Show 2-3 options
  
  return simulateApiCall(options);
};

export const fetchTrainOptions = async (
  originStation: string,
  destinationStation: string,
  departureDate: string,
  trainClass: string,
  passengers: number,
  travelTier?: string
): Promise<TrainBooking[]> => {
  console.log(`Fetching train options: ${originStation} to ${destinationStation}, Date: ${departureDate}, Class: ${trainClass}, Pax: ${passengers}, Tier: ${travelTier}`);

  const options: TrainBooking[] = MOCK_TRAIN_OPTIONS_BASE
    .map((baseTrain, index) => {
      let priceFactor = 1.0;
      if (trainClass === 'first') priceFactor = 1.8;
      else if (trainClass === 'sleeper') priceFactor = 2.5; // Sleeper might be more
      if (passengers > 1) priceFactor *= (1 + (passengers -1) * 0.1); // Group discount/increase

      const depDateObj = new Date(departureDate + 'T00:00:00');
      const departureDateTime = new Date(depDateObj.setDate(depDateObj.getDate() + index % 2)); // Vary date slightly for mock
      departureDateTime.setHours(8 + index * 2, (15 * index) % 60); // Vary time
      
      const arrivalDateTime = new Date(departureDateTime);
      arrivalDateTime.setHours(departureDateTime.getHours() + 3 + index); // Vary duration

      return {
        ...baseTrain,
        id: `TRN-${Date.now()}-${index}`,
        originStation,
        destinationStation,
        departureDateTime: departureDateTime.toISOString(),
        arrivalDateTime: arrivalDateTime.toISOString(),
        trainClass,
        price: generateRandomPrice(baseTrain.price || 60, travelTier, priceFactor), // Ensure price is set
        booked: false,
        paymentCompleted: false,
        bookingSource: 'system_booked' as BookingSource,
        details: `${baseTrain.details} - ${trainClass.charAt(0).toUpperCase() + trainClass.slice(1)} Class`,
      };
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 2); // Show 2-3 options

  return simulateApiCall(options);
};

export const fetchBusOptions = async (
  originTerminal: string,
  destinationTerminal: string,
  departureDate: string,
  passengers: number,
  travelTier?: string
): Promise<BusBooking[]> => {
  console.log(`Fetching bus options: ${originTerminal} to ${destinationTerminal}, Date: ${departureDate}, Pax: ${passengers}, Tier: ${travelTier}`);

  const options: BusBooking[] = MOCK_BUS_OPTIONS_BASE
    .map((baseBus, index) => {
      let priceFactor = 1.0;
      if (passengers > 1) priceFactor *= (1 + (passengers - 1) * 0.08); // Slightly different group factor

      const depDateObj = new Date(departureDate + 'T00:00:00');
      const departureDateTime = new Date(depDateObj);
      departureDateTime.setHours(7 + index * 3, (30 * index) % 60); // Vary time

      const arrivalDateTime = new Date(departureDateTime);
      arrivalDateTime.setHours(departureDateTime.getHours() + 4 + index); // Vary duration

      return {
        ...baseBus,
        id: `BUS-${Date.now()}-${index}`,
        originTerminal,
        destinationTerminal,
        departureDateTime: departureDateTime.toISOString(),
        arrivalDateTime: arrivalDateTime.toISOString(),
        price: generateRandomPrice(baseBus.price || 40, travelTier, priceFactor),
        booked: false,
        paymentCompleted: false,
        bookingSource: 'system_booked' as BookingSource,
        details: `${baseBus.details} - ${baseBus.seatType || 'Standard'} Seats`,
      };
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 2); // Show 2-3 options

  return simulateApiCall(options);
};


export const bookFlight = async (flightId: string): Promise<{ success: boolean; flight?: FlightBooking }> => {
  console.log(`Booking flight ${flightId}`);
  const flightMaster = MOCK_FLIGHT_OPTIONS_BASE.find(f => flightId.startsWith(f.id));
  if (flightMaster) {
    return simulateApiCall({ success: true, flight: {
        ...flightMaster,
        id: flightId,
        booked: true,
        paymentCompleted: false,
        details: `Booked: ${flightMaster.airline}`,
        departureDate: "YYYY-MM-DD" 
    }});
  }
  return simulateApiCall({ success: false });
};

export const completePayment = async (bookingType: 'flight' | 'hotel' | 'car' | 'cab' | 'train' | 'bus', bookingId: string): Promise<{ success: boolean }> => {
  console.log(`Completing payment for ${bookingType} ${bookingId}`);
  return simulateApiCall({ success: true }, 1500);
};

export const bookHotel = async (hotelId: string): Promise<{ success: boolean; hotel?: HotelBooking }> => {
  console.log(`Booking hotel ${hotelId}`);
  const hotelMaster = MOCK_HOTEL_OPTIONS_BASE.find(h => hotelId.startsWith(h.id));
  if (hotelMaster) {
    const selectedHotel = { ...hotelMaster, id: hotelId, booked: true, paymentCompleted: false, details: `Booked: ${hotelMaster.name}`, destinationCity: hotelMaster.location || "Unknown City" };
    return simulateApiCall({ success: true, hotel: selectedHotel });
  }
  return simulateApiCall({ success: false });
};

export const bookCarRental = async (carId: string): Promise<{ success: boolean; car?: CarRental }> => {
  console.log(`Booking car ${carId}`);
  const carMaster = MOCK_CAR_RENTAL_OPTIONS_BASE.find(c => carId.startsWith(c.id));
  if (carMaster) {
    return simulateApiCall({ success: true, car: {...carMaster, id: carId, booked: true, paymentCompleted: false, details: `Booked: ${carMaster.carType}`} });
  }
  return simulateApiCall({ success: false });
};

export const bookCab = async (cabId: string): Promise<{ success: boolean; cab?: CabBooking }> => {
  console.log(`Booking cab ${cabId}`);
  const cabMaster = MOCK_CAB_OPTIONS_BASE.find(c => cabId.startsWith(c.id.substring(0,6))); 
  if (cabMaster) {
      const bookedCab: CabBooking = {
          ...cabMaster,
          id: cabId,
          pickupLocation: "Mock Pickup", 
          dropoffLocation: "Mock Dropoff", 
          pickupDateTime: new Date().toISOString(), 
          status: 'Confirmed' as CabBookingStatus,
          booked: true,
          paymentCompleted: false,
          details: `${cabMaster.carModel || 'Standard Cab'} with ${cabMaster.driverName || 'a friendly driver'}`,
          price: cabMaster.estimatedFare, 
          bookingSource: 'system_booked' as BookingSource,
      };
      return simulateApiCall({ success: true, cab: bookedCab });
  }
  return simulateApiCall({ success: false });
};

export const bookTrain = async (trainId: string): Promise<{ success: boolean; train?: TrainBooking }> => {
    console.log(`Booking train ${trainId}`);
    const trainMaster = MOCK_TRAIN_OPTIONS_BASE.find(t => trainId.startsWith(t.id));
    if (trainMaster) {
        const bookedTrain: TrainBooking = {
            ...trainMaster,
            id: trainId,
            originStation: "Mock Origin", 
            destinationStation: "Mock Destination", 
            departureDateTime: new Date().toISOString(), 
            arrivalDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), 
            booked: true,
            paymentCompleted: false,
            bookingSource: 'system_booked' as BookingSource,
            price: trainMaster.price || 50, 
        };
        return simulateApiCall({ success: true, train: bookedTrain });
    }
    return simulateApiCall({ success: false });
};

export const bookBus = async (busId: string): Promise<{ success: boolean; bus?: BusBooking }> => {
  console.log(`Booking bus ${busId}`);
  const busMaster = MOCK_BUS_OPTIONS_BASE.find(b => busId.startsWith(b.id));
  if (busMaster) {
    const bookedBus: BusBooking = {
      ...busMaster,
      id: busId,
      originTerminal: "Mock Origin Terminal",
      destinationTerminal: "Mock Destination Terminal",
      departureDateTime: new Date().toISOString(),
      arrivalDateTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours later
      booked: true,
      paymentCompleted: false,
      bookingSource: 'system_booked' as BookingSource,
      price: busMaster.price || 35,
    };
    return simulateApiCall({ success: true, bus: bookedBus });
  }
  return simulateApiCall({ success: false });
};


// --- Mock Suggestions for Cross-Sell Page ---
interface MockCrossSellSuggestion {
  id: string;
  name: string;
  shortDescription: string;
  priceDisplay: string; // e.g., "$150/night", "$300 total"
}

export const getMockHotelSuggestionsForCity = (city: string): MockCrossSellSuggestion[] => {
  return [
    { id: `cross-sell-hotel1-${city}`, name: `Chic Downtown Hotel in ${city}`, shortDescription: "Stylish rooms, great location.", priceDisplay: "$180/night" },
    { id: `cross-sell-hotel2-${city}`, name: `Cozy Inn near ${city} Attractions`, shortDescription: "Comfortable and affordable.", priceDisplay: "$95/night" },
  ];
};

export const getMockFlightSuggestionsToCity = (city: string, originCity?: string): MockCrossSellSuggestion[] => {
  const from = originCity || "Your Location";
  return [
    { id: `cross-sell-flight1-${city}`, name: `Express Flight to ${city}`, shortDescription: `Direct flight from ${from}.`, priceDisplay: "$250 round trip" },
    { id: `cross-sell-flight2-${city}`, name: `Budget Airline to ${city}`, shortDescription: `Affordable option from ${from}.`, priceDisplay: "$180 round trip" },
  ];
};

export const getMockCarSuggestionsInCity = (city: string): MockCrossSellSuggestion[] => {
  return [
    { id: `cross-sell-car1-${city}`, name: `Compact Car Rental in ${city}`, shortDescription: "Perfect for city driving.", priceDisplay: "$45/day" },
    { id: `cross-sell-car2-${city}`, name: `SUV Adventure in ${city}`, shortDescription: "Explore with comfort and space.", priceDisplay: "$70/day" },
  ];
};