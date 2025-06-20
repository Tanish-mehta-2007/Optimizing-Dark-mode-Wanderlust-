
import React from 'react';
import { EXPLORE_CITIES_DATA } from '../constants'; // Changed from EXPLORE_DESTINATIONS
import { ExploreDestination } from '../types';

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

interface DestinationCardProps {
  destination: ExploreDestination;
  index: number;
  onExplore: (destinationId: string) => void;
  animationBaseClass?: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, index, onExplore, animationBaseClass }) => {
  return (
    <div 
      className={`relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:ring-4 hover:ring-blue-500 dark:hover:ring-blue-400 hover:ring-opacity-50 aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] ${animationBaseClass || ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <img 
        src={destination.imageUrl} 
        alt={`Image of ${destination.name}`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <h3 className="text-lg sm:text-xl font-bold">{destination.name}</h3>
        {destination.country && <p className="text-xs sm:text-sm opacity-90">{destination.country}</p>}
        <button 
          onClick={() => onExplore(destination.id)}
          className="mt-3 inline-flex items-center text-xs sm:text-sm font-medium text-blue-300 group-hover:text-blue-200 bg-black/30 group-hover:bg-black/50 px-3 py-1.5 rounded-md transition-colors"
          aria-label={`Explore ${destination.name}`}
        >
          Explore
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

interface PopularDestinationsHighlightProps {
  onExploreDestination: (destinationId: string) => void;
  sectionTitleAnimationClass?: string;
  cardAnimationBaseClass?: string;
}

const PopularDestinationsHighlight: React.FC<PopularDestinationsHighlightProps> = ({ onExploreDestination, sectionTitleAnimationClass, cardAnimationBaseClass }) => {
  // Select first 6 city destinations as highlights
  const highlightedDestinations = EXPLORE_CITIES_DATA.slice(0, 6); 

  if (highlightedDestinations.length === 0) {
    return null; // Don't render if no destinations to show
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 sm:mb-12 md:mb-16 ${sectionTitleAnimationClass || ''}`} style={{ opacity: sectionTitleAnimationClass ? 0 : 1 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
            Get Inspired
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover breathtaking destinations handpicked for your next adventure.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {highlightedDestinations.map((dest, index) => (
            <DestinationCard 
              key={dest.id} 
              destination={dest} 
              index={index} 
              onExplore={onExploreDestination} 
              animationBaseClass={cardAnimationBaseClass}
            />
          ))}
        </div>
      </div>
      <style>{`
        /* Ensure item-card-animate-in is defined in index.html or here if specific */
        /* .item-card-animate-in animation is now globally defined in index.html */
      `}</style>
    </section>
  );
};

export default PopularDestinationsHighlight;