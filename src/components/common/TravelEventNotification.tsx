
import React from 'react';
import Modal from './Modal'; // Assuming Modal component is in the same directory or accessible path

interface TravelEventNotificationProps {
  isVisible: boolean;
  message: string;
  actionButtonText?: string;
  onActionClick?: () => void;
  onDismiss: () => void;
}

// A more premium/fun icon, perhaps an SVG
const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-amber-400">
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
    <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
  </svg>
);


const TravelEventNotification: React.FC<TravelEventNotificationProps> = ({
  isVisible,
  message,
  actionButtonText,
  onActionClick,
  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isVisible}
      onClose={onDismiss}
      title="" 
      size="md"
    >
      <div className="text-center p-4 sm:p-6">
        <div className="mx-auto mb-4 sm:mb-5 flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-500 dark:to-blue-600 shadow-lg">
          <SparkleIcon />
        </div>
        <p className="text-md sm:text-lg font-medium text-slate-700 dark:text-slate-200 mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          {actionButtonText && onActionClick && (
            <button
              onClick={onActionClick}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 transform hover:scale-105 text-sm button-interactive"
            >
              {actionButtonText}
            </button>
          )}
          <button
            onClick={onDismiss}
            className={`w-full sm:w-auto px-6 py-2.5 font-medium rounded-lg shadow-sm transition-colors duration-200 text-sm button-interactive ${
              actionButtonText ? 
              'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200' :
              'bg-blue-600 hover:bg-blue-700 text-white' // Make dismiss primary if no action
            }`}
          >
            {actionButtonText ? "Dismiss" : "Got it!"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TravelEventNotification;
