'use client';

import React from 'react';

interface RoomFilterProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
}

export const RoomFilter: React.FC<RoomFilterProps> = ({ 
  rooms, 
  selectedRoom, 
  onSelectRoom 
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Filter by Room</h2>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectRoom('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedRoom === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All Rooms
        </button>
        
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => onSelectRoom(room)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedRoom === room
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {room}
          </button>
        ))}
      </div>
    </div>
  );
}; 