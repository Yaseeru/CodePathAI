'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { Trophy, Lock, CheckCircle, Circle, Clock } from 'lucide-react';

interface ProjectMilestoneProps {
     project: Project;
     status: 'completed' | 'current' | 'locked';
     completionPercentage?: number;
}

export default function ProjectMilestone({
     project,
     status,
     completionPercentage = 0,
}: ProjectMilestoneProps) {
     // Determine styling based on status
     const getStatusStyles = () => {
          switch (status) {
               case 'completed':
                    return {
                         container: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300',
                         icon: <Trophy className="w-8 h-8 text-green-600" />,
                         title: 'text-gray-900',
                         description: 'text-gray-600',
                         badge: 'bg-green-600 text-white',
                    };
               case 'current':
                    return {
                         container: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 ring-2 ring-purple-400',
                         icon: <Trophy className="w-8 h-8 text-purple-600" />,
                         title: 'text-gray-900 font-semibold',
                         description: 'text-gray-700',
                         badge: 'bg-purple-600 text-white',
                    };
               case 'locked':
                    return {
                         container: 'bg-gray-50 border-gray-200 opacity-60',
                         icon: <Lock className="w-8 h-8 text-gray-400" />,
                         title: 'text-gray-500',
                         description: 'text-gray-400',
                         badge: 'bg-gray-400 text-white',
                    };
          }
     };

     const styles = getStatusStyles();

     // Format duration
     const formatDuration = (minutes: number): string => {
          if (minutes < 60) {
               return `${minutes} min`;
          }
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
     };

     return (
          <div
               className={`relative ml-16 p-6 border-2 rounded-xl transition-all ${styles.container}`}
          >
               {/* Project Icon (positioned on the timeline) */}
               <div className="absolute -left-[56px] top-1/2 -translate-y-1/2 bg-white rounded-full p-2 border-2 border-current">
                    {styles.icon}
               </div>

               {/* Project Badge */}
               <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${styles.badge}`}>
                    <Trophy className="w-3 h-3" />
                    <span>PROJECT MILESTONE</span>
               </div>

               {/* Project Content */}
               <div className="space-y-4">
                    {/* Title */}
                    <h3 className={`text-xl font-bold ${styles.title}`}>
                         {project.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm ${styles.description}`}>
                         {project.description}
                    </p>

                    {/* Completion Progress (if current) */}
                    {status === 'current' && completionPercentage > 0 && (
                         <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-600">
                                   <span>Progress</span>
                                   <span>{completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                   <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${completionPercentage}%` }}
                                   />
                              </div>
                         </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                         <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(project.estimatedDuration)}</span>
                         </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-2">
                         <h4 className={`text-sm font-semibold ${styles.title}`}>
                              Requirements ({project.requirements.length})
                         </h4>
                         <ul className="space-y-1">
                              {project.requirements.slice(0, 3).map((req) => (
                                   <li key={req.id} className="flex items-start gap-2 text-sm">
                                        <Circle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${styles.description}`} />
                                        <span className={styles.description}>{req.description}</span>
                                   </li>
                              ))}
                              {project.requirements.length > 3 && (
                                   <li className={`text-xs ${styles.description}`}>
                                        +{project.requirements.length - 3} more requirements
                                   </li>
                              )}
                         </ul>
                    </div>

                    {/* Success Criteria Section */}
                    <div className="space-y-2">
                         <h4 className={`text-sm font-semibold ${styles.title}`}>
                              Success Criteria ({project.successCriteria.length})
                         </h4>
                         <ul className="space-y-1">
                              {project.successCriteria.slice(0, 2).map((criterion) => (
                                   <li key={criterion.id} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${styles.description}`} />
                                        <span className={styles.description}>{criterion.description}</span>
                                   </li>
                              ))}
                              {project.successCriteria.length > 2 && (
                                   <li className={`text-xs ${styles.description}`}>
                                        +{project.successCriteria.length - 2} more criteria
                                   </li>
                              )}
                         </ul>
                    </div>

                    {/* Unlock Status */}
                    {status === 'locked' && (
                         <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                              <Lock className="w-3 h-3" />
                              <span>Complete required lessons to unlock this project</span>
                         </div>
                    )}
               </div>
          </div>
     );
}
