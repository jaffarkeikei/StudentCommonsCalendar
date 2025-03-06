import { addDays } from 'date-fns';

interface BookedEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isBooked: boolean;
}

interface AvailableEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isAvailable: boolean;
}

interface ProcessEventsResult {
  availableRoomEvents: AvailableEvent[];
  roomsList: string[];
}

// Define the operating hours of the Student Commons
const OPENING_HOUR = 9; // 9 AM
const CLOSING_HOUR = 21; // 9 PM

/**
 * Process booked events to generate available time slots
 */
export const processEvents = (bookedEvents: BookedEvent[]): ProcessEventsResult => {
  // Extract unique rooms from the booked events
  const uniqueRooms = Array.from(new Set(bookedEvents.map((event) => event.room)));
  
  // If no rooms are found in events, define some default rooms
  const rooms = uniqueRooms.length > 0 
    ? uniqueRooms 
    : ['Room 214', 'Room 215', 'Room 216', 'Room 217', 'Room 218'];
  
  // Generate available time slots for the next 14 days
  const availableEvents: AvailableEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For each room, generate available time slots
  rooms.forEach((room) => {
    // For each day in the next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const currentDay = addDays(today, dayOffset);
      
      // Create slots for each hour during operating hours
      for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        
        // Check if this time slot is already booked
        const isBooked = bookedEvents.some((bookedEvent) => {
          return (
            bookedEvent.room === room &&
            bookedEvent.start < slotEnd &&
            bookedEvent.end > slotStart
          );
        });
        
        // If not booked, add it as an available slot
        if (!isBooked) {
          availableEvents.push({
            id: `available_${room}_${slotStart.toISOString()}`,
            title: `Available: ${room}`,
            start: slotStart,
            end: slotEnd,
            room: room,
            isAvailable: true
          });
        } else {
          // Optionally, you can also add booked events to show them in the calendar
          // with a different color (this is handled in the Calendar component)
          const bookedEvent = bookedEvents.find(
            (event) => event.room === room && event.start < slotEnd && event.end > slotStart
          );
          
          if (bookedEvent) {
            availableEvents.push({
              id: bookedEvent.id,
              title: `Booked: ${bookedEvent.title}`,
              start: bookedEvent.start,
              end: bookedEvent.end,
              room: bookedEvent.room,
              isAvailable: false
            });
          }
        }
      }
    }
  });
  
  return {
    availableRoomEvents: availableEvents,
    roomsList: rooms
  };
}; 