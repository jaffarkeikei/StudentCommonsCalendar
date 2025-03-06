'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { RoomFilter } from '../components/RoomFilter';
import { RoomDetails } from '../components/RoomDetails';
import { fetchCalendarData } from '../utils/calendarApi';
import { processEvents } from '../utils/eventProcessor';
import Header from '../components/Header';
import { format, addDays } from 'date-fns';

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
  const [currentDateRange, setCurrentDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: new Date()
  });

  // Initialize the date range to the current week
  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    
    // Start of week (Sunday)
    start.setDate(start.getDate() - start.getDay());
    // End of week (Saturday)
    end.setDate(end.getDate() + (6 - end.getDay()));
    
    // Set hours to beginning and end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    setCurrentDateRange({ start, end });
  }, []);

  // Load calendar data whenever the date range changes
  useEffect(() => {
    if (currentDateRange.start && currentDateRange.end) {
      loadCalendarData(currentDateRange.start, currentDateRange.end);
    }
  }, [currentDateRange]);

  // Load calendar data
  const loadCalendarData = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      console.log(`Loading calendar data for ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);
      
      // Fetch events from Google Calendar
      const events = await fetchCalendarData(start, end);
      
      // Process events to generate available time slots
      const { availableRoomEvents, roomsList } = processEvents(events, start, end);
      
      setAvailableEvents(availableRoomEvents);
      setRooms(roomsList);
      setLastUpdated(new Date());
      setFormattedDate(formatDate(new Date()));
      
      // If a room is selected, filter events for that room
      if (selectedRoom !== 'all') {
        setFilteredEvents(availableRoomEvents.filter(event => event.room === selectedRoom));
      } else {
        setFilteredEvents(availableRoomEvents);
      }
      
      setError('');
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Failed to load calendar data. Please try again later.');
      
      // Retry after a delay
      setTimeout(() => {
        if (loading) {
          loadCalendarData(start, end);
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change from calendar
  const handleDateRangeChange = (start: Date, end: Date) => {
    console.log(`Date range changed: ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);
    setCurrentDateRange({ start, end });
  };

  // Handle room filter change
  const handleRoomFilter = (room: string) => {
    setSelectedRoom(room);
    
    if (room === 'all') {
      console.log('Showing all rooms');
      setFilteredEvents(availableEvents);
    } else {
      console.log(`Filtering for room: ${room}`);
      const roomEvents = availableEvents.filter(event => event.room === room);
      setFilteredEvents(roomEvents);
    }
  };

  // Calculate statistics
  const availableCount = filteredEvents.filter(event => event.isAvailable).length;
  const bookedCount = filteredEvents.filter(event => !event.isAvailable).length;
  const totalCount = filteredEvents.length;
  
  // Format date range for display
  const dateRangeDisplay = currentDateRange.start && currentDateRange.end
    ? `${format(currentDateRange.start, 'MMM d')} - ${format(currentDateRange.end, 'MMM d, yyyy')}`
    : 'Loading...';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Commons Room Availability</h1>
          <p className="text-gray-600 mt-2">
            Find available rooms and check the schedule for the Student Commons.
          </p>
          
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formattedDate}
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with room filter */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Filter by Room</h2>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-40 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <RoomFilter 
                  rooms={rooms} 
                  selectedRoom={selectedRoom} 
                  onSelectRoom={handleRoomFilter} 
                />
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2">Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Range:</span>
                    <span className="font-medium">{dateRangeDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Slots:</span>
                    <span className="font-medium text-green-600">{availableCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booked Slots:</span>
                    <span className="font-medium text-red-600">{bookedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Events:</span>
                    <span className="font-medium">{totalCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            {/* Calendar view */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <Calendar 
                  events={filteredEvents} 
                  onDateRangeChange={handleDateRangeChange}
                />
              )}
            </div>
            
            {/* Room details when a specific room is selected */}
            {selectedRoom !== 'all' && (
              <RoomDetails 
                selectedRoom={selectedRoom} 
                events={availableEvents} 
              />
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Student Commons Calendar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 