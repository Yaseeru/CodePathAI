'use client';

import { useState } from 'react';

interface ActivityDay {
     date: string;
     lessonsCompleted: number;
     timeSpent: number;
     messagesSent: number;
     codeExecutions: number;
}

interface StreakCalendarProps {
     activityData: ActivityDay[];
}

/**
 * StreakCalendar component
 * GitHub-style contribution graph showing last 90 days of activity
 */
export default function StreakCalendar({ activityData }: StreakCalendarProps) {
     const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
     const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

     // Generate last 90 days
     const generateLast90Days = () => {
          const days: { date: string; activity: ActivityDay | null }[] = [];
          const today = new Date();

          for (let i = 89; i >= 0; i--) {
               const date = new Date(today);
               date.setDate(date.getDate() - i);
               const dateStr = date.toISOString().split('T')[0];

               const activity = activityData.find((a) => a.date === dateStr) || null;
               days.push({ date: dateStr, activity });
          }

          return days;
     };

     const days = generateLast90Days();

     // Calculate activity level (0-4) based on time spent
     const getActivityLevel = (activity: ActivityDay | null): number => {
          if (!activity || activity.timeSpent === 0) return 0;
          if (activity.timeSpent < 15) return 1;
          if (activity.timeSpent < 30) return 2;
          if (activity.timeSpent < 60) return 3;
          return 4;
     };

     // Get color based on activity level
     const getActivityColor = (level: number): string => {
          const colors = [
               'bg-gray-100', // No activity
               'bg-green-200', // Low activity
               'bg-green-400', // Medium activity
               'bg-green-600', // High activity
               'bg-green-800', // Very high activity
          ];
          return colors[level];
     };

     // Format date for tooltip
     const formatDate = (dateStr: string): string => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', {
               month: 'short',
               day: 'numeric',
               year: 'numeric',
          });
     };

     // Handle mouse enter on day cell
     const handleMouseEnter = (
          day: { date: string; activity: ActivityDay | null },
          event: React.MouseEvent<HTMLDivElement>
     ) => {
          if (day.activity) {
               setHoveredDay(day.activity);
               const rect = event.currentTarget.getBoundingClientRect();
               setTooltipPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
               });
          }
     };

     const handleMouseLeave = () => {
          setHoveredDay(null);
     };

     // Group days by week
     const weeks: typeof days[] = [];
     for (let i = 0; i < days.length; i += 7) {
          weeks.push(days.slice(i, i + 7));
     }

     return (
          <div className="relative">
               <div className="flex flex-col gap-1">
                    {/* Week labels */}
                    <div className="flex gap-1 mb-2">
                         <div className="w-8 text-xs text-gray-500">Mon</div>
                    </div>

                    {/* Calendar grid */}
                    <div className="flex gap-1">
                         {weeks.map((week, weekIndex) => (
                              <div key={weekIndex} className="flex flex-col gap-1">
                                   {week.map((day, dayIndex) => {
                                        const level = getActivityLevel(day.activity);
                                        const color = getActivityColor(level);

                                        return (
                                             <div
                                                  key={day.date}
                                                  className={`w-3 h-3 rounded-sm ${color} cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all`}
                                                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                                                  onMouseLeave={handleMouseLeave}
                                                  title={day.date}
                                             />
                                        );
                                   })}
                              </div>
                         ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
                         <span>Less</span>
                         <div className="flex gap-1">
                              {[0, 1, 2, 3, 4].map((level) => (
                                   <div
                                        key={level}
                                        className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
                                   />
                              ))}
                         </div>
                         <span>More</span>
                    </div>
               </div>

               {/* Tooltip */}
               {hoveredDay && (
                    <div
                         className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg pointer-events-none"
                         style={{
                              left: `${tooltipPosition.x}px`,
                              top: `${tooltipPosition.y}px`,
                              transform: 'translate(-50%, -100%)',
                         }}
                    >
                         <div className="font-semibold mb-1">
                              {formatDate(hoveredDay.date)}
                         </div>
                         <div className="space-y-1">
                              <div>Lessons: {hoveredDay.lessonsCompleted}</div>
                              <div>Time: {hoveredDay.timeSpent} min</div>
                              <div>Messages: {hoveredDay.messagesSent}</div>
                              <div>Code runs: {hoveredDay.codeExecutions}</div>
                         </div>
                    </div>
               )}
          </div>
     );
}
