

import { Trip, GeneratedItinerary, UserPreferences } from '../types'; 
import { USER_PREFERENCES_KEY } from '../constants';

// User-specific keys and functions (registerUser, findUserByEmail, etc.) have been moved to AuthContext.tsx

const TRIPS_BASE_KEY = 'aiTravelPlanner_trips_v1'; 
const ITINERARY_CACHE_KEY = 'aiTravelPlanner_itineraryCacheV1';


// User Preferences (remains global)
export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
};

export const getUserPreferences = (): UserPreferences | null => {
  try {
    const prefsJson = localStorage.getItem(USER_PREFERENCES_KEY);
    return prefsJson ? JSON.parse(prefsJson) as UserPreferences : null;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
};

// Trip Management (Now User-Specific via userId argument)
const getUserTripsKey = (userId: string): string => `${TRIPS_BASE_KEY}_${userId}`;

export const saveTrip = (trip: Trip): void => {
  if (!trip.userId) {
    console.error("Cannot save trip: userId is missing.");
    return;
  }
  try {
    const trips = getSavedTrips(trip.userId);
    const existingTripIndex = trips.findIndex(t => t.id === trip.id);
    if (existingTripIndex > -1) {
      trips[existingTripIndex] = trip;
    } else {
      trips.push(trip);
    }
    trips.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem(getUserTripsKey(trip.userId), JSON.stringify(trips));
  } catch (error) {
    console.error("Error saving trip to localStorage:", error);
  }
};

export const getSavedTrips = (userId: string): Trip[] => {
  if (!userId) return [];
  try {
    const tripsJson = localStorage.getItem(getUserTripsKey(userId));
    if (tripsJson) {
      const trips = JSON.parse(tripsJson) as Trip[];
      return trips.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (error) {
    console.error("Error getting trips from localStorage:", error);
    return [];
  }
};

export const getTripById = (userId: string, tripId: string): Trip | undefined => {
  if (!userId) return undefined;
  try {
    const trips = getSavedTrips(userId);
    return trips.find(trip => trip.id === tripId);
  } catch (error) {
    console.error("Error getting trip by ID from localStorage:", error);
    return undefined;
  }
};

export const deleteTrip = (userId: string, tripId: string): void => {
  if (!userId) return;
  try {
    let trips = getSavedTrips(userId);
    trips = trips.filter(trip => trip.id !== tripId);
    localStorage.setItem(getUserTripsKey(userId), JSON.stringify(trips));
  } catch (error) {
    console.error("Error deleting trip from localStorage:", error);
  }
};

export const clearAllSavedTrips = (userId: string): void => {
  if (!userId) return;
  try {
    localStorage.removeItem(getUserTripsKey(userId));
    console.log(`All saved trips for user ${userId} have been cleared.`);
  } catch (error) {
    console.error("Error clearing user's saved trips:", error);
  }
};


// Itinerary Cache (remains global)
interface ItineraryCacheEntry {
  itinerary: GeneratedItinerary;
  timestamp: number;
}
interface ItineraryCache {
  [key: string]: ItineraryCacheEntry;
}

const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache duration

export const cacheItinerary = (key: string, itinerary: GeneratedItinerary): void => {
  try {
    const cacheJson = localStorage.getItem(ITINERARY_CACHE_KEY);
    const cache: ItineraryCache = cacheJson ? JSON.parse(cacheJson) : {};
    
    const keys = Object.keys(cache);
    if (keys.length > 10) { // Limit cache size
      keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp); 
      delete cache[keys[0]]; 
    }

    cache[key] = { itinerary, timestamp: Date.now() };
    localStorage.setItem(ITINERARY_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching itinerary:", error);
  }
};

export const getCachedItinerary = (key: string): GeneratedItinerary | null => {
  try {
    const cacheJson = localStorage.getItem(ITINERARY_CACHE_KEY);
    if (!cacheJson) return null;

    const cache: ItineraryCache = JSON.parse(cacheJson);
    const cachedItem = cache[key];

    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
      return cachedItem.itinerary;
    }
    
    if (cachedItem) { // Expired
      delete cache[key];
      localStorage.setItem(ITINERARY_CACHE_KEY, JSON.stringify(cache)); 
    }
    return null;
  } catch (error) {
    console.error("Error getting cached itinerary:", error);
    localStorage.removeItem(ITINERARY_CACHE_KEY); // Clear corrupted cache
    return null;
  }
};

export const clearItineraryCache = (): void => {
  try {
    localStorage.removeItem(ITINERARY_CACHE_KEY);
    console.log("Itinerary cache cleared from localStorage.");
  } catch (error) {
    console.error("Error clearing itinerary cache from localStorage:", error);
  }
};

// Added these for completeness, though not immediately used by other components.
// They parallel the clear functions for other caches in googleMapsApiService.
export { clearGeocodingCache, clearReverseGeocodingCache, clearNearbySearchCache } from './googleMapsApiService';