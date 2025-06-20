
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const SecurityLockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const SecuritySection: React.FC = () => {
  const { currentUser } = useContext<AuthContextType>(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    if (!currentUser) {
      setSaveError("You must be logged in to change your password.");
      return;
    }
    if (!currentPassword) {
      setSaveError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setSaveError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSaveError("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    // Simulate API call for password change
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success/failure
    const success = Math.random() > 0.3; // 70% chance of success for mock
    if (success) {
      setSaveSuccess("Password updated successfully! (Mocked)");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setSaveError("Failed to update password. Current password might be incorrect or server error. (Mocked)");
    }
    setIsSaving(false);
    setTimeout(() => { setSaveSuccess(null); setSaveError(null); }, 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6 sm:mb-8">
        <SecurityLockIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Security Settings</h2>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="currentPassword" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Enter your current password"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Enter new password (min. 8 characters)"
            minLength={8}
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirmNewPassword" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmNewPassword"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full p-2 sm:p-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Confirm your new password"
            minLength={8}
            required
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
            {isSaving ? <LoadingSpinner size="small" message="Updating..." /> : 'Update Password'}
          </button>
        </div>
      </form>
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Two-Factor Authentication (2FA)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                For enhanced security, we recommend enabling Two-Factor Authentication.
            </p>
            <button className="text-xs px-3 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-medium rounded-md transition-colors button-interactive" disabled>
                Enable 2FA (Coming Soon)
            </button>
      </div>
    </div>
  );
};

export default SecuritySection;
