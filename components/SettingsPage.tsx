
import React, { useState, useContext } from 'react';
import { UserPreferences, EmailNotificationPrefs, PushNotificationPrefs, NotificationPreferences, SupportedLanguage } from '../types';
import { TRAVEL_TIERS } from '../constants';
import { clearItineraryCache, clearAllSavedTrips } from '../services/storageService';
import Modal from './common/Modal';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
  userId?: string; 
}

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM5.404 15.657a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06zM16.717 10a.75.75 0 01-1.5 0h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 011.5 0zM4.283 10a.75.75 0 01-1.5 0H1.25a.75.75 0 010-1.5h1.533a.75.75 0 011.5 0zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM4.343 5.404a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.061 1.06z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path fillRule="evenodd" d="M7.455 2.104a.75.75 0 00-.53 1.283A5.995 5.995 0 014.9 7.013a.75.75 0 001.024.897 4.5 4.5 0 006.054-3.046.75.75 0 00-.728-1.017A5.995 5.995 0 017.455 2.104zM12.545 7A5.995 5.995 0 0116 9.045a.75.75 0 00.925-.499A4.501 4.501 0 0013.953 3a.75.75 0 00-1.408.559A5.995 5.995 0 0112.545 7z" clipRule="evenodd" /><path d="M11.783 12.53a6.73 6.73 0 004.105-4.105.75.75 0 011.024.897 8.23 8.23 0 01-10.012 10.012.75.75 0 01.897 1.024A6.73 6.73 0 0011.783 12.53z" /></svg>;
const HomeIconSetting = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;


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

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme, userPreferences, setUserPreferences, userId }) => {
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showResetTripsModal, setShowResetTripsModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [homeAddressInput, setHomeAddressInput] = useState(userPreferences.homeAddress || '');


  const currentNotifPrefs = userPreferences.notificationPreferences || defaultNotificationPrefs;

 const handlePreferenceChange = (
    fullKey: string, 
    value: boolean | string | number | undefined, 
    feedback: string
  ) => {
    let updatedPrefs = { ...userPreferences };

    if (fullKey.startsWith('notificationPreferences.')) {
      const parts = fullKey.split('.'); 
      const type = parts[1] as 'email' | 'push';
      const prefKeyString = parts[2];

      updatedPrefs.notificationPreferences = {
        email: { ...(updatedPrefs.notificationPreferences?.email || defaultNotificationPrefs.email) },
        push: { ...(updatedPrefs.notificationPreferences?.push || defaultNotificationPrefs.push) },
      };
      
      const booleanValue = typeof value === 'boolean' ? value : (String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on');

      if (type === 'email') {
        const emailPrefs = updatedPrefs.notificationPreferences.email;
        const emailKeyToUpdate = prefKeyString as keyof EmailNotificationPrefs;
        
        if (emailKeyToUpdate === 'disableAllEmail') {
          emailPrefs.disableAllEmail = booleanValue;
          if (booleanValue === true) {
            (Object.keys(emailPrefs) as (keyof EmailNotificationPrefs)[]).forEach(key => {
                if (key !== 'disableAllEmail') {
                     (emailPrefs as any)[String(key)] = false;
                }
            });
          }
        } else {
          (emailPrefs as any)[String(emailKeyToUpdate)] = booleanValue;
          if (booleanValue === true && emailPrefs.disableAllEmail) emailPrefs.disableAllEmail = false;
        }
      } else if (type === 'push') {
        const pushPrefs = updatedPrefs.notificationPreferences.push;
         const pushKeyToUpdate = prefKeyString as keyof PushNotificationPrefs;

        if (pushKeyToUpdate === 'disableAllPush') {
          pushPrefs.disableAllPush = booleanValue;
          if (booleanValue === true) {
            (Object.keys(pushPrefs) as (keyof PushNotificationPrefs)[]).forEach(key => {
               if (key !== 'disableAllPush') {
                 (pushPrefs as any)[String(key)] = false;
               }
            });
          }
        } else {
          (pushPrefs as any)[String(pushKeyToUpdate)] = booleanValue;
          if (booleanValue === true && pushPrefs.disableAllPush) pushPrefs.disableAllPush = false;
        }
      }
    } else {
      const userPrefKey = fullKey as keyof UserPreferences;
      if (Object.prototype.hasOwnProperty.call(updatedPrefs, userPrefKey)) {
         if (userPrefKey === 'age') {
            const numValue = typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : undefined);
            (updatedPrefs as any)[userPrefKey] = typeof numValue === 'number' && !isNaN(numValue) ? numValue : undefined;
         } else if (userPrefKey === 'homeAddress') {
            (updatedPrefs as any)[userPrefKey] = String(value);
         }
         else {
          (updatedPrefs as any)[userPrefKey] = value;
         }
      } else {
        console.warn(`Invalid preference key: ${fullKey}`);
        return; 
      }
    }
    setUserPreferences(updatedPrefs);
    setFeedbackMessage(feedback);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };
  
  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme); 
    handlePreferenceChange('theme', selectedTheme, "Theme updated successfully!");
  };

  const handleHomeAddressSave = () => {
    handlePreferenceChange('homeAddress', homeAddressInput, "Home address updated!");
  };

  const handleClearItineraryCache = () => { clearItineraryCache(); setFeedbackMessage("Itinerary cache cleared!"); setShowClearCacheModal(false); setTimeout(() => setFeedbackMessage(null), 2500); };
  const handleResetAllTrips = () => {
    if (userId) { clearAllSavedTrips(userId); setFeedbackMessage("All saved trips have been reset."); } 
    else { setFeedbackMessage("Error: User not identified. Could not reset trips."); }
    setShowResetTripsModal(false); setTimeout(() => setFeedbackMessage(null), 2500);
  };
  
  const renderSettingSection = (title: string, children: React.ReactNode) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 sm:mb-4 pb-2 sm:pb-2.5 border-b border-slate-200 dark:border-slate-600">{title}</h3>
      {children}
    </div>
  );

  const RadioGroupOption: React.FC<{ name: string; value: string; currentValue: string | undefined; label: string; example?: string; onChange: (value: string) => void;}> = 
    ({ name, value, currentValue, label, example, onChange }) => (
    <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors list-item-interactive">
      <input type="radio" name={name} value={value} checked={currentValue === value} onChange={() => onChange(value)} className="form-radio h-4 w-4 text-blue-600 dark:accent-blue-500 border-slate-400 dark:border-slate-500 focus:ring-blue-500 bg-transparent"/>
      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">{label} {example && <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">({example})</span>}</span>
    </label>
  );

  const CheckboxOption: React.FC<{ id: string; checked: boolean; label: string; onChange: (checked: boolean) => void; disabled?: boolean;}> = 
    ({ id, checked, label, onChange, disabled }) => (
    <label htmlFor={id} className={`flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer list-item-interactive'}`}>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="form-checkbox h-4 w-4 text-blue-600 dark:accent-blue-500 border-slate-400 dark:border-slate-500 rounded focus:ring-blue-500 bg-transparent"/>
      <span className={`text-xs sm:text-sm ${disabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
    </label>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {feedbackMessage && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-5 z-[101] mb-4 p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-700/80 border-l-4 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-100 rounded-md text-xs sm:text-sm shadow-lg animate-fadeInScaleUp">
          {feedbackMessage}
        </div>
      )}

      {renderSettingSection("Appearance", 
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-1 gap-2 sm:gap-1">
          <label htmlFor="theme-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-0 mr-3">Theme</label>
          <div className="flex items-center space-x-1 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-700 rounded-xl w-full sm:w-auto">
            <button onClick={() => handleThemeChange('light')} className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-1.5 button-interactive ${theme === 'light' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600/70'}`} aria-pressed={theme === 'light'}><SunIcon /> <span>Light</span></button>
            <button onClick={() => handleThemeChange('dark')} className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-1.5 button-interactive ${theme === 'dark' ? 'bg-slate-850 text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600/70'}`} aria-pressed={theme === 'dark'}><MoonIcon /> <span>Dark</span></button>
          </div>
        </div>
      )}
      
      {renderSettingSection("Formatting & Display", 
        <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1"><h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Date Format</h4><div className="flex flex-col sm:flex-row sm:space-x-3"><RadioGroupOption name="dateFormat" value="month-day" currentValue={userPreferences.dateFormat} label="Month/Day" example="e.g. 3/21" onChange={(val) => handlePreferenceChange('dateFormat', val, "Date format updated.")} /><RadioGroupOption name="dateFormat" value="day-month" currentValue={userPreferences.dateFormat} label="Day/Month" example="e.g. 21/3" onChange={(val) => handlePreferenceChange('dateFormat', val, "Date format updated.")} /></div></div>
            <div className="space-y-1"><h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Distance Format</h4><div className="flex flex-col sm:flex-row sm:space-x-3"><RadioGroupOption name="distanceFormat" value="miles" currentValue={userPreferences.distanceFormat} label="Miles" example="e.g. 50 mi" onChange={(val) => handlePreferenceChange('distanceFormat', val, "Distance format updated.")} /><RadioGroupOption name="distanceFormat" value="kilometers" currentValue={userPreferences.distanceFormat} label="Kilometers" example="e.g. 80 km" onChange={(val) => handlePreferenceChange('distanceFormat', val, "Distance format updated.")} /></div></div>
            <div className="space-y-1"><h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Time Format</h4><div className="flex flex-col sm:flex-row sm:space-x-3"><RadioGroupOption name="timeFormat" value="12-hour" currentValue={userPreferences.timeFormat} label="12-hour" example="e.g. 2:00 PM" onChange={(val) => handlePreferenceChange('timeFormat', val, "Time format updated.")} /><RadioGroupOption name="timeFormat" value="24-hour" currentValue={userPreferences.timeFormat} label="24-hour" example="e.g. 14:00" onChange={(val) => handlePreferenceChange('timeFormat', val, "Time format updated.")} /></div></div>
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700"><h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Place Descriptions</h4><div className="flex flex-col"><RadioGroupOption name="placeDescriptionPreference" value="show-in-empty-and-below" currentValue={userPreferences.placeDescriptionPreference} label="Show in empty notes & below my custom notes" onChange={(val) => handlePreferenceChange('placeDescriptionPreference', val, "Place description preference updated.")} /><RadioGroupOption name="placeDescriptionPreference" value="show-in-empty-only" currentValue={userPreferences.placeDescriptionPreference} label="Only show in empty notes" onChange={(val) => handlePreferenceChange('placeDescriptionPreference', val, "Place description preference updated.")} /></div></div>
        </div>
      )}
      
      {renderSettingSection("Notifications",
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h4 className="text-sm sm:text-md font-semibold text-slate-600 dark:text-slate-300 mb-2">Email Notifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                {(Object.keys(defaultNotificationPrefs.email) as Array<keyof EmailNotificationPrefs>).filter(key => key !== 'disableAllEmail').map(keyStr => {
                    const label = String(keyStr).replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()); 
                    return <CheckboxOption key={`email-${keyStr}`} id={`email-${keyStr}`} label={label} checked={currentNotifPrefs.email[keyStr]} disabled={currentNotifPrefs.email.disableAllEmail} onChange={(val) => handlePreferenceChange(`notificationPreferences.email.${keyStr}`, val, `${label} email notifications ${val ? 'enabled' : 'disabled'}.`)} />;
                })}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
              <CheckboxOption id="email-disableAll" label="Disable ALL Email Notifications" checked={currentNotifPrefs.email.disableAllEmail} onChange={(val) => handlePreferenceChange('notificationPreferences.email.disableAllEmail', val, val ? "All email notifications disabled." : "Email notifications re-enabled (individual settings apply).")} />
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-md font-semibold text-slate-600 dark:text-slate-300 mb-2">Push Notifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                {(Object.keys(defaultNotificationPrefs.push) as Array<keyof PushNotificationPrefs>).filter(key => key !== 'disableAllPush').map(keyStr => {
                    const label = String(keyStr).replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
                    return <CheckboxOption key={`push-${keyStr}`} id={`push-${keyStr}`} label={label} checked={currentNotifPrefs.push[keyStr]} disabled={currentNotifPrefs.push.disableAllPush} onChange={(val) => handlePreferenceChange(`notificationPreferences.push.${keyStr}`, val, `${label} push notifications ${val ? 'enabled' : 'disabled'}.`)} />;
                })}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
              <CheckboxOption id="push-disableAll" label="Disable ALL Push Notifications" checked={currentNotifPrefs.push.disableAllPush} onChange={(val) => handlePreferenceChange('notificationPreferences.push.disableAllPush', val, val ? "All push notifications disabled." : "Push notifications re-enabled (individual settings apply).")} />
            </div>
          </div>
        </div>
      )}

      {renderSettingSection("Travel Profile & Data", 
        <div className="space-y-4 sm:space-y-5">
            <div><label htmlFor="defaultTravelTier" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Default Travel Style</label><select id="defaultTravelTier" name="defaultTravelTier" value={userPreferences.defaultTravelTier || ''} onChange={(e) => handlePreferenceChange('defaultTravelTier', e.target.value, "Default travel style saved!")} className="w-full p-2.5 sm:p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 text-sm"><option value="">-- Select a default style --</option>{TRAVEL_TIERS.map(tier => (<option key={tier.id} value={tier.id}>{tier.name}</option>))}</select><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">This style will be pre-selected when you plan a new trip.</p></div>
            
            <div className="pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-700">
              <label htmlFor="homeAddress" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Home Address</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HomeIconSetting/>
                    </div>
                    <input 
                        type="text" 
                        id="homeAddress" 
                        name="homeAddress" 
                        value={homeAddressInput}
                        onChange={(e) => setHomeAddressInput(e.target.value)}
                        placeholder="e.g., 123 Main St, Anytown, USA" 
                        className="w-full p-2.5 sm:p-3 pl-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 text-sm"
                    />
                </div>
                <button 
                    onClick={handleHomeAddressSave}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-colors button-interactive"
                >
                    Save
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">Used for cab booking suggestions from/to your home.</p>
            </div>

            <div className="pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 sm:space-y-2">
                <button onClick={() => setShowClearCacheModal(true)} className="w-full sm:w-auto text-xs sm:text-sm bg-amber-100 dark:bg-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-600/60 text-amber-700 dark:text-amber-300 font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors shadow-sm border border-amber-300 dark:border-amber-600 button-interactive">Clear AI Itinerary Cache</button>
                <p className="text-xs text-slate-500 dark:text-slate-400">Clears locally cached AI-generated itineraries.</p>
            </div>
            <div className="pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 sm:space-y-2">
                <button onClick={() => setShowResetTripsModal(true)} className="w-full sm:w-auto text-xs sm:text-sm bg-red-100 dark:bg-red-700/50 hover:bg-red-200 dark:hover:bg-red-600/60 text-red-700 dark:text-red-300 font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors shadow-sm border border-red-300 dark:border-red-600 button-interactive" disabled={!userId} title={!userId ? "Login required to reset trips" : "Permanently delete all your saved trips"}>Reset All Saved Trips</button>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete all your saved trips from this browser. This action cannot be undone.</p>
            </div>
        </div>
      )}

      <Modal isOpen={showClearCacheModal} onClose={() => setShowClearCacheModal(false)} title="Confirm Clear Cache" size="sm" footerActions={<><button onClick={() => setShowClearCacheModal(false)} className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 font-medium button-interactive">Cancel</button><button onClick={handleClearItineraryCache} className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium button-interactive">Clear Cache</button></>}><p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Are you sure you want to clear the AI itinerary cache? This may help with outdated generated content.</p></Modal>
      <Modal isOpen={showResetTripsModal} onClose={() => setShowResetTripsModal(false)} title="Confirm Reset All Trips" size="md" footerActions={<><button onClick={() => setShowResetTripsModal(false)} className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 font-medium button-interactive">Cancel</button><button onClick={handleResetAllTrips} className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium button-interactive">Yes, Reset All Trips</button></>}><p className="text-sm sm:text-base text-slate-600 dark:text-slate-300"><strong>Warning:</strong> This will permanently delete ALL your saved trips. This action cannot be undone. Are you absolutely sure?</p></Modal>
    </div>
  );
};

export default SettingsPage;
