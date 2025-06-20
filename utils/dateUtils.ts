
export interface ParsedTripDates {
  startDate: Date | null;
  endDate: Date | null;
}

export const parseTripDates = (datesString: string): ParsedTripDates => {
  if (!datesString || datesString.toLowerCase() === "to be determined") {
    return { startDate: null, endDate: null };
  }

  const parts = datesString.split(' to ');
  let startDateStr = parts[0];
  let endDateStr = parts.length > 1 ? parts[1] : parts[0]; // If no 'to', endDate is same as startDate

  const startDate = new Date(startDateStr);
  // Ensure time is start of day for startDate
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  // Ensure endDate includes the whole day by setting time to end of day
  endDate.setHours(23, 59, 59, 999);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn(`Could not parse dates: ${startDateStr}, ${endDateStr}`);
    return { startDate: null, endDate: null };
  }
  
  if (endDate < startDate) {
    console.warn(`End date ${endDateStr} is before start date ${startDateStr}. Setting end date to start date.`);
    endDate.setTime(startDate.getTime());
    endDate.setHours(23,59,59,999); // Ensure it's end of the start day
  }


  return { startDate, endDate };
};

export const isCurrentDateDuringTrip = (startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) {
    return false;
  }
  const now = new Date();
  return now >= startDate && now <= endDate;
};