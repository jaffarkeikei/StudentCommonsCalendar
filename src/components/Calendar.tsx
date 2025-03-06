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
    // For available rooms, just show a green block with no text
    // For booked rooms, show a red block with the booking info
    const style = {
      backgroundColor: event.isAvailable ? '#10B981' : '#EF4444', // green for available, red for booked
      borderRadius: '4px',
      opacity: 0.85,
      color: 'white',
      border: '0px',
      display: 'block',
      overflow: 'hidden',
      // If it's an available slot, make the title smaller/invisible 
      fontSize: event.isAvailable ? '0px' : '14px',
      // Simplify content for available slots
      paddingTop: event.isAvailable ? '0' : '2px'
    };
    
    return {
      style,
      className: event.isAvailable ? 'available' : 'booked',
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