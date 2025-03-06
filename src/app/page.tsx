'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { RoomFilter } from '../components/RoomFilter';
import { RoomDetails } from '../components/RoomDetails';
import { fetchCalendarData } from '../utils/calendarApi';
import { processEvents } from '../utils/eventProcessor';
import Header from '../components/Header';
import { format } from 'date-fns';

// Function to format date consistently between server and client
const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd, h:mm a');
};

// Define event type
interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isAvailable: boolean;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [rooms, setRooms] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch events data from the Google Calendar
        const eventsData = await fetchCalendarData();
        
        if (!eventsData || eventsData.length === 0) {
          throw new Error('No events found in the calendar');
        }
        
        console.log('Fetched events:', eventsData.length);
        
        // Process the events to determine available rooms
        const { availableRoomEvents, roomsList } = processEvents(eventsData);
        
        console.log('Available room events:', availableRoomEvents.length);
        console.log('Rooms list:', roomsList);
        
        const now = new Date();
        setAvailableEvents(availableRoomEvents);
        setFilteredEvents(availableRoomEvents);
        setRooms(roomsList);
        setLastUpdated(now);
        setFormattedDate(formatDate(now));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
        setError('Failed to load calendar data. Please try again later.');
        setLoading(false);
      }
    };

    loadCalendarData();
  }, []);

  // Filter events based on selected room
  const handleRoomFilter = (room: string) => {
    setSelectedRoom(room);
    
    if (room === 'all') {
      setFilteredEvents(availableEvents);
    } else {
      const filtered = availableEvents.filter((event) => 
        event.room === room
      );
      setFilteredEvents(filtered);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError('');
    // Trigger a re-fetch of the calendar data
    const loadCalendarData = async () => {
      try {
        const eventsData = await fetchCalendarData();
        const { availableRoomEvents, roomsList } = processEvents(eventsData);
        
        const now = new Date();
        setAvailableEvents(availableRoomEvents);
        setFilteredEvents(availableRoomEvents);
        setRooms(roomsList);
        setLastUpdated(now);
        setFormattedDate(formatDate(now));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load calendar data on retry:', err);
        setError('Failed to load calendar data. Please try again later.');
        setLoading(false);
      }
    };

    loadCalendarData();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Header />
      
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          <div className="mt-3">
            <button 
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Retry Loading Calendar
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white shadow-md rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="mt-4 text-lg text-gray-600">Loading available rooms...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <RoomFilter 
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={handleRoomFilter}
            />
            
            <RoomDetails
              selectedRoom={selectedRoom}
              events={availableEvents}
            />
            
            <div className="bg-white shadow-md rounded-lg p-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Stats</h3>
              <div className="text-sm">
                <p className="mb-1">Total Available Slots: <span className="font-medium">{availableEvents.filter((e) => e.isAvailable).length}</span></p>
                <p className="mb-1">Total Rooms: <span className="font-medium">{rooms.length}</span></p>
                <p className="mb-1">Filtered Results: <span className="font-medium">{filteredEvents.length}</span></p>
                {formattedDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {formattedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:w-3/4">
            <Calendar events={filteredEvents} />
          </div>
        </div>
      )}
    </div>
  );
} 