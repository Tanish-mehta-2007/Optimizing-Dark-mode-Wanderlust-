
import React, { useState, useEffect } from 'react';
import { EXPLORE_CITIES_DATA, EXPLORE_COUNTRIES_DATA, DESTINATION_ATTRACTIONS, MOCK_GUIDE_DETAILS, CITY_GUIDE_DETAILS_DATA } from '../constants';
import { ExploreDestination, TouristAttraction, User, GuideDetailContent, CityGuideDetails, CuisineHighlight, DayTripIdea } from '../../types'; 
import { ImageWithFallback } from './common/ImageDisplayUtils'; 
import LoadingSpinner from './common/LoadingSpinner';

interface DestinationDetailPageProps {
  destinationId: string;
  onNavigateToHome: () => void;
  onPlanTrip: (destinationName: string) => void;
  currentUser: User | null; 
  navigateToLogin: () => void; 
  isGuideView?: boolean;
}

// Icons
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const PlanTripIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H5.625m1.5A3.75 3.75 0 0011.25 12H10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0A8.958 8.958 0 012.25 12c0-1.753.491-3.395 1.348-4.796M12 21a8.958 8.958 0 008.652-9.204" />
  </svg>
);
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-sky-500 dark:text-sky-400"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>;
const FoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400"><path d="M10 1a9 9 0 014.969 16.786A5.505 5.505 0 0010 13.5a5.505 5.505 0 00-4.969 3.286A9 9 0 0110 1z" /><path d="M5.031 13.214a5.505 5.505 0 004.969 3.286c1.828 0 3.474-.93 4.415-2.327A7.493 7.493 0 0110 16.5a7.492 7.492 0 01-4.415-1.465A5.478 5.478 0 005.03 13.214z" /><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75V6h.75a.75.75 0 010 1.5H10v.25a.75.75 0 01-1.5 0V7.5H7.75a.75.75 0 010-1.5H8.5V2.75A.75.75 0 0110 2zM4.75 8a.75.75 0 01.75.75V12a4 4 0 004 4h1a4 4 0 004-4V8.75a.75.75 0 011.5 0V12a5.5 5.5 0 01-5.5 5.5h-1a5.5 5.5 0 01-5.5-5.5V8.75A.75.75 0 014.75 8z" clipRule="evenodd" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM5.404 15.657a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06zM16.717 10a.75.75 0 01-1.5 0h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 011.5 0zM4.283 10a.75.75 0 01-1.5 0H1.25a.75.75 0 010-1.5h1.533a.75.75 0 011.5 0zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM4.343 5.404a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.061 1.06z" clipRule="evenodd" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM5.404 15.657a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06zM16.717 10a.75.75 0 01-1.5 0h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 011.5 0zM4.283 10a.75.75 0 01-1.5 0H1.25a.75.75 0 010-1.5h1.533a.75.75 0 011.5 0zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM4.343 5.404a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.061 1.06z" /></svg>;

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({ destinationId, onNavigateToHome, onPlanTrip, currentUser, navigateToLogin, isGuideView = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState<ExploreDestination | null>(null);
  const [touristSpots, setTouristSpots] = useState<TouristAttraction[]>([]);
  const [countryGuideContent, setCountryGuideContent] = useState<GuideDetailContent | null>(null);
  const [cityGuideContent, setCityGuideContent] = useState<CityGuideDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const dataSource = isGuideView ? EXPLORE_COUNTRIES_DATA : EXPLORE_CITIES_DATA;
    const foundDestination = dataSource.find(d => d.id === destinationId);

    if (foundDestination) {
      setDestination(foundDestination);
      setTouristSpots(DESTINATION_ATTRACTIONS[destinationId] || []);
      
      if (isGuideView) { // Country Guide
        setCountryGuideContent(MOCK_GUIDE_DETAILS[destinationId] || null);
        setCityGuideContent(null); // Ensure city guide content is cleared
      } else { // City Detail (from Explore or TravelGuidesPage if it was cities)
        setCityGuideContent(CITY_GUIDE_DETAILS_DATA[destinationId] || null);
        setCountryGuideContent(null); // Ensure country guide content is cleared
      }
    } else {
      setError("Destination or Guide not found.");
    }
    setIsLoading(false);
  }, [destinationId, isGuideView]);

  const handlePlanTripClick = () => {
    if (!destination) return;
    if (currentUser) {
      onPlanTrip(destination.name);
    } else {
      navigateToLogin();
    }
  };
  
  const pageBackgroundColor = isGuideView ? 'bg-[#F0F7F4] dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950';
  const cardBackgroundColor = isGuideView ? 'bg-[#FAFCF9] dark:bg-slate-800' : 'bg-white dark:bg-slate-800';
  const sectionCardBackgroundColor = isGuideView ? 'bg-white dark:bg-slate-850' : 'bg-white dark:bg-slate-800';


  if (isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${pageBackgroundColor}`}>
        <LoadingSpinner message={`Loading ${isGuideView ? 'guide' : 'destination'} details...`} size="large" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center text-center py-20 px-4 ${pageBackgroundColor}`}>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">{error || (isGuideView ? "Guide Not Found" : "Destination Not Found")}</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-4">We couldn't find the details for this {isGuideView ? 'guide' : 'destination'}. It might have been removed or the link is incorrect.</p>
        <button
          onClick={onNavigateToHome}
          className="mt-8 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors button-interactive"
        >
          <BackArrowIcon /> Go Back
        </button>
      </div>
    );
  }
  
  const guideTitle = isGuideView
    ? `${destination.name} Travel Guide`
    : cityGuideContent?.guideTitle || destination.name;

  const guideSubtitle = isGuideView
    ? destination.description
    : cityGuideContent?.guideSubtitle || destination.description;

  return (
    <div className={`flex-1 flex flex-col ${pageBackgroundColor} text-slate-800 dark:text-slate-200 overflow-y-auto custom-scrollbar`}>
      {/* Breadcrumbs and Back Button */}
       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
         <button
            onClick={onNavigateToHome}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-2 group button-interactive"
          >
            <BackArrowIcon />
            <span className="group-hover:underline">Back to {isGuideView ? 'Travel Guides' : 'Explore'}</span>
          </button>
          {isGuideView && <p className="text-sm text-emerald-700 dark:text-emerald-300">Travel Guides / <span className="font-semibold">{destination.name}</span></p>}
      </div>

      {/* Hero Section */}
      <div className="relative h-72 sm:h-96 md:h-[480px] w-full overflow-hidden group mt-2">
        <ImageWithFallback
          src={destination.imageUrl}
          alt={`Scenic view of ${destination.name}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          placeholderClassName="absolute inset-0 w-full h-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 -mt-16 sm:-mt-24 relative z-10">
        {/* Title and Subtitle Section */}
        <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-3">{guideTitle}</h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">{guideSubtitle}</p>
        </section>
        
        {/* Top Attractions Section */}
        {touristSpots.length > 0 && (
          <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Top Attractions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {touristSpots.map((spot, index) => (
                <div key={index} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 card-interactive-lift`}>
                  <ImageWithFallback 
                    src={spot.imageUrl} 
                    alt={spot.name} 
                    className="w-full h-48 object-cover"
                    placeholderClassName="w-full h-48 bg-slate-200 dark:bg-slate-600 flex items-center justify-center"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{spot.name}</h3>
                    {spot.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{spot.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* City Guide Specific Sections */}
        {!isGuideView && cityGuideContent && (
            <>
                {cityGuideContent.diningRecommendations?.length > 0 && (
                    <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.3s'}}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Dining Recommendations</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cityGuideContent.diningRecommendations.map((item, index) => (
                            <div key={`dining-${index}`} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center p-3 card-interactive-lift`}>
                            <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mr-3 sm:mr-4" placeholderClassName="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center" />
                            <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">{item.name}</h3>
                            </div>
                        ))}
                        </div>
                    </section>
                )}
                 {cityGuideContent.hiddenGems?.length > 0 && (
                    <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.4s'}}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Hidden Gems</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cityGuideContent.hiddenGems.map((item, index) => (
                                <div key={`gem-${index}`} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center p-3 card-interactive-lift`}>
                                <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mr-3 sm:mr-4" placeholderClassName="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center" />
                                <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">{item.name}</h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {cityGuideContent.accommodationSuggestions?.length > 0 && (
                    <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.5s'}}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Accommodation Ideas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cityGuideContent.accommodationSuggestions.map((item, index) => (
                                <div key={`accom-${index}`} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center p-3 card-interactive-lift`}>
                                <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mr-3 sm:mr-4" placeholderClassName="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center" />
                                <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">{item.name}</h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {cityGuideContent.transportationInfo && (
                    <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.6s'}}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transportation</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300">{cityGuideContent.transportationInfo}</p>
                    </section>
                )}
            </>
        )}

        {/* Country Guide Specific Sections */}
        {isGuideView && countryGuideContent && (
          <>
            {countryGuideContent.cuisineHighlights && countryGuideContent.cuisineHighlights.length > 0 && (
              <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.3s'}}>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center"><FoodIcon /> Cuisine Highlights</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {countryGuideContent.cuisineHighlights.map((item: CuisineHighlight, index: number) => (
                    <div key={`cuisine-${index}`} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 card-interactive-lift`}>
                      <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" placeholderClassName="w-full h-40 bg-slate-200 dark:bg-slate-600 flex items-center justify-center" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
             {countryGuideContent.dayTripIdeas && countryGuideContent.dayTripIdeas.length > 0 && (
              <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.4s'}}>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center"><SunIcon /> Day Trip Ideas</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {countryGuideContent.dayTripIdeas.map((item: DayTripIdea, index: number) => (
                     <div key={`daytrip-${index}`} className={`${cardBackgroundColor} rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 card-interactive-lift`}>
                      <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" placeholderClassName="w-full h-40 bg-slate-200 dark:bg-slate-600 flex items-center justify-center" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {countryGuideContent.gettingAround && (
              <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.5s'}}>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><InfoIcon/> Getting Around</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300">{countryGuideContent.gettingAround}</p>
              </section>
            )}
            {countryGuideContent.insiderTips && countryGuideContent.insiderTips.length > 0 && (
              <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.6s'}}>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><LightbulbIcon /> Insider Tips</h2>
                <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300">
                  {countryGuideContent.insiderTips.map((tip, index) => (
                    <li key={`tip-${index}`} className="text-sm sm:text-base leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
        
        {/* Best Time to Visit (Common for both) */}
        {destination.bestTimeToVisit && (
          <section className={`${sectionCardBackgroundColor} p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up`} style={{animationDelay: '0.7s'}}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Best Time to Visit</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300">
              {destination.bestTimeToVisit}
            </p>
          </section>
        )}
        
        {/* Plan a Trip Button */}
        <section className="text-center py-6 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <button
            onClick={handlePlanTripClick}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-md font-semibold rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-700 button-interactive"
            aria-label={currentUser ? `Plan a trip to ${destination.name}` : "Login to plan a trip"}
          >
            <PlanTripIcon /> {currentUser ? `Plan a Trip to ${destination.name.split(',')[0]}` : `Login to Plan a Trip`}
          </button>
        </section>
      </div>
      <style>{`
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
        .prose p { color: inherit; } 
        .prose strong { color: inherit; }
        .dark .prose-p:text-slate-300 p {color: #d1d5db;}
        .dark .prose-invert ul > li::before { background-color: #64748b; /* slate-500 */ }
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
// Removed default export as it's named in App.tsx
// export default DestinationDetailPage;