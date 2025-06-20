
import React from 'react';

interface GlobalFooterProps {
  onNavigateToAboutUs: () => void;
  onNavigateToPrivacyPolicy: () => void;
  onNavigateToContactUs: () => void;
  onNavigateToSupport: () => void;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onNavigateToAboutUs,
  onNavigateToPrivacyPolicy,
  onNavigateToContactUs,
  onNavigateToSupport,
}) => {
  const currentYear = new Date().getFullYear();

  const footerLinkClasses = "text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors interactive-element px-1 py-0.5 rounded"; // Added interactive-element and padding/rounding for better click area

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-2 sm:mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600 dark:text-blue-500">
            <path d="M2 12h20"/><path d="M6.343 17.657 12 12l5.657-5.657"/><path d="m17.657 6.343-5.657 5.657L6.343 17.657"/><path d="M12 2v20"/>
          </svg>
          <span className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-200">Wanderlust AI</span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-6 gap-y-2 my-3 sm:my-4">
          <button onClick={onNavigateToAboutUs} className={footerLinkClasses}>About Us</button>
          <button onClick={onNavigateToPrivacyPolicy} className={footerLinkClasses}>Privacy Policy</button>
          <button onClick={onNavigateToContactUs} className={footerLinkClasses}>Contact Us</button>
          <button onClick={onNavigateToSupport} className={footerLinkClasses}>Support</button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {currentYear} Wanderlust AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default GlobalFooter;