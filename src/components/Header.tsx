'use client';

import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-800">Student Commons Room Availability</h1>
      <p className="text-gray-600 mt-2">
        Find and book available rooms at the Student Commons
      </p>
      <div className="flex mt-4 text-sm">
        <div className="flex items-center mr-6">
          <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
          <span>Booked</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 