
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, TRAVEL_TIERS } from '../constants';
import { GeneratedItinerary, TripFormData, DailyItinerary, ItineraryItem, GroundingChunk, Coordinates, NearbyPlaceSuggestion, FlightStatusData, FlightStatus, TouristAttraction, PlaceSuggestion, TravelNotificationTriggerType } from '../../types';
import { getCachedItinerary, cacheItinerary } from './storageService';

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY environment variable is not set. AI features will be mocked. For development, you can set it in a .env file or directly in your environment.");
}

// Parser for structured form-based AI itinerary
const parseItineraryFromStringInternal = (text: string, formData: TripFormData): Omit<GeneratedItinerary, 'budget'> => {
  const lines = text.split('\n');
  const dailyBreakdown: DailyItinerary[] = [];
  let currentDay: DailyItinerary | null = null;
  let overallTitle = `Trip to ${formData.destinations.join(', ')}`; 
  let eventCounter = 0; 

  lines.forEach(line => {
    line = line.trim();

    if (line.toLowerCase().startsWith("overall trip title:")) {
      overallTitle = line.substring("overall trip title:".length).trim();
      return;
    }

    const dayMatch = line.match(/^Day\s*(\d+)\s*(?:\(([^)]+?)\))?:?/i);
    if (dayMatch) {
      if (currentDay) dailyBreakdown.push(currentDay);
      const dayNumber = dayMatch[1];
      const date = dayMatch[2] ? dayMatch[2].trim() : undefined;
      currentDay = { day: `Day ${dayNumber}`, date, events: [] };
    } else if (currentDay) {
      const isEventStartLine = line.startsWith("- ") || line.match(/^\d{1,2}:\d{2}\s*(AM|PM)?/i);
      const directImageUrlMatch = line.match(/^Direct Image URL:\s*(.*)/i);
      const travelTimeToNextMatch = line.match(/^Estimated Travel Time to Next Activity:\s*(.*)/i);

      if (directImageUrlMatch && currentDay.events.length > 0) {
        const url = directImageUrlMatch[1].trim();
        if (url && url.toLowerCase() !== "no_image_url" && url.startsWith("http")) {
          currentDay.events[currentDay.events.length - 1].imageUrl = url;
        }
      } else if (travelTimeToNextMatch && currentDay.events.length > 0) {
        const travelTime = travelTimeToNextMatch[1].trim();
        if (travelTime && travelTime.toLowerCase() !== "n/a") {
            currentDay.events[currentDay.events.length - 1].travelTimeToNext = travelTime;
        }
      } else if (isEventStartLine) {
        const event: ItineraryItem = { 
            time: "N/A", 
            activity: "", 
            identifier: `evt-form-${Date.now()}-${eventCounter++}`,
            source: 'ai' 
        };
        
        const timeActivityMatch = line.match(/^(?:(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[:-]?\s*)?(?:-\s*)?(.*)/i);
        if (timeActivityMatch) {
          event.time = timeActivityMatch[1] ? timeActivityMatch[1].trim() : "Flexible";
          let activityDetails = timeActivityMatch[2].trim();

          activityDetails = activityDetails.replace(/\s*[\)\]\}]+\s*[\)\]\}]+\s*/g, ' ').trim();

          const locationMatch = activityDetails.match(/Location:\s*([^(\n]+?)(?:\s+\(Approx\.|$)/i);
          if (locationMatch && locationMatch[1]) {
            event.location = locationMatch[1].trim().replace(/\.$/, '');
          }
          
          const costMatch = activityDetails.match(/\(Approx\.\s*([^)]+?)\)/i);
          if (costMatch && costMatch[1]) {
              let costContent = costMatch[1].trim();
              costContent = costContent.replace(/\s*USD\s*$/i, "").trim(); 

              if (costContent.match(/^[$]?[\d,]+(?:-[\d,]+)?$/i)) { 
                  if (!costContent.startsWith('$') && costContent.match(/^[\d]/)) {
                      event.cost = '$' + costContent;
                  } else {
                      event.cost = costContent;
                  }
              } else if (costContent.toLowerCase() === 'free' || costContent.toLowerCase() === 'included' || costContent.toLowerCase() === 'varies' || costContent.toLowerCase() === 'n/a') {
                  event.cost = costContent.charAt(0).toUpperCase() + costContent.slice(1);
              }
          }
          
          const mainActivityBlockMatch = activityDetails.match(/^(.*?)(?:\s+Location:|\s+\(Approx\.|\s*\([^\)]*?(?:USD)?\)|$)/i);
          let activityAndOwnDescription = activityDetails; 
          if (mainActivityBlockMatch && mainActivityBlockMatch[1]) {
            activityAndOwnDescription = mainActivityBlockMatch[1].trim();
          }

          const activityNameMatch = activityAndOwnDescription.match(/^([^()]+?)(?:\s*\((.*?)\))?$/);
          if (activityNameMatch && activityNameMatch[1]) {
            event.activity = activityNameMatch[1].trim();
            if (activityNameMatch[2]) {
              let potentialDesc = activityNameMatch[2].trim();
              potentialDesc = potentialDesc.replace(/^"(.*?)"$/, '$1').trim();
              const isCost = event.cost && potentialDesc.toLowerCase().includes(event.cost.toLowerCase().replace('$', ''));
              const isLocation = event.location && potentialDesc.toLowerCase().includes(event.location.toLowerCase());
              if (!isCost && !isLocation && potentialDesc.toLowerCase() !== 'approx.' && !potentialDesc.match(/USD$/i)) {
                event.description = potentialDesc;
              }
            }
          } else {
            event.activity = activityAndOwnDescription; 
          }
          
          if (!event.description && event.activity) {
              const allParentheticalParts = activityDetails.matchAll(/\(([^)]+?)\)/g);
              for (const partMatch of allParentheticalParts) {
                  let potentialDesc = partMatch[1].trim();
                  potentialDesc = potentialDesc.replace(/^"(.*?)"$/, '$1').trim();
                  const isCost = event.cost && potentialDesc.toLowerCase().includes(event.cost.toLowerCase().replace('$', ''));
                  const isLocation = event.location && potentialDesc.toLowerCase().includes(event.location.toLowerCase());
                  const isApprox = potentialDesc.toLowerCase().startsWith('approx.');
                  const isUSD = potentialDesc.toLowerCase().endsWith('usd');
                  if (!isCost && !isLocation && !isApprox && !isUSD && potentialDesc.length > 3) { 
                      event.description = potentialDesc;
                      break; 
                  }
              }
          }
          
          const finalFieldClean = (fieldVal: string | undefined): string | undefined => {
              if (!fieldVal) return undefined;
              let cleaned = fieldVal;
              cleaned = cleaned.replace(/[\)\]\}]+(?:\s*[\)\]\}]+)*/g, '');
              cleaned = cleaned.replace(/\(\s*Approx\.[^)]*?\)[\s.,;:!?(){}[\]]*/gi, '');
              cleaned = cleaned.trim();
              cleaned = cleaned.replace(/[.,;:!?(){}[\]\s]*$/g, '');
              cleaned = cleaned.trim(); 
              if (cleaned && cleaned.length <= 3 && /^[.,;:!?(){}[\]\s]*$/.test(cleaned)) {
                  return undefined;
              }
              return cleaned || undefined; 
          };

          event.activity = finalFieldClean(event.activity);
          event.description = finalFieldClean(event.description);
          event.location = finalFieldClean(event.location);

          if (event.cost && !(event.cost.includes('-') || event.cost.toLowerCase() === 'free' || event.cost.toLowerCase() === 'included' || event.cost.toLowerCase() === 'varies' || event.cost.toLowerCase() === 'n/a')) {
             event.cost = finalFieldClean(event.cost);
          }

          if (event.description) {
              if (event.location && event.description.toLowerCase().includes(event.location.toLowerCase()) && event.description.length < event.location.length + 10) event.description = undefined;
              if (event.cost && event.description.toLowerCase().includes(event.cost.toLowerCase().replace('$', '')) && event.description.length < event.cost.length + 10) event.description = undefined;
              if (event.description && event.description.toLowerCase().startsWith("approx.")) event.description = undefined;
          }

          if (event.activity) {
            currentDay.events.push(event);
          }
        }
      }
    }
  });
  if (currentDay) dailyBreakdown.push(currentDay);
  
  const finalClean = (text?: string) => text ? text.replace(/[\)\]\}]+(?:\s*[\)\]\}]+)*/g, '').trim() : undefined;

  return {
    title: finalClean(overallTitle) || `Trip to ${formData.destinations.join(', ')}`,
    destinations: formData.destinations,
    duration: `${formData.startDate} to ${formData.endDate}`,
    dailyBreakdown: dailyBreakdown.map(day => ({
        ...day,
        date: finalClean(day.date)
    })),
  };
};
export { parseItineraryFromStringInternal as parseItineraryFromString };


export const parseChatItineraryFromString = (text: string): Partial<GeneratedItinerary> => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const itinerary: Partial<GeneratedItinerary> & { dailyBreakdown: DailyItinerary[], destinations: string[] } = { 
    title: "Custom AI Generated Trip",
    destinations: [], 
    duration: "To be determined",
    dailyBreakdown: [],
  };
  let currentDay: DailyItinerary | null = null;
  let overallEstimatedCost: number | undefined = undefined;
  let eventCounter = 0; 

  for (const line of lines) {
    const titleMatch = line.match(/^Trip Title:\s*(.*)/i);
    if (titleMatch) {
      itinerary.title = titleMatch[1].trim();
      continue;
    }
    const destMatch = line.match(/^Destinations?:\s*(.*)/i); 
    if (destMatch) {
      itinerary.destinations = destMatch[1].split(/, | and /i).map(d => d.trim()).filter(d => d); // Split by comma or 'and'
      if (itinerary.destinations.length === 0) itinerary.destinations = ["Unknown Destination"];
      continue;
    }
    const durationMatch = line.match(/^Duration:\s*(.*)/i);
    if (durationMatch) {
      itinerary.duration = durationMatch[1].trim();
      continue;
    }
    const costMatchTotal = line.match(/^Overall Estimated Cost:\s*\$?([\d,.-]+)\s*USD/i) || line.match(/^Overall Estimated Cost:\s*(N\/A)/i);
    if (costMatchTotal) {
        if (costMatchTotal[1].toLowerCase() !== 'n/a') {
            overallEstimatedCost = parseFloat(costMatchTotal[1].replace(/,/g, '').split('-')[0]); 
        }
        continue;
    }

    const dayHeaderMatch = line.match(/^Day\s*(\d+):\s*(.*)/i);
    if (dayHeaderMatch) {
      if (currentDay) {
        itinerary.dailyBreakdown.push(currentDay);
      }
      const dayNumber = dayHeaderMatch[1];
      let dayDescriptionOrDate = dayHeaderMatch[2].trim();
      const datePattern = /\b\d{4}-\d{2}-\d{2}\b/;
      let dateFound: string | undefined = undefined;
      if (datePattern.test(dayDescriptionOrDate)) {
        dateFound = dayDescriptionOrDate.match(datePattern)?.[0];
      }
      currentDay = { day: `Day ${dayNumber}: ${dayDescriptionOrDate}`, date: dateFound, events: [] };
      continue;
    }
    
    const travelTimeToNextMatchChat = line.match(/^Estimated Travel Time to Next Activity:\s*(.*)/i);
    if (travelTimeToNextMatchChat && currentDay && currentDay.events.length > 0) {
        const travelTime = travelTimeToNextMatchChat[1].trim();
        if (travelTime && travelTime.toLowerCase() !== 'n/a') {
            currentDay.events[currentDay.events.length - 1].travelTimeToNext = travelTime;
        }
        continue; 
    }


    if (currentDay) {
      const eventMatch = line.match(/^-?\s*(?:(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[:\-\s]*)?([^-\.(]+?)(?:\s*at\s*([^-\.(]+?))?(?:\s*-\s*\(([^)]+?)\))?(?:\.\s*Location:\s*([^.]+?))?(?:\.\s*Cost:\s*([^.]+))?\.?$/i);
      if (eventMatch) {
        const [, time, activityName, placeName, description, location, costStr] = eventMatch;
        const event: ItineraryItem = {
          time: time ? time.trim() : "Flexible",
          activity: `${activityName.trim()}${placeName ? ` at ${placeName.trim()}` : ''}`,
          identifier: `evt-chat-${Date.now()}-${eventCounter++}`,
          source: 'ai'
        };
        if (description) event.description = description.trim();
        if (location) event.location = location.trim();
        
        if (costStr) {
            let cleanedCost = costStr.trim();
            cleanedCost = cleanedCost.replace(/^Approx\.\s*/i, "").trim(); 
            cleanedCost = cleanedCost.replace(/\s*USD\s*$/i, "").trim();   
            
            if (cleanedCost.toLowerCase() === 'n/a') {
                event.cost = "N/A";
            } else if (cleanedCost.match(/^[$]?[\d,]+(?:-[\d,]+)?$/i)) { 
                if (!cleanedCost.startsWith('$') && cleanedCost.match(/^[\d]/)) {
                    event.cost = '$' + cleanedCost;
                } else {
                    event.cost = cleanedCost;
                }
            } else if (cleanedCost.toLowerCase() === 'free' || cleanedCost.toLowerCase() === 'included' || cleanedCost.toLowerCase() === 'varies') {
                event.cost = cleanedCost.charAt(0).toUpperCase() + cleanedCost.slice(1);
            }
        }
        currentDay.events.push(event);
      }
    }
  }

  if (currentDay) {
    itinerary.dailyBreakdown.push(currentDay);
  }
  if (overallEstimatedCost !== undefined) {
    itinerary.estimatedTotalCost = overallEstimatedCost;
  } else { 
    let sum = 0;
    itinerary.dailyBreakdown.forEach(day => {
        day.events.forEach(event => {
            if (event.cost) {
                const costValue = event.cost.match(/(\d+[\d,.]*)/); 
                if (costValue && costValue[1]) sum += parseFloat(costValue[1].replace(/,/g, ''));
            }
        });
    });
    if (sum > 0) itinerary.estimatedTotalCost = sum;
  }

  return itinerary;
};


export const generateItinerary = async (formData: TripFormData): Promise<GeneratedItinerary> => {
  const cacheKey = `${formData.destinations.join('-')}-${formData.startDate}-${formData.endDate}-${formData.travelType}-${formData.numberOfTravelers}-${formData.travelTier}-${formData.specialOccasion || 'none'}-v8-multi-city`; 
  
  const localCached = getCachedItinerary(cacheKey);
  if (localCached) {
    console.log("Returning client-side cached multi-city itinerary (v8) for tier:", formData.travelTier, "travelers:", formData.numberOfTravelers);
    return localCached;
  }

  const selectedTierDetails = TRAVEL_TIERS.find(t => t.id === formData.travelTier);
  const tierNameForAI = selectedTierDetails ? selectedTierDetails.name : formData.travelTier;

  if (!ai) { 
    console.warn("Frontend Gemini API not initialized. Returning mock multi-city itinerary for tier:", formData.travelTier, "travelers:", formData.numberOfTravelers);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const mockEstimatedCost = formData.travelTier === 'luxury' ? (500 * (parseInt(formData.numberOfTravelers) || 1)) : 
                              formData.travelTier === 'lifestyle' ? (250 * (parseInt(formData.numberOfTravelers) || 1)) : 
                              (100 * (parseInt(formData.numberOfTravelers) || 1));
    
    const mockDays: DailyItinerary[] = [];
    const startDateObj = new Date(formData.startDate + 'T00:00:00'); // Ensure parsing in local timezone context
    const endDateObj = new Date(formData.endDate + 'T00:00:00');
    const numDays = Math.max(1, (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24) + 1);

    let cityIndex = 0;
    for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + i);
        const currentCity = formData.destinations[cityIndex % formData.destinations.length];
        const dayEvents: ItineraryItem[] = [
            { time: "09:00 AM", activity: `Mock Breakfast in ${currentCity} (${tierNameForAI})`, description: "Fuel up for the day", location: `Mock Cafe, ${currentCity}`, cost: "$20", imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=400&auto=format&fit=crop", identifier: `mock-evt-${Date.now()}-${i}-1`, travelTimeToNext: "Approx. 15 min walk", source: 'ai'}, 
            { time: "10:30 AM", activity: `Mock Sightseeing in ${currentCity} (${tierNameForAI})`, description: `Explore landmarks of ${currentCity}`, location:`Mock Landmark, ${currentCity}`, cost: "$30", imageUrl: "https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=400&auto=format&fit=crop", identifier: `mock-evt-${Date.now()}-${i}-2`, source: 'ai'}
        ];
        
        if (i < numDays - 1 && formData.destinations.length > 1 && (i + 1) % Math.ceil(numDays / formData.destinations.length) === 0) {
            const nextCityIndex = (cityIndex + 1) % formData.destinations.length;
            const nextCity = formData.destinations[nextCityIndex];
            dayEvents.push({ time: "03:00 PM", activity: `Travel from ${currentCity} to ${nextCity}`, description: "Enjoy the journey!", location: `${currentCity} Station`, cost: "$50", imageUrl: "https://images.unsplash.com/photo-1505839420434-870960a3189e?q=80&w=400&auto=format&fit=crop", identifier: `mock-evt-${Date.now()}-travel-${i}`, travelTimeToNext: "Approx. 30 min to hotel", source: 'ai'});
            cityIndex = nextCityIndex;
        }

        mockDays.push({
            day: `Day ${i + 1}`,
            date: currentDate.toISOString().split('T')[0],
            events: dayEvents
        });
    }


    const mockItinerary: GeneratedItinerary = {
      title: `Mock Trip: ${formData.destinations.join(' & ')} Adventure (${tierNameForAI}, ${formData.numberOfTravelers} guests)`,
      destinations: formData.destinations,
      duration: `${formData.startDate} to ${formData.endDate}`,
      dailyBreakdown: mockDays,
      estimatedTotalCost: mockEstimatedCost * numDays, // Rough estimate for total
    };
    cacheItinerary(cacheKey, mockItinerary);
    return mockItinerary;
  }

  console.log("[Frontend] Generating multi-city itinerary with frontend AI.");
  const prompt = `
    You are a sophisticated travel planning AI. Generate a detailed day-by-day itinerary.
    Your output MUST follow this exact structure. Do not add any conversational fluff or introductory/concluding remarks outside this structure.

    Overall Trip Title: [A catchy title for the trip, e.g., "Exploring ${formData.destinations.join(' and ')}" or "${formData.destinations[0]} & Beyond (${formData.numberOfTravelers} people, ${tierNameForAI} Style)"]

    Day 1 ([${formData.startDate}]):
    - HH:MM AM/PM: [Activity/Meal] at [Specific Restaurant/Place Name] ([Brief, engaging description of activity/place, max 15 words]). Location: [Specific Address or well-known Landmark, City, Country]. (Approx. [Cost, e.g., $XX or $XX-YY] USD)
    Direct Image URL: [A publicly accessible and embeddable direct image URL (e.g., from Wikimedia Commons, Unsplash, Pexels with permissive licenses) that best represents this activity/location. Use a relevant, high-quality image. If no suitable URL, output "NO_IMAGE_URL"]
    Estimated Travel Time to Next Activity: [e.g., Approx. 15 min drive / 30 min public transit / N/A if last activity of the day]
    - HH:MM AM/PM: [Another Activity/Meal] at [Specific Restaurant/Place Name] ([Description]). Location: [Address/Landmark]. (Approx. [Cost, e.g., $XX or $XX-YY] USD)
    Direct Image URL: [Another publicly accessible and embeddable direct image URL or "NO_IMAGE_URL"]
    Estimated Travel Time to Next Activity: [e.g., Approx. 10 min walk / N/A if last activity of the day]

    (If traveling between cities, include it as an event like this within a day's plan:)
    - HH:MM AM/PM: Travel from [Previous City] to [Next City] ([Travel mode, e.g., by train, flight]). Location: [Departure point, e.g., [Previous City] Train Station]. (Approx. [Travel Cost, e.g., $XX] USD)
    Direct Image URL: [Relevant travel image or "NO_IMAGE_URL"]
    Estimated Travel Time to Next Activity: [Time to next activity in the new city, or "N/A"]
    
    Day 2 ([${new Date(new Date(formData.startDate + 'T00:00:00').setDate(new Date(formData.startDate + 'T00:00:00').getDate() + 1)).toISOString().split('T')[0]}]):
    - HH:MM AM/PM: [Activity/Meal in the current city]...
    ... and so on for all days.

    Estimated Total Activities & Food Cost: [Total Calculated Cost, e.g., $XXX or $XXX-YYY] USD

    Use the following details for generation:
    Destinations (in order): ${formData.destinations.join(', ')}
    Origin City (for context of starting point only, flights from origin are NOT part of this itinerary's activity list): ${formData.originCity}
    Travel Type: ${formData.travelType}
    Number of Travelers: ${formData.numberOfTravelers}
    Selected Travel Style/Tier: ${tierNameForAI} (Guide your suggestions for dining and activities based on this style and number of travelers. Do NOT include specific hotel names or accommodation details. Focus on activities, meals, and sightseeing.)
    Start Date: ${formData.startDate}
    End Date: ${formData.endDate}
    Special Occasion (if any, incorporate it subtly): ${formData.specialOccasion || 'None'}

    Important Guidelines:
    1.  The itinerary should flow sequentially through the listed Destinations. If multiple destinations, allocate appropriate time for each based on the total duration.
    2.  Distribute the total trip duration (${formData.startDate} to ${formData.endDate}) among the cities. For example, if 2 cities and 4 days, roughly 2 days per city.
    3.  Explicitly include "Travel from [Previous City] to [Next City]" as an event if applicable. Specify travel mode (e.g., train, short flight, bus) and estimated cost if possible. This travel event should be part of a day's plan.
    4.  Calculate actual dates for each day based on the Start Date.
    5.  Include specific times (HH:MM AM/PM). If a time is flexible, just state activity.
    6.  Provide specific names for restaurants and attractions.
    7.  Locations must be specific (address or very well-known landmark, including city and country).
    8.  Estimated costs must be in USD and reflect the total for ALL travelers for activities and meals. Use ranges like $20-30 if appropriate. Costs can also be "Free", "Included", "Varies", or "N/A".
    9.  The sum of "Approx. [Cost] USD" for all events should be the "Estimated Total Activities & Food Cost".
    10. For EACH event, provide a "Direct Image URL:" on a new line immediately after the event details. This URL must be directly embeddable (e.g., .jpg, .png, .webp) and publicly accessible from sites like Wikimedia Commons, Unsplash, Pexels, etc. Prioritize quality and relevance. If a suitable image URL cannot be found, output "NO_IMAGE_URL". Do not provide links to web pages or search results.
    11. AFTER the Direct Image URL, provide "Estimated Travel Time to Next Activity:" on a new line. Specify the mode (e.g., drive, walk, public transit) and time. If it's the last activity of the day, or travel time is negligible/not applicable, output "N/A".
    12. Ensure the "Estimated Total Activities & Food Cost:" line is the VERY LAST line of your response.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    
    const text = response.text;
    if (!text || text.trim() === "") {
        throw new Error("AI returned an empty response for itinerary generation.");
    }
    if (response.promptFeedback && response.promptFeedback.blockReason) {
        throw new Error(`AI content generation blocked: ${response.promptFeedback.blockReason} - ${response.promptFeedback.blockReasonMessage || ''}`);
    }

    const parsedData = parseItineraryFromStringInternal(text, formData); // Use internal alias
    
    let estimatedTotalCost: number | undefined = undefined;
    const costEstimateLineMatch = text.match(/Estimated Total Activities & Food Cost:\s*\$?([\d,.-]+)\s*USD/i); 
    if (costEstimateLineMatch && costEstimateLineMatch[1]) {
      const costStr = costEstimateLineMatch[1].split('-')[0]; 
      estimatedTotalCost = parseFloat(costStr.replace(/,/g, ''));
    } else { 
      let sum = 0;
      parsedData.dailyBreakdown.forEach(day => {
        day.events.forEach(event => {
          if (event.cost) {
            const costValue = event.cost.match(/(\d+[\d,.]*)/); 
            if (costValue && costValue[1]) sum += parseFloat(costValue[1].replace(/,/g, ''));
          }
        });
      });
      estimatedTotalCost = sum > 0 ? sum : undefined;
    }
    
    const completeItinerary: GeneratedItinerary = {
      ...parsedData,
      estimatedTotalCost
    };

    cacheItinerary(cacheKey, completeItinerary);
    return completeItinerary;

  } catch (error) {
    console.error("Error generating itinerary with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    throw new Error(error instanceof Error ? error.message : "Failed to generate itinerary. The AI might be busy or the request timed out. Please try again.");
  }
};

export const generatePackingList = async (destinations: string[], startDate: string, endDate: string, travelType: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock packing list.");
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return Promise.resolve(["Mock: Sunscreen", "Mock: Passport", "Mock: Phone Charger", "Mock: Comfortable Shoes", `Mock: Outfit for ${travelType}`]);
  }
  
  const prompt = `
    Generate a practical and concise packing list for a trip with the following details:
    Destinations: ${destinations.join(', ')}
    Start Date: ${startDate}
    End Date: ${endDate}
    Travel Type: ${travelType}

    Consider typical weather for the destinations and time of year (infer from dates), and common activities related to the travel type.
    If multiple destinations have varied climates, include items for both if necessary.
    Do NOT include categories.
    Provide the list as a flat JSON array of strings, where each string is an item to pack.
    Example: ["Sunscreen", "Passport", "Phone Charger", "Hiking Boots"]
    Output ONLY the JSON array. Do not include any other text, markdown, or explanations.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s; 
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData as string[];
      } else {
         console.warn("Packing list from AI was not a JSON array of strings. Received:", parsedData);
         const fallbackList = String(jsonStr).split('\n').map(s => String(s).replace(/^- |^\* |^"|"|,$/g, '').trim()).filter(s => String(s).length > 0 && !String(s).match(/^\[|\]$/));
         return fallbackList.length > 0 ? fallbackList : ["Default Item 1", "Default Item 2 (Parsing Failed)"];
      }
    } catch (e) {
      console.warn("Failed to parse JSON packing list, attempting plain text split. Raw response:", response.text, "Error:", e);
      const fallbackList = String(response.text).split('\n').map(s => String(s).replace(/^- |^\* |^"|"|,$/g, '').trim()).filter(s => String(s).length > 0 && !String(s).match(/^\[|\]$/));
      return fallbackList.length > 0 ? fallbackList : ["Default Item 1", "Default Item 2 (JSON Parse Error)"];
    }

  } catch (error) {
    console.error("Error generating packing list with Gemini:", error);
     if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    throw new Error("Failed to generate packing list. Please try again.");
  }
};

export const generateTravelNotificationContent = async (
  destination: string,
  notificationType: TravelNotificationTriggerType,
  homeAddress?: string,
  tripOccasion?: string,
  daysUntilTrip?: number 
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock notification content.");
    const cleanDest = destination.split(',')[0]; 
    let mockMessage = `Mock: Friendly travel reminder for ${cleanDest}!`;
    if (notificationType === 'upcoming_trip_general_reminder') {
      if (daysUntilTrip === 1) mockMessage = `Mock: Your awesome trip to ${cleanDest} is TOMORROW! 🤩 Get packing!`;
      else if (daysUntilTrip === 7) mockMessage = `Mock: Just 1 week until ${cleanDest}! 🗓️ The countdown is ON!`;
      else mockMessage = `Mock: Only ${daysUntilTrip} days left until your trip to ${cleanDest}! 🎉`;
    } else if (notificationType === 'departure_cab') {
      mockMessage = `Mock: Time to head to ${cleanDest}! ✈️ Don't forget your cab from ${homeAddress || 'your current location'} to the airport. Tap to book!`;
    } else if (notificationType === 'arrival_cab') {
      mockMessage = `Mock: Welcome back from ${cleanDest}! 🏡 Need a ride home from the airport to ${homeAddress || 'your destination'}? We can help!`;
    }
    return mockMessage;
  }

  const commonInstructions = "Craft a short (1-2 sentences), sassy, lovable, and premium-sounding notification for a traveler. Use emojis. Be exciting and a bit playful. Keep it concise. Do not use markdown formatting like **bold** or *italics*.";
  let promptSpecifics = "";
  const cleanDestination = destination.split(',')[0]; 

  switch (notificationType) {
    case 'upcoming_trip_general_reminder':
      if (daysUntilTrip === 1) {
        promptSpecifics = `Their fabulous trip to ${cleanDestination} is TOMORROW! Make it sound super exciting and urgent (in a fun way). Example: "Hold onto your hats, globetrotter! 🎩 Your grand escape to ${cleanDestination} is TOMORROW! Adventure (and maybe some chaos) awaits! 🚀"`;
      } else if (daysUntilTrip === 7) {
        promptSpecifics = `Their amazing trip to ${cleanDestination} is just 1 week away! Build anticipation. ${tripOccasion ? `This trip is for their ${tripOccasion}.` : ''} Example: "Hey jet-setter! ✨ Just 7 sleeps until your Parisian adventure! Time to start dreaming of croissants and chic vibes. 😉"`;
      } else {
        promptSpecifics = `Their wonderful trip to ${cleanDestination} is ${daysUntilTrip} days away. Give them a fun countdown reminder. ${tripOccasion ? `Mention their ${tripOccasion} if relevant.` : ''} Example: "Good news, superstar! Only ${daysUntilTrip} more days until you're sipping cocktails in ${cleanDestination}. The glam life is calling! 💅"`;
      }
      break;
    case 'departure_cab':
      promptSpecifics = `Their flight to ${cleanDestination} is today! Remind them to book a cab to the airport from ${homeAddress ? homeAddress : 'their current spot'} and mention they can book it via the app. Example: "It's D-Day for ${cleanDestination}! ✨ Your throne (aka plane seat) awaits. Need a royal chariot to the airport from ${homeAddress || 'your current launchpad'}? Tap here, darling, and we'll sort you out! 💅"`;
      break;
    case 'arrival_cab':
      promptSpecifics = `They are returning today from their trip to ${cleanDestination}. Remind them to book a cab from the airport to ${homeAddress ? homeAddress : 'their final destination'} through the app. Example: "Welcome back, superstar! Hope ${cleanDestination} treated you like royalty. ✨ Now, let's glide you home from the airport to ${homeAddress || 'your castle'} without a fuss. Tap for a comfy cab ride! 🏰"`;
      break;
    default:
      return "Have a great trip!"; // Should not happen
  }

  const fullPrompt = `${commonInstructions} ${promptSpecifics}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: fullPrompt,
    });
    return response.text.trim().replace(/[\*\#]/g, ''); // Remove any markdown like * or #
  } catch (error) {
    console.error(`Error generating travel notification content for ${notificationType} (${daysUntilTrip} days):`, error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("Invalid API Key for generating notification content.");
    }
    return `Friendly reminder for your trip to ${cleanDestination}! Just ${daysUntilTrip || 'a few'} days left.`;
  }
};


export const searchRecentInfo = async (query: string): Promise<{text: string, sources: GroundingChunk[]}> => {
  if (!ai) {
    if (query.toLowerCase().includes("near my current location")) {
      return {
        text: "Mock search: Near your location, you might find 'The Cozy Cafe' (great for coffee) and 'City Park' (nice for a walk). Check online for more details!",
        sources: [
          {web: {uri: "https://mock.example.com/cozycafe", title: "The Cozy Cafe Reviews"}},
          {web: {uri: "https://mock.example.com/citypark", title: "City Park Events"}}
        ]
      };
    }
    return {text: "Mock search result: The event happened recently according to mock data.", sources: [{web: {uri: "https://mock.example.com", title: "Mock Source Example"}}]};
  }
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL, 
      contents: query,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validSources: GroundingChunk[] = sources
      .filter(s => s.web && s.web.uri && s.web.title) 
      .map(s => ({ web: { uri: s.web.uri as string, title: s.web.title as string } }));
    return { text, sources: validSources };
  } catch (error) {
    console.error("Error with Google Search grounding:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    throw new Error("Failed to get information using Google Search. The AI might be busy or the request timed out.");
  }
};

export const fetchFlightStatus = async (airline: string, flightNumber: string, departureDate: string): Promise<FlightStatusData> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock flight status.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockStatuses: FlightStatus[] = ['On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    let mockDetails = "";
    if (randomStatus === 'Delayed') mockDetails = "Delayed by 30 minutes";
    return {
      status: randomStatus,
      details: mockDetails,
      gate: randomStatus !== 'Cancelled' ? `A${Math.floor(Math.random() * 20) + 1}` : undefined,
      estimatedDepartureTime: randomStatus === 'Delayed' ? '10:30 AM' : '10:00 AM',
      actualDepartureTime: randomStatus === 'Departed' || randomStatus === 'Arrived' ? '10:05 AM' : undefined,
      estimatedArrivalTime: randomStatus === 'Delayed' ? '12:30 PM' : '12:00 PM',
      actualArrivalTime: randomStatus === 'Arrived' ? '12:05 PM' : undefined,
      terminal: randomStatus !== 'Cancelled' ? `T${Math.floor(Math.random() * 3) + 1}` : undefined,
    };
  }

  const prompt = `
    Provide the current flight status for ${airline} flight ${flightNumber} scheduled for departure on ${departureDate}.
    If the flight is today or in the past, try to get the most up-to-date information.
    If the flight is in the future, provide its scheduled status.

    Format the response strictly as a JSON object with the following keys (use null or omit if information is not available):
    - "status": One of "On Time", "Delayed", "Cancelled", "Departed", "Arrived", "Scheduled", "Unknown".
    - "details": A brief string explaining the status if not "On Time" or "Scheduled" (e.g., "Delayed by 30 minutes", "Cancelled due to weather").
    - "gate": The departure or arrival gate number (e.g., "A12").
    - "terminal": The terminal number (e.g., "T2").
    - "estimatedDepartureTime": Estimated or scheduled departure time (e.g., "10:30 AM PST").
    - "actualDepartureTime": Actual departure time if departed (e.g., "10:35 AM PST").
    - "estimatedArrivalTime": Estimated or scheduled arrival time (e.g., "02:45 PM EST").
    - "actualArrivalTime": Actual arrival time if arrived (e.g., "02:50 PM EST").

    Example:
    {
      "status": "Delayed",
      "details": "Delayed by 45 minutes due to late aircraft arrival",
      "gate": "B5",
      "terminal": "2",
      "estimatedDepartureTime": "11:15 AM PST",
      "actualDepartureTime": null,
      "estimatedArrivalTime": "03:30 PM EST",
      "actualArrivalTime": null
    }
    
    If you cannot find specific information, use "Unknown" for status and null for other fields.
    Output ONLY this JSON object. Do not include any text outside of the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    try {
      const parsedData = JSON.parse(jsonStr);
      if (parsedData && typeof parsedData.status === 'string') {
        return parsedData as FlightStatusData;
      } else {
        console.warn("Flight status from AI was not in expected JSON format. Received:", parsedData, "Cleaned string:", jsonStr);
        return { status: 'Unknown', details: "AI returned data in an unexpected format." };
      }
    } catch (e) {
      console.error("Failed to parse JSON response for flight status:", e, "Raw response:", response.text, "Cleaned string:", jsonStr);
      if (response.text.length < 100) { 
        const statusKeywords: { keyword: RegExp, status: FlightStatus }[] = [
          { keyword: /on time/i, status: "On Time"},
          { keyword: /delayed/i, status: "Delayed"},
          { keyword: /cancelled|canceled/i, status: "Cancelled"},
          { keyword: /departed/i, status: "Departed"},
          { keyword: /arrived/i, status: "Arrived"},
          { keyword: /scheduled/i, status: "Scheduled"},
        ];
        for (const sk of statusKeywords) {
          if (sk.keyword.test(response.text)) return { status: sk.status, details: "Could not parse full details." };
        }
      }
      return { status: 'Unknown', details: "Failed to parse flight status from AI." };
    }

  } catch (error) {
    console.error("Error fetching flight status with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("Invalid API Key for flight status. Please check your API_KEY environment variable.");
    }
    return { status: 'Unknown', details: error instanceof Error ? error.message : "Failed to fetch flight status." };
  }
};

export const fetchPopularTouristSpots = async (destinationName: string): Promise<TouristAttraction[]> => {
  if (!ai) {
    console.warn("Gemini API not initialized. Returning mock tourist spots.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { name: `Mock Spot 1 in ${destinationName}`, description: `A very famous mock place in ${destinationName}, known for its mockish charm.` },
      { name: `Mock Landmark 2 for ${destinationName}`, description: `Another must-see mock attraction. Offers great mock views of ${destinationName}.` },
      { name: `The Great Mock Exhibit of ${destinationName}`, description: `Experience the rich mock history of ${destinationName} at this unique exhibit.` },
    ];
  }

  const prompt = `
    List 5-7 popular tourist attractions in ${destinationName}.
    Provide the output as a JSON array of objects. Each object MUST have "name" (string) and "description" (string, 1-2 sentences) keys.
    Optionally, if you can find a relevant and publicly accessible direct image URL (e.g., from Wikimedia Commons, Unsplash, Pexels with permissive licenses), include an "imageUrl" (string) key. If no suitable URL, omit this key or set its value to null.
    Example:
    [
      {"name": "Eiffel Tower", "description": "Iconic wrought-iron lattice tower located on the Champ de Mars in Paris.", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg"},
      {"name": "Louvre Museum", "description": "The world's largest art museum and a historic monument in Paris."}
    ]
    Output ONLY the JSON array. Do not include any other text, markdown, or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => 
        typeof item.name === 'string' && 
        typeof item.description === 'string' &&
        (typeof item.imageUrl === 'string' || typeof item.imageUrl === 'undefined' || item.imageUrl === null)
      )) {
        return parsedData.map(item => ({...item, imageUrl: item.imageUrl || undefined})) as TouristAttraction[];
      } else {
        console.warn("Tourist spots from AI was not in the expected JSON array format. Received:", parsedData, "Cleaned string:", jsonStr);
        throw new Error("AI returned data in an unexpected format for tourist spots.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response for tourist spots:", e, "Raw response:", response.text, "Cleaned string:", jsonStr);
      throw new Error("Failed to parse tourist spots from AI.");
    }

  } catch (error) {
    console.error(`Error fetching tourist spots for ${destinationName} with Gemini:`, error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error(`Invalid API Key. Please check your API_KEY environment variable when fetching tourist spots for ${destinationName}.`);
    }
    throw new Error(error instanceof Error ? error.message : `Failed to fetch tourist spots for ${destinationName}. The AI might be busy or the request timed out.`);
  }
};

export const fetchPlaceSuggestions = async (destination: string): Promise<PlaceSuggestion[]> => {
  console.warn("geminiService.fetchPlaceSuggestions is called, but it relies on Google Maps API which is stubbed. Returning empty array. Destination:", destination);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API delay
  return []; // Return empty array as Google Maps API is stubbed
};

// Mock function to simulate generating an image URL for an event
export const generateEventImageMock = async (activity: string, location?: string): Promise<string> => {
  console.log(`Mock generating image for: ${activity}${location ? ` in ${location}` : ''}`);
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API call delay
  
  // Simple logic to return a somewhat relevant placeholder based on keywords
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("museum") || lowerActivity.includes("art")) return "https://images.unsplash.com/photo-1567954968760-9708a753893b?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("eiffel tower")) return "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("beach") || lowerActivity.includes("coast") || lowerActivity.includes("sea")) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("food") || lowerActivity.includes("dinner") || lowerActivity.includes("lunch") || lowerActivity.includes("breakfast") || lowerActivity.includes("restaurant") || lowerActivity.includes("cafe")) return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("park") || lowerActivity.includes("garden")) return "https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("hike") || lowerActivity.includes("mountain") || lowerActivity.includes("trail")) return "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("flight") || lowerActivity.includes("airport")) return "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=400&auto=format&fit=crop";
  if (lowerActivity.includes("train") || lowerActivity.includes("station")) return "https://images.unsplash.com/photo-1505839420434-870960a3189e?q=80&w=400&auto=format&fit=crop";


  // Generic fallback
  return "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=400&auto=format&fit=crop"; 
};