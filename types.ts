export type SupportedLanguage = 'en' | 'es'; // Add more as needed

export interface ItineraryItem {
  time: string;
  activity: string;
  description?: string;
  location?: string;
  cost?: string;
  imageUrl?: string; 
  identifier: string; 
  isEditing?: boolean; 
  travelTimeToNext?: string; 
  source?: 'ai' | 'user'; 
  likes?: string[]; // Array of user IDs who liked this item
}

export interface DailyItinerary {
  day: string;
  date?: string; 
  events: ItineraryItem[];
}

export interface GeneratedItinerary {
  title: string;
  destinations: string[]; 
  duration: string; 
  dailyBreakdown: DailyItinerary[];
  estimatedTotalCost?: number; 
}

export type FlightClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type FlightStatus = 'On Time' | 'Delayed' | 'Cancelled' | 'Departed' | 'Arrived' | 'Scheduled' | 'Unknown';

export interface FlightStatusData {
  status: FlightStatus;
  details?: string; 
  gate?: string;
  terminal?: string;
  estimatedDepartureTime?: string;
  actualDepartureTime?: string;
  estimatedArrivalTime?: string;
  actualArrivalTime?: string;
}

export interface FlightLegCriteria {
  legId: string;
  origin: string;
  destination: string;
  departureDate: string;
}

export type BookingSource = 'ai_suggested' | 'system_booked' | 'user_manual' | 'notification_suggested';

export interface FlightBooking {
  id: string;
  airline: string; 
  flightNumber: string; 
  details: string; 
  price: number;
  booked: boolean;
  paymentCompleted: boolean;
  departureDate: string; 
  departureTime?: string; 
  arrivalTime?: string;
  duration?: string; 
  stops?: number; 
  origin?: string; 
  destination?: string; 
  flightClass?: FlightClass;
  status?: FlightStatus; 
  statusData?: FlightStatusData; 
  legId?: string; 
  bookingSource?: BookingSource;
  confirmationNumber?: string; // For manual bookings
}

export interface HotelBooking {
  id:string;
  name: string;
  details: string; 
  price: number; 
  booked: boolean;
  paymentCompleted: boolean;
  starRating?: number;
  location?: string; 
  amenities?: string[];
  roomType?: string;
  boardType?: string; 
  numberOfGuests?: number;
  destinationCity: string; 
  bookingSource?: BookingSource;
  confirmationNumber?: string; // For manual bookings
  checkInDate?: string; // For manual bookings
  checkOutDate?: string; // For manual bookings
}

export interface CarRental {
  id: string;
  details: string; 
  price: number; 
  booked: boolean;
  paymentCompleted: boolean;
  carType?: string; 
  supplier?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  transmission?: 'Automatic' | 'Manual';
  fuelPolicy?: string;
  mileage?: string; 
  bookingSource?: BookingSource;
  confirmationNumber?: string; // For manual bookings
  pickupDateTime?: string; // For manual bookings
  dropoffDateTime?: string; // For manual bookings
}

export type CabBookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Driver Assigned' | 'En Route' | 'Completed';

export interface CabBooking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string; // ISO string
  estimatedFare: number;
  status: CabBookingStatus;
  driverName?: string;
  carModel?: string;
  licensePlate?: string;
  booked: boolean;
  paymentCompleted: boolean;
  tripAssociation?: 'departure_to_airport' | 'arrival_from_airport';
  details: string; 
  price: number;   
  bookingSource?: BookingSource;
  confirmationNumber?: string; // For manual bookings
}

export interface TrainBooking {
  id: string;
  trainLine: string;
  trainNumber?: string;
  originStation: string;
  destinationStation: string;
  departureDateTime: string; // ISO string
  arrivalDateTime: string; // ISO string
  trainClass?: string; // e.g., 'Standard', 'First Class'
  price: number; 
  booked: boolean; 
  paymentCompleted?: boolean; 
  confirmationNumber?: string;
  bookingSource: BookingSource; 
  details: string; 
}

export interface BusBooking {
  id: string;
  busCompany: string;
  busNumber?: string;
  originTerminal: string;
  destinationTerminal: string;
  departureDateTime: string; // ISO string
  arrivalDateTime: string; // ISO string
  seatType?: string; // e.g., 'Standard', 'Luxury Recliner'
  price: number;
  booked: boolean;
  paymentCompleted?: boolean;
  confirmationNumber?: string;
  bookingSource: BookingSource;
  details: string;
}


export type ExpenseCategory = "Food & Drinks" | "Accommodation" | "Transportation" | "Activities" | "Shopping" | "Miscellaneous";

export interface TripParticipant {
  id: string; 
  name: string;
  isCurrentUser?: boolean; 
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; 
  paidById: string; 
  splitWithIds: string[]; 
}

export type PrimaryTransportationMode = 'flight' | 'train' | 'bus' | 'roadtrip';

export interface Trip {
  id: string;
  source: 'form' | 'chat' | 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_cab' | 'standalone_train' | 'standalone_bus'; 
  userId?: string; 
  originCity?: string; 
  destinations: string[]; 
  dates: string; 
  travelType?: string; 
  travelTier: string; 
  specialOccasion?: string;
  numberOfTravelers?: string; 
  primaryTransportationMode?: PrimaryTransportationMode;
  itinerary?: GeneratedItinerary;
  flights?: FlightBooking[]; 
  hotels?: HotelBooking[]; 
  carRental?: CarRental; 
  departureCab?: CabBooking; 
  arrivalCab?: CabBooking;   
  trains?: TrainBooking[]; 
  buses?: BusBooking[]; 
  packingList?: string[];
  createdAt: string; 
  budget?: number; 
  expenses?: Expense[]; 
  participants?: TripParticipant[]; 
  prefillDestination?: string; 
  prefillDates?: string; 
  notes?: string; 
  prefillPickup?: string;    
  prefillDropoff?: string;   
  prefillDateTime?: string;  
  bookingIntent?: 'departure_cab' | 'arrival_cab'; 
}

export interface TripFormData {
  travelType: string; 
  originCity: string; 
  destinations: string[]; 
  startDate: string;
  endDate: string;
  numberOfTravelers: string; 
  travelTier: string; 
  specialOccasion?: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  FORM = 'FORM', 
  STRUCTURED_ITINERARY_BUILDER = 'STRUCTURED_ITINERARY_BUILDER', 
  TRANSPORTATION_MODE_SELECTION = 'TRANSPORTATION_MODE_SELECTION', 
  ITINERARY = 'ITINERARY',
  FLIGHT_BOOKING = 'FLIGHT_BOOKING',
  HOTEL_BOOKING = 'HOTEL_BOOKING',
  CAR_BOOKING = 'CAR_BOOKING',
  CAB_BOOKING = 'CAB_BOOKING',
  TRAIN_BOOKING = 'TRAIN_BOOKING', 
  BUS_BOOKING = 'BUS_BOOKING', 
  PAYMENT_PAGE = 'PAYMENT_PAGE', 
  STANDALONE_PAYMENT_PAGE = 'STANDALONE_PAYMENT_PAGE', 
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION', 
  PACKING_LIST = 'PACKING_LIST',
  MY_TRIPS = 'MY_TRIPS',
  TRIP_DETAIL = 'TRIP_DETAIL', 
  EXPLORE = 'EXPLORE', 
  AI_CHAT_PAGE = 'AI_CHAT_PAGE', 
  MY_ACCOUNT = 'MY_ACCOUNT',
  NEARBY_SUGGESTIONS = 'NEARBY_SUGGESTIONS',
  DESTINATION_DETAIL = 'DESTINATION_DETAIL',
  BUDGET_DISPLAY = 'BUDGET_DISPLAY',
  STANDALONE_FLIGHT_BOOKING = 'STANDALONE_FLIGHT_BOOKING',
  STANDALONE_HOTEL_BOOKING = 'STANDALONE_HOTEL_BOOKING',
  STANDALONE_CAR_BOOKING = 'STANDALONE_CAR_BOOKING',
  STANDALONE_TRAIN_BOOKING = 'STANDALONE_TRAIN_BOOKING',
  STANDALONE_BUS_BOOKING = 'STANDALONE_BUS_BOOKING', 
  BLOG_PAGE = 'BLOG_PAGE',
  BLOG_POST_DETAIL = 'BLOG_POST_DETAIL', 
  GUIDES_PAGE = 'GUIDES_PAGE',
  GUIDE_DETAIL = 'GUIDE_DETAIL',
  NOTIFICATIONS = 'NOTIFICATIONS', 
  CROSS_SELL_BOOKINGS = 'CROSS_SELL_BOOKINGS', 
  SUPPORT = 'SUPPORT',
  ABOUT_US = 'ABOUT_US',
  PRIVACY_POLICY = 'PRIVACY_POLICY', 
  CONTACT_US = 'CONTACT_US',
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  NAVIGATION_MENU = 'NAVIGATION_MENU', 
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface ExploreDestination {
  id: string;
  name: string;
  country?: string; 
  description: string;
  longDescription?: string;
  imageUrl: string;
  tags: string[];
  averageRating?: number;
  bestTimeToVisit?: string;
  continent: string; 
  tagline?: string; 
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface EmailNotificationPrefs {
  importedItems: boolean;
  guideComments: boolean;
  guideLikes: boolean;
  replyToComment: boolean;
  usageTips: boolean;
  upcomingTripReminders: boolean;
  productUpdates: boolean;
  newFlightDeals: boolean;
  cheapHotelDeals: boolean;
  proDeals: boolean;
  feedbackSurveys: boolean;
  disableAllEmail: boolean;
}

export interface PushNotificationPrefs {
  importedItems: boolean;
  guideComments: boolean;
  guideLikes: boolean;
  replyToComment: boolean;
  usageTips: boolean;
  upcomingTripReminders: boolean;
  productUpdates: boolean;
  cheapHotelDeals: boolean; 
  proDeals: boolean;
  feedbackSurveys: boolean;
  liveFlightStatus: boolean;
  disableAllPush: boolean;
}

export interface NotificationPreferences {
  email: EmailNotificationPrefs;
  push: PushNotificationPrefs;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultTravelTier?: string;
  age?: number; 
  homeAddress?: string; 
  dateFormat?: 'month-day' | 'day-month';
  distanceFormat?: 'miles' | 'kilometers';
  timeFormat?: '12-hour' | '24-hour';
  placeDescriptionPreference?: 'show-in-empty-and-below' | 'show-in-empty-only';
  expertTravelTips?: 'on' | 'off';
  notificationPreferences?: NotificationPreferences; 
  language?: SupportedLanguage;
}

export interface NearbyPlaceSuggestion {
  id: string;
  name: string;
  category: string; 
  description: string;
  latitude: number;
  longitude: number;
  address?: string; 
  webLink?: string; 
  rating?: string; 
  distance?: string; 
}

export interface BillingAddressDetails {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

export interface User extends BillingAddressDetails {
  id: string; 
  email: string;
  password?: string; 
  profileImageUrl?: string; 
  phoneNumber?: string; 
  secondaryEmail?: string; 
}

export interface TouristAttraction {
  name: string;
  description: string;
  imageUrl?: string; 
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string; 
  imageUrl: string;
  snippet: string;
  content: string; 
  tags: string[];
}

export interface CuisineHighlight {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface DayTripIdea {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface GuideDetailContent {
  gettingAround?: string;
  cuisineHighlights?: CuisineHighlight[];
  insiderTips?: string[];
  dayTripIdeas?: DayTripIdea[]; 
}

export interface GuideCardItem {
  name: string;
  imageUrl?: string;
}

export interface CityGuideDetails {
  guideTitle: string;
  guideSubtitle: string;
  diningRecommendations: GuideCardItem[];
  hiddenGems: GuideCardItem[];
  accommodationSuggestions: GuideCardItem[];
  transportationInfo: string;
}

export interface TripContextType {
  currentTrip: Trip | null;
  setCurrentTrip: React.Dispatch<React.SetStateAction<Trip | null>>;
  updateTripDetails: (details: UpdateTripDetailsPayload) => void;
  setPrimaryTransportationMode: (mode: PrimaryTransportationMode) => void;
  setItinerary: (itinerary: GeneratedItinerary) => void;
  addFlightBooking: (flight: FlightBooking) => void;
  updateFlightBooking: (flightId: string, updates: Partial<FlightBooking>) => void;
  addHotelBooking: (hotel: HotelBooking) => void; 
  updateHotelBooking: (hotelId: string, updates: Partial<HotelBooking>) => void;
  setCarRental: (car: CarRental | undefined) => void;
  updateCarRental: (carId: string, updates: Partial<CarRental>) => void;
  setDepartureCab: (cab: CabBooking | undefined) => void;
  updateDepartureCab: (cabId: string, updates: Partial<CabBooking>) => void;
  setArrivalCab: (cab: CabBooking | undefined) => void;
  updateArrivalCab: (cabId: string, updates: Partial<CabBooking>) => void;
  addTrainBooking: (train: TrainBooking) => void; 
  updateTrainBooking: (trainId: string, updates: Partial<TrainBooking>) => void; 
  addBusBooking: (bus: BusBooking) => void;
  updateBusBooking: (busId: string, updates: Partial<BusBooking>) => void;
  setPackingList: (list: string[]) => void;
  clearCurrentTrip: () => void;
  addItineraryEvent: (dayIndex: number, event: ItineraryItem) => void;
  updateItineraryEvent: (dayIndex: number, eventIdentifier: string, updatedEventData: Partial<ItineraryItem>) => void;
  deleteItineraryEvent: (dayIndex: number, eventIdentifier: string) => void;
  reorderItineraryEvents: (dayIndex: number, oldEventIndex: number, newEventIndex: number) => void;
  setBudget: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;
  addParticipant: (name: string) => void;
  removeParticipant: (participantId: string) => void;
  itineraryHistory: GeneratedItinerary[];
  itineraryHistoryPointer: number;
  undoItineraryChange: () => void;
  redoItineraryChange: () => void;
  canUndoItinerary: () => boolean;
  canRedoItinerary: () => boolean;
  updateTripNotes: (notes: string) => void;
  toggleLikeItineraryEvent: (dayIndex: number, eventIdentifier: string, userId: string) => void; 
}

export interface UpdateTripDetailsPayload extends Partial<Omit<Trip, 'id' | 'createdAt' | 'destinations' | 'dates' | 'prefillDestination' | 'prefillDates' | 'prefillPickup' | 'prefillDropoff' | 'prefillDateTime' >> { 
  source: 'form' | 'chat' | 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_cab' | 'standalone_train' | 'standalone_bus'; 
  originCity?: string;
  destinations?: string[]; 
  dates?: string; 
  travelType?: string; 
  travelTier?: string;
  specialOccasion?: string;
  numberOfTravelers?: string;
  userId?: string; 
  prefillDestination?: string; 
  prefillDates?: string; 
  prefillPickup?: string;
  prefillDropoff?: string;
  prefillDateTime?: string; 
  bookingIntent?: 'departure_cab' | 'arrival_cab';
  departureCab?: CabBooking; 
  arrivalCab?: CabBooking;  
  primaryTransportationMode?: PrimaryTransportationMode;
}

export type NotificationType = 'alert' | 'info' | 'reminder' | 'update' | 'system';

export interface NotificationItem {
  id: string;
  userId: string; 
  message: string;
  type: NotificationType;
  timestamp: string; 
  isRead: boolean;
  link?: {
    view: AppView;
    params?: Record<string, any>; 
  };
}

export type TravelNotificationTriggerType = 'upcoming_trip_general_reminder' | 'departure_cab' | 'arrival_cab';

export interface ActiveNotification {
  tripId: string;
  notificationType: TravelNotificationTriggerType; 
  message: string;
  action?: {
    label: string;
    handler?: () => void; 
  };
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  location?: Coordinates;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CrossSellContextType {
  originalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_cab' | 'standalone_train' | 'standalone_bus'; 
  destination: string;
  dates?: string;
}

// Define AuthContextType explicitly for User type augmentation
export interface AuthContextTypeInternal {
  currentUser: User | null;
  isLoadingAuth: boolean;
  login: (email: string, passwordInput: string) => Promise<User | null>;
  signup: (email: string, passwordInput: string) => Promise<User | null>;
  logout: () => void;
  socialLogin: (provider: 'google' | 'microsoft' | 'apple') => Promise<User | null>;
  updateCurrentUserProfileImage: (imageUrl: string) => Promise<void>;
  updateUserContactDetails: (details: { phoneNumber?: string; secondaryEmail?: string }) => Promise<void>;
  updateUserBillingAddress: (details: BillingAddressDetails) => Promise<void>;
}
