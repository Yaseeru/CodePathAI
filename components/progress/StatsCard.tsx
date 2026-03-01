import { ReactNode } from 'react';

interface StatsCardProps {
     title: string;
     value: string | number;
     icon: ReactNode;
     trend?: number;
     colorTheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

/**
 * StatsCard component
 * Displays a single statistic with icon, value, and optional trend indicator
 */
export default function StatsCard({
     title,
     value,
     icon,
     trend,
     colorTheme = 'blue',
}: StatsCardProps) {
     // Color theme mappings
     const themeColors = {
          blue: {
               bg: 'bg-blue-50',
               iconBg: 'bg-blue-100',
               iconText: 'text-blue-600',
               valueText: 'text-blue-900',
               titleText: 'text-blue-700',
          },
          green: {
               bg: 'bg-green-50',
               iconBg: 'bg-green-100',
               iconText: 'text-green-600',
               valueText: 'text-green-900',
               titleText: 'text-green-700',
          },
          purple: {
               bg: 'bg-purple-50',
               iconBg: 'bg-purple-100',
               iconText: 'text-purple-600',
               valueText: 'text-purple-900',
               titleText: 'text-purple-700',
          },
          orange: {
               bg: 'bg-orange-50',
               iconBg: 'bg-orange-100',
               iconText: 'text-orange-600',
               valueText: 'text-orange-900',
               titleText: 'text-orange-700',
          },
          red: {
               bg: 'bg-red-50',
               iconBg: 'bg-red-100',
               iconText: 'text-red-600',
               valueText: 'text-red-900',
               titleText: 'text-red-700',
          },
     };

     const colors = themeColors[colorTheme];

     return (
          <div className={`${colors.bg} rounded-lg p-6 shadow-sm`}>
               <div className="flex items-start justify-between">
                    <div className="flex-1">
                         <p className={`text-sm font-medium ${colors.titleText} mb-2`}>
                              {title}
                         </p>
                         <div className="flex items-baseline gap-2">
                              <p className={`text-3xl font-bold ${colors.valueText}`}>
                                   {value}
                              </p>
                              {trend !== undefined && (
                                   <span
                                        className={`text-sm font-medium ${trend > 0
                                                  ? 'text-green-600'
                                                  : trend < 0
                                                       ? 'text-red-600'
                                                       : 'text-gray-600'
                                             }`}
                                   >
                                        {trend > 0 && '↑'}
                                        {trend < 0 && '↓'}
                                        {trend === 0 && '→'}
                                        {Math.abs(trend)}%
                                   </span>
                              )}
                         </div>
                    </div>
                    <div className={`${colors.iconBg} rounded-lg p-3`}>
                         <div className={`${colors.iconText} w-6 h-6`}>{icon}</div>
                    </div>
               </div>
          </div>
     );
}
