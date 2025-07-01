
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppView, User } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
// import type { AuthContextType } from '../../contexts/AuthContext'; // Type is inferred
import { LanguageContext, useTranslation } from '../../contexts/LanguageContext'; // Import LanguageContext
import { SUPPORTED_LANGUAGES } from '../../constants'; // Corrected import for SUPPORTED_LANGUAGES
import ThemeToggleButton from './ThemeToggleButton'; // Import ThemeToggleButton

// Icons
const WanderlustAppLogoIcon = () => ( 
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5 sm:size-6 text-brand-dark dark:text-brand-light">
         <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" />
    </svg>
);
const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>;
const MyAccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600 dark:text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3.75h.008v.008H12v-.008zM3 10.5S4.5 6 9 6s6 4.5 6 4.5S13.5 21 9 21s-6-4.5-6-4.5zm5.25-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;


// Icons for nav links
const ExploreIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253m0 0A11.971 11.971 0 0012 13.5c2.998 0 5.74 1.1 7.843 2.918" /></svg>;
const PlanTripIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H5.625m1.5A3.75 3.75 0 0011.25 12H10.5m.75-4.5H2.25m2.25 0H18.75M2.25 9H18.75m0 0H2.25m16.5 0V12A2.25 2.25 0 0116.5 14.25H3.75A2.25 2.25 0 011.5 12V9m15 3A2.25 2.25 0 0014.25 9.75H1.5M15 9.75V15A2.25 2.25 0 0112.75 17.25H1.5" /></svg>;
const FlightIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const HotelIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3.75A2.25 2.25 0 0019.5 1.5h-15A2.25 2.25 0 002.25 3.75zM9 15V9M15 15V9" /></svg>;
const CarIconNav = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M12 4.5v6.75m0 0l-3-3m3 3l3-3M3.375 8.25c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v8.25" /></svg>;


interface GlobalHeaderProps {
  onNavigateToHome: () => void;
  onNavigateToMenu: () => void; 
  onNavigateToNotifications: () => void;
  onNavigateToMyAccount: () => void;
  onLogout: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  currentView: AppView;
  onNavigateToPlanNewTrip: () => void; 
  onNavigateToMyTrips: () => void; 
  onNavigateToExplore: (searchTerm?: string) => void;
  onNavigateToStandaloneFlight: () => void;
  onNavigateToStandaloneHotel: () => void;
  onNavigateToStandaloneCar: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onNavigateToHome,
  onNavigateToMenu,
  onNavigateToNotifications,
  onNavigateToMyAccount,
  onLogout,
  onNavigateToLogin,
  onNavigateToSignup,
  currentView,
  onNavigateToPlanNewTrip,
  onNavigateToExplore,
  onNavigateToStandaloneFlight,
  onNavigateToStandaloneHotel,
  onNavigateToStandaloneCar,
}) => {
  const { currentUser } = useContext(AuthContext);
  const { t, language, setLanguage } = useTranslation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);


  const toggleProfileDropdown = () => setIsProfileDropdownOpen(prev => !prev);
  const toggleLanguageDropdown = () => setIsLanguageDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewsToExcludeHeader = [AppView.LOGIN, AppView.SIGNUP];
  if (viewsToExcludeHeader.includes(currentView)) {
    return null;
  }

  const navItemBaseClass = "px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 button-interactive"; // Added button-interactive
  const navItemActiveClass = "bg-blue-100 dark:bg-blue-700/70 text-blue-600 dark:text-blue-300";
  const navItemInactiveClass = "text-slate-700 dark:text-slate-200";

  const desktopNavLinks = [
    { labelKey: "globalHeader.planTrip", action: onNavigateToPlanNewTrip, view: AppView.STRUCTURED_ITINERARY_BUILDER, icon: <PlanTripIconNav /> },
    { labelKey: "globalHeader.explore", action: () => onNavigateToExplore(), view: AppView.EXPLORE, icon: <ExploreIconNav /> },
    { labelKey: "globalHeader.flights", action: onNavigateToStandaloneFlight, view: AppView.STANDALONE_FLIGHT_BOOKING, icon: <FlightIconNav /> },
    { labelKey: "globalHeader.hotels", action: onNavigateToStandaloneHotel, view: AppView.STANDALONE_HOTEL_BOOKING, icon: <HotelIconNav /> },
    { labelKey: "globalHeader.cars", action: onNavigateToStandaloneCar, view: AppView.STANDALONE_CAR_BOOKING, icon: <CarIconNav /> },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-850/95 backdrop-blur-sm px-4 sm:px-6 md:px-10 py-3 h-[var(--header-height)]">
        {/* Left Section: Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
            <button 
                onClick={onNavigateToMenu} 
                className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors button-interactive" 
                aria-label="Open navigation menu"
            >
                <HamburgerIcon />
            </button>
            <div 
                className="flex items-center gap-2 sm:gap-3 text-slate-800 dark:text-slate-100 cursor-pointer interactive-element nav-item-interactive rounded-md p-1 -ml-1"
                onClick={onNavigateToHome}
                title={t('app.name') + " - Home"}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateToHome()}

            >
                <div className="shrink-0"><WanderlustAppLogoIcon /></div>
                <h2 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] hidden md:block">{t('app.name')}</h2>
            </div>
        </div>

        {/* Center Section: Desktop Navigation Links (hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {desktopNavLinks.map(link => {
                const isActive = currentView === link.view || 
                                (link.view === AppView.STRUCTURED_ITINERARY_BUILDER && [AppView.ITINERARY, AppView.FLIGHT_BOOKING, AppView.HOTEL_BOOKING, AppView.CAR_BOOKING, AppView.PAYMENT_PAGE, AppView.PACKING_LIST, AppView.BUDGET_DISPLAY].includes(currentView));
                return (
                    <button 
                        key={link.labelKey} 
                        onClick={link.action}
                        className={`${navItemBaseClass} ${isActive ? navItemActiveClass : navItemInactiveClass}`} // button-interactive already in navItemBaseClass
                        aria-current={isActive ? "page" : undefined}
                    >
                        {link.icon}
                        {t(link.labelKey)}
                    </button>
                );
            })}
        </nav>

        {/* Right Section: Language, Notifications & User/Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggleButton />

             {/* Language Switcher */}
            <div ref={languageDropdownRef} className="relative">
              <button
                onClick={toggleLanguageDropdown}
                className="flex items-center p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors button-interactive"
                aria-label={t('languageSwitcher.label')}
                aria-haspopup="true"
                aria-expanded={isLanguageDropdownOpen}
              >
                <GlobeIcon />
              </button>
              {isLanguageDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-40" role="menu">
                  {SUPPORTED_LANGUAGES.map(langConfig => (
                    <button
                      key={langConfig.langCode}
                      onClick={() => { setLanguage(langConfig.langCode); setIsLanguageDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between button-interactive"
                      role="menuitemradio"
                      aria-checked={language === langConfig.langCode}
                    >
                      {langConfig.name}
                      {language === langConfig.langCode && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {currentUser && (
            <button
                onClick={onNavigateToNotifications}
                className="flex items-center justify-center rounded-full h-8 w-8 sm:h-9 sm:w-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors p-0 button-interactive"
                aria-label={t('globalHeader.notifications')}
            >
                <BellIcon />
            </button>
            )}
            {currentUser ? (
            <div ref={profileDropdownRef} className="relative">
                <button onClick={toggleProfileDropdown} type="button" className="rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500 button-interactive" aria-expanded={isProfileDropdownOpen} aria-haspopup="true">
                    <span className="sr-only">Open user menu</span>
                    {currentUser.profileImageUrl ?
                        <img className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover" src={currentUser.profileImageUrl} alt="User" /> :
                        <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-sm sm:text-base font-semibold">{currentUser.email.substring(0,1).toUpperCase()}</span>
                    }
                </button>
                {isProfileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none z-40" role="menu">
                        <button onClick={() => { onNavigateToMyAccount(); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center button-interactive" role="menuitem"><MyAccountIcon />{t('globalHeader.myAccount')}</button>
                        <button onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center button-interactive" role="menuitem"><LogoutIcon />{t('globalHeader.logout')}</button>
                    </div>
                )}
            </div>
            ) : (
            <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={onNavigateToLogin} className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors button-interactive">
                    {t('globalHeader.login')}
                </button>
                <button onClick={onNavigateToSignup} className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors button-interactive">
                    {t('globalHeader.signup')}
                </button>
            </div>
            )}
        </div>
    </header>
  );
};

export default GlobalHeader;