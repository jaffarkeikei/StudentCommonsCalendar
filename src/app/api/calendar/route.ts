import { NextResponse } from 'next/server';
import axios from 'axios';

const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/utsu.ca_rnd3a7qonjovajo4obnomj5iq0%40group.calendar.google.com/public/basic.ics';

export async function GET() {
  try {
    // Fetch the iCal data from the server side
    const response = await axios.get(CALENDAR_URL);
    const icalData = response.data;
    
    // Return the raw iCal data to be processed on the client
    return NextResponse.json({ success: true, data: icalData });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
} 