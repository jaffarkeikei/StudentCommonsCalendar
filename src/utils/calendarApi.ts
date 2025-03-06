import axios from 'axios';
import ICAL from 'ical.js';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isBooked: boolean;
}

/**
 * Fetches calendar data from Google Calendar in iCal format
 * and parses it into an array of events
 * @param start Optional start date to filter events (inclusive)
 * @param end Optional end date to filter events (inclusive)
 */
export const fetchCalendarData = async (start?: Date, end?: Date): Promise<Event[]> => {
  try {
    // Log the date range if provided
    if (start && end) {
      console.log(`Fetching calendar data from ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);
    }
    
    // Fetch the iCal data from our API route
    const response = await axios.get('/api/calendar');
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch calendar data');
    }
    
    const icalData = response.data.data;
    
    // Parse the iCal data
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    console.log(`Found ${vevents.length} events in the calendar`);
    
    // Convert to our event format
    let events = vevents.map((vevent: any) => {
      const event = new ICAL.Event(vevent);
      
      const title = event.summary || 'Untitled Event';
      const description = event.description || '';
      const location = event.location || '';
      
      // Log raw event data for debugging
      console.log('RAW EVENT:', {
        title,
        description,
        location,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate()
      });
      
      // Extract room name from the event title, description, or location
      let room = 'Unknown Room';
      
      // Try to find room in location first - most reliable source
      if (location) {
        const locationRoomMatch = location.match(/(?:Room|Rm)\s*:?\s*(\w+)/i) || 
                                  location.match(/(\d{3})/);
        if (locationRoomMatch && locationRoomMatch[1]) {
          room = `Room ${locationRoomMatch[1]}`;
        }
      }
      
      // If room not found in location, check title
      if (room === 'Unknown Room' && title) {
        const titleRoomMatch = title.match(/(?:Room|Rm)\s*:?\s*(\w+)/i) || 
                              title.match(/(?:\/Rm:|\/Room:|Room|Rm:)\s*(\w+)/i) ||
                              title.match(/\b(\d{3})\b/); // Look for 3-digit room numbers
        if (titleRoomMatch && titleRoomMatch[1]) {
          room = `Room ${titleRoomMatch[1]}`;
        }
      }
      
      // If room still not found, try description
      if (room === 'Unknown Room' && description) {
        const roomRegexes = [
          /(?:Room|Rm)\s*:?\s*(\w+)/i,
          /Space\/Room:\s*(\w+)/i,
          /\b(?:Room|Rm)\s+(\d{3})/i,
          /\bSpace\s+(\d{3})/i,
          /\b(\d{3})\b/ // Look for 3-digit room numbers
        ];
        
        for (const regex of roomRegexes) {
          const match = description.match(regex);
          if (match && match[1]) {
            room = `Room ${match[1]}`;
            break;
          }
        }
      }
      
      const parsedEvent = {
        id: event.uid,
        title: title,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        room: room,
        isBooked: true // All events from the calendar are booked events
      };
      
      // Log the final parsed event
      console.log('PARSED EVENT:', parsedEvent);
      
      return parsedEvent;
    });
    
    // Filter events by date range if provided
    if (start && end) {
      events = events.filter((event: Event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // Include events that overlap with the date range
        // An event overlaps if:
        // - Event starts before or on the end date AND
        // - Event ends on or after the start date
        return eventStart <= end && eventEnd >= start;
      });
      
      console.log(`Filtered to ${events.length} events within the date range`);
    }
    
    // Log summary
    console.log(`Parsed ${events.length} events`);
    
    return events;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    throw new Error('Failed to fetch calendar data');
  }
}; 