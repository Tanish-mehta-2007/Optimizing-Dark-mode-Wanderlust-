import { Coordinates } from '@/types';

/**
 * Mock geocoding function.
 * In a real application, this would call a geocoding API.
 * @param locationName The name of the location to geocode.
 * @returns A promise that resolves to Coordinates or null if not found.
 */
export const mockGeocode = async (locationName: string): Promise<Coordinates | null> => {
  console.log(`Geocoding (mock): ${locationName}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  const MOCK_LOCATIONS: { [key: string]: Coordinates } = {
    "eiffel tower": { lat: 48.8584, lng: 2.2945 },
    "paris": { lat: 48.8566, lng: 2.3522 },
    "louvre museum": { lat: 48.8606, lng: 2.3376 },
    "notre dame cathedral": { lat: 48.8530, lng: 2.3499 },
    "arc de triomphe": { lat: 48.8738, lng: 2.2950 },
    "sacre-coeur basilica": { lat: 48.8867, lng: 2.3431 },
    "colosseum": { lat: 41.8902, lng: 12.4922 },
    "rome": { lat: 41.9028, lng: 12.4964 },
    "roman forum": { lat: 41.8925, lng: 12.4853 },
    "trevi fountain": { lat: 41.9009, lng: 12.4833 },
    "vatican city": { lat: 41.9029, lng: 12.4534 },
    "st. peter's basilica": { lat: 41.9022, lng: 12.4539 },
    "london eye": { lat: 51.5033, lng: -0.1195 },
    "london": { lat: 51.5074, lng: -0.1278 },
    "tower of london": { lat: 51.5081, lng: -0.0759 },
    "buckingham palace": { lat: 51.5014, lng: -0.1419 },
    "british museum": { lat: 51.5194, lng: -0.1270 },
    "big ben": { lat: 51.5007, lng: -0.1246 },
    "new york": { lat: 40.7128, lng: -74.0060 },
    "statue of liberty": { lat: 40.6892, lng: -74.0445 },
    "times square": { lat: 40.7580, lng: -73.9855 },
    "central park": { lat: 40.785091, lng: -73.968285 },
    "tokyo": { lat: 35.6895, lng: 139.6917 },
    "shibuya crossing": { lat: 35.6590, lng: 139.7006 },
    "tokyo skytree": { lat: 35.7101, lng: 139.8107 },
    "sydney": { lat: -33.8688, lng: 151.2093 },
    "sydney opera house": { lat: -33.8568, lng: 151.2153 },
  };

  const normalizedLocationName = locationName.toLowerCase().trim();

  for (const key in MOCK_LOCATIONS) {
    if (normalizedLocationName.includes(key)) {
      return MOCK_LOCATIONS[key];
    }
  }

  // A fallback for more generic city names if specific landmarks aren't matched
  if (normalizedLocationName.includes("berlin")) return { lat: 52.5200, lng: 13.4050 };
  if (normalizedLocationName.includes("madrid")) return { lat: 40.4168, lng: -3.7038 };

  console.warn(`Mock geocoding: No coordinates found for "${locationName}"`);
  return null;
};

/**
 * Utility to get coordinates for a list of location names.
 * @param locationNames Array of location names.
 * @returns A promise that resolves to an array of Coordinates objects.
 */
export const getCoordinatesForLocations = async (locationNames: string[]): Promise<Coordinates[]> => {
  const results = await Promise.all(locationNames.map(name => mockGeocode(name)));
  return results.filter(result => result !== null) as Coordinates[];
};
