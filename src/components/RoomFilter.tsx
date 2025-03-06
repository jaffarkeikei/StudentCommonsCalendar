'use client';

import React, { useState } from 'react';

interface RoomFilterProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
}

// Helper function to group rooms by floor
const groupRoomsByFloor = (rooms: string[]) => {
  const floorGroups: { [floor: string]: string[] } = {};
  
  rooms.forEach(room => {
    // Extract floor number from room name (assuming pattern like "Room 214" where 2 is the floor)
    const floorMatch = room.match(/Room\s+(\d)(\d+)/i);
    if (floorMatch && floorMatch[1]) {
      const floor = `Floor ${floorMatch[1]}`;
      if (!floorGroups[floor]) {
        floorGroups[floor] = [];
      }
      floorGroups[floor].push(room);
    } else {
      // If we can't determine floor, put in "Other" category
      if (!floorGroups['Other']) {
        floorGroups['Other'] = [];
      }
      floorGroups['Other'].push(room);
    }
  });
  
  return floorGroups;
};

export const RoomFilter: React.FC<RoomFilterProps> = ({ 
  rooms, 
  selectedRoom, 
  onSelectRoom 
}) => {
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const roomsByFloor = groupRoomsByFloor(rooms);
  
  // Sort floor groups by floor number
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Filter by Room</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onSelectRoom('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRoom === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All Rooms
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedFloors.map(floor => (
          <div key={floor} className="bg-gray-50 rounded-lg p-2">
            <div 
              className="font-medium text-gray-700 cursor-pointer flex justify-between items-center"
              onClick={() => setExpandedFloor(expandedFloor === floor ? null : floor)}
            >
              <span>{floor}</span>
              <span className="text-gray-500">
                {expandedFloor === floor ? '−' : '+'}
              </span>
            </div>
            
            {expandedFloor === floor && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {roomsByFloor[floor].map((room) => (
                  <button
                    key={room}
                    onClick={() => onSelectRoom(room)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedRoom === room
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {room.replace('Room ', '')}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 