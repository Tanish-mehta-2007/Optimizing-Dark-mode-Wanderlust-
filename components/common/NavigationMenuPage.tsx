
import React, { useContext, useEffect, useState } from 'react';
import { AppView, Trip } from '../../types'; 
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextType } from '../../contexts/AuthContext'; // Import AuthContextType
import { getSavedTrips } from '../../services/storageService'; 

// Standardized Icon Wrapper
const NavMenuIconWrapper: React.FC<{ children: React.ReactNode, isActive: boolean }> = ({ children, isActive }) => (
  <span className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-150'}`}>
    {children}
  </span>
);

// Icons
const NavMenuHomeIcon = ({ isActive }: { isActive: boolean }) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg></NavMenuIconWrapper>;
const NavMenuPlanTripIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H5.625m1.5A3.75 3.75 0 0011.25 12H10.5m.75-4.5H2.25m2.25 0H18.75M2.25 9H18.75m0 0H2.25m16.5 0V12A2.25 2.25 0 0116.5 14.25H3.75A2.25 2.25 0 011.5 12V9m15 3A2.25 2.25 0 0014.25 9.75H1.5M15 9.75V15A2.25 2.25 0 0112.75 17.25H1.5" /></svg></NavMenuIconWrapper>;
const NavMenuMyTripsIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75h-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 17.25h-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.75h15A2.25 2.25 0 0121.75 6v12A2.25 2.25 0 0119.5 20.25h-15A2.25 2.25 0 012.25 18V6A2.25 2.25 0 014.5 3.75z" /></svg></NavMenuIconWrapper>;
const NavMenuExploreIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253m0 0A11.971 11.971 0 0012 13.5c2.998 0 5.74 1.1 7.843 2.918" /></svg></NavMenuIconWrapper>;
const NavMenuCustomPlanIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></NavMenuIconWrapper>;
const NavMenuNearbyIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg></NavMenuIconWrapper>;
const NavMenuBudgetIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg></NavMenuIconWrapper>;
const NavMenuBellIconSidebar = ({ isActive }: { isActive: boolean }) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg></NavMenuIconWrapper>;
const NavMenuStandaloneFlightIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg></NavMenuIconWrapper>;
const NavMenuStandaloneHotelIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg></NavMenuIconWrapper>;
const NavMenuStandaloneCarIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg></NavMenuIconWrapper>;
const NavMenuStandaloneTrainIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M5.25 6.75V17.25m13.5-10.5v10.5m-13.5 0L5.25 15M12 17.25l-1.5-2.25M18.75 17.25l-1.5-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5A6.75 6.75 0 019.75 6.75h4.5A6.75 6.75 0 0121 13.5" /></svg></NavMenuIconWrapper>;
const NavMenuStandaloneCabIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5c0-.966-.351-1.837-.936-2.514A3.695 3.695 0 0012 10.5c-.711 0-1.385.174-1.96.486-.585.677-.94 1.548-.94 2.514V21m3-8.25V9M10.5 9V3.75A1.5 1.5 0 0112 2.25h.008c.828 0 1.5.672 1.5 1.5V9M10.5 21h3m-3-3h3M7.5 6.313A11.963 11.963 0 006 6.687c1.656-.323 3.223-.886 4.5-1.748M16.5 6.313A11.963 11.963 0 0118 6.687c-1.656-.323-3.223-.886-4.5-1.748" /></svg></NavMenuIconWrapper>;
const NavMenuNewspaperIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.875c0-.621.504-1.125 1.125-1.125H6.75M12 7.5V5.625c0-.621-.504-1.125-1.125-1.125H9.75v1.5M12 7.5h3.375M3.75 7.5h-.375a1.125 1.125 0 00-1.125 1.125V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V7.875c0-.621-.504-1.125-1.125-1.125H12M3.75 7.5V5.625c0-.621.504-1.125 1.125-1.125H9.75v1.5" /></svg></NavMenuIconWrapper>;
const NavMenuBookOpenIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.25 : 1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></NavMenuIconWrapper>;

const NavMenuLogoutIcon = () => <NavMenuIconWrapper isActive={false}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg></NavMenuIconWrapper>;
const NavMenuLoginIcon = ({ isActive }: { isActive: boolean }) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3l3-3m0 0l-3-3m3 3H9" /></svg></NavMenuIconWrapper>;
const NavMenuUserPlusIcon = ({ isActive }: { isActive: boolean }) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg></NavMenuIconWrapper>;

const NavMenuCountriesVisitedIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg></NavMenuIconWrapper>;
const NavMenuUpcomingTripsIcon = ({isActive}: {isActive: boolean}) => <NavMenuIconWrapper isActive={isActive}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-500 dark:text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15h.008v.008H12V15z" /></svg></NavMenuIconWrapper>;
const NavMenuCloseMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


interface NavigationMenuPageProps {
  onPlanNewTrip: () => void;
  onViewMyTrips: () => void;
  onExplore: (searchTerm?: string) => void; 
  onCustomPlan: () => void; 
  onNavigateToNearbySuggestions: () => void; 
  onNavigateToHome: () => void;
  onNavigateToBudget: () => void; 
  onNavigateToStandaloneFlight: () => void;
  onNavigateToStandaloneHotel: () => void;
  onNavigateToStandaloneCar: () => void;
  onNavigateToStandaloneTrain?: () => void; 
  onNavigateToCabBooking?: () => void; 
  onNavigateToBlog: () => void;
  onNavigateToGuides: () => void;
  onNavigateToNotifications: () => void; 
  clearCurrentTrip: () => void; 
  currentView: AppView; 
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToMyAccount: () => void; 
  isSlideOutMode?: boolean; 
  isOpen?: boolean;          
  onCloseMenu?: () => void;    
}

export const NavigationMenuPage: React.FC<NavigationMenuPageProps> = ({ 
    onPlanNewTrip, onViewMyTrips, onExplore, onCustomPlan, onNavigateToMyAccount, 
    onNavigateToNearbySuggestions, onNavigateToHome, onNavigateToBudget,
    onNavigateToStandaloneFlight, onNavigateToStandaloneHotel, onNavigateToStandaloneCar, onNavigateToStandaloneTrain, onNavigateToCabBooking,
    onNavigateToBlog, onNavigateToGuides, onNavigateToNotifications,
    clearCurrentTrip, currentView, onNavigateToLogin, onNavigateToSignup,
    isSlideOutMode = false, isOpen = false, onCloseMenu 
}) => {
  const { currentUser, logout } = useContext<AuthContextType>(AuthContext);
  const [upcomingTripsCount, setUpcomingTripsCount] = useState(0);
  const [countriesVisitedCount, setCountriesVisitedCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const userTrips = getSavedTrips(currentUser.id);
      const upcoming = userTrips.filter(trip => {
        const datesParts = trip.dates.split(' to ');
        const endDateString = datesParts.length > 1 ? datesParts[1] : datesParts[0];
        return new Date(endDateString + 'T23:59:59') >= new Date();
      }).length;
      setUpcomingTripsCount(upcoming);

      const pastTrips = userTrips.filter(trip => {
        const datesParts = trip.dates.split(' to ');
        const endDateString = datesParts.length > 1 ? datesParts[1] : datesParts[0];
        return new Date(endDateString + 'T23:59:59') < new Date();
      });
      
      const visitedCountries = new Set<string>();
      pastTrips.forEach(trip => {
        trip.destinations.forEach(dest => {
          const country = dest.split(',').pop()?.trim();
          if (country) visitedCountries.add(country);
        });
      });
      setCountriesVisitedCount(visitedCountries.size);
    } else {
      setUpcomingTripsCount(0);
      setCountriesVisitedCount(0);
    }
  }, [currentUser, currentView]); // Added currentView to dependencies to re-trigger counts on view change if needed


  const navItemBaseStyle = "flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ease-in-out text-sm group";
  const navItemActiveStyle = "bg-blue-100 dark:bg-blue-700/60 text-blue-700 dark:text-blue-300 font-semibold shadow-sm scale-[1.02]";
  const navItemInactiveStyle = "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-slate-100 active:scale-95";

  const handleNavLinkClick = (action?: () => void) => {
    if(action) action();
    if (isSlideOutMode && onCloseMenu) {
      onCloseMenu();
    }
  };
  const handleLogout = () => {
    logout();
    clearCurrentTrip();
    handleNavLinkClick(onNavigateToHome);
  };

  const isStructuredPlanActive = [ AppView.TRANSPORTATION_MODE_SELECTION, AppView.STRUCTURED_ITINERARY_BUILDER, AppView.ITINERARY, AppView.FLIGHT_BOOKING, AppView.HOTEL_BOOKING, AppView.CAR_BOOKING, AppView.TRAIN_BOOKING, AppView.BUS_BOOKING, AppView.PAYMENT_PAGE, AppView.PACKING_LIST ].includes(currentView);
  
  const navLinks = [
    { view: AppView.HOME, icon: NavMenuHomeIcon, label: "Home", action: onNavigateToHome },
    { view: AppView.STRUCTURED_ITINERARY_BUILDER, customActiveCheck: isStructuredPlanActive, icon: NavMenuPlanTripIcon, label: "Plan Full Trip", action: onPlanNewTrip },
    { view: AppView.AI_CHAT_PAGE, icon: NavMenuCustomPlanIcon, label: "AI Custom Chat", action: onCustomPlan },
    { view: AppView.MY_TRIPS, icon: NavMenuMyTripsIcon, label: "My Trips", action: onViewMyTrips, authRequired: true },
    { view: AppView.EXPLORE, icon: NavMenuExploreIcon, label: "Explore", action: () => onExplore() }, 
    { view: AppView.BUDGET_DISPLAY, icon: NavMenuBudgetIcon, label: "Budget & Expenses", action: onNavigateToBudget, authRequired: true },
    { view: AppView.NOTIFICATIONS, icon: NavMenuBellIconSidebar, label: "Notifications", action: onNavigateToNotifications, authRequired: true },
    { view: AppView.NEARBY_SUGGESTIONS, icon: NavMenuNearbyIcon, label: "Nearby Live", action: onNavigateToNearbySuggestions },
  ];
  const quickBookLinks = [
    { view: AppView.STANDALONE_FLIGHT_BOOKING, icon: NavMenuStandaloneFlightIcon, label: "Book a Flight", action: onNavigateToStandaloneFlight },
    { view: AppView.STANDALONE_HOTEL_BOOKING, icon: NavMenuStandaloneHotelIcon, label: "Book a Hotel", action: onNavigateToStandaloneHotel },
    { view: AppView.STANDALONE_CAR_BOOKING, icon: NavMenuStandaloneCarIcon, label: "Rent a Car", action: onNavigateToStandaloneCar },
    ...(onNavigateToStandaloneTrain ? [{ view: AppView.STANDALONE_TRAIN_BOOKING, icon: NavMenuStandaloneTrainIcon, label: "Book a Train", action: onNavigateToStandaloneTrain }] : []),
    ...(onNavigateToCabBooking ? [{ view: AppView.CAB_BOOKING, icon: NavMenuStandaloneCabIcon, label: "Book a Cab", action: onNavigateToCabBooking }] : []),
  ];
  const discoverLinks = [
    { view: AppView.BLOG_PAGE, customActiveCheck: [AppView.BLOG_PAGE, AppView.BLOG_POST_DETAIL].includes(currentView), icon: NavMenuNewspaperIcon, label: "Travel Blog", action: onNavigateToBlog },
    { view: AppView.GUIDES_PAGE, customActiveCheck: [AppView.GUIDES_PAGE, AppView.GUIDE_DETAIL].includes(currentView), icon: NavMenuBookOpenIcon, label: "Country Guides", action: onNavigateToGuides },
  ];
  
  const renderNavSection = (title: string, links: Array<{view?: AppView, icon: React.FC<{isActive: boolean}>, label: string, action?: () => void, authRequired?: boolean, customActiveCheck?: boolean }>) => (
    <>
      <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3 pt-3">{title}</h2>
      {links.map(link => {
        if (link.authRequired && !currentUser) return null;
        const isActive = link.customActiveCheck !== undefined ? link.customActiveCheck : (link.view ? currentView === link.view : false);
        return (
          <div 
            key={link.label} 
            onClick={() => handleNavLinkClick(link.action)} 
            className={`${navItemBaseStyle} ${isActive ? navItemActiveStyle : navItemInactiveStyle} interactive-element`}
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavLinkClick(link.action); }}
          >
            <link.icon isActive={isActive} /> <span className={isActive ? 'font-semibold' : 'font-medium'}>{link.label}</span>
          </div>
        );
      })}
    </>
  );

  const containerClasses = isSlideOutMode 
    ? `flex flex-col h-full bg-white dark:bg-slate-850`
    : `bg-white dark:bg-slate-850 min-h-screen flex flex-col page-transition-enter`;

  if (isSlideOutMode && !isOpen) {
    return null; 
  }

  return (
    <div className={containerClasses}>
        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto">
                {isSlideOutMode && onCloseMenu && (
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Menu</h1>
                    <button onClick={onCloseMenu} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors active:scale-90 button-interactive" aria-label="Close menu">
                      <NavMenuCloseMenuIcon />
                    </button>
                  </div>
                )}
                {!isSlideOutMode && (
                  <div className="mb-8 text-center">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Menu</h1>
                  </div>
                )}

                <nav className="space-y-0.5">{renderNavSection("Main Menu", navLinks)}</nav>
                <div className="my-4 mx-1"><hr className="border-slate-200 dark:border-slate-700"/></div>
                <nav className="space-y-0.5">{renderNavSection("Quick Book", quickBookLinks)}</nav>
                <div className="my-4 mx-1"><hr className="border-slate-200 dark:border-slate-700"/></div>
                <nav className="space-y-0.5">{renderNavSection("Discover More", discoverLinks)}</nav>
            
                {currentUser && (<div className="mt-auto pt-6 space-y-3"> 
                    <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3">Quick Stats</h2> 
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-700/40 dark:to-slate-800/30 p-3 rounded-lg flex items-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:scale-[1.02]"><NavMenuCountriesVisitedIcon isActive={false}/><div><p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Countries Visited</p><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{countriesVisitedCount}</p></div></div> 
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-700/40 dark:to-slate-800/30 p-3 rounded-lg flex items-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:scale-[1.02]"><NavMenuUpcomingTripsIcon isActive={false}/><div><p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Upcoming Trips</p><p className="text-lg font-bold text-amber-600 dark:text-amber-400">{upcomingTripsCount}</p></div></div> 
                </div>)}
            </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 shrink-0">
            <div className="max-w-md mx-auto">
                {currentUser ? (
                <div className="flex items-center justify-between">
                    <div 
                        onClick={() => handleNavLinkClick(onNavigateToMyAccount)} 
                        className="flex items-center space-x-2 group flex-grow hover:bg-slate-100 dark:hover:bg-slate-700/70 p-2 -ml-2 rounded-lg transition-colors active:scale-95 interactive-element" 
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavLinkClick(onNavigateToMyAccount); }}
                        aria-label="My Account" title="My Account"
                    >
                        {currentUser.profileImageUrl ? <img src={currentUser.profileImageUrl} alt="User" className="w-9 h-9 rounded-full object-cover bg-slate-200 dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600" /> : <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-semibold ring-1 ring-blue-600 dark:ring-blue-400">{currentUser.email.substring(0,1).toUpperCase()}</div>}
                        <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[150px]" title={currentUser.email}>{currentUser.email}</p><p className="text-xs text-slate-500 dark:text-slate-400">Logged In</p></div>
                    </div>
                    <button onClick={handleLogout} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors ml-2 shrink-0 hover:bg-red-100/70 dark:hover:bg-red-700/30 active:scale-90 button-interactive" title="Logout" aria-label="Logout"><NavMenuLogoutIcon /></button>
                </div>
                ) : ( 
                  <div className="space-y-2.5"> 
                    <div 
                        onClick={() => handleNavLinkClick(onNavigateToLogin)} 
                        className={`${navItemBaseStyle} ${currentView === AppView.LOGIN ? navItemActiveStyle : navItemInactiveStyle} justify-center interactive-element`} 
                        role="button" tabIndex={0} 
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavLinkClick(onNavigateToLogin); }}
                    >
                        <NavMenuLoginIcon isActive={currentView === AppView.LOGIN} /> 
                        <span className={currentView === AppView.LOGIN ? 'font-semibold' : 'font-medium'}>Log In</span>
                    </div>
                    <div 
                        onClick={() => handleNavLinkClick(onNavigateToSignup)} 
                        className={`${navItemBaseStyle} ${currentView === AppView.SIGNUP ? navItemActiveStyle : navItemInactiveStyle} justify-center bg-slate-100 dark:bg-slate-700/70 interactive-element`} 
                        role="button" tabIndex={0} 
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavLinkClick(onNavigateToSignup); }}
                    >
                        <NavMenuUserPlusIcon isActive={currentView === AppView.SIGNUP} /> 
                        <span className={currentView === AppView.SIGNUP ? 'font-semibold' : 'font-medium'}>Sign Up</span>
                    </div> 
                  </div> 
                )}
            </div>
        </div>
    </div>
  );
};
