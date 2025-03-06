import { addDays, format, isSameDay, parseISO, differenceInDays } from 'date-fns';

// Define the interfaces for our events
export interface BookedEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isBooked: boolean;
}

export interface AvailableEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isAvailable: boolean;
}

export interface ProcessEventsResult {
  availableRoomEvents: AvailableEvent[];
  roomsList: string[];
}

// Define the operating hours of the Student Commons
const OPENING_HOUR = 9; // 9 AM
const CLOSING_HOUR = 21; // 9 PM

/**
 * Group rooms by floor or pattern to create a more intuitive view
 */
const groupRoomsByCategory = (rooms: string[]): { [category: string]: string[] } => {
  const floorGroups: { [floor: string]: string[] } = {};
  
  // Initialize floor groups 1-5
  for (let i = 1; i <= 5; i++) {
    floorGroups[`Floor ${i}`] = [];
  }
  
  // Ensure "Other" category exists
  floorGroups['Other'] = [];
  
  rooms.forEach(room => {
    // Extract floor number from room name (assuming pattern like "Room 214" where 2 is the floor)
    const floorMatch = room.match(/Room\s+(\d)(\d+)/i);
    if (floorMatch && floorMatch[1]) {
      const floorNumber = parseInt(floorMatch[1]);
      // Only floors 1-5 exist, other rooms go to "Other"
      if (floorNumber >= 1 && floorNumber <= 5) {
        const floor = `Floor ${floorNumber}`;
        floorGroups[floor].push(room);
      } else {
        floorGroups['Other'].push(room);
      }
    } else {
      // If we can't determine floor, put in "Other" category
      floorGroups['Other'].push(room);
    }
  });
  
  // Remove empty floor categories
  Object.keys(floorGroups).forEach(floor => {
    if (floorGroups[floor].length === 0) {
      delete floorGroups[floor];
    }
  });
  
  return floorGroups;
};

/**
 * Process booked events to generate available time slots
 * with improved grouping and display
 * @param bookedEvents The booked events from the calendar
 * @param startDate Optional start date to limit the range (defaults to today)
 * @param endDate Optional end date to limit the range (defaults to 7 days from start)
 */
export const processEvents = (
  bookedEvents: BookedEvent[], 
  startDate?: Date, 
  endDate?: Date
): ProcessEventsResult => {
  // Log incoming events for debugging
  console.log(`Processing ${bookedEvents.length} booked events`);
  
  // Set default date range if not provided
  const start = startDate || new Date();
  // Reset time to start of day
  start.setHours(0, 0, 0, 0);
  
  const end = endDate || addDays(start, 7);
  // Reset time to end of day
  end.setHours(23, 59, 59, 999);
  
  console.log(`Generating available slots from ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);
  
  // Calculate number of days in the range
  const dayCount = differenceInDays(end, start) + 1;
  
  // Extract unique rooms from the booked events
  const uniqueRooms = Array.from(new Set(bookedEvents.map((event) => event.room)))
    .filter(room => room !== 'Unknown Room');
  
  // If no rooms are found in events, define some default rooms
  const rooms = uniqueRooms.length > 0 
    ? uniqueRooms 
    : ['Room 214', 'Room 215', 'Room 216', 'Room 217', 'Room 218', 'Room 313', 'Room 314', 'Room 315'];
  
  // Sort rooms by room number
  rooms.sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, ''));
    const bNum = parseInt(b.replace(/\D/g, ''));
    return aNum - bNum;
  });
  
  console.log('Unique rooms found:', rooms);
  
  // New approach: Create contiguous blocks of availability
  const availableEvents: AvailableEvent[] = [];

  // For each room, generate available time slots
  rooms.forEach((room) => {
    // For each day in the specified range
    for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
      const currentDay = addDays(start, dayOffset);
      
      // Create a sorted array of booked periods for this room and day
      const bookedPeriodsForDay = bookedEvents
        .filter(event => 
          event.room === room && 
          (isSameDay(event.start, currentDay) || 
          isSameDay(event.end, currentDay))
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      
      // If there are no bookings, create one full-day available slot
      if (bookedPeriodsForDay.length === 0) {
        const dayStart = new Date(currentDay);
        dayStart.setHours(OPENING_HOUR, 0, 0, 0);
        
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(CLOSING_HOUR, 0, 0, 0);
        
        availableEvents.push({
          id: `available_${room}_${dayStart.toISOString()}`,
          title: `${room}`,
          start: dayStart,
          end: dayEnd,
          room: room,
          isAvailable: true
        });
      } else {
        // There are some bookings - create available slots around them
        let lastEndTime = new Date(currentDay);
        lastEndTime.setHours(OPENING_HOUR, 0, 0, 0);
        
        // Process each booked period
        for (const bookedEvent of bookedPeriodsForDay) {
          // If there's a gap between last end time and this booking's start,
          // that's an available period
          if (lastEndTime < bookedEvent.start) {
            availableEvents.push({
              id: `available_${room}_${lastEndTime.toISOString()}`,
              title: `${room}`,
              start: lastEndTime,
              end: new Date(bookedEvent.start),
              room: room,
              isAvailable: true
            });
          }
          
          // Add the booked event with isAvailable: false
          availableEvents.push({
            id: bookedEvent.id,
            title: bookedEvent.title,
            start: bookedEvent.start,
            end: bookedEvent.end,
            room: bookedEvent.room,
            isAvailable: false
          });
          
          // Update last end time
          lastEndTime = new Date(bookedEvent.end);
        }
        
        // Check if there's available time after the last booking until closing
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(CLOSING_HOUR, 0, 0, 0);
        
        if (lastEndTime < dayEnd) {
          availableEvents.push({
            id: `available_${room}_${lastEndTime.toISOString()}`,
            title: `${room}`,
            start: lastEndTime,
            end: dayEnd,
            room: room,
            isAvailable: true
          });
        }
      }
    }
  });
  
  // Log diagnostic information
  console.log(`Total events processed: ${availableEvents.length}`);
  console.log(`Available events: ${availableEvents.filter(e => e.isAvailable).length}`);
  console.log(`Booked events: ${availableEvents.filter(e => !e.isAvailable).length}`);
  
  // Group the rooms by floor for better filtering UI
  const roomGroups = groupRoomsByCategory(rooms);
  
  console.log('Room groupings:', roomGroups);
  
  return {
    availableRoomEvents: availableEvents,
    roomsList: rooms
  };
}; 