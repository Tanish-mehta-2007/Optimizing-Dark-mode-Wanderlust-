
import React, { useState, useContext, useRef, useEffect } from 'react';
// Removed HomePageFooter import
import { AuthContext } from '../contexts/AuthContext';
import { POPULAR_DESTINATIONS, EXPLORE_CITIES_DATA } from '../constants';
import { ImageWithFallback } from './common/ImageDisplayUtils';
import { AppView } from '../types'; 
import { useTranslation } from '../contexts/LanguageContext'; // Import useTranslation

// --- Icons for New Header ---
// These icons are defined in GlobalHeader.tsx, not needed here.

// --- Icons (from user's HTML structure or common icons) ---
const HeroSearchIcon = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="text-slate-400 dark:text-slate-500">
        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
    </svg>
);

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0">
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.4l-4.71-4.711a6.5 6.5 0 119.192-9.192A6.5 6.5 0 0110 18.4zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const DestinationDiscoveryIcon = () => (<div className="text-[#0e171b] dark:text-sky-300 group-hover:text-blue-600 dark:group-hover:text-sky-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path></svg></div>);
const ItineraryManagementIcon = () => (<div className="text-[#0e171b] dark:text-sky-300 group-hover:text-blue-600 dark:group-hover:text-sky-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"></path></svg></div>);
const TransportationBookingIcon = () => (<div className="text-[#0e171b] dark:text-sky-300 group-hover:text-blue-600 dark:group-hover:text-sky-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M240,112H229.2L201.42,49.5A16,16,0,0,0,186.8,40H69.2a16,16,0,0,0-14.62,9.5L26.8,112H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V192h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V128h8a8,8,0,0,0,0,16ZM69.2,56H186.8l24.89,56H44.31ZM64,208H40V192H64Zm128,0V192h24v16Zm24-32H40V128H216ZM56,152a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,152Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,152Z"></path></svg></div>);
const AITripPlannerIcon = () => (<div className="text-[#0e171b] dark:text-sky-300 group-hover:text-blue-600 dark:group-hover:text-sky-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"></path></svg></div>);

interface HomePageProps {
  onPlanNewTrip: () => void;
  onExplore: (searchTerm?: string) => void;
  onNavigateToMyTrips: () => void;
  onViewGuides: () => void;
  onViewDestinationDetailsDirect: (destinationId: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToCustomChat: () => void;
  onNavigateToMyAccount: () => void;
  onNavigateToAboutUs: () => void; 
  onNavigateToPrivacyPolicy: () => void; 
  onNavigateToContactUs: () => void; 
  onLogoutFromHomepage: () => void;
  onPlanTripFromSearch: (destinationName: string) => void;
  onNavigateToSignup: () => void;
  onNavigateToNotifications: () => void; 
  onNavigateToStandaloneFlight: () => void;
  onNavigateToStandaloneHotel: () => void;
  onNavigateToStandaloneCar: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
    onExplore,
    onViewGuides,
    onViewDestinationDetailsDirect,
    onNavigateToCustomChat,
    onPlanTripFromSearch,
}) => {
  const { t } = useTranslation();
  const [heroSearchTerm, setHeroSearchTerm] = useState('');
  const [heroAutocompleteSuggestions, setHeroAutocompleteSuggestions] = useState<string[]>([]);
  const [showHeroAutocomplete, setShowHeroAutocomplete] = useState(false);
  const heroSearchContainerRef = useRef<HTMLFormElement>(null);

  const handleHeroSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setHeroSearchTerm(term);
    if (term.trim()) {
      const filtered = POPULAR_DESTINATIONS.filter(dest => dest.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
      setHeroAutocompleteSuggestions(filtered);
      setShowHeroAutocomplete(filtered.length > 0);
    } else {
      setHeroAutocompleteSuggestions([]);
      setShowHeroAutocomplete(false);
    }
  };

  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    const trimmedSearchTerm = heroSearchTerm.trim();
    if (trimmedSearchTerm) {
      onPlanTripFromSearch(trimmedSearchTerm);
    }
    setHeroSearchTerm('');
    setShowHeroAutocomplete(false);
  };

  const handleHeroSuggestionClick = (suggestion: string) => {
    onPlanTripFromSearch(suggestion);
    setHeroSearchTerm('');
    setHeroAutocompleteSuggestions([]);
    setShowHeroAutocomplete(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (heroSearchContainerRef.current && !heroSearchContainerRef.current.contains(event.target as Node)) {
        setShowHeroAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const spotlightCityIds = ['paris', 'tokyo', 'rome', 'new-york'];
  const spotlightDestinationsData = EXPLORE_CITIES_DATA.filter(city => spotlightCityIds.includes(city.id))
                                      .sort((a, b) => spotlightCityIds.indexOf(a.id) - spotlightCityIds.indexOf(b.id));

  const keyFeatures = [
    { icon: <DestinationDiscoveryIcon />, titleKey: "feature.destinationDiscovery", descriptionKey: "feature.destinationDiscovery.desc" },
    { icon: <ItineraryManagementIcon />, titleKey: "feature.itineraryManagement", descriptionKey: "feature.itineraryManagement.desc" },
    { icon: <TransportationBookingIcon />, titleKey: "feature.transportationBooking", descriptionKey: "feature.transportationBooking.desc" },
    { icon: <AITripPlannerIcon />, titleKey: "feature.aiTripPlanner", descriptionKey: "feature.aiTripPlanner.desc" },
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 dark:bg-slate-900" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="animate-fade-in-down">
          <div
            className="relative flex min-h-[calc(100vh-var(--header-height)-80px)] sm:min-h-[calc(100vh-var(--header-height)-40px)] md:min-h-[calc(100vh-var(--header-height))] flex-col gap-6 sm:gap-8 items-center justify-start px-4 pt-20 sm:pt-24 md:pt-28 pb-8 text-white bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                {t('homePage.hero.title')}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-light max-w-md sm:max-w-lg">
                {t('homePage.hero.subtitle')}
              </p>
            </div>
            <form
              onSubmit={handleHeroSearchSubmit}
              ref={heroSearchContainerRef}
              className="relative z-10 flex flex-col w-full max-w-sm sm:max-w-md md:max-w-lg"
            >
              <div className="flex items-center w-full bg-white dark:bg-slate-800 rounded-full shadow-2xl h-12 sm:h-14">
                <div className="pl-4 sm:pl-5 pr-1 sm:pr-2 text-slate-400 dark:text-slate-500">
                  <HeroSearchIcon />
                </div>
                <input
                  type="text"
                  placeholder={t('homePage.hero.searchPlaceholder')}
                  className="flex-grow h-full px-2 bg-transparent text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none"
                  value={heroSearchTerm}
                  onChange={handleHeroSearchInputChange}
                  onFocus={() => { if (heroSearchTerm.trim() && heroAutocompleteSuggestions.length > 0) setShowHeroAutocomplete(true); }}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="h-9 sm:h-10 px-4 sm:px-6 m-1 sm:m-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-full transition-colors"
                >
                  {t('homePage.searchButton')}
                </button>
              </div>
              {showHeroAutocomplete && heroAutocompleteSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto z-30 text-left">
                  <ul className="py-1">
                    {heroAutocompleteSuggestions.map((s, i) => (
                      <li 
                        key={i} 
                        onMouseDown={() => handleHeroSuggestionClick(s)} 
                        className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-700 cursor-pointer flex items-center"
                      >
                        <LocationPinIcon /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
      </div>
      
      <div className="px-4 sm:px-6 md:px-10 py-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-[#0e171b] dark:text-slate-100 text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-2 pt-3 sm:pt-5 animate-text-pop-in">{t('homePage.quickAccess')}</h2>
          <div className="flex justify-center">
              <div className="flex flex-1 gap-2 sm:gap-3 flex-wrap px-2 sm:px-4 py-2 sm:py-3 max-w-[480px] justify-center">
              <button onClick={() => onExplore()} className="flex min-w-[80px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 sm:h-10 px-3 sm:px-4 bg-[#e7eff3] dark:bg-slate-700 text-[#0e171b] dark:text-slate-100 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] grow hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  <span className="truncate">{t('homePage.exploreDestinations')}</span>
              </button>
              <button onClick={onViewGuides} className="flex min-w-[80px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 sm:h-10 px-3 sm:px-4 bg-[#e7eff3] dark:bg-slate-700 text-[#0e171b] dark:text-slate-100 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] grow hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  <span className="truncate">{t('homePage.travelGuides')}</span>
              </button>
              </div>
          </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-[#0e171b] dark:text-slate-100 text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-2 pt-3 sm:pt-5 animate-text-pop-in" style={{animationDelay: '0.1s'}}>{t('homePage.destinationSpotlights')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-2 sm:p-4">
              {spotlightDestinationsData.map((dest, idx) => (
              <button key={dest.id} onClick={() => onViewDestinationDetailsDirect(dest.id)} className="flex flex-col gap-2 sm:gap-3 pb-2 sm:pb-3 group item-card-animate-in rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" style={{ animationDelay: `${idx * 0.05 + 0.4}s` }}>
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <ImageWithFallback src={dest.imageUrl} alt={`Image of ${dest.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-[#0e171b] dark:text-slate-100 text-sm sm:text-base font-medium leading-normal group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-left px-1">{dest.name}</p>
              </button>
              ))}
          </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-[#0e171b] dark:text-slate-100 text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-2 pt-3 sm:pt-5 animate-text-pop-in" style={{animationDelay: '0.2s'}}>{t('homePage.keyFeatures')}</h2>
              <div className="flex flex-col gap-6 sm:gap-8 px-2 sm:px-4 py-6 sm:py-10">
              <div className="flex flex-col gap-3 sm:gap-4">
                  <h1 className="text-[#0e171b] dark:text-slate-50 tracking-light text-2xl sm:text-3xl font-bold leading-tight sm:font-black sm:leading-tight sm:tracking-[-0.033em] max-w-2xl">
                      {t('homePage.planYourPerfectTrip')}
                  </h1>
                  <p className="text-[#0e171b] dark:text-slate-300 text-sm sm:text-base font-normal leading-normal max-w-2xl">
                      {t('homePage.appDescription')}
                  </p>
                  </div>
                  <button onClick={onNavigateToCustomChat} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 sm:h-12 sm:px-5 bg-[#19a1e5] hover:bg-blue-600 text-slate-50 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-fit transition-colors">
                  <span className="truncate">{t('homePage.chatWithAIBot')}</span>
                  </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-0 sm:p-0">
                  {keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex flex-1 gap-3 rounded-lg border border-[#d0dfe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 flex-col group item-card-animate-in hover:shadow-lg dark:hover:border-slate-600 transition-all" style={{ animationDelay: `${idx * 0.05 + 0.5}s` }}>
                      <div className="transition-transform duration-300 group-hover:scale-110 w-6 h-6 sm:w-7 sm:h-7">{feature.icon}</div>
                      <div className="flex flex-col gap-1">
                      <h2 className="text-[#0e171b] dark:text-slate-100 text-sm sm:text-base font-bold leading-tight">{t(feature.titleKey)}</h2>
                      <p className="text-[#4e7f97] dark:text-slate-400 text-xs sm:text-sm font-normal leading-normal">{t(feature.descriptionKey)}</p>
                      </div>
                  </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  )
};

export default HomePage;
