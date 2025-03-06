'use client';

import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md rounded-lg p-6 mb-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Commons Room Availability</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Find available rooms at the Student Commons. The calendar shows when rooms are free (green) or booked (red).
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded bg-green-500 mr-2"></div>
            <span className="text-sm">Available Room</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-red-500 mr-2"></div>
            <span className="text-sm">Booked Room</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <span>Data from UTSU Student Commons Calendar</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 