
import React, { useState, useMemo, useEffect } from 'react';
import { EXPLORE_CITIES_DATA } from '../constants';
import { ExploreDestination } from '../types';
import { ImageWithFallback } from './common/ImageDisplayUtils';
import { AppView } from '../types'; // Ensure AppView is imported if needed for onNavigateBack

// Icons
const SearchIcon = ({className = "w-5 h-5 text-slate-500 dark:text-emerald-700"}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);


interface ExploreViewProps {
  onViewDestinationDetails: (destinationId: string) => void;
  initialSearchTerm?: string | null;
  onClearInitialSearch: () => void;
  onNavigateBack: () => void; // Added for the back button
}

const CONTINENTS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']; 

const ExploreView: React.FC<ExploreViewProps> = ({ 
    onViewDestinationDetails, 
    initialSearchTerm, 
    onClearInitialSearch,
    onNavigateBack 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<string>('All');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      onClearInitialSearch(); 
    }
  }, [initialSearchTerm, onClearInitialSearch]);

  const filteredDestinations = useMemo(() => {
    return EXPLORE_CITIES_DATA.filter(dest => {
      const nameMatch = dest.name.toLowerCase().includes(searchTerm.toLowerCase());
      const countryMatch = dest.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const taglineMatch = dest.tagline?.toLowerCase().includes(searchTerm.toLowerCase());
      const continentMatch = activeContinent === 'All' || dest.continent === activeContinent;
      return (nameMatch || countryMatch || taglineMatch) && continentMatch;
    });
  }, [searchTerm, activeContinent]);

  const handleCardFlip = (destinationId: string) => {
    setFlippedCards(prev => ({ ...prev, [destinationId]: !prev[destinationId] }));
  };

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          className="mb-4 sm:mb-6 inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-slate-700 hover:bg-emerald-200 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors"
        >
          <BackArrowIcon /> Back to Home
        </button>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              placeholder="Where to?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-emerald-100 dark:bg-emerald-800/30 border border-transparent focus:border-emerald-400 dark:focus:border-emerald-500 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder-emerald-600 dark:placeholder-emerald-400 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Continent Filters */}
        <div className="mb-6 sm:mb-10 flex items-center justify-start space-x-1.5 sm:space-x-2 overflow-x-auto pb-2 custom-scrollbar">
          {CONTINENTS.map(continent => (
            <button
              key={continent}
              onClick={() => setActiveContinent(continent)}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-full transition-colors whitespace-nowrap
                ${activeContinent === continent 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-slate-700'
                }`}
            >
              {continent}
            </button>
          ))}
        </div>

        {/* City Cards Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredDestinations.map((dest, index) => {
              const isFlipped = !!flippedCards[dest.id];
              return (
                <div
                  key={dest.id}
                  className="perspective group cursor-pointer"
                  style={{ animation: `fadeInScaleUpItemDelayed 0.5s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                  onClick={() => handleCardFlip(dest.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardFlip(dest.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isFlipped}
                  aria-label={`Toggle details for ${dest.name}`}
                >
                  <div className={`relative w-full aspect-[4/3] rounded-xl shadow-lg transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front of Card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-emerald-100 dark:border-slate-700">
                      <ImageWithFallback 
                        src={dest.imageUrl} 
                        alt={`Image of ${dest.name}`} 
                        className="w-full h-2/3 object-cover"
                        placeholderClassName="w-full h-2/3 bg-emerald-100 dark:bg-slate-700 flex items-center justify-center"
                      />
                      <div className="p-3">
                        <h3 className="text-base sm:text-md font-semibold text-slate-800 dark:text-slate-100 mb-0.5 truncate" title={dest.name}>{dest.name}</h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate" title={dest.tagline || dest.description.substring(0,50) + "..."}>{dest.tagline || truncateText(dest.description, 40)}</p>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-emerald-600 dark:bg-emerald-700 rounded-xl overflow-y-auto border border-emerald-500 dark:border-emerald-600 transform rotate-y-180 p-3 sm:p-4 flex flex-col justify-between text-white">
                      <div>
                        <h3 className="text-base sm:text-md font-bold mb-1">{dest.name}</h3>
                        {dest.country && <p className="text-xs mb-1"><span className="font-semibold">Country:</span> {dest.country}</p>}
                        <p className="text-xs mb-1 line-clamp-2 sm:line-clamp-3 overflow-hidden"><span className="font-semibold">About:</span> {truncateText(dest.longDescription || dest.description, 60)}</p>
                        {dest.averageRating && <p className="text-xs mb-1"><span className="font-semibold">Rating:</span> {dest.averageRating}/5</p>}
                        {dest.bestTimeToVisit && <p className="text-xs mb-1 line-clamp-2 overflow-hidden"><span className="font-semibold">Best Visit:</span> {truncateText(dest.bestTimeToVisit, 50)}</p>}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewDestinationDetails(dest.id); }}
                        className="mt-2 w-full inline-flex items-center justify-center px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-md transition-colors group/button"
                        aria-label={`Learn more about ${dest.name}`}
                      >
                        Learn More <ArrowRightIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-emerald-400 dark:text-emerald-500 mb-4 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">No Cities Found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or continent filter.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-emerald-200 dark:border-slate-700 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 md:space-x-6 mb-3 sm:mb-4">
            <a href="#" className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:underline py-1">About</a>
            <a href="#" className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:underline py-1">Contact</a>
            <a href="#" className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:underline py-1">Privacy Policy</a>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            &copy; {new Date().getFullYear()} Wanderlust. All rights reserved.
          </p>
        </footer>
      </div>
       <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        
        @keyframes fadeInScaleUpItemDelayed {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; }
      `}</style>
    </div>
  );
};

export default ExploreView;