
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TripContext } from '../contexts/TripContext';
import { generatePackingList, searchRecentInfo } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { saveTrip } from '../services/storageService';
import { GroundingChunk } from '../types';

interface ShoppingSuggestion {
  query: string;
  links: GroundingChunk[];
  error?: string;
  isLoading: boolean;
}

interface PackingListDisplayProps {
  onNext: () => void;
  onBack: () => void;
}

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);


const PackingListDisplay: React.FC<PackingListDisplayProps> = ({ onNext, onBack }) => {
  const { currentTrip, setPackingList } = useContext(TripContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const [shoppingSuggestions, setShoppingSuggestions] = useState<Record<string, ShoppingSuggestion>>({});
  const [isFetchingAllSuggestions, setIsFetchingAllSuggestions] = useState(false);
  const [generalSuggestionError, setGeneralSuggestionError] = useState<string | null>(null);

  const fetchPackingList = useCallback(async () => {
    if (!currentTrip || !currentTrip.destinations || currentTrip.destinations.length === 0 || !currentTrip.dates || !currentTrip.itinerary?.title) { 
      setError("Essential trip details (destination(s), dates, or itinerary type) are missing. Cannot generate packing list.");
      setIsLoading(false);
      return;
    }
    if (currentTrip.packingList && currentTrip.packingList.length > 0) {
       setIsLoading(false);
       const initialChecked: Record<string, boolean> = {};
       currentTrip.packingList.forEach(item => initialChecked[item] = false); 
       setCheckedItems(initialChecked);
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [startDate, endDate] = currentTrip.dates.split(' to ');
      const travelType = currentTrip.itinerary?.title.includes("Business") ? "Business Trip" : 
                         currentTrip.itinerary?.title.includes("Adventure") ? "Adventure" : "General Vacation";

      const list = await generatePackingList(currentTrip.destinations, startDate, endDate, travelType);
      setPackingList(list); 
      const initialChecked: Record<string, boolean> = {};
      list.forEach(item => initialChecked[item] = false);
      setCheckedItems(initialChecked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate packing list due to an unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, [currentTrip, setPackingList]); 

  useEffect(() => {
    fetchPackingList();
  }, [fetchPackingList]);

  const handleToggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSuggestShoppingLinks = async () => {
    if (!currentTrip || !currentTrip.packingList) return;
    
    const uncheckedItemsList = currentTrip.packingList.filter(item => !checkedItems[item]);
    if (uncheckedItemsList.length === 0) {
      setGeneralSuggestionError("All items are checked off!");
      setTimeout(() => setGeneralSuggestionError(null), 3000);
      return;
    }

    setIsFetchingAllSuggestions(true);
    setGeneralSuggestionError(null);
    const newSuggestions = { ...shoppingSuggestions };

    for (const item of uncheckedItemsList) {
      const query = `links to buy ${item} online`;
      newSuggestions[item] = { query, links: [], isLoading: true, error: undefined };
      setShoppingSuggestions({ ...newSuggestions }); 

      try {
        const result = await searchRecentInfo(query);
        newSuggestions[item] = { query, links: result.sources, isLoading: false, error: undefined };
      } catch (err) {
        console.error(`Error fetching suggestions for ${item}:`, err);
        newSuggestions[item] = { 
            query, 
            links: [], 
            isLoading: false, 
            error: err instanceof Error ? err.message : `Failed to get suggestions for ${item}.` 
        };
      }
      setShoppingSuggestions({ ...newSuggestions }); 
    }
    setIsFetchingAllSuggestions(false);
  };


  const handleSaveAndFinish = () => {
    if (currentTrip) {
      saveTrip(currentTrip);
    }
    onNext();
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-xl shadow-xl">
        <LoadingSpinner message="Generating your personalized packing list..." size="large"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md mx-auto border border-red-200 dark:border-red-700">
        <h2 className="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Oops! Packing List Error</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors"
        >
          Back to Confirmation
        </button>
      </div>
    );
  }

  if (!currentTrip || !currentTrip.packingList || currentTrip.packingList.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md mx-auto border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-100">Packing List Not Available</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The AI couldn't generate a packing list for this trip, or the list is empty. You can try going back or retrying.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
            onClick={onBack}
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors"
            >
            Back to Confirmation
            </button>
            <button
            onClick={fetchPackingList}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors"
            >
            Retry Generating List
            </button>
        </div>
      </div>
    );
  }
  
  const categorizeItem = (item: string): string => {
    const lowerItem = item.toLowerCase();
    if (/(shirt|pant|jean|dress|sock|underwear|jacket|coat|sweater|shoe|boot|sandal|hat|scarf|glove)/.test(lowerItem)) return "👚 Clothing & Footwear";
    if (/(passport|visa|ticket|id|document|insurance|boarding pass|money|card)/.test(lowerItem)) return "📄 Documents & Money";
    if (/(phone|charger|adapter|camera|laptop|power bank|headphone|tablet)/.test(lowerItem)) return "🔌 Electronics";
    if (/(toothbrush|toothpaste|shampoo|soap|sunscreen|deodorant|medication|first aid|brush|comb|lotion)/.test(lowerItem)) return "🧴 Toiletries & Health";
    if (/(book|guide|map|journal|pen|snack|water bottle|bag|towel)/.test(lowerItem)) return "Miscellaneous";
    return "✨ Other Essentials";
  };

  const categorizedList: Record<string, string[]> = currentTrip.packingList.reduce((acc, item) => {
    const category = categorizeItem(item);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, string[]>);

  const sortedCategories = Object.keys(categorizedList).sort((a,b) => {
    if (a.includes("Clothing")) return -1;
    if (b.includes("Clothing")) return 1;
    if (a.includes("Documents")) return -1;
    if (b.includes("Documents")) return 1;
    return a.localeCompare(b);
  });

  const uncheckedItemsExist = currentTrip.packingList.some(item => !checkedItems[item]);
  const destinationsString = currentTrip.destinations.join(' & ');

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-10 rounded-xl shadow-xl max-w-3xl mx-auto text-slate-700 dark:text-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6 sm:mb-8">Your Packing Checklist for {destinationsString}</h2>
      
      {sortedCategories.map((category) => (
        <div key={category} className="mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-4">{category}</h3>
          <ul className="space-y-2.5">
            {categorizedList[category].map((item, index) => (
              <li key={`${category}-${index}-${item}`} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-md transition-colors">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id={`item-${category}-${index}`} 
                        className="form-checkbox h-5 w-5 text-blue-600 bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 mr-3 accent-blue-600 cursor-pointer"
                        checked={!!checkedItems[item]}
                        onChange={() => handleToggleCheckItem(item)}
                    />
                    <label htmlFor={`item-${category}-${index}`} className={`flex-grow cursor-pointer text-sm sm:text-base ${checkedItems[item] ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{item}</label>
                </div>
                {!checkedItems[item] && shoppingSuggestions[item] && (
                    <div className="ml-8 mt-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-600">
                        {shoppingSuggestions[item].isLoading && (
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                <LoadingSpinner size="small" message="" />
                                <span className="ml-1">Finding links...</span>
                            </div>
                        )}
                        {shoppingSuggestions[item].error && (
                            <p className="text-xs text-red-500 dark:text-red-400">Error: {shoppingSuggestions[item].error}</p>
                        )}
                        {shoppingSuggestions[item].links.length > 0 && (
                            <div className="space-y-1 mt-1">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Shopping links:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                {shoppingSuggestions[item].links.slice(0, 3).map((link, linkIdx) => (
                                    <li key={linkIdx} className="text-xs">
                                        <a 
                                            href={link.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                            title={link.web.uri}
                                        >
                                            {link.web.title || link.web.uri}
                                        </a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                        {!shoppingSuggestions[item].isLoading && !shoppingSuggestions[item].error && shoppingSuggestions[item].links.length === 0 && (
                             <p className="text-xs text-slate-500 dark:text-slate-400 italic">No specific shopping suggestions found for this item.</p>
                        )}
                    </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {generalSuggestionError && <p className="text-sm text-red-500 dark:text-red-400 text-center mt-4">{generalSuggestionError}</p>}

      <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors"
        >
          Back to Confirmation
        </button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
                onClick={handleSuggestShoppingLinks}
                disabled={isFetchingAllSuggestions || !uncheckedItemsExist}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-60 text-sm"
            >
                <ShoppingBagIcon /> {isFetchingAllSuggestions ? 'Suggesting...' : 'Suggest Shopping Links'}
            </button>
            <button
                onClick={handleSaveAndFinish}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105"
            >
                Next: Manage Budget
            </button>
        </div>
      </div>
    </div>
  );
};

export default PackingListDisplay;
