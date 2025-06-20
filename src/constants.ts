
// THIS IS A PLACEHOLDER AND NOT SECURE FOR PRODUCTION.
// In a real application, API keys should be managed via a backend or environment variables during build.
// For the purpose of this exercise, it is assumed process.env.API_KEY will be set in the environment.
// We will use that, and if not available, the geminiService will fallback to mock data.
import { ExploreDestination, FlightClass, CarRental, CabBooking, TrainBooking, BusBooking, TouristAttraction, BlogPost, GuideDetailContent, CityGuideDetails, NotificationItem, AppView, FAQItem, SupportedLanguage } from '../types';

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002"; // Used for generating itinerary event images

export const USER_PREFERENCES_KEY = 'aiTravelPlanner_userPreferences_v1';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const SUPPORTED_LANGUAGES: { langCode: SupportedLanguage; name: string; countryCode: string; countryName: string }[] = [
  { langCode: 'en', name: 'English (US)', countryCode: 'US', countryName: 'United States' },
  { langCode: 'es', name: 'Español (ES)', countryCode: 'ES', countryName: 'Spain' },
  // Add other languages here, e.g.:
  // { langCode: 'fr', name: 'Français (FR)', countryCode: 'FR', countryName: 'France' },
  // { langCode: 'de', name: 'Deutsch (DE)', countryCode: 'DE', countryName: 'Germany' },
  // { langCode: 'ja', name: '日本語 (JP)', countryCode: 'JP', countryName: 'Japan' },
];


export const FLIGHT_CLASSES: { value: FlightClass, label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
];

export const MOCK_FLIGHT_OPTIONS_BASE = [
  { id: "FL123", airline: "Airline X", flightNumber: "AX123", departureTime: "08:00", arrivalTime: "10:30", duration:"2h 30m", stops: 0, price: 300, flightClass: 'economy' as FlightClass },
  { id: "FL456", airline: "Airline Y", flightNumber: "AY456", departureTime: "10:00", arrivalTime: "15:00", duration:"5h 00m", stops: 1, price: 700, flightClass: 'business' as FlightClass },
];

export const MOCK_HOTEL_OPTIONS_BASE = [
  { id: "HTL001", name: "Grand Hotel Destination", starRating: 5, location: "City Center", amenities: ["Pool", "Gym", "Spa"], roomType: "Deluxe Room", boardType: "Breakfast included", price: 200 },
  { id: "HTL002", name: "Cozy Inn Suburb", starRating: 3, location: "Quiet Area", amenities: ["WiFi", "Parking"], roomType: "Standard Room", boardType: "Room only", price: 80 },
];

export const MOCK_CAR_RENTAL_OPTIONS_BASE: Pick<CarRental, 'id' | 'carType' | 'supplier' | 'transmission' | 'fuelPolicy' | 'mileage' | 'price'>[] = [
  { id: "CAR789", carType: "Compact", supplier: "City Wheels", transmission: 'Automatic' as 'Automatic' | 'Manual', fuelPolicy: "Full to Full", mileage: "Unlimited", price: 50 },
  { id: "CAR101", carType: "SUV", supplier: "Adventure Drives", transmission: 'Automatic' as 'Automatic' | 'Manual', fuelPolicy: "Full to Full", mileage: "Unlimited", price: 90 },
];

export const MOCK_CAB_OPTIONS_BASE: Pick<CabBooking, 'id' | 'estimatedFare' | 'driverName' | 'carModel' | 'licensePlate'>[] = [
  { id: "CAB001", estimatedFare: 25, driverName: "John R.", carModel: "Toyota Prius", licensePlate: "CAB123" },
  { id: "CAB002", estimatedFare: 30, driverName: "Maria S.", carModel: "Honda Civic", licensePlate: "RIDE45" },
  { id: "CAB003", estimatedFare: 22, driverName: "Driver AI", carModel: "Tesla Model 3", licensePlate: "AI DRIVE" },
  { id: "CAB004", estimatedFare: 45, driverName: "Lux Transports", carModel: "Mercedes E-Class", licensePlate: "VIPCAB" },
];

export const MOCK_TRAIN_OPTIONS_BASE: Pick<TrainBooking, 'id' | 'trainLine' | 'trainNumber' | 'trainClass' | 'price' | 'details'>[] = [
    { id: "TRN001", trainLine: "Bullet Express", trainNumber: "BE401", trainClass: "Standard", price: 75, details: "Direct, WiFi, Cafe Car" },
    { id: "TRN002", trainLine: "Scenic Route", trainNumber: "SR22", trainClass: "First Class", price: 120, details: "1 Stop, Panoramic Views, Dining Service" },
    { id: "TRN003", trainLine: "City Hopper", trainNumber: "CH78", trainClass: "Standard", price: 50, details: "Multiple Stops, Commuter Service" },
];

export const MOCK_BUS_OPTIONS_BASE: Pick<BusBooking, 'id' | 'busCompany' | 'busNumber' | 'seatType' | 'price' | 'details'>[] = [
  { id: "BUS001", busCompany: "InterCity Coach", busNumber: "IC101", seatType: "Standard Recliner", price: 45, details: "Direct, WiFi, USB Charging" },
  { id: "BUS002", busCompany: "Express Shuttle", busNumber: "ES202", seatType: "Luxury Plus", price: 65, details: "1 Stop, Extra Legroom, Onboard Restroom, Snacks" },
  { id: "BUS003", busCompany: "MetroLink Transit", busNumber: "ML303", seatType: "Standard", price: 30, details: "Multiple Stops, Commuter Line" },
];


export const TRAVEL_TYPES = [
  "Vacation", "Business Trip", "Adventure", "Relaxation", "Cultural Exploration",
  "Honeymoon", "Family Trip", "Road Trip", "Backpacking", "Luxury Getaway"
];

export const TRAVEL_TIERS = [
  { 
    id: 'budget', name: 'Budget Explorer', 
    description: 'Affordable stays, local gems, and savvy travel hacks.', 
    basePricePerDayPerPerson: 75, estimatedFlightCostPerPerson: 200, estimatedHotelCostPerNightPerPerson: 30,
  },
  { 
    id: 'lifestyle', name: 'Comfort Seeker', 
    description: 'Mid-range comfort, popular attractions, and balanced experiences.', 
    basePricePerDayPerPerson: 200, estimatedFlightCostPerPerson: 450, estimatedHotelCostPerNightPerPerson: 80,
  },
  { 
    id: 'luxury', name: 'Luxury Indulgence', 
    description: 'Premium accommodations, exclusive activities, and top-tier service.', 
    basePricePerDayPerPerson: 500, estimatedFlightCostPerPerson: 1000, estimatedHotelCostPerNightPerPerson: 250,
  },
];

export const POPULAR_DESTINATIONS = [ // Primarily city names for autocomplete
  'Tokyo, Japan', 'Delhi, India', 'Shanghai, China', 'Paris, France', 'Rome, Italy', 'New York, USA',
  'London, UK', 'Barcelona, Spain', 'Amsterdam, Netherlands', 'Berlin, Germany', 'Sydney, Australia',
  'Rio de Janeiro, Brazil', 'Cape Town, South Africa', 'Dubai, UAE', 'Bangkok, Thailand',
  'Istanbul, Turkey', 'Seoul, South Korea', 'Mexico City, Mexico', 'Toronto, Canada', 'Buenos Aires, Argentina',
  'Vienna, Austria', 'Prague, Czech Republic', 'Lisbon, Portugal', 'Dublin, Ireland', 'Singapore, Singapore',
  'Kuala Lumpur, Malaysia', 'Hong Kong, China', 'Vancouver, Canada', 'San Francisco, USA', 'Los Angeles, USA',
  'Chicago, USA', 'Miami, USA', 'Madrid, Spain', 'Milan, Italy', 'Florence, Italy', 'Venice, Italy',
  'Munich, Germany', 'Brussels, Belgium', 'Zurich, Switzerland', 'Stockholm, Sweden', 'Oslo, Norway',
  'Copenhagen, Denmark', 'Helsinki, Finland', 'Moscow, Russia', 'St. Petersburg, Russia', 'Warsaw, Poland',
  'Budapest, Hungary', 'Athens, Greece', 'Cairo, Egypt', 'Marrakech, Morocco', 'Nairobi, Kenya'
];

export const EXPLORE_COUNTRIES_DATA: ExploreDestination[] = [
  {
    id: 'france', name: 'France', country: 'France',
    description: 'A country of art, romance, culinary delights, and diverse landscapes from Paris to Provence.',
    longDescription: 'France, in Western Europe, encompasses medieval cities, alpine villages and Mediterranean beaches. Paris, its capital, is famed for its fashion houses, classical art museums including the Louvre and monuments like the Eiffel Tower. The country is also renowned for its wines and sophisticated cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['country', 'europe', 'culture', 'food', 'history', 'romance'],
    averageRating: 4.8, bestTimeToVisit: 'Spring (Apr-Jun), Fall (Sep-Oct)',
    continent: 'Europe', tagline: 'Art, romance, and culinary delights.'
  },
  {
    id: 'japan', name: 'Japan', country: 'Japan',
    description: 'A captivating blend of ancient traditions and futuristic innovation, from tranquil temples to bustling cities.',
    longDescription: 'Japan is an island country in East Asia. It is known for its traditional arts, including tea ceremonies, calligraphy and flower arranging. The country has a legacy of distinctive gardens, sculpture and poetry.',
    imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['country', 'asia', 'culture', 'modern', 'food', 'nature', 'temples'],
    averageRating: 4.9, bestTimeToVisit: 'Spring (Mar-May), Fall (Sep-Nov)',
    continent: 'Asia', tagline: 'Ancient traditions meet futuristic innovation.'
  },
  {
    id: 'italy', name: 'Italy', country: 'Italy',
    description: 'Explore millennia of history, world-renowned art, stunning coastlines, and delicious cuisine.',
    longDescription: 'Italy, a European country with a long Mediterranean coastline, has left a powerful mark on Western culture and cuisine. Its capital, Rome, is home to the Vatican as well as landmark art and ancient ruins.',
    imageUrl: 'https://images.unsplash.com/photo-1515855633085-f55009515779?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['country', 'europe', 'history', 'art', 'food', 'culture', 'coastline'],
    averageRating: 4.7, bestTimeToVisit: 'Spring (Apr-Jun), Fall (Sep-Oct)',
    continent: 'Europe', tagline: 'History, art, and exquisite cuisine.'
  },
   {
    id: 'usa', name: 'United States', country: 'USA',
    description: 'Vast landscapes, iconic cities, diverse cultures, and endless opportunities for adventure.',
    longDescription: 'The U.S. is a country of 50 states covering a vast swath of North America. Major Atlantic Coast cities are New York, a global finance and culture center, and capital Washington, DC.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['country', 'north america', 'cities', 'national parks', 'culture', 'road trip'],
    averageRating: 4.6, bestTimeToVisit: 'Varies by region; Spring and Fall generally pleasant.',
    continent: 'North America', tagline: 'Iconic cities and diverse landscapes.'
  },
  {
    id: 'uk', name: 'United Kingdom', country: 'UK',
    description: 'Historic castles, vibrant cities, rolling countryside, and rich cultural heritage.',
    longDescription: 'The United Kingdom, made up of England, Scotland, Wales and Northern Ireland, is an island nation in northwestern Europe. England – birthplace of Shakespeare and The Beatles – is home to the capital, London.',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['country', 'europe', 'history', 'cities', 'countryside', 'culture', 'royalty'],
    averageRating: 4.5, bestTimeToVisit: 'Late Spring to Early Autumn (May-Sep).',
    continent: 'Europe', tagline: 'Historic castles and vibrant culture.'
  },
  {
    id: 'spain', name: 'Spain', country: 'Spain',
    description: 'Fiery flamenco, stunning architecture, beautiful beaches, and a rich tapestry of regional cultures.',
    longDescription: 'Spain, on Europe’s Iberian Peninsula, includes 17 autonomous regions with diverse geography and cultures. Capital city Madrid is home to the Royal Palace and Prado museum.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80', // Replaced with a generic beach image as a placeholder
    tags: ['country', 'europe', 'culture', 'beaches', 'architecture', 'food', 'fiesta'],
    averageRating: 4.7, bestTimeToVisit: 'Spring (Mar-May) and Fall (Sep-Oct).',
    continent: 'Europe', tagline: 'Flamenco, beaches, and rich culture.'
  },
];

export const EXPLORE_CITIES_DATA: ExploreDestination[] = [
  {
    id: 'paris', name: 'Paris', country: 'France',
    description: 'The City of Lights, known for its art, fashion, and iconic landmarks like the Eiffel Tower.',
    longDescription: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques along the Rue du Faubourg Saint-Honoré.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80',
    tags: ['city', 'culture', 'romance', 'art', 'food', 'history', 'europe'],
    averageRating: 4.8, bestTimeToVisit: 'Spring (April to June) and Fall (September to October) offer pleasant temperatures and fewer crowds. Summer (July-August) is popular but can be hot and crowded. Winter (November to March) is colder with shorter days, but offers a cozy atmosphere and potential for budget travel.',
    continent: 'Europe', tagline: 'The city of lights'
  },
  {
    id: 'tokyo', name: 'Tokyo', country: 'Japan',
    description: 'A dazzling metropolis blending ultramodern skyscrapers with historic temples and vibrant street life.',
    longDescription: 'Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional – from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto Shrine is known for its towering gate and surrounding woods. The Imperial Palace sits amid large public gardens. The city\'s many museums offer exhibits ranging from classical art (in the Tokyo National Museum) to a reconstructed kabuki theater (in the Edo-Tokyo Museum).',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'culture', 'modern', 'food', 'technology', 'nightlife', 'asia'],
    averageRating: 4.7, bestTimeToVisit: 'Spring (March to May) for cherry blossoms and pleasant weather. Fall (September to November) offers comfortable temperatures and beautiful autumn foliage. Avoid Golden Week (late April/early May) due to crowds.',
    continent: 'Asia', tagline: 'A vibrant metropolis'
  },
  {
    id: 'rome', name: 'Rome', country: 'Italy',
    description: 'The Eternal City, boasting millennia of history, art, and ancient ruins like the Colosseum.',
    longDescription: 'Rome, Italy’s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture on display. Ancient ruins such as the Forum and the Colosseum evoke the power of the former Roman Empire. Vatican City, headquarters of the Roman Catholic Church, has St. Peter’s Basilica and the Vatican Museums, which house masterpieces such as Michelangelo’s Sistine Chapel frescoes.',
    imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1073&q=80',
    tags: ['city', 'history', 'culture', 'art', 'food', 'ancient', 'europe'],
    averageRating: 4.9, bestTimeToVisit: 'April to June and September to October offer pleasant weather for sightseeing. July and August can be very hot and crowded. Winter is mild but can be rainy.',
    continent: 'Europe', tagline: 'Eternal city'
  },
  {
    id: 'new-york', name: 'New York', country: 'USA',
    description: 'The city that never sleeps, offering iconic landmarks, diverse neighborhoods, and endless entertainment.',
    longDescription: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers. Its iconic sites include skyscrapers such as the Empire State Building and sprawling Central Park. Broadway theater is staged in neon-lit Times Square.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226696-b4d9888116EA?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'usa', 'landmarks', 'culture', 'food', 'entertainment', 'north america'],
    averageRating: 4.7, bestTimeToVisit: 'Spring (April-May) and Fall (September-October) offer pleasant temperatures. Summer is hot and humid; winter can be very cold with snow. The holiday season (Nov-Dec) is magical but crowded.',
    continent: 'North America', tagline: 'The city that never sleeps'
  },
  {
    id: 'london', name: 'London', country: 'UK',
    description: 'A historic global hub with royal palaces, world-class museums, and a vibrant theater scene.',
    longDescription: 'London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times. At its centre stand the imposing Houses of Parliament, the iconic ‘Big Ben’ clock tower and Westminster Abbey, site of British monarch coronations. Across the Thames River, the London Eye observation wheel provides panoramic views of the South Bank cultural complex, and the entire city.',
    imageUrl: 'https://images.unsplash.com/photo-1508714977591-5084b2005042?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'uk', 'history', 'museums', 'theater', 'culture', 'europe'],
    averageRating: 4.6, bestTimeToVisit: 'Late spring (May-June) and early autumn (September) usually offer the best weather. Summer (July-August) is peak tourist season. Winter can be chilly and damp.',
    continent: 'Europe', tagline: 'Historic capital'
  },
  {
    id: 'barcelona', name: 'Barcelona', country: 'Spain',
    description: 'Famous for Gaudí\'s architecture, vibrant nightlife, and beautiful Mediterranean beaches.',
    longDescription: 'Barcelona, the cosmopolitan capital of Spain’s Catalonia region, is known for its art and architecture. The fantastical Sagrada Família church and other modernist landmarks designed by Antoni Gaudí dot the city. Museu Picasso and Fundació Joan Miró feature modern art by their namesakes. City history museum MUHBA, includes several Roman archaeological sites.',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'spain', 'architecture', 'beach', 'nightlife', 'food', 'europe'],
    averageRating: 4.7, bestTimeToVisit: 'May to June and September to October offer pleasant weather. July and August are hot and popular for beaches. Winter is mild.',
    continent: 'Europe', tagline: 'Coastal charm'
  },
  {
    id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands',
    description: 'Picturesque canals, historic houses, world-class art museums, and a vibrant cycling culture.',
    longDescription: 'Amsterdam is known for its artistic heritage, elaborate canal system and narrow houses with gabled facades, legacies of the city’s 17th-century Golden Age. Its Museum District houses the Van Gogh Museum, works by Rembrandt and Vermeer at the Rijksmuseum, and modern art at the Stedelijk. Cycling is key to the city’s character, and there are numerous bike paths.',
    imageUrl: 'https://images.unsplash.com/photo-1584023433294-396369001415?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'europe', 'canals', 'art', 'culture', 'cycling'],
    averageRating: 4.6, bestTimeToVisit: 'April to May for tulip season and pleasant weather. June to August is peak season. September to October offers mild weather and fewer crowds.',
    continent: 'Europe', tagline: 'Canals and culture'
  },
  {
    id: 'bangkok', name: 'Bangkok', country: 'Thailand',
    description: 'A city of contrasts with ornate shrines, vibrant street life, and modern shopping malls.',
    longDescription: 'Bangkok, Thailand’s capital, is a large city known for ornate shrines and vibrant street life. The boat-filled Chao Phraya River feeds its network of canals, flowing past the Rattanakosin royal district, home to opulent Grand Palace and its sacred Wat Phra Kaew Temple. Nearby is Wat Pho Temple with an enormous reclining Buddha and, on the opposite shore, Wat Arun Temple with its Khmer-style spire.',
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'asia', 'temples', 'street food', 'nightlife', 'shopping'],
    averageRating: 4.5, bestTimeToVisit: 'The cool and dry season from November to February is ideal. March to May is very hot, and June to October is the rainy season.',
    continent: 'Asia', tagline: 'Ornate shrines and vibrant street life'
  },
  {
    id: 'dubai', name: 'Dubai', country: 'UAE',
    description: 'Ultramodern architecture, luxury shopping, lively nightlife, and desert adventures.',
    longDescription: 'Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture and a lively nightlife scene. Burj Khalifa, an 830m-tall tower, dominates the skyscraper-filled skyline. At its foot lies Dubai Fountain, with jets and lights choreographed to music. On artificial islands just offshore is Atlantis, The Palm, a resort with water and marine-animal parks.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979791-2ea1a4620175?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'middle east', 'luxury', 'modern', 'desert', 'shopping', 'asia'],
    averageRating: 4.7, bestTimeToVisit: 'November to March offers pleasant weather. Summer months (May to September) are extremely hot.',
    continent: 'Asia', tagline: 'Luxury and ultramodern marvels'
  },
  {
    id: 'sydney', name: 'Sydney', country: 'Australia',
    description: 'Iconic Opera House, beautiful harbor, famous beaches, and a vibrant cosmopolitan atmosphere.',
    longDescription: 'Sydney, capital of New South Wales and one of Australia\'s largest cities, is best known for its harbourfront Sydney Opera House, with a distinctive sail-like design. Massive Darling Harbour and the smaller Circular Quay port are hubs of waterside life, with the arched Harbour Bridge and esteemed Royal Botanic Garden nearby. Sydney Tower’s outdoor platform, the Skywalk, offers 360-degree views of the city, harbour and suburbs.',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'australia', 'beach', 'harbor', 'culture', 'outdoors', 'oceania'],
    averageRating: 4.6, bestTimeToVisit: 'September to November (spring) and March to May (autumn) offer pleasant weather. Summer (December-February) is great for beaches but can be hot.',
    continent: 'Oceania', tagline: 'Iconic harbor and sunny beaches'
  },
  {
    id: 'cape-town', name: 'Cape Town', country: 'South Africa',
    description: 'Stunning Table Mountain, diverse wildlife, beautiful vineyards, and rich history.',
    longDescription: 'Cape Town is a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain. Slowly rotating cable cars climb to the mountain’s flat top, from which there are sweeping views of the city, the busy harbor and boats heading for Robben Island, the notorious prison that once held Nelson Mandela, which is now a living museum.',
    imageUrl: 'https://images.unsplash.com/photo-1577965344498-656078115a01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'africa', 'nature', 'mountains', 'wildlife', 'wine'],
    averageRating: 4.7, bestTimeToVisit: 'November to February for warm, dry summer weather, ideal for beaches and outdoor activities. March to May (autumn) for wine tasting and fewer crowds.',
    continent: 'Africa', tagline: 'Majestic mountains and vibrant culture'
  },
  {
    id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil',
    description: 'Famous for Copacabana and Ipanema beaches, Christ the Redeemer statue, and vibrant Carnival festival.',
    longDescription: 'Rio de Janeiro is a huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches, 38m Christ the Redeemer statue atop Mount Corcovado and for Sugarloaf Mountain, a granite peak with cable cars to its summit. The city is also known for its sprawling favelas (shantytowns). Its raucous Carnival festival, featuring parade floats, flamboyant costumes and samba dancers, is considered the world’s largest.',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-79ef09a89371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'south america', 'beach', 'carnival', 'mountains', 'culture'],
    averageRating: 4.5, bestTimeToVisit: 'December to March for summer weather and Carnival (February/March). April-May or September-October offer milder temperatures and fewer crowds.',
    continent: 'South America', tagline: 'Beaches, carnival, and iconic views'
  },
  {
    id: 'berlin', name: 'Berlin', country: 'Germany',
    description: 'A city of history, art, and vibrant nightlife, with landmarks like the Brandenburg Gate.',
    longDescription: 'Berlin, Germany’s capital, dates to the 13th century. Reminders of the city\'s turbulent 20th-century history include its Holocaust memorial and the Berlin Wall\'s graffitied remains. Divided during the Cold War, its 18th-century Brandenburg Gate has become a symbol of reunification. The city\'s also known for its art scene and modern landmarks like the gold-colored, swoop-roofed Berliner Philharmonie, built in 1963.',
    imageUrl: 'https://images.unsplash.com/photo-1526481280643-3ff143635935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'europe', 'history', 'art', 'nightlife', 'culture'],
    averageRating: 4.5, bestTimeToVisit: 'May to September for pleasant weather. Summer has many festivals.',
    continent: 'Europe', tagline: 'History, art, and vibrant nightlife'
  },
  {
    id: 'istanbul', name: 'Istanbul', country: 'Turkey',
    description: 'A city straddling two continents, rich in history with iconic sites like Hagia Sophia and the Blue Mosque.',
    longDescription: 'Istanbul is a major city in Turkey that straddles Europe and Asia across the Bosphorus Strait. Its Old City reflects the cultural influences of the many empires that once ruled here. In the Sultanahmet district, the open-air, Roman-era Hippodrome was for centuries the site of chariot races, and Egyptian obelisks also remain. The iconic Byzantine Hagia Sophia features a soaring 6th-century dome and rare Christian mosaics.',
    imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'europe', 'asia', 'history', 'culture', 'mosques', 'bazaars'],
    averageRating: 4.6, bestTimeToVisit: 'Spring (April-May) and Fall (September-October) are ideal for pleasant weather and fewer crowds.',
    continent: 'Europe', // Or 'Asia'/'Eurasia' depending on definition. For simplicity, often listed with European cities
    tagline: 'Where continents collide'
  },
  {
    id: 'prague', name: 'Prague', country: 'Czech Republic',
    description: 'Nicknamed “the City of a Hundred Spires,” known for its Old Town Square and Charles Bridge.',
    longDescription: 'Prague, capital city of the Czech Republic, is bisected by the Vltava River. Nicknamed “the City of a Hundred Spires,” it\'s known for its Old Town Square, the heart of its historic core, with colorful baroque buildings, Gothic churches and the medieval Astronomical Clock, which gives an animated hourly show. Completed in 1402, pedestrian Charles Bridge is lined with statues of Catholic saints.',
    imageUrl: 'https://images.unsplash.com/photo-1509909756405-be0199881695?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    tags: ['city', 'europe', 'history', 'architecture', 'castles', 'culture'],
    averageRating: 4.7, bestTimeToVisit: 'Spring (May) and early Fall (September) offer pleasant weather for exploring.',
    continent: 'Europe', tagline: 'City of a Hundred Spires'
  },
];

// Static data for tourist attractions
export const DESTINATION_ATTRACTIONS: Record<string, TouristAttraction[]> = {
  'paris': [
    { name: 'Louvre Museum', description: 'World\'s largest art museum and a historic monument.', imageUrl: 'https://images.unsplash.com/photo-1599215130439-7a25018917b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Eiffel Tower', description: 'Iconic wrought-iron lattice tower on the Champ de Mars.', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Notre Dame Cathedral', description: 'Medieval Catholic cathedral, widely considered one of the finest examples of French Gothic architecture.', imageUrl: 'https://images.unsplash.com/photo-1556909172-6ab63f18fd12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ],
  'japan': [ // Country level example for Japan
    { name: 'Mount Fuji', description: 'Japan\'s highest mountain, an active stratovolcano and iconic symbol of the country.', imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Kinkaku-ji (Golden Pavilion)', description: 'Zen Buddhist temple in Kyoto, its top two floors completely covered in gold leaf.', imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Fushimi Inari Shrine', description: 'Famous Shinto shrine in southern Kyoto, known for its thousands of vermilion torii gates.', imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
  ],
  'italy': [ // Country level example for Italy
    { name: 'Colosseum', description: 'Oval amphitheatre in Rome, the largest ancient amphitheatre ever built.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Canals of Venice', description: 'Iconic waterways of Venice, explored by gondola, forming the city\'s unique character.', imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Leaning Tower of Pisa', description: 'Freestanding bell tower, known worldwide for its nearly four-degree lean.', imageUrl: 'https://images.unsplash.com/photo-1597102009712-96205e00517f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' }
  ],
  'tokyo': [
    { name: 'Tokyo Skytree', description: 'Broadcasting and observation tower with panoramic city views.', imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Senso-ji Temple', description: 'An ancient Buddhist temple, one of Tokyo\'s oldest and most significant.', imageUrl: 'https://images.unsplash.com/photo-1548670047-460315039cce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
    { name: 'Shibuya Crossing', description: 'Iconic intersection famous for its scramble crossing and vibrant atmosphere.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' }, // Reusing main Tokyo image for Shibuya
  ],
  'rome': [
     { name: 'Colosseum', description: 'Oval amphitheatre in Rome, the largest ancient amphitheatre ever built.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
     { name: 'Roman Forum', description: 'Plaza surrounded by ruins of ancient government buildings at the center of Rome.', imageUrl: 'https://images.unsplash.com/photo-1569974421599-08fb0a8fa5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
     { name: 'Trevi Fountain', description: 'World-famous Baroque fountain, known for coin tossing for good luck.', imageUrl: 'https://images.unsplash.com/photo-1508062878650-89395390477a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60' },
  ],
  // Add more attractions for other cities as needed
};

// This is for the new structure used by DestinationDetailPage when isGuideView is true.
export const CITY_GUIDE_DETAILS_DATA: Record<string, CityGuideDetails> = {
  'paris': {
    guideTitle: "Your Essential Guide to Paris",
    guideSubtitle: "Discover the heart of France: iconic landmarks, charming streets, and culinary delights.",
    diningRecommendations: [
      { name: "Le Relais de l'Entrecôte", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Bouillon Chartier", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "L'As du Fallafel", imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
    ],
    hiddenGems: [
      { name: "Canal Saint-Martin", imageUrl: "https://images.unsplash.com/photo-1562619402-263335006e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Promenade Plantée (Coulée Verte)", imageUrl: "https://images.unsplash.com/photo-1606018584452-8e1d0b580f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Marché des Enfants Rouges", imageUrl: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
    ],
    accommodationSuggestions: [
      { name: "Hotel Lutetia (Luxury)", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Generator Paris (Hostel)", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Hotel Chopin (Mid-Range Charm)", imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
    ],
    transportationInfo: "Paris has an excellent public transport system, including the Métro, RER trains, buses, and trams. Consider a Navigo Découverte pass for longer stays. Walking is also a great way to explore central areas. Ride-sharing services and taxis are widely available."
  },
  'tokyo': {
    guideTitle: "Tokyo: A Blend of Tradition and Future",
    guideSubtitle: "Navigate serene temples, bustling crossings, and indulge in world-class cuisine.",
    diningRecommendations: [
        { name: "Sukiyabashi Jiro (Sushi - Book way ahead!)", imageUrl: "https://images.unsplash.com/photo-1553642618-de0381320ff3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Ichiran Ramen (Ramen Chain)", imageUrl: "https://images.unsplash.com/photo-1574004285988-d69arin39e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Tsukiji Outer Market (Street Food & Seafood)", imageUrl: "https://images.unsplash.com/photo-1550692179-8a9815f3786a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
    ],
    hiddenGems: [
        { name: "Yanaka District (Old Tokyo Charm)", imageUrl: "https://images.unsplash.com/photo-1589517547775-888b4c1a0860?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Todoroki Valley (Nature in the City)", imageUrl: "https://images.unsplash.com/photo-1607863600990-52a00f08b9ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Jimbocho Book Town", imageUrl: "https://images.unsplash.com/photo-1551029506-0807939a2212?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
    ],
    accommodationSuggestions: [
        { name: "Park Hyatt Tokyo (Luxury)", imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Book And Bed Tokyo (Unique Hostel)", imageUrl: "https://images.unsplash.com/photo-1521783970252-8935404326f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Ryokan Kamogawa Asakusa (Traditional Inn)", imageUrl: "https://images.unsplash.com/photo-1619097994156-a63919745224?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
    ],
    transportationInfo: "Tokyo's public transport is incredibly efficient. The JR lines, subways (Tokyo Metro and Toei), and buses cover the city extensively. Get a Suica or Pasmo card for easy travel. Taxis are clean but can be expensive."
  }
  // Add more city guide details as needed for 'rome', 'new-york', etc.
};

// Mock data for blog posts (used by BlogPage.tsx)
export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '10 Hidden Gems in Tokyo You Won\'t Find in Guidebooks',
    author: 'AI Traveler Bot',
    date: '2024-03-15',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    snippet: 'Discover the lesser-known alleys, quirky cafes, and serene temples that make Tokyo truly unique. Move beyond the usual tourist traps and explore the city like a local with these insider tips.',
    content: '## Tokyo\'s Secret Spots\n\nForget Shibuya Crossing for a moment (okay, maybe just one photo). Tokyo is a city of endless discovery. Here are a few places that offer a different vibe:\n\n*   **Yanaka Ginza:** A traditional shopping street with a Showa-era atmosphere. Great for local snacks and crafts.\n*   **Nezu Museum:** Features a stunning Japanese garden, perfect for a peaceful escape from the city bustle.\n*   **Golden Gai (Shinjuku):** Tiny, atmospheric bars packed into narrow alleys. A unique nightlife experience if you\'re feeling adventurous.\n*   **Gotokuji Temple:** The "beckoning cat" temple, filled with thousands of maneki-neko statues. Quirky and photogenic!\n\n### More to Explore...\n\nThis is just a taste! Get lost, wander, and you\'ll find your own Tokyo treasures. Don\'t be afraid to duck into small restaurants or explore side streets – that\'s where the real magic happens.',
    tags: ['Tokyo', 'Japan', 'Hidden Gems', 'Travel Tips', 'Culture']
  },
  {
    id: '2',
    title: 'Mastering Parisian Cafe Culture: A Beginner\'s Guide',
    author: 'Wanderlust AI',
    date: '2024-04-02',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    snippet: 'From ordering your "café crème" to lingering for hours, learn the art of enjoying Paris like a true Parisian. It\'s more than just coffee; it\'s a way of life.',
    content: '## The Art of the Parisian Café\n\nSitting at a Parisian café is an experience in itself. Here’s how to blend in:\n\n1.  **Ordering:** A simple "un café, s\'il vous plaît" gets you an espresso. For a milky coffee, ask for a "café crème."\n2.  **Terrace vs. Indoors:** The terrace is for people-watching (and often costs slightly more). Indoors is cozier.\n3.  **Lingering is Encouraged:** Unlike some bustling city cafes, Parisian cafes are meant for lingering. Read a book, write, or just watch the world go by.\n4.  **Service:** Service can be... unhurried. Relax and enjoy the pace. You might need to actively flag down your server for the bill ("l\'addition, s\'il vous plaît").\n\nEnjoy your coffee and soak in the Parisian atmosphere!',
    tags: ['Paris', 'France', 'Food & Drink', 'Culture', 'Travel Tips']
  },
  {
    id: '3',
    title: 'Budget Travel: Making Your Euro Trip Affordable',
    author: 'Savvy Explorer',
    date: '2024-04-20',
    imageUrl: 'https://images.unsplash.com/photo-1520175480969-232909b1c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    snippet: 'Europe doesn\'t have to break the bank! Discover practical tips for hostels, transportation, food, and free activities to make your dream trip a reality on a budget.',
    content: '## Europe on a Dime\n\nTraveling through Europe on a budget is totally doable with a bit of planning.\n\n*   **Accommodation:** Hostels are your best friend. Look for ones with good reviews and communal kitchens to save on food costs.\n*   **Transportation:** Consider budget airlines for long distances (book in advance!) or overnight buses/trains to save on a night\'s accommodation.\n*   **Food:** Take advantage of supermarket picnics, street food, and lunch specials ("menu du jour" in France).\n*   **Activities:** Many European cities offer free walking tours and have numerous free museums or attractions on certain days.\n\nWith a little research, you can have an incredible European adventure without emptying your wallet!',
    tags: ['Europe', 'Budget Travel', 'Travel Hacks', 'Adventure']
  }
];


// MOCK_GUIDE_DETAILS - This is for the older GuideDetailContent type, which is seemingly deprecated.
// It's included here as it was referenced in the error, but may not be used by the current DestinationDetailPage.
export const MOCK_GUIDE_DETAILS: Record<string, GuideDetailContent> = {
  'france': {
    gettingAround: "France has an excellent high-speed train network (TGV) connecting major cities. Public transport within cities is generally good. Renting a car is great for exploring countryside regions like Provence or the Loire Valley.",
    cuisineHighlights: [
      { name: "Croissant", description: "A buttery, flaky, viennoiserie pastry, iconic to France.", imageUrl: "https://images.unsplash.com/photo-1589840666079-687304759c60?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Coq au Vin", description: "A classic French stew of chicken braised with wine, lardons, mushrooms, and optionally garlic.", imageUrl: "https://images.unsplash.com/photo-1620700002487-B7f9179a1f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Crème brûlée", description: "A rich custard base topped with a layer of hardened caramelized sugar.", imageUrl: "https://images.unsplash.com/photo-1587324020882-fad0eb980840?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" }
    ],
    insiderTips: [
      "Learn a few basic French phrases; it's appreciated by locals.",
      "Always say 'Bonjour' when entering a shop and 'Au revoir' when leaving.",
      "Tipping is not as customary as in some countries, but rounding up or leaving a small amount for good service is fine."
    ],
    dayTripIdeas: [
        { name: "Palace of Versailles from Paris", description: "Explore the opulent former royal residence and its vast gardens.", imageUrl: "https://images.unsplash.com/photo-1569126547659-08877a3a8103?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"},
        { name: "Giverny (Monet's Garden) from Paris", description: "Visit the beautiful gardens that inspired Claude Monet's impressionist masterpieces.", imageUrl: "https://images.unsplash.com/photo-1590326900135-8492980f91c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"}
    ]
  },
  'japan': {
    gettingAround: "Japan's public transportation is world-class. The Shinkansen (bullet train) is incredibly efficient for intercity travel. Local trains and subways are excellent in cities. Consider a Japan Rail Pass if doing extensive train travel.",
    cuisineHighlights: [
      { name: "Sushi & Sashimi", description: "Vinegared rice with various toppings (sushi) or thinly sliced raw fish (sashimi).", imageUrl: "https://images.unsplash.com/photo-1553642618-de0381320ff3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Ramen", description: "Wheat noodles served in a meat or fish-based broth, often flavored with soy sauce or miso, and topped with ingredients like sliced pork, dried seaweed, and green onions.", imageUrl: "https://images.unsplash.com/photo-1574004285988-d69arin39e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" },
      { name: "Tempura", description: "Seafood or vegetables that have been battered and deep fried.", imageUrl: "https://images.unsplash.com/photo-1585349360703-208a2f65f038?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60" }
    ],
    insiderTips: [
      "Purchase a Suica or Pasmo card for easy payment on public transport.",
      "Carry cash, as not all smaller establishments accept credit cards.",
      "Learn basic chopstick etiquette.",
      "Pocket Wi-Fi or a local SIM card is highly recommended for navigation."
    ],
    dayTripIdeas: [
        { name: "Nara from Kyoto or Osaka", description: "Visit Todai-ji temple with its giant Buddha and feed the friendly wild deer in Nara Park.", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"}, // Re-using a Kyoto image
        { name: "Hakone from Tokyo", description: "Enjoy views of Mt. Fuji, hot springs (onsen), art museums, and a scenic boat ride on Lake Ashi.", imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=60"} // Mt Fuji image
    ]
  }
  // ... add more country guide details
};

// Mock data for notifications (used by NotificationsPage.tsx)
export const MOCK_NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: 'notif1',
    userId: 'user1@example.com', // Specific to user1
    message: 'Your upcoming trip to Paris is just 7 days away! Check your packing list.',
    type: 'reminder',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    link: { view: AppView.MY_TRIPS } // Example link
  },
  {
    id: 'notif2',
    userId: 'user1@example.com',
    message: 'Flight AX123 to Tokyo has been delayed by 30 minutes. New departure: 10:30 AM.',
    type: 'alert',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
  },
  {
    id: 'notif3',
    userId: 'user2@example.com', // Specific to user2
    message: 'Welcome to Wanderlust! Explore popular destinations or start planning your first trip.',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
    link: { view: AppView.EXPLORE }
  },
  {
    id: 'notif4',
    userId: 'user1@example.com',
    message: 'New blog post: "Top 5 Hidden Gems in Rome" - Check it out!',
    type: 'update',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
    link: { view: AppView.BLOG_PAGE }
  },
   {
    id: 'notif5',
    userId: 'user1@example.com',
    message: 'System maintenance scheduled for tonight at 2 AM. Service may be briefly unavailable.',
    type: 'system',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    isRead: true,
  },
];

// Mock Support FAQs
export const MOCK_SUPPORT_FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: 'How do I plan a new trip?',
    answer: 'You can plan a new trip by clicking the "Plan Full Trip" button on the homepage or in the sidebar. This will take you to the structured itinerary builder. Alternatively, use the "AI Custom Chat" for a more conversational planning experience.'
  },
  {
    id: 'faq2',
    question: 'Can I edit my itinerary after it\'s generated?',
    answer: 'Yes! After an itinerary is generated, you can view it on the "Itinerary Display" page. From there, you can add, edit (for user-added events), delete, and reorder events within each day. You can also access and edit your saved trips from the "My Trips" page, then navigate to the "Trip Detail" view.'
  },
  {
    id: 'faq3',
    question: 'How does the AI Custom Chat work?',
    answer: 'The AI Custom Chat allows you to talk to our Wanderlust AI. Tell it your travel preferences, destinations, and what you\'d like to do, and it will help you build a personalized itinerary. It can also help with quick standalone bookings for flights, hotels, or cars directly through the chat.'
  },
  {
    id: 'faq4',
    question: 'Where can I see my saved trips?',
    answer: 'You can find all your saved trips on the "My Trips" page, accessible from the sidebar or homepage. From there, you can view details, edit, or delete trips.'
  },
  {
    id: 'faq5',
    question: 'How do I change my app theme or notification preferences?',
    answer: 'You can customize your app experience by navigating to "My Account" from the sidebar, then selecting "Preferences" (for theme, date/distance formats, etc.) or "Notifications" to manage your email and push notification settings.'
  },
  {
    id: 'faq6',
    question: 'What if the AI makes a mistake or I need more help?',
    answer: 'While our AI is pretty smart, it can sometimes misunderstand or lack specific information. If you encounter issues or need help beyond what the AI or these FAQs can provide, you can try rephrasing your query in the Support Chat on this page. For complex issues not covered, this mock application currently does not have a direct human support channel.'
  },
  {
    id: 'faq7',
    question: 'How do I share my trip itinerary with friends or family?',
    answer: 'Currently, Wanderlust AI does not have a direct "share trip" feature. You can take screenshots of your itinerary or copy-paste the details to share them. We are working on adding a dedicated sharing feature in the future!'
  },
  {
    id: 'faq8',
    question: 'Is my payment information secure when booking through Wanderlust AI?',
    answer: 'Wanderlust AI uses industry-standard secure payment processors for all transactions. We do not store your full credit card details on our servers. All payment information is encrypted and handled by our trusted payment partners to ensure its safety.'
  },
  {
    id: 'faq9',
    question: 'Can I use Wanderlust AI offline?',
    answer: 'Some features of Wanderlust AI, like viewing a previously generated and saved itinerary, may be available offline. However, features that require real-time data, such as new AI itinerary generation, live flight status updates, or searching for new booking options, require an active internet connection.'
  },
  {
    id: 'faq10',
    question: 'What should I do if an AI-generated itinerary doesn\'t quite match my expectations?',
    answer: 'Our AI tries its best, but sometimes it might need a little guidance! You can always edit the generated itinerary manually by adding, removing, or modifying events. Alternatively, you can try re-generating the itinerary with more specific prompts or use the AI Custom Chat for a more interactive planning session where you can refine details as you go.'
  },
  {
    id: 'faq11',
    question: 'How are travel restrictions or COVID-19 related advisories handled?',
    answer: 'Wanderlust AI currently does not provide real-time travel restriction or health advisory information. We recommend always checking official government travel advisories and airline/destination-specific websites for the latest updates before and during your trip.'
  }
];


export const WANDERBOT_SUPPORT_SYSTEM_INSTRUCTION = `You are Wanderbot, a friendly and dedicated support assistant for the Wanderlust AI Travel Planner app. Your primary goal is to help users understand and use the app effectively. You should:
- Answer questions about app features and functionality (e.g., "How do I save a trip?", "Where can I find my booked flights?", "How to change theme?").
- Provide guidance on how to perform specific tasks within the app.
- Help troubleshoot common issues (e.g., "Why can't I see my saved trips?", "The map isn't loading.").
- Be polite, patient, and clear in your explanations.
- If a user asks for travel planning, booking (flights, hotels, cars), or itinerary creation, politely state that your role is to provide app support and you cannot assist with those specific requests. Suggest they use the "Plan Full Trip" or "AI Custom Chat" (for travel planning) features for those needs.
- If you cannot answer a question, acknowledge it and suggest checking the FAQs or, if applicable in a real scenario, contacting human support (though for this app, just state you cannot help further with that specific complex query).
Keep your responses focused and helpful regarding the Wanderlust app. Do not generate action tags like [ACTION:...].
Use markdown for formatting when appropriate (bold, lists, etc.).
Example Interaction:
User: How do I see my past trips?
Wanderbot: You can find all your trips, both upcoming and past, on the "My Trips" page. You can get there by clicking "My Trips" in the sidebar! Past trips will be listed in a separate section there.

User: Can you book a flight to Paris for me?
Wanderbot: I'm here to help you with the Wanderlust app itself! For booking flights or planning your trip details, please use the "Plan Full Trip" feature or chat with our main "AI Custom Chat" assistant. They're experts at that! How else can I help you with the app today?\`;

export const TRAIN_CLASSES = [ 
  { value: 'standard', label: 'Standard Class' },
  { value: 'first', label: 'First Class' },
  { value: 'sleeper', label: 'Sleeper Cabin' },
];

export const WANDERLUST_AI_SYSTEM_INSTRUCTION = \`**Important Note:** You are currently operating within the dedicated AI Custom Chat interface. The ability to initiate standalone bookings (flights, hotels, cars, buses using \\\`[ACTION:NAVIGATE_STANDALONE_...]\\\` tags) is exclusively available and should ONLY be used within this chat when a user explicitly requests a quick, individual booking. Do not offer or attempt these booking actions if you are operating in any other context.

You are Wanderlust, an AI-powered travel agent. Your personality is paramount: sarcastic, witty, and funny, sprinkled with casual slang to keep things lively and engaging. Your mission is to help users craft their perfect personalized trips with style and flair, like a travel-savvy bestie who’s seen it all and isn't afraid to poke a little fun.

**Your Tone & Style (This is CRUCIAL):**
*   **Sarcastic but Friendly:** Your sarcasm should be playful and endearing, never mean. Think witty banter. Example: "Oh, another trip to Paris? Groundbreaking. Just kidding... mostly. Let's make it epic."
*   **Witty & Humorous:** Inject humor naturally. Avoid being robotic or bland. Make the user chuckle.
*   **Casual Slang (Classy, though!):** Use terms like "jet-setter," "globetrotter," "shopaholic," "spill the tea," "what's the damage?" (for costs), "let's get this show on the road," "capiche?" "drama queen," "hold your horses." Keep it light and modern, but avoid anything offensive or overly niche.
*   **Engaging & Conversational:** Make planning feel like a fun chat with a knowledgeable (and slightly cheeky) travel buddy, not a boring Q&A.
*   **Cheeky but Always Helpful:** A little playful teasing is fine, as long as you're still providing excellent travel advice.

**Your Core Functions (How to Chat & Plan):**

1.  **Get the Deets (Step-by-Step, Don't Overwhelm!):**
    *   "Alright, spill the beans, globetrotter! Where are we scheming to send you? Got a specific paradise in mind, or are we playing destination roulette today?"
    *   "And from which lovely part of the world will you be embarking on this grand escape? (That's 'origin city' for the easily confused)."
    *   "Who’s the lucky (or unlucky, depending on your travel style) crew joining this epic adventure? Flying solo and living your best life, rolling with the squad, dragging the fam, or is this some hush-hush business affair?"
    *   "Time to talk time! When are you looking to ditch reality, and for how long? Give me the dates, even if they're just a vibe for now. A weekend? A month-long sabbatical from adulting?"
    *   "What's the grand master plan for this trip? Are we channeling your inner Indiana Jones for some heart-pounding adventure, becoming a professional beach bum, aiming to max out those credit cards with some serious retail therapy, or something else entirely fabulous?"
    *   "And how are we propelling you to this fabulous destination? Puddle jumper (flight), iron horse (train), luxury coach (bus), hitting the open road in a rented chariot (roadtrip), or are you planning on teleporting? (Kidding on the last one... unless?)"

2.  **Dish Out Suggestions (Destinations, Flights, Hotels, Activities):**
    *   Based on their answers, throw out some *killer* suggestions. Give 'em the good stuff – detailed info, maybe a fun fact, and options.
    *   **Present complex options in neat markdown cards.** Use bold headings, bullet points. For example:
        "Okay, for your Parisian escapade, activity-wise, how about this for Day 1?"
        "**Morning:** Conquer the Eiffel Tower (because, duh, it's Paris). Try to book tickets online unless you *enjoy* the company of a thousand strangers in a queue. **Cost:** Around €25-€30 for top access. **Pro-Tip:** Go super early or late to dodge the selfie-stick army."
        "**Afternoon:** Get cultured at the Louvre. Pro tip: don't try to see everything, you'll turn into a museum zombie. Pick a few must-sees. **Cost:** About €22. **Wanderlust's Pick:** Say hi to Mona for me, tell her I said her smile is overrated."

3.  **Keep the Conversation Flowing:**
    *   Ask follow-up questions naturally. "Not a fan of museums? Got it. More of a 'hunt down the best street food' kinda traveler, then?"
    *   Encourage them to share more preferences. "Anything else on your 'absolutely-must-do' or 'hard-pass' list? Don't be shy!"

4.  **Pro Travel Guru - Sprinkle that Wisdom:**
    *   Provide relevant travel tips, a heads-up about the weather ("Just so you know, Tokyo in July is basically a sauna, so pack light and maybe a personal fan?"), or a cool cultural tidbit.

5.  **No Broken Records:**
    *   Don't repeat the same suggestions or info unless specifically asked. I have a good memory (usually).

6.  **Link Policy (My Lips Are Sealed... Mostly):**
    *   "Listen, as your virtual travel bestie, I'd *love* to give you direct links, but rules are rules, you know? If this were real life, for hotels, I'm practically contractually obligated to whisper '*booking.com*' in your ear. For flights and activities, I'd totally hook you up with my 'super-secret official affiliate links,' wink wink. But since this is just us chatting, you'll have to use your own search magic for the actual booking part. I can tell you *what* to book, though!"
    *   **Crucially: NEVER share any actual external URLs or website names, EXCEPT for mentioning 'booking.com' when discussing hotel bookings as part of your persona.** Do not suggest Google Flights, Skyscanner, GetYourGuide, Viator, etc., by name.

7.  **Trip Display (The Grand Reveal):**
    *   When providing a full itinerary, always give a clear day-by-day itinerary summary *first*, then if you were a real app, you'd show the full trip "card" or detailed view. Since you output text, the summary is key.

8.  **Route Optimization (I'm Smart Like That):**
    *   "And don't worry, I'm smart enough to plan things so you're not zigzagging across town like a headless chicken. I optimize routes logically to minimize your precious vacation time spent commuting." (You say this, the actual optimization is up to the user or other app features).

9.  **Flight Searches (One Way Street):**
    *   "Flights, huh? We do one-way like a pro. If you need a round trip, just hit me with the return details as a separate request, cool? Keeps things less complicated for my brilliant AI brain." (Mention this limitation if relevant).

10. **Restaurant/Nightlife/Cafe Suggestions (When Asked):**
    *   "Feeling peckish? Or just thirsty? I can totally suggest some cool spots for grub, a nightcap, or a killer cup of joe. Just tell me what your taste buds are screaming for. No bookings though, I'm a planner, not your personal concierge... yet."
    *   Provide quick explanations and vibes, but no booking capabilities.

11. **Markdown is Your BFF:**
    *   Use markdown formatting (headings, bold, italics, lists) extensively for clarity and to make your advice pop. Make it look good!

**Standalone Bookings (Super Speedy Edition!):**
Listen up, buttercup! If the user *clearly* wants to book JUST a flight, hotel, car rental, or bus and not a whole shebang of a trip, we switch to express mode. No long-winded tales from your travels, just the facts, ma'am. **Remember:** These standalone booking actions (\\\`[ACTION:NAVIGATE_STANDALONE_...]\\\`) are exclusive to this chat interface when a user makes a direct request for one.

1.  **Minimum Viable Details (MVPs for the VIPs - that's you, user!):**
    *   **Flights & Buses:** "Alright, travel plan. Where from, where to, and when are we launching this bird/bus? (Origin City, Destination City, Departure Date - that's all I need for now, hotshot)." (Internally, you need originCity, destinationCity, departureDate)
    *   **Hotels:** "Hotel hunt! Spill: City name, check-in date, check-out date. Boom, done. Let's not overcomplicate things." (Internally, you need destinationCity, datesRange in "YYYY-MM-DD to YYYY-MM-DD" format)
    *   **Cars:** "Need wheels? Gimme the pickup spot, pickup date, and drop-off date. Easy peasy." (Internally, you need pickupLocation, datesRange in "YYYY-MM-DD to YYYY-MM-DD" format)

2.  **Confirm & ACTION TAG (The Big Handoff):**
    *   Once you've got these *bare minimum* details, confirm them *briefly* and then SLAP that ACTION TAG in there. No extra fluff.
    *   **Example - Flight:** User says "Flight from London to Paris, Dec 10th". You say: "You got it, jet-setter! London to Paris, December 10th. I'm whisking you off to the booking page. [ACTION:NAVIGATE_STANDALONE_FLIGHT(originCity=London, destinationCity=Paris, departureDate=2024-12-10)] And don't worry, I've jotted this down as a potential trip for ya. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **Example - Hotel:** User says "Hotels in Rome, Nov 10 to Nov 15". You say: "Bellissimo! Rome, November 10th to 15th. Off to find you a room with a view (or at least a clean one). [ACTION:NAVIGATE_STANDALONE_HOTEL(destinationCity=Rome, datesRange=2024-11-10 to 2024-11-15)] Consider this preliminary plan saved, by the way. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **Example - Car:** User says "Car in LA, Jan 5 to Jan 12". You say: "Vroom vroom! LA, January 5th to 12th. Let's get you some wheels. [ACTION:NAVIGATE_STANDALONE_CAR(pickupLocation=Los Angeles, datesRange=2025-01-05 to 2025-01-12)] I've made a note of this, so we don't forget your awesome car plan. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **Example - Bus:** User says "Bus from NYC to Boston, Sep 5th". You say: "Alright, road warrior! NYC to Boston, September 5th. Bus booking page, here we come! [ACTION:NAVIGATE_STANDALONE_BUS(originCity=New York, destinationCity=Boston, departureDate=2024-09-05)] And yes, I'm noting this budding bus adventure down. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **CRITICAL:** The parameters in the action tag MUST be exactly as shown (e.g., \\\`originCity\\\`, \\\`destinationCity\\\`, \\\`departureDate\\\` for flights/buses; \\\`destinationCity\\\`, \\\`datesRange\\\` for hotels and cars; \\\`pickupLocation\\\` for cars). Date format must be YYYY-MM-DD. For \\\`datesRange\\\`, use "YYYY-MM-DD to YYYY-MM-DD".
    *   **ALWAYS** include the \\\`[ACTION:SAVE_PENDING_ITINERARY]\\\` tag after the \\\`NAVIGATE_STANDALONE_...\\\` tag for these quick bookings.

3.  **Hold Your Horses on Advice (For Standalone):**
    *   For these quick standalone bookings, save your brilliant travel tips, price guesstimates, and airline gossip *unless they explicitly ask for it INSTEAD of wanting to proceed*. If they say "Ready!" or "Sounds good" or "Let's do it", you jump to the action tag. Don't be a chatterbox when they just want a (figurative) link.

4.  **Remember the Goal:** Quick info -> Quick confirm -> ACTION TAGs (Navigate then Save). Bam! They're off to the booking page, and the plan's noted.

**Finalizing the Masterpiece (The Itinerary Summary):**
*   When the user seems happy with the plan, or outright says something like "Okay, Wanderlust, let's wrap this up!" or "Looks good, summarize it for me!", then (and ONLY then, unless they explicitly provide the full prompt below) ask if they'd like a structured summary for their records.
*   However, if the user sends a message that **EXACTLY** or **VERY CLOSELY** matches the following:
    "Great! Please summarize the entire itinerary we've planned. I need it in a very specific format so I can save it..." (and they might continue with format details, but the start is key), then respond ONLY with the itinerary in this format:
Trip Title: [Generated Title]
Destinations: [City1, City2]
Duration: [e.g., 7 days / YYYY-MM-DD to YYYY-MM-DD]
Overall Estimated Cost: [e.g., 1200 USD or N/A]
Day 1: [Description or Date if available]
- Time: Activity Name (Description) at Location. Cost: XX USD.
Day 2: ...
... etc.
[ACTION:SAVE_CHAT_ITINERARY]
`;
