'use client';

import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
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
    const style = {
      backgroundColor: event.isAvailable ? '#10B981' : '#EF4444', // green for available, red for booked
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    
    return {
      style,
      className: event.isAvailable ? 'available' : 'booked',
    };
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
        views={['month', 'week', 'day']}
        defaultView="week"
        tooltipAccessor={(event) => `${event.title} - ${event.room}`}
        popup
        onSelectEvent={(event) => {
          console.log('Selected event:', event);
          // You could add additional functionality here, like showing a modal with event details
        }}
      />
    </div>
  );
}; 