
import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppView, UserPreferences, Trip, Coordinates, NotificationPreferences, CrossSellContextType, ActiveNotification, SupportedLanguage, BookingSource, UpdateTripDetailsPayload, PrimaryTransportationMode, TripContextType } from '../types'; 
import { AuthContext } from './contexts/AuthContext';
import type { AuthContextType } from './contexts/AuthContext'; 
import { TripContext } from './contexts/TripContext'; 
import { saveUserPreferences, getUserPreferences, saveTrip, getTripById, getSavedTrips } from './services/storageService'; 
import GlobalHeader from './components/common/GlobalHeader'; 
import GlobalFooter from './components/common/GlobalFooter';
import { NavigationMenuPage } from './components/common/NavigationMenuPage'; 
import HomePage from './components/HomePage';
import StructuredItineraryBuilderPage from './components/StructuredItineraryBuilderPage';
import TransportationModeSelectionPage from './components/TransportationModeSelectionPage'; 
import { ItineraryDisplay } from './components/ItineraryDisplay'; 
import { FlightBookingPage } from './components/FlightBookingPage';
import HotelBookingPage from './components/HotelBookingPage';
import CarBookingPage from './components/CarBookingPage';
import { CabBookingPage } from './components/CabBookingPage'; 
import { TrainBookingPage } from './components/TrainBookingPage'; 
import BusBookingPage from './components/BusBookingPage'; 
import PaymentPage from './components/PaymentPage';
import StandalonePaymentPage from './components/StandalonePaymentPage'; 
import PackingListDisplay from './components/PackingListDisplay';
import BookingConfirmationPage from './components/BookingConfirmationPage';
import { MyTripsDisplay } from './components/MyTripsDisplay'; 
import TripDetailPage from './components/TripDetailPage'; 
import { LoginPage } from './components/LoginPage'; 
import SignupPage from './components/SignupPage';
import ExploreView from './components/ExploreView';
import { CustomItineraryBuilder } from './components/CustomItineraryBuilder';
import MyAccountPage from './components/MyAccountPage';
import NearbySuggestionsPage from './components/NearbySuggestionsPage';
import { DestinationDetailPage } from './components/DestinationDetailPage';
import BudgetDisplay from './components/BudgetDisplay';
import BlogPage from './components/BlogPage';
import BlogPostDetailPage from './components/BlogPostDetailPage'; 
import TravelGuidesPage from './components/TravelGuidesPage';
import { NotificationsPage } from './components/NotificationsPage'; 
import SupportPage from './components/SupportPage'; 
import AboutUsPage from './components/AboutUsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ContactPage from './components/ContactPage';
import TermsOfServicePage from './components/TermsOfServicePage'; 
import { parseChatItineraryFromString } from './services/geminiService';
import LoadingSpinner from './components/common/LoadingSpinner'; 
import TravelEventNotification from './components/common/TravelEventNotification'; 
import { checkAndGenerateNotifications } from './services/notificationService'; 
import { parseTripDates } from '../utils/dateUtils'; 
import { CSSTransition } from 'react-transition-group';
import { DEFAULT_LANGUAGE } from './constants'; 

// AppContext for providing navigateTo to nested components like LegalSection
export const AppContext = React.createContext<{ navigateTo?: (view: AppView, params?: any) => void }>({});


// Chat Transition Overlay Component
const ChatTransitionOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] text-center p-4 motion-safe:animate-fadeIn">
    <LoadingSpinner size="large" message="" />
    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mt-6 animate-pulse">{message}</p>
  </div>
);

const defaultNotificationPrefs: NotificationPreferences = {
  email: {
    importedItems: true, guideComments: true, guideLikes: true, replyToComment: true,
    usageTips: true, upcomingTripReminders: true, productUpdates: true,
    newFlightDeals: true, cheapHotelDeals: true, proDeals: true,
    feedbackSurveys: false, disableAllEmail: false,
  },
  push: {
    importedItems: true, guideComments: true, guideLikes: true, replyToComment: true,
    usageTips: true, upcomingTripReminders: true, productUpdates: true,
    cheapHotelDeals: true, proDeals: true, feedbackSurveys: false,
    liveFlightStatus: true, disableAllPush: false,
  },
};

const ChatIconFAB: React.FC = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.612 3.75 12.375 3.75S21 7.444 21 12z" />
  </svg>
);


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(() => {
    const storedPrefs = getUserPreferences();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedPrefs?.theme || (prefersDark ? 'dark' : 'light');
    return {
      theme: initialTheme,
      language: storedPrefs?.language || DEFAULT_LANGUAGE, 
      defaultTravelTier: storedPrefs?.defaultTravelTier || 'lifestyle',
      age: storedPrefs?.age,
      homeAddress: storedPrefs?.homeAddress || '', 
      dateFormat: storedPrefs?.dateFormat || 'month-day',
      distanceFormat: storedPrefs?.distanceFormat || 'miles',
      timeFormat: storedPrefs?.timeFormat || '12-hour',
      placeDescriptionPreference: storedPrefs?.placeDescriptionPreference || 'show-in-empty-and-below',
      expertTravelTips: storedPrefs?.expertTravelTips || 'on',
      notificationPreferences: storedPrefs?.notificationPreferences || defaultNotificationPrefs,
    };
  });
  const { currentTrip, setCurrentTrip, clearCurrentTrip, updateTripDetails, setItinerary } = useContext<TripContextType>(TripContext);
  const { currentUser, isLoadingAuth, logout } = useContext<AuthContextType>(AuthContext);
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>(null); 
  const [activePostId, setActivePostId] = useState<string | null>(null); 
  const [isGuideDetailFromGuidePage, setIsGuideDetailFromGuidePage] = useState<boolean>(false);
  const [crossSellContext, setCrossSellContext] = useState<CrossSellContextType | null>(null);
  const [initialExploreSearchTerm, setInitialExploreSearchTerm] = useState<string | null>(null);
  const [activeTripIdForDetailView, setActiveTripIdForDetailView] = useState<string | null>(null);

  const [isTransitioningFromChat, setIsTransitioningFromChat] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [geolocatedOriginCity, setGeolocatedOriginCity] = useState<string | null>("Mockville"); 
  const todayDateString = new Date().toISOString().split('T')[0];

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isSlideOutMenuOpen, setIsSlideOutMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768); 

  const [travelNotificationQueue, setTravelNotificationQueue] = useState<ActiveNotification[]>([]);
  const [activeTravelNotification, setActiveTravelNotification] = useState<ActiveNotification | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const slideOutMenuRef = useRef<HTMLDivElement>(null);


  const updateIsMobileView = useCallback(() => {
    setIsMobileView(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateIsMobileView);
    return () => window.removeEventListener('resize', updateIsMobileView);
  }, [updateIsMobileView]);

  useEffect(() => {
    if (userPreferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveUserPreferences(userPreferences); 
    // Geolocation for origin city removed; using default "Mockville" or manually set value.
  }, [userPreferences]);


  useEffect(() => {
    if (!isMobileView && isSlideOutMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileView, isSlideOutMenuOpen]);

  useEffect(() => {
    if (currentUser && userPreferences) {
      const userTrips = getSavedTrips(currentUser.id);
      checkAndGenerateNotifications(userTrips, userPreferences, new Date())
        .then(newNotifications => {
          if (newNotifications.length > 0) {
            setTravelNotificationQueue(prevQueue => [...prevQueue, ...newNotifications.filter(
              nn => !prevQueue.find(pq => pq.tripId === nn.tripId && pq.notificationType === nn.notificationType)
            )]);
          }
        })
        .catch(error => console.error("Failed to check/generate notifications:", error));
    } else {
        setTravelNotificationQueue([]); 
    }
  }, [currentUser, userPreferences]); 

  useEffect(() => {
    if (!activeTravelNotification && travelNotificationQueue.length > 0) {
      setActiveTravelNotification(travelNotificationQueue[0]);
      setTravelNotificationQueue(q => q.slice(1));
    }
  }, [activeTravelNotification, travelNotificationQueue]);

  const handleDismissTravelNotification = () => {
    setActiveTravelNotification(null); 
  };

  const navigateTo = useCallback((view: AppView) => {
    window.scrollTo(0, 0);
    if (view === AppView.AI_CHAT_PAGE) {
      setIsChatbotOpen(false); 
    }
    setCurrentView(view);
    setIsSlideOutMenuOpen(false); 
  }, []);

  const handleStandaloneBookingNavigation = (
    view: AppView.STANDALONE_FLIGHT_BOOKING | AppView.STANDALONE_HOTEL_BOOKING | AppView.STANDALONE_CAR_BOOKING | AppView.CAB_BOOKING | AppView.STANDALONE_TRAIN_BOOKING | AppView.STANDALONE_BUS_BOOKING, 
    prefill?: { 
        destination?: string;
        dates?: string;
        origin?: string;
        pickup?: string;
        dropoff?: string;
        dateTime?: string;
    },
    bookingIntent?: 'departure_cab' | 'arrival_cab' 
  ) => {
    clearCurrentTrip();
    const sourceMap = {
        [AppView.STANDALONE_FLIGHT_BOOKING]: 'standalone_flight' as const,
        [AppView.STANDALONE_HOTEL_BOOKING]: 'standalone_hotel' as const,
        [AppView.STANDALONE_CAR_BOOKING]: 'standalone_car' as const,
        [AppView.CAB_BOOKING]: 'standalone_cab' as const,
        [AppView.STANDALONE_TRAIN_BOOKING]: 'standalone_train' as const,
        [AppView.STANDALONE_BUS_BOOKING]: 'standalone_bus' as const,
    };
    const source = sourceMap[view];

    let updatePayload: UpdateTripDetailsPayload = {
        source,
        travelTier: userPreferences.defaultTravelTier || "lifestyle",
    };

    if (view === AppView.STANDALONE_FLIGHT_BOOKING || view === AppView.STANDALONE_TRAIN_BOOKING || view === AppView.STANDALONE_BUS_BOOKING) {
        updatePayload.originCity = prefill?.origin || geolocatedOriginCity || '';
        updatePayload.destinations = prefill?.destination ? [prefill.destination] : [];
        updatePayload.dates = prefill?.dates || todayDateString;
    } else if (view === AppView.STANDALONE_HOTEL_BOOKING) {
        updatePayload.destinations = prefill?.destination ? [prefill.destination] : [];
        updatePayload.dates = prefill?.dates || `${todayDateString} to ${new Date(new Date(todayDateString).setDate(new Date(todayDateString).getDate() + 1)).toISOString().split('T')[0]}`;
    } else if (view === AppView.STANDALONE_CAR_BOOKING) {
        updatePayload.destinations = prefill?.destination ? [prefill.destination] : []; 
        updatePayload.dates = prefill?.dates || `${todayDateString} to ${new Date(new Date(todayDateString).setDate(new Date(todayDateString).getDate() + 1)).toISOString().split('T')[0]}`;
    } else if (view === AppView.CAB_BOOKING) {
        updatePayload.prefillPickup = prefill?.pickup;
        updatePayload.prefillDropoff = prefill?.dropoff;
        updatePayload.prefillDateTime = prefill?.dateTime;
        updatePayload.bookingIntent = bookingIntent; 
        if (prefill?.dropoff) updatePayload.destinations = [prefill.dropoff];
        if (prefill?.dateTime) updatePayload.dates = prefill.dateTime.split('T')[0];
    }
    
    if (prefill?.destination) updatePayload.prefillDestination = prefill.destination;
    if (prefill?.dates) updatePayload.prefillDates = prefill.dates;
    
    updateTripDetails(updatePayload);
    navigateTo(view);
  };
  
  const navigateToBookingPageBasedOnMode = (mode: PrimaryTransportationMode) => {
    switch(mode) {
        case 'flight': navigateTo(AppView.FLIGHT_BOOKING); break;
        case 'train': navigateTo(AppView.TRAIN_BOOKING); break;
        case 'bus': navigateTo(AppView.BUS_BOOKING); break;
        case 'roadtrip': navigateTo(AppView.CAR_BOOKING); break;
        default: navigateTo(AppView.FLIGHT_BOOKING); // Fallback
    }
  };

  const handleCabBookingFromNotification = (tripId: string, type: 'departure_cab' | 'arrival_cab') => {
    if (!currentUser) return; 
    const trip = getSavedTrips(currentUser.id).find(t => t.id === tripId);
    if (!trip || !userPreferences) return;

    const parsedDates = parseTripDates(trip.dates);
    let prefillPickup: string | undefined;
    let prefillDropoff: string | undefined;
    let prefillDateTime: string | undefined;

    if (type === 'departure_cab' && parsedDates.startDate) {
        prefillPickup = "Current Location";
        prefillDropoff = `${trip.destinations[0].split(',')[0]} Airport`; 
        const departureDayStart = new Date(parsedDates.startDate);
        departureDayStart.setHours(9,0,0,0); 
        prefillDateTime = departureDayStart.toISOString();
    } else if (type === 'arrival_cab' && parsedDates.endDate) {
      prefillPickup = `${trip.destinations[trip.destinations.length - 1].split(',')[0]} Airport`; 
      prefillDropoff = userPreferences.homeAddress || "Your Home";
      const arrivalDayNoon = new Date(parsedDates.endDate);
      arrivalDayNoon.setHours(12,0,0,0); 
      prefillDateTime = arrivalDayNoon.toISOString();
    } else {
        prefillPickup = "Current Location";
        prefillDropoff = "Airport";
        prefillDateTime = new Date().toISOString();
    }
    
    handleStandaloneBookingNavigation(AppView.CAB_BOOKING, {
        pickup: prefillPickup,
        dropoff: prefillDropoff,
        dateTime: prefillDateTime,
    }, type); 
    handleDismissTravelNotification(); 
  };


  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    const updatedPrefs = { ...userPreferences, theme: newTheme };
    setUserPreferencesState(updatedPrefs);
  };
  
  const handleNavigateToMyTrips = () => currentUser ? navigateTo(AppView.MY_TRIPS) : navigateTo(AppView.LOGIN);
  const handleNavigateToCustomChat = () => navigateTo(AppView.AI_CHAT_PAGE);
  const openChatbotPopup = () => { if(currentView !== AppView.AI_CHAT_PAGE) setIsChatbotOpen(true); };
  const toggleSlideOutMenu = () => setIsSlideOutMenuOpen(prev => !prev);
  const closeSlideOutMenu = () => setIsSlideOutMenuOpen(false);

  const handleNavigateToMenu = () => {
    if (isMobileView) {
      navigateTo(AppView.NAVIGATION_MENU);
    } else {
      toggleSlideOutMenu();
    }
  };
  
  const commonNavigationProps = { 
    onPlanNewTrip: () => { handlePlanNewTrip(); closeSlideOutMenu(); },
    onViewMyTrips: () => { handleNavigateToMyTrips(); closeSlideOutMenu(); },
    onExplore: (searchTerm?: string) => { handleNavigateToExplore(searchTerm); closeSlideOutMenu(); },
    onCustomPlan: () => { handleNavigateToCustomChat(); closeSlideOutMenu(); },
    onNavigateToMyAccount: () => { handleNavigateToMyAccount(); closeSlideOutMenu(); },
    onNavigateToNearbySuggestions: () => { navigateTo(AppView.NEARBY_SUGGESTIONS); closeSlideOutMenu(); },
    onNavigateToHome: () => { clearCurrentTrip(); navigateTo(AppView.HOME); closeSlideOutMenu(); },
    onNavigateToBudget: () => { navigateTo(AppView.BUDGET_DISPLAY); closeSlideOutMenu(); },
    onNavigateToStandaloneFlight: () => { handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING); closeSlideOutMenu(); },
    onNavigateToStandaloneHotel: () => { handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING); closeSlideOutMenu(); },
    onNavigateToStandaloneCar: () => { handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING); closeSlideOutMenu(); },
    onNavigateToStandaloneTrain: () => { handleStandaloneBookingNavigation(AppView.STANDALONE_TRAIN_BOOKING); closeSlideOutMenu(); },
    onNavigateToStandaloneBus: () => { handleStandaloneBookingNavigation(AppView.STANDALONE_BUS_BOOKING); closeSlideOutMenu(); },
    onNavigateToCabBooking: () => { handleStandaloneBookingNavigation(AppView.CAB_BOOKING); closeSlideOutMenu(); }, 
    onNavigateToBlog: () => { navigateTo(AppView.BLOG_PAGE); closeSlideOutMenu(); },
    onNavigateToGuides: () => { navigateTo(AppView.GUIDES_PAGE); closeSlideOutMenu(); },
    onNavigateToNotifications: () => { handleNavigateToNotifications(); closeSlideOutMenu(); },
    onNavigateToLogin: () => { navigateTo(AppView.LOGIN); closeSlideOutMenu(); },
    onNavigateToSignup: () => { navigateTo(AppView.SIGNUP); closeSlideOutMenu(); },
  };


  useEffect(() => {
    if (!isLoadingAuth) {
      if (currentUser) {
        if (currentView === AppView.LOGIN || currentView === AppView.SIGNUP) navigateTo(AppView.HOME);
      } else {
        const publicViews = [
            AppView.LOGIN, AppView.SIGNUP, AppView.HOME, AppView.EXPLORE, 
            AppView.DESTINATION_DETAIL, AppView.BLOG_PAGE, AppView.BLOG_POST_DETAIL, 
            AppView.GUIDES_PAGE, AppView.GUIDE_DETAIL, 
            AppView.STRUCTURED_ITINERARY_BUILDER, AppView.TRANSPORTATION_MODE_SELECTION,
            AppView.STANDALONE_FLIGHT_BOOKING, AppView.STANDALONE_HOTEL_BOOKING, AppView.STANDALONE_CAR_BOOKING, AppView.STANDALONE_TRAIN_BOOKING, AppView.STANDALONE_BUS_BOOKING, AppView.CAB_BOOKING,
            AppView.AI_CHAT_PAGE, AppView.NAVIGATION_MENU, AppView.ABOUT_US, AppView.PRIVACY_POLICY, AppView.TERMS_OF_SERVICE, AppView.CONTACT_US, AppView.SUPPORT
        ];
        
        const nonAuthViewsRequiringLogin = [ 
            AppView.NOTIFICATIONS, AppView.MY_ACCOUNT, AppView.PAYMENT_PAGE, 
            AppView.STANDALONE_PAYMENT_PAGE, AppView.PACKING_LIST, AppView.MY_TRIPS,
            AppView.TRIP_DETAIL, AppView.BUDGET_DISPLAY, AppView.BOOKING_CONFIRMATION, 
            AppView.FLIGHT_BOOKING, AppView.HOTEL_BOOKING, AppView.CAR_BOOKING, AppView.TRAIN_BOOKING, AppView.BUS_BOOKING,
        ];
        if (nonAuthViewsRequiringLogin.includes(currentView) && !publicViews.includes(currentView)) {
             navigateTo(AppView.LOGIN);
        }
      }
    }
  }, [currentUser, currentView, isLoadingAuth, navigateTo]);

  const handlePlanNewTrip = () => {
    clearCurrentTrip(); 
    updateTripDetails({ source: 'form', travelTier: userPreferences.defaultTravelTier || "lifestyle", originCity: geolocatedOriginCity || '' });
    navigateTo(AppView.STRUCTURED_ITINERARY_BUILDER);
  };
  
  const handlePlanTripFromDestination = (destinationName: string) => { 
    clearCurrentTrip();
    updateTripDetails({ source: 'form', destinations: [destinationName], travelTier: userPreferences.defaultTravelTier || "lifestyle", originCity: geolocatedOriginCity || '' });
    navigateTo(AppView.STRUCTURED_ITINERARY_BUILDER);
  };
  
  const handleViewDestinationDetails = (destinationId: string) => { setActiveDestinationId(destinationId); setIsGuideDetailFromGuidePage(false); navigateTo(AppView.DESTINATION_DETAIL); };
  const handleViewGuideDetails = (guideId: string) => { setActiveDestinationId(guideId); setIsGuideDetailFromGuidePage(true); navigateTo(AppView.GUIDE_DETAIL); };
  const handleNavigateToBlogPostDetail = (postId: string) => { setActivePostId(postId); navigateTo(AppView.BLOG_POST_DETAIL); };
  const handleNavigateToNotifications = () => currentUser ? navigateTo(AppView.NOTIFICATIONS) : navigateTo(AppView.LOGIN);
  
  const handleNavigateToSupport = () => navigateTo(AppView.SUPPORT);
  const handleNavigateToAboutUs = () => navigateTo(AppView.ABOUT_US);
  const handleNavigateToPrivacyPolicy = () => navigateTo(AppView.PRIVACY_POLICY);
  const handleNavigateToTermsOfService = () => navigateTo(AppView.TERMS_OF_SERVICE);
  const handleNavigateToContactUs = () => navigateTo(AppView.CONTACT_US);

  const handleNavigateToExplore = (searchTerm?: string) => { setInitialExploreSearchTerm(searchTerm ?? null); navigateTo(AppView.EXPLORE); };
  const handleNavigateToMyAccount = () => currentUser ? navigateTo(AppView.MY_ACCOUNT) : navigateTo(AppView.LOGIN);


  const handleSaveCustomItinerary = (summaryText: string) => {
    const parsedItinerary = parseChatItineraryFromString(summaryText);
    const finalDestinations = parsedItinerary.destinations && parsedItinerary.destinations.length > 0 ? parsedItinerary.destinations : ["Custom AI Plan"];
    updateTripDetails({ 
        source: 'chat', 
        destinations: finalDestinations, 
        dates: parsedItinerary.duration || "To be determined", 
        travelType: "Custom AI Plan", 
        travelTier: userPreferences.defaultTravelTier || "lifestyle", 
        originCity: geolocatedOriginCity || '' 
    });
    if(parsedItinerary.title && parsedItinerary.dailyBreakdown && parsedItinerary.dailyBreakdown.length > 0){
        setItinerary({ 
            title: parsedItinerary.title, 
            destinations: finalDestinations, 
            duration: parsedItinerary.duration || "To be determined", 
            dailyBreakdown: parsedItinerary.dailyBreakdown.map(day => ({
                ...day,
                events: day.events.map(event => ({...event, bookingSource: 'ai_suggested' as BookingSource}))
            })), 
            estimatedTotalCost: parsedItinerary.estimatedTotalCost 
        });
    }
    setIsChatbotOpen(false);
    navigateTo(AppView.ITINERARY); 
  };
  
  const handleNavigateFromAIChatToStandaloneBooking = (type: 'flight' | 'hotel' | 'car' | 'bus' | 'cab', params: Record<string, string>) => {
    let view: AppView; 
    let prefill: { destination?: string; dates?: string; origin?: string; pickup?: string; dropoff?: string; dateTime?: string } = {};
    let source: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_bus' | 'standalone_cab'; 
    let message = "Taking you to your booking...";
    setIsChatbotOpen(false);

    switch (type) {
      case 'flight': view = AppView.STANDALONE_FLIGHT_BOOKING; source = 'standalone_flight'; prefill.origin = params.originCity || geolocatedOriginCity || ''; prefill.destination = params.destinationCity; prefill.dates = params.departureDate; message = "Fastening seatbelts... taking you to flight bookings!"; updateTripDetails({ source, travelTier: userPreferences.defaultTravelTier || "lifestyle", destinations: params.destinationCity ? [params.destinationCity] : [], originCity: prefill.origin, dates: params.departureDate, prefillDestination: params.destinationCity, prefillDates: params.departureDate }); break;
      case 'hotel': view = AppView.STANDALONE_HOTEL_BOOKING; source = 'standalone_hotel'; prefill.destination = params.destinationCity; prefill.dates = params.datesRange; message = "Finding the comfiest pillows... heading to hotel bookings!"; clearCurrentTrip(); updateTripDetails({ source, travelTier: userPreferences.defaultTravelTier || "lifestyle", prefillDestination: prefill.destination, prefillDates: prefill.dates }); break;
      case 'car': view = AppView.STANDALONE_CAR_BOOKING; source = 'standalone_car'; prefill.destination = params.pickupLocation; prefill.dates = params.datesRange; message = "Revving engines... off to car rentals!"; clearCurrentTrip(); updateTripDetails({ source, travelTier: userPreferences.defaultTravelTier || "lifestyle", prefillDestination: prefill.destination, prefillDates: prefill.dates }); break;
      case 'bus': view = AppView.STANDALONE_BUS_BOOKING; source = 'standalone_bus'; prefill.origin = params.originCity || geolocatedOriginCity || ''; prefill.destination = params.destinationCity; prefill.dates = params.departureDate; message = "Hitting the road... all aboard for bus bookings!"; updateTripDetails({ source, travelTier: userPreferences.defaultTravelTier || "lifestyle", destinations: params.destinationCity ? [params.destinationCity] : [], originCity: prefill.origin, dates: params.departureDate, prefillDestination: params.destinationCity, prefillDates: params.departureDate }); break;
      case 'cab': view = AppView.CAB_BOOKING; source = 'standalone_cab'; prefill.pickup = params.pickupLocation; prefill.dropoff = params.dropoffLocation; prefill.dateTime = params.pickupDateTime; message = "Hailing your ride... let's get you a cab!"; clearCurrentTrip(); updateTripDetails({ source, travelTier: userPreferences.defaultTravelTier || "lifestyle", prefillPickup: prefill.pickup, prefillDropoff: prefill.dropoff, prefillDateTime: prefill.dateTime }); break;
      default: console.error("Unknown AI chat navigation type:", type); return;
    }
    setTransitionMessage(message); setIsTransitioningFromChat(true); navigateTo(view);
    setTimeout(() => setIsTransitioningFromChat(false), 800); 
  };

  const handleSavePendingItineraryFromChat = () => { if (currentTrip) saveTrip(currentTrip); else console.warn("Attempted to save pending itinerary from chat, but currentTrip is null."); };
  
  const handleBookingConfirmationNavigation = (passedOriginalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_cab' | 'standalone_train' | 'standalone_bus' | 'form', destination: string, dates?: string) => {
    setCrossSellContext(passedOriginalSource === 'form' ? null : { originalSource: passedOriginalSource as 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_cab' | 'standalone_train' | 'standalone_bus', destination, dates });
    navigateTo(AppView.BOOKING_CONFIRMATION);
  };

  const handlePlanFullTripFromCrossSell = (destination: string, dates?: string) => {
    clearCurrentTrip(); let finalStartDate = todayDateString; let finalEndDate = new Date(new Date(todayDateString).setDate(new Date(todayDateString).getDate() + 7)).toISOString().split('T')[0];
    if (dates) { const parts = dates.split(' to '); const contextStartDateStr = parts[0]; const contextEndDateStr = parts.length > 1 ? parts[1] : null;
      if (contextStartDateStr) { const parsedContextStart = new Date(contextStartDateStr); if (!isNaN(parsedContextStart.getTime()) && parsedContextStart >= new Date(todayDateString)) finalStartDate = contextStartDateStr; }
      if (contextEndDateStr) { const parsedContextEnd = new Date(contextEndDateStr); if (!isNaN(parsedContextEnd.getTime()) && parsedContextEnd >= new Date(finalStartDate)) finalEndDate = contextEndDateStr; else finalEndDate = new Date(new Date(finalStartDate).setDate(new Date(finalStartDate).getDate() + 7)).toISOString().split('T')[0];
      } else finalEndDate = new Date(new Date(finalStartDate).setDate(new Date(finalStartDate).getDate() + 7)).toISOString().split('T')[0]; }
    updateTripDetails({ source: 'form', destinations: [destination], dates: `${finalStartDate} to ${finalEndDate}`, travelTier: userPreferences.defaultTravelTier || "lifestyle", originCity: geolocatedOriginCity || '' });
    navigateTo(AppView.STRUCTURED_ITINERARY_BUILDER);
  };

  const handleViewTripDetails = (tripId: string) => {
    if (currentUser) { const tripToView = getTripById(currentUser.id, tripId); if (tripToView) { setCurrentTrip(tripToView); setActiveTripIdForDetailView(tripId); navigateTo(AppView.TRIP_DETAIL); } else { console.warn("Trip not found:", tripId); navigateTo(AppView.MY_TRIPS); }} else navigateTo(AppView.LOGIN);
  };

  const getCompatibleCrossSellContext = (
    context: CrossSellContextType | null
  ): ({ originalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_bus'; destination: string; dates?: string; } | null) => { 
    if (!context) return null;
    if (context.originalSource === 'standalone_cab' || context.originalSource === 'standalone_train') {
      return null; 
    }
    return context as { originalSource: 'standalone_flight' | 'standalone_hotel' | 'standalone_car' | 'standalone_bus'; destination: string; dates?: string; }; 
  };


  const renderView = () => {
    if (isLoadingAuth) return <div className="flex-1 flex justify-center items-center p-4"><p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base">Loading authentication...</p></div>;
    
    if (isMobileView && currentView === AppView.NAVIGATION_MENU) {
      return <NavigationMenuPage {...commonNavigationProps} clearCurrentTrip={clearCurrentTrip} currentView={currentView} isSlideOutMode={false} isOpen={true} onCloseMenu={() => navigateTo(AppView.HOME)} />;
    }
    switch (currentView) {
      case AppView.LOGIN: return <LoginPage onLoginSuccess={() => navigateTo(AppView.HOME)} navigateToSignup={() => navigateTo(AppView.SIGNUP)} />;
      case AppView.SIGNUP: return <SignupPage onSignupSuccess={() => navigateTo(AppView.HOME)} navigateToLogin={() => navigateTo(AppView.LOGIN)} />;
      case AppView.HOME: return <HomePage onPlanNewTrip={handlePlanNewTrip} onExplore={handleNavigateToExplore} onNavigateToMyTrips={handleNavigateToMyTrips} onViewGuides={() => navigateTo(AppView.GUIDES_PAGE)} onViewDestinationDetailsDirect={handleViewDestinationDetails} onNavigateToLogin={() => navigateTo(AppView.LOGIN)} onNavigateToSignup={() => navigateTo(AppView.SIGNUP)} onNavigateToCustomChat={handleNavigateToCustomChat} onNavigateToMyAccount={handleNavigateToMyAccount} onNavigateToNotifications={handleNavigateToNotifications} onNavigateToAboutUs={handleNavigateToAboutUs} onNavigateToPrivacyPolicy={handleNavigateToPrivacyPolicy} onNavigateToContactUs={handleNavigateToContactUs} onLogoutFromHomepage={() => { logout(); clearCurrentTrip(); navigateTo(AppView.HOME); }} onPlanTripFromSearch={handlePlanTripFromDestination} onNavigateToStandaloneFlight={() => handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING)} onNavigateToStandaloneHotel={() => handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING)} onNavigateToStandaloneCar={() => handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING)} onNavigateToStandaloneTrain={() => handleStandaloneBookingNavigation(AppView.STANDALONE_TRAIN_BOOKING)} onNavigateToStandaloneBus={() => handleStandaloneBookingNavigation(AppView.STANDALONE_BUS_BOOKING)} />;
      case AppView.AI_CHAT_PAGE: return <CustomItineraryBuilder onSaveCustomItinerary={handleSaveCustomItinerary} onNavigateFromAIChatToStandaloneBooking={handleNavigateFromAIChatToStandaloneBooking} onSavePendingItineraryFromChat={handleSavePendingItineraryFromChat} onCloseChatbot={() => navigateTo(AppView.HOME)} isPageMode={true} />;
      case AppView.STRUCTURED_ITINERARY_BUILDER: return <StructuredItineraryBuilderPage onItineraryGenerated={() => navigateTo(AppView.ITINERARY)} />;
      case AppView.ITINERARY: return <ItineraryDisplay onNext={() => navigateTo(AppView.TRANSPORTATION_MODE_SELECTION)} onBack={() => navigateTo(AppView.STRUCTURED_ITINERARY_BUILDER)} />;
      case AppView.TRANSPORTATION_MODE_SELECTION: return <TransportationModeSelectionPage onNext={navigateToBookingPageBasedOnMode} onBack={() => navigateTo(AppView.ITINERARY)} />;
      case AppView.FLIGHT_BOOKING: return <FlightBookingPage onNext={() => navigateTo(AppView.HOTEL_BOOKING)} onBack={() => navigateTo(AppView.TRANSPORTATION_MODE_SELECTION)} />;
      case AppView.HOTEL_BOOKING: return <HotelBookingPage onNext={() => navigateTo(AppView.CAR_BOOKING)} onBack={() => navigateTo(AppView.FLIGHT_BOOKING)} />;
      case AppView.CAR_BOOKING: return <CarBookingPage onNext={() => navigateTo(AppView.TRAIN_BOOKING)} onBack={() => navigateTo(AppView.HOTEL_BOOKING)} onSkip={() => navigateTo(AppView.TRAIN_BOOKING)} userPreferences={userPreferences} />;
      case AppView.TRAIN_BOOKING: return <TrainBookingPage onNext={() => navigateTo(AppView.BUS_BOOKING)} onBack={() => navigateTo(AppView.CAR_BOOKING)} />;
      case AppView.BUS_BOOKING: return <BusBookingPage onNext={() => navigateTo(AppView.PAYMENT_PAGE)} onBack={() => navigateTo(AppView.TRAIN_BOOKING)} />;
      case AppView.CAB_BOOKING: return <CabBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} userPreferences={userPreferences}/>; 
      case AppView.PAYMENT_PAGE: return <PaymentPage onNext={() => handleBookingConfirmationNavigation('form', currentTrip?.destinations?.[0] || 'Unknown', currentTrip?.dates)} onBack={(originViewArg?: AppView | boolean) => { const viewToGo = (typeof originViewArg === 'string' && Object.values(AppView).includes(originViewArg as AppView)) ? originViewArg as AppView : AppView.BUS_BOOKING; navigateTo(viewToGo); }} />;
      case AppView.STANDALONE_PAYMENT_PAGE: return <StandalonePaymentPage onPaymentSuccess={(originalSource, destination, dates) => handleBookingConfirmationNavigation(originalSource, destination, dates)} onBack={() => { if (currentTrip?.source === 'standalone_flight') navigateTo(AppView.STANDALONE_FLIGHT_BOOKING); else if (currentTrip?.source === 'standalone_hotel') navigateTo(AppView.STANDALONE_HOTEL_BOOKING); else if (currentTrip?.source === 'standalone_car') navigateTo(AppView.STANDALONE_CAR_BOOKING); else if (currentTrip?.source === 'standalone_train') navigateTo(AppView.STANDALONE_TRAIN_BOOKING); else if (currentTrip?.source === 'standalone_bus') navigateTo(AppView.STANDALONE_BUS_BOOKING); else if (currentTrip?.source === 'standalone_cab') navigateTo(AppView.CAB_BOOKING); else navigateTo(AppView.HOME); }} />;
      case AppView.BOOKING_CONFIRMATION: return <BookingConfirmationPage onNextFullTrip={() => navigateTo(AppView.PACKING_LIST)} onSkipCrossSellAndGoHome={() => navigateTo(AppView.HOME)} onNavigateToStandaloneFlight={(prefill) => handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING, prefill)} onNavigateToStandaloneHotel={(prefill) => handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING, prefill)} onNavigateToStandaloneCar={(prefill) => handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING, prefill)} onPlanFullTripFromCrossSell={handlePlanFullTripFromCrossSell} crossSellContext={getCompatibleCrossSellContext(crossSellContext)} />;
      case AppView.PACKING_LIST: return <PackingListDisplay onNext={() => navigateTo(AppView.BUDGET_DISPLAY)} onBack={() => navigateTo(AppView.BOOKING_CONFIRMATION)} />;
      case AppView.MY_TRIPS: return <MyTripsDisplay onPlanNewTrip={handlePlanNewTrip} onViewTripDetails={handleViewTripDetails}/>;
      case AppView.TRIP_DETAIL: return activeTripIdForDetailView ? <TripDetailPage tripId={activeTripIdForDetailView} onNavigateBack={() => {setActiveTripIdForDetailView(null); navigateTo(AppView.MY_TRIPS);}} /> : <MyTripsDisplay onPlanNewTrip={handlePlanNewTrip} onViewTripDetails={handleViewTripDetails} />; 
      case AppView.EXPLORE: return <ExploreView onViewDestinationDetails={handleViewDestinationDetails} initialSearchTerm={initialExploreSearchTerm} onClearInitialSearch={() => setInitialExploreSearchTerm(null)} onNavigateBack={() => navigateTo(AppView.HOME)} />;
      case AppView.MY_ACCOUNT: return <MyAccountPage theme={userPreferences.theme} setTheme={handleSetTheme} userPreferences={userPreferences} setUserPreferences={setUserPreferencesState} />;
      case AppView.NEARBY_SUGGESTIONS: return <NearbySuggestionsPage navigateTo={navigateTo} />;
      case AppView.DESTINATION_DETAIL: return activeDestinationId ? <DestinationDetailPage destinationId={activeDestinationId} onNavigateToHome={() => navigateTo(isGuideDetailFromGuidePage ? AppView.GUIDES_PAGE : AppView.EXPLORE )} onPlanTrip={handlePlanTripFromDestination} currentUser={currentUser} navigateToLogin={() => navigateTo(AppView.LOGIN)} isGuideView={isGuideDetailFromGuidePage} /> : <ExploreView onViewDestinationDetails={handleViewDestinationDetails} initialSearchTerm={null} onClearInitialSearch={() => {}} onNavigateBack={() => navigateTo(AppView.HOME)} />;
      case AppView.BUDGET_DISPLAY: return <BudgetDisplay onNext={() => navigateTo(AppView.MY_TRIPS)} onBack={() => navigateTo(AppView.PACKING_LIST)} />;
      case AppView.STANDALONE_FLIGHT_BOOKING: return <FlightBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} isStandaloneMode={true} />;
      case AppView.STANDALONE_HOTEL_BOOKING: return <HotelBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} isStandaloneMode={true} />;
      case AppView.STANDALONE_CAR_BOOKING: return <CarBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} onSkip={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} isStandaloneMode={true} userPreferences={userPreferences} />;
      case AppView.STANDALONE_TRAIN_BOOKING: return <TrainBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} isStandaloneMode={true} />;
      case AppView.STANDALONE_BUS_BOOKING: return <BusBookingPage onNext={() => navigateTo(AppView.STANDALONE_PAYMENT_PAGE)} onBack={() => navigateTo(AppView.HOME)} isStandaloneMode={true} />;
      case AppView.BLOG_PAGE: return <BlogPage onViewPostDetail={handleNavigateToBlogPostDetail} />;
      case AppView.BLOG_POST_DETAIL: return activePostId ? <BlogPostDetailPage postId={activePostId} onNavigateBack={() => navigateTo(AppView.BLOG_PAGE)} /> : <BlogPage onViewPostDetail={handleNavigateToBlogPostDetail} />;
      case AppView.GUIDES_PAGE: return <TravelGuidesPage onNavigateToGuideDetail={handleViewGuideDetails} />;
      case AppView.GUIDE_DETAIL: return activeDestinationId ? <DestinationDetailPage destinationId={activeDestinationId} onNavigateToHome={() => navigateTo(AppView.GUIDES_PAGE)} onPlanTrip={handlePlanTripFromDestination} currentUser={currentUser} navigateToLogin={() => navigateTo(AppView.LOGIN)} isGuideView={true} /> : <TravelGuidesPage onNavigateToGuideDetail={handleViewGuideDetails} />;
      case AppView.NOTIFICATIONS: return <NotificationsPage onNavigateBack={() => navigateTo(AppView.HOME)} />;
      case AppView.SUPPORT: return <SupportPage onNavigateBack={() => navigateTo(AppView.HOME)} />;
      case AppView.ABOUT_US: return <AboutUsPage onNavigateBack={() => navigateTo(AppView.HOME)} onNavigateToContactUs={handleNavigateToContactUs} />;
      case AppView.PRIVACY_POLICY: return <PrivacyPolicyPage onNavigateBack={() => navigateTo(AppView.HOME)} onNavigateToContactUs={handleNavigateToContactUs} />;
      case AppView.TERMS_OF_SERVICE: return <TermsOfServicePage onNavigateBack={() => navigateTo(AppView.MY_ACCOUNT)} />;
      case AppView.CONTACT_US: return <ContactPage onNavigateBack={() => navigateTo(AppView.HOME)} onNavigateToSupport={handleNavigateToSupport} />;
      case AppView.NAVIGATION_MENU: 
        if (!isMobileView) return <HomePage onPlanNewTrip={handlePlanNewTrip} onExplore={handleNavigateToExplore} onNavigateToMyTrips={handleNavigateToMyTrips} onViewGuides={() => navigateTo(AppView.GUIDES_PAGE)} onViewDestinationDetailsDirect={handleViewDestinationDetails} onNavigateToLogin={() => navigateTo(AppView.LOGIN)} onNavigateToSignup={() => navigateTo(AppView.SIGNUP)} onNavigateToCustomChat={handleNavigateToCustomChat} onNavigateToMyAccount={handleNavigateToMyAccount} onNavigateToNotifications={handleNavigateToNotifications} onNavigateToAboutUs={handleNavigateToAboutUs} onNavigateToPrivacyPolicy={handleNavigateToPrivacyPolicy} onNavigateToContactUs={handleNavigateToContactUs} onLogoutFromHomepage={() => { logout(); clearCurrentTrip(); navigateTo(AppView.HOME); }} onPlanTripFromSearch={handlePlanTripFromDestination} onNavigateToStandaloneFlight={() => handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING)} onNavigateToStandaloneHotel={() => handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING)} onNavigateToStandaloneCar={() => handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING)} onNavigateToStandaloneTrain={() => handleStandaloneBookingNavigation(AppView.STANDALONE_TRAIN_BOOKING)} onNavigateToStandaloneBus={() => handleStandaloneBookingNavigation(AppView.STANDALONE_BUS_BOOKING)} />;
      default: return <HomePage 
        onPlanNewTrip={handlePlanNewTrip} 
        onExplore={handleNavigateToExplore} 
        onNavigateToMyTrips={handleNavigateToMyTrips} 
        onViewGuides={() => navigateTo(AppView.GUIDES_PAGE)} 
        onViewDestinationDetailsDirect={handleViewDestinationDetails} 
        onNavigateToLogin={() => navigateTo(AppView.LOGIN)} 
        onNavigateToSignup={() => navigateTo(AppView.SIGNUP)} 
        onNavigateToCustomChat={handleNavigateToCustomChat} 
        onNavigateToMyAccount={handleNavigateToMyAccount} 
        onNavigateToNotifications={handleNavigateToNotifications} 
        onNavigateToAboutUs={handleNavigateToAboutUs} 
        onNavigateToPrivacyPolicy={handleNavigateToPrivacyPolicy} 
        onNavigateToContactUs={handleNavigateToContactUs} 
        onLogoutFromHomepage={() => { logout(); clearCurrentTrip(); navigateTo(AppView.HOME); }} 
        onPlanTripFromSearch={handlePlanTripFromDestination} 
        onNavigateToStandaloneFlight={() => handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING)} 
        onNavigateToStandaloneHotel={() => handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING)} 
        onNavigateToStandaloneCar={() => handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING)} 
        onNavigateToStandaloneTrain={() => handleStandaloneBookingNavigation(AppView.STANDALONE_TRAIN_BOOKING)}
        onNavigateToStandaloneBus={() => handleStandaloneBookingNavigation(AppView.STANDALONE_BUS_BOOKING)}
      />;
    }
  };

  const headerExcludedViews = [
    AppView.LOGIN, AppView.SIGNUP,
    ...(isMobileView ? [AppView.NAVIGATION_MENU] : []) 
  ];
  
  const footerExcludedViews = [
    AppView.LOGIN, AppView.SIGNUP, AppView.AI_CHAT_PAGE,
    ...(isMobileView ? [AppView.NAVIGATION_MENU] : [])
  ];

  return (
    <AppContext.Provider value={{ navigateTo }}>
      <div className={`theme-${userPreferences.theme} flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950`}>
        {activeTravelNotification && (
          <TravelEventNotification
            isVisible={!!activeTravelNotification}
            message={activeTravelNotification.message}
            actionButtonText={activeTravelNotification.action?.label}
            onActionClick={() => {
              if (activeTravelNotification.action?.handler) {
                activeTravelNotification.action.handler();
              } else if (activeTravelNotification.notificationType === 'departure_cab' || activeTravelNotification.notificationType === 'arrival_cab') {
                  handleCabBookingFromNotification(activeTravelNotification.tripId, activeTravelNotification.notificationType);
              }
              handleDismissTravelNotification();
            }}
            onDismiss={handleDismissTravelNotification}
          />
        )}
        {!headerExcludedViews.includes(currentView) && (
          <GlobalHeader
            onNavigateToHome={() => navigateTo(AppView.HOME)}
            onNavigateToMenu={handleNavigateToMenu}
            onNavigateToNotifications={handleNavigateToNotifications}
            onNavigateToMyAccount={handleNavigateToMyAccount}
            onLogout={() => { logout(); clearCurrentTrip(); navigateTo(AppView.HOME); }}
            onNavigateToLogin={() => navigateTo(AppView.LOGIN)}
            onNavigateToSignup={() => navigateTo(AppView.SIGNUP)}
            currentView={currentView}
            onNavigateToPlanNewTrip={handlePlanNewTrip}
            onNavigateToMyTrips={handleNavigateToMyTrips}
            onNavigateToExplore={handleNavigateToExplore}
            onNavigateToStandaloneFlight={() => handleStandaloneBookingNavigation(AppView.STANDALONE_FLIGHT_BOOKING)}
            onNavigateToStandaloneHotel={() => handleStandaloneBookingNavigation(AppView.STANDALONE_HOTEL_BOOKING)}
            onNavigateToStandaloneCar={() => handleStandaloneBookingNavigation(AppView.STANDALONE_CAR_BOOKING)}
          />
        )}
        
        <CSSTransition
          nodeRef={backdropRef}
          in={!isMobileView && isSlideOutMenuOpen}
          timeout={250}
          classNames="backdrop"
          unmountOnExit
        >
          <div 
            ref={backdropRef}
            className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/50 z-30 backdrop-blur-sm" 
            onClick={closeSlideOutMenu}
            aria-hidden="true"
          ></div>
        </CSSTransition>

        <CSSTransition
          nodeRef={slideOutMenuRef}
          in={!isMobileView && isSlideOutMenuOpen}
          timeout={250}
          classNames="slide-out-menu"
          unmountOnExit
        >
          <div 
            ref={slideOutMenuRef}
            className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-850 shadow-2xl z-40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="slideout-menu-title"
          >
            <NavigationMenuPage 
              {...commonNavigationProps} 
              clearCurrentTrip={clearCurrentTrip} 
              currentView={currentView} 
              isSlideOutMode={true} 
              isOpen={true} 
              onCloseMenu={closeSlideOutMenu} />
          </div>
        </CSSTransition>
        
        <main className={`flex-1 flex flex-col ${!headerExcludedViews.includes(currentView) ? 'pt-[var(--header-height)]' : ''}`}>
            {renderView()}
        </main>

        {isTransitioningFromChat && <ChatTransitionOverlay message={transitionMessage} />}
        
        {currentUser && !isMobileView && currentView !== AppView.AI_CHAT_PAGE && (
           isChatbotOpen ? (
             <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-2.5rem)] max-w-sm sm:max-w-md h-[75vh] max-h-[550px] sm:max-h-[600px]">
              <CustomItineraryBuilder 
                onSaveCustomItinerary={handleSaveCustomItinerary} 
                onNavigateFromAIChatToStandaloneBooking={handleNavigateFromAIChatToStandaloneBooking}
                onSavePendingItineraryFromChat={handleSavePendingItineraryFromChat}
                onCloseChatbot={() => setIsChatbotOpen(false)}
              />
             </div>
           ) : (
            <button 
              onClick={openChatbotPopup}
              className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white p-3 sm:p-3.5 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-100 animate-bounce-once button-interactive"
              aria-label="Open AI Chat Planner"
            >
              <ChatIconFAB />
            </button>
           )
        )}

        {!footerExcludedViews.includes(currentView) && (
          <GlobalFooter 
            onNavigateToAboutUs={handleNavigateToAboutUs}
            onNavigateToPrivacyPolicy={handleNavigateToPrivacyPolicy}
            onNavigateToContactUs={handleNavigateToContactUs}
            onNavigateToSupport={handleNavigateToSupport}
          />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
