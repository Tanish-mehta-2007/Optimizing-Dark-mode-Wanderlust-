
import React, { useState, useContext, useRef, ChangeEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const UserPlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-slate-400 dark:text-slate-500">
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
  </svg>
);

export const ProfilePictureManager: React.FC = () => {
  const { currentUser, updateCurrentUserProfileImage } = useContext<AuthContextType>(AuthContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profileImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("File is too large. Please select an image under 2MB.");
        setSelectedFile(null);
        setPreviewUrl(currentUser?.profileImageUrl || null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).");
        setSelectedFile(null);
        setPreviewUrl(currentUser?.profileImageUrl || null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(currentUser?.profileImageUrl || null);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile || !previewUrl) {
      setError("Please select an image first.");
      return;
    }
    if (!currentUser) {
      setError("You must be logged in to update your profile picture.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateCurrentUserProfileImage(previewUrl);
      setSuccessMessage("Profile picture updated successfully!");
      setSelectedFile(null); // Clear selection after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile picture.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Profile Picture</h3>
      
      <div className="flex flex-col items-center space-y-4 sm:space-y-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 shadow-md">
          {previewUrl ? (
            <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <UserPlaceholderIcon />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload profile picture"
        />
        
        <button
          onClick={triggerFileInput}
          className="px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm border border-slate-300 dark:border-slate-500 transition-colors text-xs sm:text-sm button-interactive"
          disabled={isLoading}
        >
          {previewUrl && previewUrl !== currentUser?.profileImageUrl ? 'Change Picture' : 'Upload Picture'}
        </button>

        {error && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
        {successMessage && <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 text-center">{successMessage}</p>}

        {selectedFile && previewUrl && (
          <button
            onClick={handleSaveImage}
            disabled={isLoading}
            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-70 flex items-center justify-center text-xs sm:text-sm button-interactive"
          >
            {isLoading ? <LoadingSpinner size="small" message="Saving..." /> : 'Save Image'}
          </button>
        )}
      </div>
    </div>
  );
};
// No default export, ProfilePictureManager is a named export.
