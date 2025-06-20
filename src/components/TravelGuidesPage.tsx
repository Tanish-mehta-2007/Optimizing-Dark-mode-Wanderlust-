
import React, { useState, useMemo } from 'react';
import { EXPLORE_COUNTRIES_DATA } from '../constants'; // Changed to COUNTRIES
import { ExploreDestination } from '../../types';
import { ImageWithFallback } from './common/ImageDisplayUtils';

interface TravelGuidesPageProps {
  onNavigateToGuideDetail: (guideId: string) => void; // guideId will now be countryId
}

const FILTER_CATEGORIES = [
  { name: "All", tags: [] },
  { name: "City Focused", tags: ["cities", "city life"] }, // Tags might need adjustment for countries
  { name: "Nature & Outdoors", tags: ["nature", "beach", "mountains", "national parks", "outdoors", "coastline", "harbor", "desert", "countryside"] },
  { name: "Adventure & Culture", tags: ["adventure", "culture", "history", "art", "temples", "ruins", "food", "festivals", "road trip", "wildlife"] },
  { name: "Relaxation", tags: ["relaxation", "beach", "spa", "wellbeing", "romance", "countryside", "food"] },
];


const TravelGuidesPage: React.FC<TravelGuidesPageProps> = ({ onNavigateToGuideDetail }) => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredGuides = useMemo(() => {
    const selectedCategory = FILTER_CATEGORIES.find(cat => cat.name === activeFilter);
    if (!selectedCategory || activeFilter === "All") {
      return EXPLORE_COUNTRIES_DATA; // Use COUNTRIES data
    }
    return EXPLORE_COUNTRIES_DATA.filter(destination => 
      destination.tags.some(tag => selectedCategory.tags.includes(tag.toLowerCase()))
    );
  }, [activeFilter]);

  return (
    <div className="flex-1 flex flex-col bg-[#F0F7F4] dark:bg-slate-900 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
            Travel guides
          </h1>
        </header>

        <div className="mb-8 sm:mb-10 flex flex-wrap gap-2 sm:gap-3">
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveFilter(category.name)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 button-interactive
                ${activeFilter === category.name
                  ? 'bg-[#2D4C46] text-white shadow-md focus:ring-[#2D4C46]'
                  : 'bg-[#E0EBE8] dark:bg-slate-700 text-[#2D4C46] dark:text-slate-200 hover:bg-[#CFE0DC] dark:hover:bg-slate-600 focus:ring-[#7DA09B]'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredGuides.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">No country guides found for "{activeFilter}".</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Try a different category or check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {filteredGuides.map((guide, index) => ( 
              <div
                key={guide.id}
                className="group cursor-pointer flex flex-col items-center card-interactive-lift"
                onClick={() => onNavigateToGuideDetail(guide.id)} 
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToGuideDetail(guide.id); }}
                tabIndex={0}
                role="button"
                aria-label={`View guide for ${guide.name}`}
                style={{ animation: `fadeInScaleUpItemDelayed 0.5s ease-out ${index * 0.07}s forwards`, opacity: 0 }}
              >
                <div className="w-full aspect-[4/3] rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
                  <ImageWithFallback
                    src={guide.imageUrl}
                    alt={`Image of ${guide.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholderClassName="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                  />
                </div>
                <div className="mt-2 sm:mt-3 text-center px-1">
                  <h2 
                    className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate" 
                    title={guide.name}
                  >
                    {guide.name} 
                  </h2>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
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
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

export default TravelGuidesPage;