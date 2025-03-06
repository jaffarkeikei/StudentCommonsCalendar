import axios from 'axios';
import ICAL from 'ical.js';

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
 */
export const fetchCalendarData = async (): Promise<Event[]> => {
  try {
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
    
    // Convert to our event format
    const events = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      
      const title = event.summary || 'Untitled Event';
      
      // Extract room name from the event title if possible
      // Assuming format like "Room 214 - Meeting" or similar
      let room = 'Unknown Room';
      const roomMatch = title.match(/Room\s+(\w+)/i);
      if (roomMatch && roomMatch[1]) {
        room = `Room ${roomMatch[1]}`;
      }
      
      return {
        id: event.uid,
        title: title,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        room: room,
        isBooked: true // All events from the calendar are booked events
      };
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    throw new Error('Failed to fetch calendar data');
  }
}; 