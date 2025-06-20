
import React, { useState, useContext } from 'react';
import { ProfilePictureManager } from './ProfilePictureManager'; // Changed to named import
import { AuthContext } from '../contexts/AuthContext';
// import type { AuthContextType } from '../contexts/AuthContext'; // Type is inferred
import LoadingSpinner from './common/LoadingSpinner'; // For save button
import { UserPreferences } from '../types'; // Import UserPreferences

const IdentificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm.375 0a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
  </svg>
);
const CalendarIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
  const inputElement = event.currentTarget;
  if (inputElement && typeof inputElement.showPicker === 'function') {
    try {
      inputElement.showPicker();
    } catch (e) {
      console.warn("Could not programmatically open date picker:", e);
    }
  }
};

interface PersonalInfoData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
}

interface PersonalInfoSectionProps {
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
}

const calculateAge = (birthDateString: string): number | undefined => {
  if (!birthDateString) return undefined;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : undefined;
};

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userPreferences, setUserPreferences }) => {
  const { currentUser } = useContext(AuthContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialDateOfBirth = userPreferences.age 
    ? new Date(new Date().setFullYear(new Date().getFullYear() - userPreferences.age)).toISOString().split('T')[0]
    : '1990-01-01';


  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    fullName: currentUser?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Alex Doe',
    dateOfBirth: initialDateOfBirth,
    phoneNumber: currentUser?.phoneNumber || '555-123-4567', // Use actual phone number or placeholder
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const success = Math.random() > 0.2; 
    if (success) {
      const calculatedAge = calculateAge(personalInfo.dateOfBirth);
      setUserPreferences({ ...userPreferences, age: calculatedAge });
      // Here you might also want to update the currentUser in AuthContext if fullName or phoneNumber changes.
      // This mock doesn't do that directly, but a real app would.
      setSaveSuccess("Personal information updated successfully!");
    } else {
      setSaveError("Failed to update personal information. Please try again.");
    }
    setIsSaving(false);
    setTimeout(() => { setSaveSuccess(null); setSaveError(null); }, 3000);
  };

  const today = new Date().toISOString().split('T')[0];
  const hundredYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0];


  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6 sm:mb-8">
        <IdentificationIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Personal Information</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
          <ProfilePictureManager />
        </div>

        <div className="lg:w-2/3">
          <form onSubmit={handleSaveChanges} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={personalInfo.fullName}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={personalInfo.dateOfBirth}
                    onChange={handleInputChange}
                    onClick={handleDateInputClick}
                    max={today}
                    min={hundredYearsAgo}
                    className="appearance-none w-full p-2 sm:p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CalendarIcon />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={currentUser?.email || ''}
                readOnly
                className="w-full p-2 sm:p-2.5 text-sm bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                title="Email address cannot be changed here."
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={personalInfo.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="pt-2 sm:pt-3">
              {saveSuccess && <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3">{saveSuccess}</p>}
              {saveError && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 mb-2 sm:mb-3">{saveError}</p>}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 disabled:opacity-70 flex items-center justify-center text-sm button-interactive"
              >
                {isSaving ? <LoadingSpinner size="small" message="Saving..." /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;