import { NextResponse } from 'next/server';
import ICAL from 'ical.js';

export async function GET() {
  try {
    // Check if ICAL is properly imported
    const icalVersion = ICAL.VERSION || 'Unknown version';
    
    return NextResponse.json({
      status: 'success',
      ical: {
        loaded: true,
        version: icalVersion
      }
    });
  } catch (error) {
    console.error('Error checking ICAL library:', error);
    return NextResponse.json({
      status: 'error',
      ical: {
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
} 