
import { Coordinates } from '../../types';

export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Failed to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "The request to get user location timed out.";
            break;
          default:
            message += "An unknown error occurred.";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true, 
        timeout: 10000, // 10 seconds
        maximumAge: 0 // Force fresh location
      }
    );
  });
};