'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isAvailable: boolean;
}

interface RoomDetailsProps {
  selectedRoom: string;
  events: Event[];
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({ selectedRoom, events }) => {
  // If no specific room is selected or "all" is selected, show a message
  if (!selectedRoom || selectedRoom === 'all') {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 mt-4">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-lg text-gray-600 font-medium">Select a room to view details</p>
          <p className="text-sm text-gray-500 mt-2">Room availability and booking information will appear here</p>
        </div>
      </div>
    );
  }

  // Calculate room-specific information
  const roomData = useMemo(() => {
    // Filter events for the selected room
    const roomEvents = events.filter(event => event.room === selectedRoom);
    
    // Sort events by start time
    const sortedEvents = [...roomEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Current time
    const now = new Date();
    
    // Find if the room is currently occupied
    const currentEvent = roomEvents.find(event => {
      return now >= event.start && now <= event.end && !event.isAvailable;
    });
    
    // Is the room available right now?
    const isCurrentlyAvailable = !currentEvent;
    
    // Get upcoming bookings (non-available events)
    const upcomingBookings = sortedEvents.filter(event => 
      !event.isAvailable && event.end > now
    ).slice(0, 5); // Only show next 5 bookings
    
    // Get upcoming availability windows
    const upcomingAvailability = sortedEvents.filter(event => 
      event.isAvailable && event.end > now
    ).slice(0, 5); // Only show next 5 availability windows
    
    // Calculate total available hours today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAvailableEvents = roomEvents.filter(event => 
      event.isAvailable && 
      event.start >= todayStart && 
      event.end <= todayEnd
    );
    
    const totalAvailableMinutesToday = todayAvailableEvents.reduce((total, event) => {
      const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
      return total + duration;
    }, 0);
    
    const availableHoursToday = Math.floor(totalAvailableMinutesToday / 60);
    const availableMinutesToday = Math.round(totalAvailableMinutesToday % 60);
    
    // Extract room number (assuming format "Room XXX")
    const roomNumber = selectedRoom.replace(/Room\s+/i, '');

    // Get floor number from first digit
    const floorNumber = roomNumber.charAt(0);
    
    return {
      roomNumber,
      floorNumber,
      isCurrentlyAvailable,
      currentEvent,
      upcomingBookings,
      upcomingAvailability,
      availableHoursToday,
      availableMinutesToday
    };
  }, [selectedRoom, events]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-4">
      {/* Room header */}
      <div className={`p-4 ${roomData.isCurrentlyAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
        <h2 className="text-xl text-white font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Room {roomData.roomNumber}
        </h2>
        <p className="text-white opacity-90 mt-1">Floor {roomData.floorNumber}</p>
      </div>
      
      {/* Current status */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-2">Current Status</h3>
        <div className={`py-2 px-3 rounded-md font-medium ${
          roomData.isCurrentlyAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {roomData.isCurrentlyAvailable 
            ? 'Available Now' 
            : `Booked: ${roomData.currentEvent?.title.replace('Booked: ', '')}`
          }
        </div>
        
        {!roomData.isCurrentlyAvailable && roomData.currentEvent && (
          <div className="mt-2 text-sm text-gray-600">
            Until {format(roomData.currentEvent.end, 'h:mm a')}
          </div>
        )}
      </div>
      
      {/* Availability summary */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-2">Today's Availability</h3>
        <div className="text-gray-700">
          {roomData.availableHoursToday > 0 || roomData.availableMinutesToday > 0 ? (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Available for <span className="font-medium">
                  {roomData.availableHoursToday} hour{roomData.availableHoursToday !== 1 ? 's' : ''}
                  {roomData.availableMinutesToday > 0 ? ` ${roomData.availableMinutesToday} min` : ''}
                </span> today
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No more availability today</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Next available times */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-2">Next Available Times</h3>
        {roomData.upcomingAvailability.length > 0 ? (
          <ul className="space-y-2">
            {roomData.upcomingAvailability.map(event => (
              <li key={event.id} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">
                  {format(event.start, 'EEE, MMM d')} • {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No upcoming availability</p>
        )}
      </div>
      
      {/* Upcoming bookings */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">Upcoming Bookings</h3>
        {roomData.upcomingBookings.length > 0 ? (
          <ul className="space-y-3">
            {roomData.upcomingBookings.map(booking => (
              <li key={booking.id} className="border-l-4 border-red-400 pl-3 py-1">
                <div className="font-medium text-gray-800">
                  {booking.title.replace('Booked: ', '')}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(booking.start, 'EEE, MMM d')}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {format(booking.start, 'h:mm a')} - {format(booking.end, 'h:mm a')}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No upcoming bookings</p>
        )}
      </div>
    </div>
  );
}; 