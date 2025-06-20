
import { Trip, UserPreferences, ActiveNotification, TravelNotificationTriggerType } from '../../types';
import { parseTripDates } from '../../utils/dateUtils';
import { generateTravelNotificationContent } from './geminiService';

const getSessionStorageKey = (tripId: string, type: TravelNotificationTriggerType, daysRemaining?: number) => {
  if (type === 'upcoming_trip_general_reminder' && daysRemaining !== undefined) {
    return `notif_${tripId}_${type}_${daysRemaining}_days_sent_session`;
  }
  return `notif_${tripId}_${type}_sent_session`;
};

export const checkAndGenerateNotifications = async (
  trips: Trip[],
  userPreferences: UserPreferences,
  currentDate: Date // Pass current date for testability
): Promise<ActiveNotification[]> => {
  const notifications: ActiveNotification[] = [];
  if (!userPreferences || !userPreferences.notificationPreferences) {
    // console.warn("User preferences or notification preferences not found. Skipping notification generation.");
    return notifications;
  }

  const allowPushReminders = userPreferences.notificationPreferences.push?.upcomingTripReminders;

  for (const trip of trips) {
    if (!trip.dates || !trip.destinations?.length) continue;

    const parsedDates = parseTripDates(trip.dates);
    if (!parsedDates.startDate || !parsedDates.endDate) continue;
    
    const today = new Date(currentDate); 
    today.setHours(0, 0, 0, 0); 

    const daysUntilDeparture = Math.ceil((parsedDates.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isDepartureDay = today.getTime() === parsedDates.startDate.getTime();
    const isArrivalDay = today.getTime() === parsedDates.endDate.getTime();

    // Upcoming Trip General Reminders (7 days down to 1 day before)
    if (allowPushReminders && daysUntilDeparture >= 1 && daysUntilDeparture <= 7) {
      const key = getSessionStorageKey(trip.id, 'upcoming_trip_general_reminder', daysUntilDeparture);
      if (!sessionStorage.getItem(key)) {
        try {
          const message = await generateTravelNotificationContent(
            trip.destinations[0],
            'upcoming_trip_general_reminder',
            undefined, // homeAddress not needed for general reminder
            trip.specialOccasion,
            daysUntilDeparture // Pass number of days
          );
          notifications.push({
            tripId: trip.id,
            notificationType: 'upcoming_trip_general_reminder',
            message
          });
          sessionStorage.setItem(key, 'true');
        } catch (error) {
          console.error(`Error generating upcoming trip reminder for ${daysUntilDeparture} days out:`, error);
        }
      }
    }

    // Departure Day Cab Reminder
    if (allowPushReminders && isDepartureDay) {
      const key = getSessionStorageKey(trip.id, 'departure_cab');
      if (!sessionStorage.getItem(key)) {
         try {
          const message = await generateTravelNotificationContent(trip.destinations[0], 'departure_cab', userPreferences.homeAddress);
          notifications.push({
            tripId: trip.id,
            notificationType: 'departure_cab',
            message,
            action: {
              label: "Book Airport Cab",
            }
          });
          sessionStorage.setItem(key, 'true');
        } catch (error) { console.error("Error generating departure cab notification:", error); }
      }
    }
    
    // Arrival Day Cab Reminder
    if (allowPushReminders && isArrivalDay && trip.id !== "new_trip_placeholder_id") { // Exclude placeholder trips if any
        const key = getSessionStorageKey(trip.id, 'arrival_cab');
        if (!sessionStorage.getItem(key)) {
            try {
                const message = await generateTravelNotificationContent(trip.destinations[trip.destinations.length - 1], 'arrival_cab', userPreferences.homeAddress);
                notifications.push({
                    tripId: trip.id,
                    notificationType: 'arrival_cab',
                    message,
                    action: {
                        label: "Book Cab Home",
                    }
                });
                sessionStorage.setItem(key, 'true');
            } catch (error) { console.error("Error generating arrival cab notification:", error); }
        }
    }
  }
  return notifications;
};