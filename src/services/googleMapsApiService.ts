
import { Coordinates, NearbyPlaceSuggestion } from '../../types';

// Caches are removed as the API calls are stubbed.

export const geocodeLocation = async (locationString: string, contextHint?: string): Promise<Coordinates | null> => {
  console.warn("GoogleMapsApiService: geocodeLocation is called, but Google Maps API is removed/stubbed. Returning null. Location sought:", locationString, "Context:", contextHint);
  // Simulate a delay as if an API call was made
  await new Promise(resolve => setTimeout(resolve, 50)); 
  return null;
};

export const reverseGeocodeCoordinates = async (coords: Coordinates): Promise<string | null> => {
  console.warn("GoogleMapsApiService: reverseGeocodeCoordinates is called, but Google Maps API is removed/stubbed. Returning mock city. Coords:", coords);
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 50));
  // Return a mock city name if needed by other parts of the app, or null
  return "Mockville"; 
};

export const fetchNearbyPlaces = async (coordinates: Coordinates): Promise<NearbyPlaceSuggestion[]> => {
  console.warn("GoogleMapsApiService: fetchNearbyPlaces is called, but Google Maps API is removed/stubbed. Returning empty array. Coords:", coordinates);
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 50));
  return [];
};

// Cache clearing functions are kept for now as they are exported by storageService,
// but they will do nothing as caches are removed.
export const clearGeocodingCache = () => {
  console.log("Geocoding cache clear called (no-op as Google Maps API is stubbed).");
};

export const clearReverseGeocodingCache = () => {
  console.log("Reverse geocoding cache clear called (no-op as Google Maps API is stubbed).");
};

export const clearNearbySearchCache = () => {
  console.log("Nearby search cache clear called (no-op as Google Maps API is stubbed).");
};
