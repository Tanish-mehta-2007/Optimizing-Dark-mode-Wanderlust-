
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { BillingAddressDetails } from '../../types'; 
import LoadingSpinner from './common/LoadingSpinner';

const LocationMarkerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);


const BillingAddressSection: React.FC = () => {
  const { currentUser, updateUserBillingAddress } = useContext<AuthContextType>(AuthContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [addressDetails, setAddressDetails] = useState<BillingAddressDetails>({
    streetAddress1: currentUser?.streetAddress1 || '',
    streetAddress2: currentUser?.streetAddress2 || '',
    city: currentUser?.city || '',
    stateOrProvince: currentUser?.stateOrProvince || '',
    postalCode: currentUser?.postalCode || '',
    country: currentUser?.country || '',
  });

  useEffect(() => {
    if (currentUser) {
        setAddressDetails({
            streetAddress1: currentUser.streetAddress1 || '',
            streetAddress2: currentUser.streetAddress2 || '',
            city: currentUser.city || '',
            stateOrProvince: currentUser.stateOrProvince || '',
            postalCode: currentUser.postalCode || '',
            country: currentUser.country || '',
        });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSaveError("You must be logged in to update billing address.");
      return;
    }
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await updateUserBillingAddress(addressDetails);
      setSaveSuccess("Billing address updated successfully!");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update billing address. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => { setSaveSuccess(null); setSaveError(null); }, 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6 sm:mb-8">
        <LocationMarkerIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Billing Address</h2>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="streetAddress1" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Street Address 1
          </label>
          <input
            type="text" name="streetAddress1" id="streetAddress1" value={addressDetails.streetAddress1} onChange={handleInputChange}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 123 Main St" required
          />
        </div>
        <div>
          <label htmlFor="streetAddress2" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Street Address 2 (Optional)
          </label>
          <input
            type="text" name="streetAddress2" id="streetAddress2" value={addressDetails.streetAddress2 || ''} onChange={handleInputChange}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Apt 4B"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input type="text" name="city" id="city" value={addressDetails.city} onChange={handleInputChange} className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Anytown" required/>
            </div>
            <div>
                <label htmlFor="stateOrProvince" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State / Province</label>
                <input type="text" name="stateOrProvince" id="stateOrProvince" value={addressDetails.stateOrProvince} onChange={handleInputChange} className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., CA" required/>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="postalCode" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
                <input type="text" name="postalCode" id="postalCode" value={addressDetails.postalCode} onChange={handleInputChange} className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 90210" required/>
            </div>
            <div>
                <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input type="text" name="country" id="country" value={addressDetails.country} onChange={handleInputChange} className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., USA" required/>
            </div>
        </div>

        <div className="pt-2 sm:pt-3">
          {saveSuccess && <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3">{saveSuccess}</p>}
          {saveError && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 mb-2 sm:mb-3">{saveError}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 disabled:opacity-70 flex items-center justify-center text-sm button-interactive"
          >
            {isSaving ? <LoadingSpinner size="small" message="Saving..." /> : 'Save Billing Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingAddressSection;
