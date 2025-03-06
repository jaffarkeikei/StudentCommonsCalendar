import { addDays, format, isSameDay, parseISO } from 'date-fns';

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
 * Group rooms by floor or pattern to create a more intuitive view
 */
const groupRoomsByCategory = (rooms: string[]): { [category: string]: string[] } => {
  const floorGroups: { [floor: string]: string[] } = {};
  
  rooms.forEach(room => {
    // Extract floor number from room name (assuming pattern like "Room 214" where 2 is the floor)
    const floorMatch = room.match(/Room\s+(\d)(\d+)/i);
    if (floorMatch && floorMatch[1]) {
      const floor = `Floor ${floorMatch[1]}`;
      if (!floorGroups[floor]) {
        floorGroups[floor] = [];
      }
      floorGroups[floor].push(room);
    } else {
      // If we can't determine floor, put in "Other" category
      if (!floorGroups['Other']) {
        floorGroups['Other'] = [];
      }
      floorGroups['Other'].push(room);
    }
  });
  
  return floorGroups;
};

/**
 * Process booked events to generate available time slots
 * with improved grouping and display
 */
export const processEvents = (bookedEvents: BookedEvent[]): ProcessEventsResult => {
  // Log incoming events for debugging
  console.log(`Processing ${bookedEvents.length} booked events`);
  
  // Look for Room 538 events
  const room538Events = bookedEvents.filter(event => event.room === 'Room 538');
  console.log(`Found ${room538Events.length} events for Room 538 in input`);
  
  // Check for March 6 events specifically
  const march6Events = bookedEvents.filter(event => 
    event.start.getMonth() === 2 && // JavaScript months are 0-indexed, so March is 2
    event.start.getDate() === 6
  );
  console.log(`Found ${march6Events.length} events for March 6`);
  
  // Log the March 6 Room 538 events in detail
  const march6Room538Events = bookedEvents.filter(event => 
    event.room === 'Room 538' && 
    event.start.getMonth() === 2 && 
    event.start.getDate() === 6
  );
  console.log('March 6 Room 538 events:', march6Room538Events);
  
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For each room, generate available time slots
  rooms.forEach((room) => {
    // For each day in the next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const currentDay = addDays(today, dayOffset);
      
      // Identify March 6 specifically for logging
      const isMarch6 = currentDay.getMonth() === 2 && currentDay.getDate() === 6;
      
      // Create a sorted array of booked periods for this room and day
      const bookedPeriodsForDay = bookedEvents
        .filter(event => 
          event.room === room && 
          (isSameDay(event.start, currentDay) || 
          isSameDay(event.end, currentDay))
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      
      // Special logging for March 6 and Room 538
      if (isMarch6 && room === 'Room 538') {
        console.log(`Processing March 6 for Room 538. Found ${bookedPeriodsForDay.length} bookings:`);
        console.log(bookedPeriodsForDay);
      }
      
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
        
        if (isMarch6 && room === 'Room 538') {
          console.log('Created full-day available slot for Room 538 on March 6');
        }
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
            
            if (isMarch6 && room === 'Room 538') {
              console.log(`Created available slot for Room 538 on March 6: ${lastEndTime.toTimeString()} - ${bookedEvent.start.toTimeString()}`);
            }
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
          
          if (isMarch6 && room === 'Room 538') {
            console.log(`Added booked event for Room 538 on March 6: ${bookedEvent.start.toTimeString()} - ${bookedEvent.end.toTimeString()}`);
          }
          
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
          
          if (isMarch6 && room === 'Room 538') {
            console.log(`Created available slot for Room 538 on March 6 after last booking: ${lastEndTime.toTimeString()} - ${dayEnd.toTimeString()}`);
          }
        }
      }
    }
  });
  
  // Find and log all events for Room 538 for debugging
  const room538ProcessedEvents = availableEvents.filter(event => event.room === 'Room 538');
  console.log(`Generated ${room538ProcessedEvents.length} events for Room 538 (available + booked)`);
  
  const room538BookedEvents = room538ProcessedEvents.filter(event => !event.isAvailable);
  console.log(`Generated ${room538BookedEvents.length} BOOKED events for Room 538`);
  
  // Log all March 6 events
  const march6ProcessedEvents = availableEvents.filter(event => 
    event.start.getMonth() === 2 && event.start.getDate() === 6
  );
  console.log(`Generated ${march6ProcessedEvents.length} events for March 6 (all rooms, available + booked)`);
  
  // Log diagnostic information
  console.log(`Total events processed: ${availableEvents.length}`);
  console.log(`Available events: ${availableEvents.filter(e => e.isAvailable).length}`);
  console.log(`Booked events: ${availableEvents.filter(e => !e.isAvailable).length}`);
  
  // Group the rooms by floor for better filtering UI
  const roomGroups = groupRoomsByCategory(rooms);
  
  return {
    availableRoomEvents: availableEvents,
    roomsList: rooms
  };
}; 