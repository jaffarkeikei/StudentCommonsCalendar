'use client';

import React from 'react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer
const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  isAvailable: boolean;
}

interface CalendarProps {
  events: Event[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  // Custom event styling
  const eventStyleGetter = (event: Event) => {
    // For available rooms, use a seamless green background
    // For booked rooms, show a contrasting red
    const style = {
      backgroundColor: event.isAvailable ? '#10B981' : '#EF4444', 
      opacity: event.isAvailable ? 0.8 : 0.9,
      color: 'white',
      border: event.isAvailable ? 'none' : '1px solid #DC2626',
      borderRadius: event.isAvailable ? '0' : '4px',
      display: 'block',
      overflow: 'hidden',
      fontSize: event.isAvailable ? '0px' : '14px',
      paddingTop: event.isAvailable ? '0' : '2px',
      // Remove margin to create seamless appearance
      margin: event.isAvailable ? '0' : '1px',
    };
    
    return {
      style,
      className: event.isAvailable ? 'available-slot' : 'booked-slot',
    };
  };

  // Custom component to display event content
  const EventComponent = ({ event }: { event: Event }) => {
    if (event.isAvailable) {
      // For available rooms, just show a subtle indicator
      return <div className="h-full w-full"></div>;
    }
    
    // For booked rooms, show the title and room
    return (
      <div className="p-1">
        <div className="font-bold">{event.room}</div>
        <div className="text-xs">{event.title.replace('Booked: ', '')}</div>
      </div>
    );
  };

  if (!events || events.length === 0) {
    return (
      <div className="h-[700px] bg-white shadow-md rounded-lg p-4 flex justify-center items-center">
        <div className="text-center text-gray-500">
          <p className="text-xl font-semibold mb-2">No events available</p>
          <p>There are no room events to display at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[700px] bg-white shadow-md rounded-lg p-4">
      <style jsx global>{`
        /* Custom styles to make available blocks seamless */
        .rbc-event.available-slot {
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
        }
        
        /* Remove border between time slots */
        .rbc-time-content, .rbc-time-column {
          border: none !important;
        }
        
        .rbc-time-content > * + * > * {
          border-left: none !important;
        }
        
        /* Make row borders lighter */
        .rbc-time-slot {
          border-top: 1px solid rgba(220, 220, 220, 0.3) !important;
        }
        
        /* Custom styles for booked rooms */
        .rbc-event.booked-slot {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        
        /* Improve time labels */
        .rbc-time-gutter .rbc-label {
          font-weight: 500;
          color: #555;
        }
        
        /* Better day headers */
        .rbc-header {
          padding: 10px;
          font-weight: 600;
          background-color: #f9fafb;
        }
      `}</style>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        views={['week', 'day', 'agenda']}
        defaultView="week"
        tooltipAccessor={(event) => 
          event.isAvailable 
            ? `Available: ${event.room}` 
            : `Booked: ${event.title.replace('Booked: ', '')}`
        }
        components={{
          event: EventComponent as any
        }}
        popup
        dayLayoutAlgorithm="no-overlap"
        min={new Date(new Date().setHours(8, 0, 0, 0))} // Calendar starts at 8 AM
        max={new Date(new Date().setHours(22, 0, 0, 0))} // Calendar ends at 10 PM
      />
    </div>
  );
}; 