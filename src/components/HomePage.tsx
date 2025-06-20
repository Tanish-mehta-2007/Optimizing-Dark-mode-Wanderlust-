
import React, { useState, useContext, useRef, useEffect } from 'react';
// Removed HomePageFooter import
import { AuthContext } from '../contexts/AuthContext';
import { POPULAR_DESTINATIONS, EXPLORE_CITIES_DATA } from '../constants';
import { ImageWithFallback } from './common/ImageDisplayUtils';
import { AppView } from '../../types'; 
import { useTranslation } from '../contexts/LanguageContext'; // Import useTranslation
import PopularDestinationsHighlight from './PopularDestinationsHighlight'; 
import FeatureHighlights from './FeatureHighlights'; 

// --- Icons (from user's HTML structure or common icons) ---
const HeroSearchIcon = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="text-slate-400 dark:text-slate-500">
        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
    </svg>
);

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0">
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.4l-4.71-4.711a6.5 6.5 0 119.192-9.192A6.5 6.5 0 0110 18.4zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
);

// Hero icons for new buttons
const HotelIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V4h3V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 016.25 2H7V.75A.75.75 0 017.75 0h4.5A.75.75 0 0113 .75V2h.75A.75.75 0 0114.5 2.75V4h.25A2.75 2.75 0 0117.5 6.75v1.5H2.5v-1.5A2.75 2.75 0 015.25 4H5V2.75A.75.75 0 015.75 2H10V.75A.75.75 0 0110 3zM3.5 8.25v7a1.25 1.25 0 001.25 1.25h10.5a1.25 1.25 0 001.25-1.25v-7a.25.25 0 00-.25-.25H3.75a.25.25 0 00-.25.25z" clipRule="evenodd" /></svg>;
const FlightIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.505 2.241a.75.75 0 01.995.248l2.138 3.846A21.675 21.675 0 0110 6.75c2.404 0 4.701.247 6.862.736l2.137-3.846a.75.75 0 011.243.692l-.973 4.866A.75.75 0 0118.5 9H1.5a.75.75 0 01-.744-1.007L.26 3.181a.75.75 0 01.995-.692L3.505 2.24zm0 0L2.26 1.496a.75.75 0 01.248-.995l2.262 1.744zm14.99 0L18.744 1.5a.75.75 0 00-.248-.996l-2.262 1.745zm-7.495 9a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" /><path fillRule="evenodd" d="M2.266 10.932A.75.75 0 013 10.5h14a.75.75 0 01.734.432l1.311 3.06a.75.75 0 01-.606 1.058l-1.138-.284a.75.75 0 00-.734.066L15 15.428V17a.75.75 0 01-1.5 0v-1.085l-2.25-1.125a.75.75 0 00-.75 0L8.25 15.915V17a.75.75 0 01-1.5 0v-1.572l-1.454-.727a.75.75 0 00-.734-.066l-1.138.284a.75.75 0 01-.606-1.058l1.31-3.06z" clipRule="evenodd" /></svg>;
const CarIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.966 3.03A.75.75 0 016.75 3h6.5a.75.75 0 01.744.966l-.504 1.511a.75.75 0 00.693.949h1.502a.75.75 0 01.744.966l-.75 2.25a.75.75 0 01-.744.534h-1.382a22.14 22.14 0 01-1.415 4.991A.75.75 0 0111.25 15h-2.5a.75.75 0 01-.693-.949 22.14 22.14 0 01-1.415-4.991H5.25a.75.75 0 01-.744-.534l-.75-2.25A.75.75 0 014.5 6.422h1.502a.75.75 0 00.693-.949L5.966 3.03zM6.755 5.461L6.19 7.283h7.619l-.564-1.822H6.755zM5.03 9.233L5.25 8.5h9.5l.22 0.733a1.5 1.5 0 01-1.407 1.978.75.75 0 00-.612.769 20.647 20.647 0 001.24 4.46.75.75 0 01-.693.949H6.993a.75.75 0 01-.693-.949 20.647 20.647 0 001.24-4.46.75.75 0 00-.612-.769A1.5 1.5 0 015.03 9.233z" clipRule="evenodd" /></svg>;
const PlanTripIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392A1.124 1.124 0 014.5 12h11a1.125 1.125 0 011 1.125V16a.75.75 0 001.5 0v-2.875A2.625 2.625 0 0014.5 10.5h-11A2.625 2.625 0 001 7.875V4a.75.75 0 00-1.5 0v3.875c0 1.933 1.567 3.5 3.5 3.5h11c1.933 0 3.5-1.567 3.5-3.5V6a.75.75 0 00-1.5 0v1.875c0 .828-.672 1.5-1.5 1.5h-11a1.125 1.125 0 01-1-1.125V2.75z" /><path d="M9.06 7.72L6.27 4.94a.75.75 0 111.06-1.06L10 6.19l2.67-2.31a.75.75 0 11.98 1.13l-3.1 2.69a.75.75 0 01-1.02-.04z" /></svg>;
const AITripPlannerIconHero = () => (<div className="w-4 h-4"><svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"></path></svg></div>);
const TrainIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.5 2A.5.5 0 005 2.5v1A.5.5 0 005.5 4h9a.5.5 0 00.5-.5v-1A.5.5 0 0014.5 2h-9zM3 5.5a.5.5 0 01.5-.5h13a.5.5 0 01.5.5v8a.5.5 0 01-.5-.5h-13a.5.5 0 01-.5-.5v-8zm2 1.5a.5.5 0 000 1h1a.5.5 0 000-1H5zm3.5.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3.5-.5a.5.5 0 000 1h1a.5.5 0 000-1h-1zM5 11.5a.5.5 0 000 1h1a.5.5 0 000-1H5zm3.5.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3.5-.5a.5.5 0 000 1h1a.5.5 0 000-1h-1z" clipRule="evenodd" /><path d="M2 15.5a.5.5 0 01.5-.5h15a.5.5 0 010 1H2.5a.5.5 0 01-.5-.5zM5.5 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14.5 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;
const BusIconHero = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7.764 3.072A.75.75 0 018.25 3h3.5a.75.75 0 01.486.072l6.423 4.432A.75.75 0 0118.25 8H1.75a.75.75 0 01-.409-.996L7.764 3.072z" /><path fillRule="evenodd" d="M1.5 10A.75.75 0 012.25 9.25h15.5a.75.75 0 01.75.75v3.5A2.75 2.75 0 0115.75 17H4.25A2.75 2.75 0 011.5 14.25v-3.5zm4.5 1.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5H6zm6.5 0a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75z" clipRule="evenodd" /></svg>;


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
  onNavigateToStandaloneTrain: () => void;
  onNavigateToStandaloneBus: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
    onPlanNewTrip,
    onExplore,
    onViewGuides,
    onViewDestinationDetailsDirect,
    onNavigateToCustomChat,
    onPlanTripFromSearch, 
    onNavigateToStandaloneFlight,
    onNavigateToStandaloneHotel,
    onNavigateToStandaloneCar,
    onNavigateToStandaloneTrain,
    onNavigateToStandaloneBus,
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


  const HeroButton: React.FC<{ onClick?: () => void; text: string; icon: React.ReactNode; className?: string }> = ({ onClick, text, icon, className }) => (
    <button
        onClick={onClick}
        className={`h-11 sm:h-12 px-4 sm:px-5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/30 flex items-center justify-center gap-2 shadow-lg button-interactive ${className}`}
    >
        {icon}
        {text}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col w-full bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="animate-fade-in-down">
          <div
            className="relative flex min-h-[calc(100vh-var(--header-height)-80px)] sm:min-h-[calc(100vh-var(--header-height)-40px)] md:min-h-[calc(100vh-var(--header-height))] flex-col gap-6 sm:gap-8 items-center justify-center px-4 pt-20 sm:pt-24 md:pt-28 pb-8 text-white bg-cover bg-center home-hero-bg"
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                {t('homePage.hero.title')}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-light max-w-md sm:max-w-lg mb-4 sm:mb-6">
                {t('homePage.hero.subtitle')}
              </p>
            </div>
            {/* Updated Hero CTAs */}
            <div className="relative z-10 grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-4 w-full max-w-xl md:max-w-2xl">
                <HeroButton onClick={onPlanNewTrip} text={t('globalHeader.planTrip')} icon={<PlanTripIconHero />} className="col-span-2 sm:col-auto bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400"/>
                <HeroButton onClick={onNavigateToStandaloneFlight} text={t('globalHeader.flights')} icon={<FlightIconHero />} className="bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400"/>
                <HeroButton onClick={onNavigateToStandaloneHotel} text={t('globalHeader.hotels')} icon={<HotelIconHero />} className="bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400"/>
                <HeroButton onClick={onNavigateToStandaloneCar} text={t('globalHeader.cars')} icon={<CarIconHero />} className="bg-lime-500 hover:bg-lime-600 text-white focus:ring-lime-400"/>
                {onNavigateToStandaloneTrain && <HeroButton onClick={onNavigateToStandaloneTrain} text={t('globalHeader.trains')} icon={<TrainIconHero />} className="bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-400"/>}
                {onNavigateToStandaloneBus && <HeroButton onClick={onNavigateToStandaloneBus} text={t('globalHeader.buses')} icon={<BusIconHero />} className="bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400"/>}
                <HeroButton onClick={onNavigateToCustomChat} text={t('homePage.chatWithAIBot')} icon={<AITripPlannerIconHero />} className="col-span-2 sm:col-auto bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white focus:ring-slate-500"/>
            </div>
          </div>
      </div>
      
      <div className="px-4 sm:px-6 md:px-10 py-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-[#0e171b] dark:text-slate-100 text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-2 pt-3 sm:pt-5 animate-text-pop-in">{t('homePage.quickAccess')}</h2>
          <div className="flex justify-center">
              <div className="flex flex-1 gap-2 sm:gap-3 flex-wrap px-2 sm:px-4 py-2 sm:py-3 max-w-[480px] justify-center">
              <button onClick={() => onExplore()} className="flex min-w-[80px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 sm:h-10 px-3 sm:px-4 bg-[#e7eff3] dark:bg-slate-700 text-[#0e171b] dark:text-slate-100 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] grow interactive-element hover:scale-105 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all">
                  <span className="truncate">{t('homePage.exploreDestinations')}</span>
              </button>
              <button onClick={onViewGuides} className="flex min-w-[80px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 sm:h-10 px-3 sm:px-4 bg-[#e7eff3] dark:bg-slate-700 text-[#0e171b] dark:text-slate-100 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] grow interactive-element hover:scale-105 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all">
                  <span className="truncate">{t('homePage.travelGuides')}</span>
              </button>
              </div>
          </div>
          </div>
          <PopularDestinationsHighlight 
            onExploreDestination={onViewDestinationDetailsDirect} 
            sectionTitleAnimationClass="animate-text-pop-in"
            cardAnimationBaseClass="item-card-animate-in"
          />
          <FeatureHighlights
            sectionTitleAnimationClass="animate-text-pop-in"
            cardAnimationBaseClass="item-card-animate-in"
          />
      </div>
      <style>{`
        .home-hero-bg {
          background-image: url('https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); /* Default scenic background */
        }
        .dark .home-hero-bg {
           background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); /* Dark mode variation - could be a starry night, etc. */
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  )
};

export default HomePage;
