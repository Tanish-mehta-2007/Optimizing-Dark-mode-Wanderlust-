
import React from 'react';

const CardIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-500 mr-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
</svg>
);


const CardInfoSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6">
        <CardIcon />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Payment Methods</h2>
      </div>
      <div className="text-center py-8 sm:py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4 opacity-70">
         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Managing saved payment methods is coming soon!
        </p>
         <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          For now, please add your card details during the checkout process when making a booking. Thank you for your patience!
        </p>
      </div>
    </div>
  );
};

export default CardInfoSection;