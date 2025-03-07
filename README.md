# Student Commons Room Availability Calendar

This application scrapes booking data from the UTSU Student Commons Google Calendar and presents a view of **available** rooms, making it easier to identify when rooms are free to use.

## Features
- Scrapes booking data from the UTSU Student Commons Google Calendar
- Displays a calendar view of available rooms
- Allows filtering by room
- Shows available time slots for each room
- Provides navigation to view different weeks

## Technology Stack
- React.js for the frontend
- Next.js for the application framework
- Node.js for backend data processing
- Google Calendar API integration
- Tailwind CSS for styling

## System Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client Browser                                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            Next.js App                                  │
│                                                                         │
│  ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐  │
│  │                 │     │                  │     │                  │  │
│  │  React UI       │◄────┤  Page Component  │◄────┤  API Route       │  │
│  │  Components     │     │  (Data State)    │     │  (Calendar data) │  │
│  │                 │     │                  │     │                  │  │
│  └────────┬────────┘     └──────┬───────────┘     └────────┬─────────┘  │
│           │                     │                          │            │
│           ▼                     ▼                          ▼            │
│  ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐  │
│  │                 │     │                  │     │                  │  │
│  │  Calendar       │     │  Event           │     │  Calendar API    │  │
│  │  Component      │     │  Processing      │     │  Service         │  │
│  │                 │     │                  │     │                  │  │
│  └─────────────────┘     └──────────────────┘     └──────────────────┘  │
│                                                                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Google Calendar API (External)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### How the Application Works

#### Data Flow

1. **Data Retrieval**:
   - The application fetches iCal data from the UTSU Student Commons Google Calendar through an API route.
   - The API route (`/api/calendar`) acts as a proxy to avoid CORS issues and fetch the calendar data server-side.

2. **Data Processing**:
   - The `calendarApi.ts` service parses the raw iCal data into structured event objects.
   - It extracts room information from event titles, descriptions, and locations using regular expressions.
   - Events are filtered based on the selected date range.

3. **Event Processing**:
   - The `eventProcessor.ts` utility processes booked events to generate availability slots.
   - It identifies periods when rooms are not booked and creates "available" events.
   - Rooms are grouped by floor (1-5) for better organization in the UI.

4. **State Management**:
   - The main page component (`page.tsx`) manages application state, including:
     - Loading status
     - Available events
     - Filtered events (based on room selection)
     - Date range (for calendar navigation)
     - Selected room

5. **User Interface**:
   - The React UI components render the processed data:
     - `Calendar.tsx`: Displays events in a weekly/daily view with navigation
     - `RoomFilter.tsx`: Allows filtering by room, organized by floor
     - `RoomDetails.tsx`: Shows detailed information about a selected room
     - `Header.tsx`: Application header and navigation

#### Key Components

- **Calendar Component**: A wrapper around the React Big Calendar library that displays events and handles date navigation.
- **Room Filter**: Organizes rooms by floor (1-5) and allows users to filter events by specific rooms.
- **Room Details**: Shows the current status and upcoming availability for a selected room.
- **Event Processor**: Converts booked events into a combination of booked and available time slots.

#### Date Range Navigation

- Users can navigate between weeks using the calendar navigation buttons.
- When the date range changes, the application:
  1. Updates the current date range state
  2. Fetches new calendar data for the selected range
  3. Processes events to determine room availability
  4. Updates the UI to display the new data

This architecture ensures that users can easily browse room availability across different time periods and quickly find available spaces in the Student Commons building.

## Setup Instructions
1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at http://localhost:3000

## Data Source
This application uses data from the [UTSU Student Commons Calendar](https://calendar.google.com/calendar/u/0/embed?src=utsu.ca_rnd3a7qonjovajo4obnomj5iq0@group.calendar.google.com&ctz=America/Toronto). 
