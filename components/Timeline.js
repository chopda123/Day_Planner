


'use client'

import React from 'react'

/**
 * Timeline Component - Renders a 24-hour vertical timeline
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onTaskClick - Callback when task is clicked
 * 
 * Task object structure:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   startTime: string (HH:MM format),
 *   endTime: string (HH:MM format),
 *   category: string,
 *   telegramReminder: boolean,
 *   completed: boolean
 * }
 */
const Timeline = ({ tasks = [], onTaskClick }) => {
  // Generate time slots for 24 hours (30-minute intervals)
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Convert time string to minutes from midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate position and height for a task block
  const calculateTaskPosition = (task) => {
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);
    const duration = endMinutes - startMinutes;
    
    // Position: 1 minute = 2.4 pixels (makes 24 hours = 1152px)
    const top = (startMinutes / 60) * 48; // 48px per hour
    const height = (duration / 60) * 48; // 48px per hour
    
    return { top, height };
  };

  // Category color mapping
  const categoryColors = {
    work: 'bg-blue-100 border-l-4 border-blue-500',
    personal: 'bg-green-100 border-l-4 border-green-500',
    health: 'bg-red-100 border-l-4 border-red-500',
    learning: 'bg-purple-100 border-l-4 border-purple-500',
    leisure: 'bg-yellow-100 border-l-4 border-yellow-500',
    other: 'bg-gray-100 border-l-4 border-gray-500'
  };

  // Format time for display (12-hour format)
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Function to get contrasting text color
  const getTextColor = (category) => {
    const colors = {
      work: 'text-blue-800',
      personal: 'text-green-800',
      health: 'text-red-800',
      learning: 'text-purple-800',
      leisure: 'text-yellow-800',
      other: 'text-gray-800'
    };
    return colors[category] || colors.other;
  };

  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Total height of timeline (24 hours * 48px)
  const timelineHeight = 24 * 48; // 1152px

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">24-Hour Timeline</h2>
      
      {/* Responsive container */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[600px]"> {/* Minimum width for mobile */}
          <div className="flex">
            {/* Time labels column */}
            <div className="w-20 flex-shrink-0 relative" style={{ height: `${timelineHeight}px` }}>
              {timeSlots.map((time, index) => {
                const hour = parseInt(time.split(':')[0]);
                const minute = time.split(':')[1];
                
                // Only show even hours and half hours
                const isEvenHour = minute === '00';
                const isHalfHour = minute === '30';
                
                return (
                  <div
                    key={time}
                    className={`absolute flex items-center justify-end pr-2 w-full ${
                      isEvenHour 
                        ? 'text-gray-700 font-medium text-sm' 
                        : isHalfHour
                        ? 'text-gray-400 text-xs'
                        : 'hidden'
                    }`}
                    style={{ 
                      top: `${(index * 48) / 2}px`,
                      height: '24px'
                    }}
                  >
                    {isEvenHour ? (
                      hour === 0 ? '12 AM' :
                      hour === 12 ? '12 PM' :
                      hour > 12 ? `${hour-12} PM` : `${hour} AM`
                    ) : (
                      '•'
                    )}
                  </div>
                );
              })}
            </div>

            {/* Timeline column */}
            <div className="flex-1 relative ml-4" style={{ height: `${timelineHeight}px` }}>
              {/* Hour markers */}
              {Array.from({ length: 25 }).map((_, hour) => (
                <div
                  key={`hour-marker-${hour}`}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${hour * 48}px` }}
                />
              ))}

              {/* Half-hour markers (dashed) */}
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={`halfhour-marker-${hour}`}
                  className="absolute w-full border-t border-gray-200 border-dashed"
                  style={{ top: `${hour * 48 + 24}px` }}
                />
              ))}

              {/* Current time indicator (optional) */}
              {/* <div 
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                style={{ 
                  top: `${(new Date().getHours() * 48 + new Date().getMinutes() * 0.8)}px` 
                }}
              >
                <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
              </div> */}

              {/* Task blocks */}
              {sortedTasks.map((task) => {
                const { top, height } = calculateTaskPosition(task);
                const categoryClass = categoryColors[task.category] || categoryColors.other;
                const textColor = getTextColor(task.category);
                const minHeight = Math.max(height, 40); // Minimum height for visibility
                
                // Calculate width to avoid overlapping (simplified)
                const width = '95%';

                return (
                  <div
                    key={task.id}
                    className={`absolute left-0 rounded-r-lg p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${categoryClass} ${textColor}`}
                    style={{
                      top: `${top}px`,
                      height: `${minHeight}px`,
                      width: width,
                      zIndex: 10
                    }}
                    onClick={() => onTaskClick && onTaskClick(task)}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm md:text-base truncate pr-2">
                            {task.title}
                          </h3>
                          {task.telegramReminder && (
                            <span className="text-xs bg-white/80 px-2 py-1 rounded-full border shrink-0">
                              🔔
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1 opacity-90 truncate">
                          {formatTime(task.startTime)} - {formatTime(task.endTime)}
                        </p>
                      </div>
                      {task.description && height > 60 && (
                        <p className="text-xs mt-2 opacity-80 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Legend</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryColors).map(([category, colorClass]) => {
            const textColor = getTextColor(category);
            return (
              <div 
                key={category} 
                className={`flex items-center px-3 py-1.5 rounded-lg ${colorClass} ${textColor} text-sm`}
              >
                <span className="capitalize">{category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text for mobile */}
      <div className="mt-4 text-xs text-gray-500 md:hidden">
        <p>← Scroll horizontally to see full timeline →</p>
      </div>
    </div>
  );
};

export default Timeline;