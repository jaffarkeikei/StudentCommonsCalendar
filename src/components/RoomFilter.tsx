'use client';

import React, { useState, useEffect } from 'react';

interface RoomFilterProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
}

// Helper function to group rooms by floor
const groupRoomsByFloor = (rooms: string[]) => {
  const floorGroups: { [floor: string]: string[] } = {};
  
  // Initialize floor groups 1-5
  for (let i = 1; i <= 5; i++) {
    floorGroups[`Floor ${i}`] = [];
  }
  
  // Ensure "Other" category exists
  floorGroups['Other'] = [];
  
  rooms.forEach(room => {
    // Extract floor number from room name (assuming pattern like "Room 214" where 2 is the floor)
    const floorMatch = room.match(/Room\s+(\d)(\d+)/i);
    if (floorMatch && floorMatch[1]) {
      const floorNumber = parseInt(floorMatch[1]);
      // Only floors 1-5 exist, other rooms go to "Other"
      if (floorNumber >= 1 && floorNumber <= 5) {
        const floor = `Floor ${floorNumber}`;
        floorGroups[floor].push(room);
      } else {
        floorGroups['Other'].push(room);
      }
    } else {
      // If we can't determine floor, put in "Other" category
      floorGroups['Other'].push(room);
    }
  });
  
  // Remove empty floor categories
  Object.keys(floorGroups).forEach(floor => {
    if (floorGroups[floor].length === 0) {
      delete floorGroups[floor];
    }
  });
  
  // Sort rooms numerically within each floor
  Object.keys(floorGroups).forEach(floor => {
    floorGroups[floor].sort((a, b) => {
      const aMatch = a.match(/(\d+)/);
      const bMatch = b.match(/(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });
  });
  
  return floorGroups;
};

export const RoomFilter: React.FC<RoomFilterProps> = ({ 
  rooms, 
  selectedRoom, 
  onSelectRoom 
}) => {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set(['Floor 2']));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<string[]>(rooms);
  const roomsByFloor = groupRoomsByFloor(rooms);
  
  // Sort floor groups by floor number
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  // Effect to filter rooms based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(rooms);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = rooms.filter(room => 
      room.toLowerCase().includes(term)
    );
    setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  const toggleFloor = (floor: string) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floor)) {
      newExpanded.delete(floor);
    } else {
      newExpanded.add(floor);
    }
    setExpandedFloors(newExpanded);
  };

  const isFloorVisible = (floor: string) => {
    if (!searchTerm.trim()) return true;
    return roomsByFloor[floor].some(room => 
      filteredRooms.includes(room)
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Filter by Room</h2>
      
      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* All Rooms button */}
      <div className="mb-4">
        <button
          onClick={() => onSelectRoom('all')}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            selectedRoom === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All Rooms
        </button>
      </div>
      
      {/* Floor sections */}
      <div className="space-y-2">
        {sortedFloors.map(floor => isFloorVisible(floor) && (
          <div key={floor} className="bg-gray-50 rounded-lg overflow-hidden">
            <div 
              className="font-medium text-gray-700 cursor-pointer flex justify-between items-center p-3 hover:bg-gray-100 transition-colors"
              onClick={() => toggleFloor(floor)}
            >
              <span>{floor}</span>
              <span className="text-gray-500 text-lg">
                {expandedFloors.has(floor) ? '−' : '+'}
              </span>
            </div>
            
            {expandedFloors.has(floor) && (
              <div className="p-2 grid grid-cols-3 gap-2 bg-white border-t border-gray-100">
                {roomsByFloor[floor].filter(room => filteredRooms.includes(room)).map((room) => (
                  <button
                    key={room}
                    onClick={() => onSelectRoom(room)}
                    className={`px-2 py-2 rounded text-sm transition-colors ${
                      selectedRoom === room
                        ? 'bg-blue-500 text-white font-medium'
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                    title={room}
                  >
                    {room.replace('Room ', '')}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Show when no rooms match search */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No rooms match your search
        </div>
      )}
    </div>
  );
}; 