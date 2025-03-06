'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { RoomFilter } from '../components/RoomFilter';
import { fetchCalendarData } from '../utils/calendarApi';
import { processEvents } from '../utils/eventProcessor';
import Header from '../components/Header';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

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
        
        setAvailableEvents(availableRoomEvents);
        setFilteredEvents(availableRoomEvents);
        setRooms(roomsList);
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
      const filtered = availableEvents.filter((event: any) => 
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
        
        setAvailableEvents(availableRoomEvents);
        setFilteredEvents(availableRoomEvents);
        setRooms(roomsList);
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
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="my-8">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <div className="mt-2">
              <button 
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Loading calendar data...</span>
          </div>
        ) : (
          <>
            <RoomFilter 
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={handleRoomFilter}
            />
            
            <div className="mt-6">
              <Calendar events={filteredEvents} />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 