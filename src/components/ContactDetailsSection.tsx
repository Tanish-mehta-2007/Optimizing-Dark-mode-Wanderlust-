
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

interface ContactDetailsData {
  phoneNumber: string;
  secondaryEmail: string;
}

const ContactDetailsSection: React.FC = () => {
  const { currentUser, updateUserContactDetails } = useContext<AuthContextType>(AuthContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [contactDetails, setContactDetails] = useState<ContactDetailsData>({
    phoneNumber: currentUser?.phoneNumber || '',
    secondaryEmail: currentUser?.secondaryEmail || '',
  });

  useEffect(() => {
    if (currentUser) {
        setContactDetails({
            phoneNumber: currentUser.phoneNumber || '',
            secondaryEmail: currentUser.secondaryEmail || '',
        });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSaveError("You must be logged in to update contact details.");
      return;
    }
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await updateUserContactDetails({
        phoneNumber: contactDetails.phoneNumber,
        secondaryEmail: contactDetails.secondaryEmail,
      });
      setSaveSuccess("Contact details updated successfully!");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update contact details. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => { setSaveSuccess(null); setSaveError(null); }, 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6 sm:mb-8">
        <MailIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Contact Details</h2>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="primaryEmail" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Primary Email Address (Read-only)
          </label>
          <input
            type="email"
            name="primaryEmail"
            id="primaryEmail"
            value={currentUser?.email || ''}
            readOnly
            className="w-full p-2 sm:p-2.5 text-sm bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            title="Primary email address cannot be changed here."
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
            value={contactDetails.phoneNumber}
            onChange={handleInputChange}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div>
          <label htmlFor="secondaryEmail" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Secondary Email (Optional)
          </label>
          <input
            type="email"
            name="secondaryEmail"
            id="secondaryEmail"
            value={contactDetails.secondaryEmail}
            onChange={handleInputChange}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Enter a secondary email"
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
            {isSaving ? <LoadingSpinner size="small" message="Saving..." /> : 'Save Contact Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactDetailsSection;