
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext'; // Import useTranslation

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  animationBaseClass?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index, animationBaseClass }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group ${animationBaseClass || ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-12 h-12 mb-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
};

// SVGs for Feature Icons (Heroicons v2 Outline)
const SmartItineraryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* light-bulb icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.995 15.995 0 01-5.25 0M10.5 14.25h3M12 12.75a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-4.5 0v3.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const FlightUpdatesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* paper-airplane icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const OfflineAccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* arrow-down-tray icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const OptimizedRoutingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* arrow-path icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
  </svg>
);
const AIChatPlannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* chat-bubble-oval-left-ellipsis icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.612 3.75 12.375 3.75S21 7.444 21 12z" />
  </svg>
);
const SeamlessBookingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* calendar-days icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15h.008v.008H12V15z" />
  </svg>
);

interface FeatureHighlightsProps {
  sectionTitleAnimationClass?: string;
  cardAnimationBaseClass?: string;
}

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ sectionTitleAnimationClass, cardAnimationBaseClass }) => {
  const { t } = useTranslation();
  const features = [
    { icon: <SmartItineraryIcon />, titleKey: "feature.destinationDiscovery", descriptionKey: "feature.destinationDiscovery.desc" }, // Using existing keys for smart itinerary
    { icon: <FlightUpdatesIcon />, title: "Live Flight Updates", description: "Stay notified and monitor your flight status to ensure a smooth travel experience." }, // Kept as is, can be translated later
    { icon: <OfflineAccessIcon />, title: "Offline Access", description: "No Wi-Fi, no problem. Your trip plans are locally downloaded for access anywhere." }, // Kept
    { icon: <OptimizedRoutingIcon />, title: "Optimized Map Routing", description: "Perfect for road trips! Get the best routes auto-rearranged and visualized on the map." }, // Kept
    { icon: <AIChatPlannerIcon />, titleKey: "feature.aiTripPlanner", descriptionKey: "feature.aiTripPlanner.desc" }, // Using existing keys
    { icon: <SeamlessBookingsIcon />, titleKey: "feature.transportationBooking", descriptionKey: "feature.transportationBooking.desc" }, // Using existing keys for seamless bookings
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-850">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 sm:mb-12 md:mb-16 ${sectionTitleAnimationClass || ''}`} style={{ opacity: sectionTitleAnimationClass ? 0 : 1 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
            {t('homePage.keyFeatures')} {/* Example of translating section title if needed, or can be hardcoded */}
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Wanderlust AI combines powerful planning tools with intelligent suggestions to make your travel effortless.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.titleKey ? t(feature.titleKey) : feature.title!} 
              description={feature.descriptionKey ? t(feature.descriptionKey) : feature.description!} 
              index={index} 
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

export default FeatureHighlights;
