
import React, { useState, useContext } from 'react';
import SettingsPage from './SettingsPage';
import PersonalInfoSection from './PersonalInfoSection';
import CardInfoSection from './CardInfoSection';
import ContactDetailsSection from './ContactDetailsSection'; 
import SecuritySection from './SecuritySection'; // New import
import { UserPreferences } from '../types';
import { AuthContext } from '../contexts/AuthContext';
// import type { AuthContextType } from '../contexts/AuthContext'; // Type is inferred

interface MyAccountPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
}

type SettingSubView = 
  | 'personalDetails' 
  | 'contactDetails' 
  | 'security' 
  | 'appPreferences' 
  | 'legal' 
  | 'paymentMethodsMain' 
  | 'billingAddress' 
  | null;

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

interface SettingsItemProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center justify-between w-full px-3 sm:px-4 py-3 sm:py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-800 rounded-lg interactive-element list-item-interactive button-interactive"
    role="button" 
  >
    <div className="flex-grow">
      <h4 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <ChevronRightIcon />
  </button>
);

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 sm:mb-8">
    <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 px-1 pb-2 sm:pb-3 pt-1 sm:pt-2">{title}</h2>
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/70" role="group"> 
      {children}
    </div>
  </div>
);

const MyAccountPage: React.FC<MyAccountPageProps> = ({ theme, setTheme, userPreferences, setUserPreferences }) => {
  const [currentSettingView, setCurrentSettingView] = useState<SettingSubView>(null);
  const { currentUser } = useContext(AuthContext);

  const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3 sm:mb-4">{title}</h3>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">This section is under development. Please check back later!</p>
    </div>
  );

  const renderContent = () => {
    if (currentSettingView === null) {
      return (
        <div className="animate-fadeIn space-y-5 sm:space-y-6">
          <SettingsSection title="Personal info">
            <SettingsItem title="Personal details" subtitle="Manage your name, date of birth, and profile picture." onClick={() => setCurrentSettingView('personalDetails')} />
            <SettingsItem title="Contact details" subtitle="Update your email and phone number." onClick={() => setCurrentSettingView('contactDetails')} />
            <SettingsItem title="Security" subtitle="Change password and manage security settings." onClick={() => setCurrentSettingView('security')} />
          </SettingsSection>
          <SettingsSection title="App settings">
            <SettingsItem title="Preferences" subtitle="Theme, notifications, and data settings." onClick={() => setCurrentSettingView('appPreferences')} />
            <SettingsItem title="Legal" subtitle="View our privacy policy and terms of service." onClick={() => setCurrentSettingView('legal')} />
          </SettingsSection>
          <SettingsSection title="Payment methods">
            <SettingsItem title="Payment methods" subtitle="Manage your saved credit/debit cards." onClick={() => setCurrentSettingView('paymentMethodsMain')} />
            <SettingsItem title="Billing address" subtitle="Set or update your billing address." onClick={() => setCurrentSettingView('billingAddress')} />
          </SettingsSection>
        </div>
      );
    }
    switch (currentSettingView) {
      case 'personalDetails': return <PersonalInfoSection userPreferences={userPreferences} setUserPreferences={setUserPreferences} />;
      case 'contactDetails': return <ContactDetailsSection />; 
      case 'security': return <SecuritySection />; 
      case 'appPreferences': return <SettingsPage theme={theme} setTheme={setTheme} userPreferences={userPreferences} setUserPreferences={setUserPreferences} userId={currentUser?.id} />;
      case 'legal': return <PlaceholderContent title="Legal Information" />;
      case 'paymentMethodsMain': return <CardInfoSection />;
      case 'billingAddress': return <PlaceholderContent title="Billing Address" />;
      default: return null;
    }
  };
  
  const getSubViewTitle = () => {
    switch (currentSettingView) {
      case 'personalDetails': return 'Personal Details';
      case 'contactDetails': return 'Contact Details';
      case 'security': return 'Security';
      case 'appPreferences': return 'Preferences';
      case 'legal': return 'Legal';
      case 'paymentMethodsMain': return 'Payment Methods';
      case 'billingAddress': return 'Billing Address';
      default: return 'Settings';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 page-transition-enter">
      <div className="mb-6 sm:mb-8 flex items-center">
        {currentSettingView !== null && (
          <button onClick={() => setCurrentSettingView(null)} className="mr-2 sm:mr-3 p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-900 button-interactive" aria-label="Back to settings menu">
            <BackArrowIcon />
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {getSubViewTitle()}
        </h1>
      </div>
      {renderContent()}
      {currentSettingView === null && (
        <div className="mt-8 sm:mt-10 text-center sm:text-left">
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 px-3 rounded-md hover:bg-blue-100/70 dark:hover:bg-blue-700/30 transition-colors w-full sm:w-auto button-interactive">
            + Invite friends
          </button>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
export default MyAccountPage;
