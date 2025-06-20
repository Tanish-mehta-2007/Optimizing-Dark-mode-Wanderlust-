
import React, { useContext } from 'react';
import { AppContext } from '../App'; 
import { AppView } from '../../types'; 

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

interface LegalLinkProps {
  title: string;
  onClick: () => void;
}

const LegalLink: React.FC<LegalLinkProps> = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center justify-between w-full px-3 sm:px-4 py-3 sm:py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-800 rounded-lg button-interactive list-item-interactive"
    role="link"
  >
    <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  </button>
);

const LegalSection: React.FC = () => {
  const { navigateTo } = useContext(AppContext); 

  const handleNavigateToPrivacy = () => {
    if (navigateTo) navigateTo(AppView.PRIVACY_POLICY);
    else console.warn("navigateTo function not available from AppContext for Privacy Policy.");
  };

  const handleNavigateToTerms = () => {
     if (navigateTo) navigateTo(AppView.TERMS_OF_SERVICE);
    else console.warn("navigateTo function not available from AppContext for Terms of Service.");
  };


  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6 sm:mb-8">
        <DocumentIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Legal Information</h2>
      </div>
      <div className="space-y-2">
        <LegalLink title="Privacy Policy" onClick={handleNavigateToPrivacy} />
        <LegalLink title="Terms of Service" onClick={handleNavigateToTerms} />
      </div>
    </div>
  );
};

export default LegalSection;
