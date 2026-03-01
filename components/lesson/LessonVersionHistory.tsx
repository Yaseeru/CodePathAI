'use client';

/**
 * LessonVersionHistory Component
 * Displays version history for a lesson with ability to view and restore versions
 */

import { useState, useEffect } from 'react';
import type { LessonVersion } from '@/lib/services/lesson-versioning';

interface LessonVersionHistoryProps {
     lessonId: string;
     onVersionRestore?: (version: number) => void;
}

export default function LessonVersionHistory({
     lessonId,
     onVersionRestore
}: LessonVersionHistoryProps) {
     const [versions, setVersions] = useState<LessonVersion[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [selectedVersion, setSelectedVersion] = useState<LessonVersion | null>(null);
     const [restoring, setRestoring] = useState(false);

     useEffect(() => {
          fetchVersionHistory();
     }, [lessonId]);

     const fetchVersionHistory = async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await fetch(`/api/lessons/${lessonId}/versions`);
               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch version history');
               }

               setVersions(data.versions);
          } catch (err) {
               setError(err instanceof Error ? err.message : 'Unknown error');
          } finally {
               setLoading(false);
          }
     };

     const handleViewVersion = async (version: number) => {
          try {
               const response = await fetch(`/api/lessons/${lessonId}/versions/${version}`);
               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch version');
               }

               setSelectedVersion(data.version);
          } catch (err) {
               setError(err instanceof Error ? err.message : 'Unknown error');
          }
     };

     const handleRestoreVersion = async (version: number) => {
          if (!confirm(`Are you sure you want to restore to version ${version}? This will create a new version with the content from version ${version}.`)) {
               return;
          }

          try {
               setRestoring(true);
               setError(null);

               const response = await fetch(`/api/lessons/${lessonId}/versions/${version}`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         changeNotes: `Restored to version ${version}`,
                    }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Failed to restore version');
               }

               // Refresh version history
               await fetchVersionHistory();
               setSelectedVersion(null);

               if (onVersionRestore) {
                    onVersionRestore(version);
               }

               alert(data.message || 'Version restored successfully');
          } catch (err) {
               setError(err instanceof Error ? err.message : 'Unknown error');
          } finally {
               setRestoring(false);
          }
     };

     const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
          });
     };

     if (loading) {
          return (
               <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {error}</p>
                    <button
                         onClick={fetchVersionHistory}
                         className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                         Try again
                    </button>
               </div>
          );
     }

     if (versions.length === 0) {
          return (
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">No version history available for this lesson.</p>
               </div>
          );
     }

     return (
          <div className="space-y-4">
               <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
                    <span className="text-sm text-gray-500">{versions.length} versions</span>
               </div>

               <div className="space-y-2">
                    {versions.map((version) => (
                         <div
                              key={version.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                         >
                              <div className="flex items-start justify-between">
                                   <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                             <span className="font-semibold text-gray-900">
                                                  Version {version.version}
                                             </span>
                                             <span className="text-sm text-gray-500">
                                                  {formatDate(version.createdAt)}
                                             </span>
                                        </div>

                                        <h4 className="mt-1 font-medium text-gray-800">{version.title}</h4>

                                        {version.changeNotes && (
                                             <p className="mt-1 text-sm text-gray-600">{version.changeNotes}</p>
                                        )}

                                        {version.createdBy && (
                                             <p className="mt-1 text-xs text-gray-500">
                                                  Modified by: {version.createdBy}
                                             </p>
                                        )}
                                   </div>

                                   <div className="flex gap-2 ml-4">
                                        <button
                                             onClick={() => handleViewVersion(version.version)}
                                             className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        >
                                             View
                                        </button>
                                        <button
                                             onClick={() => handleRestoreVersion(version.version)}
                                             disabled={restoring}
                                             className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                             {restoring ? 'Restoring...' : 'Restore'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>

               {selectedVersion && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                         <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                   <h3 className="text-lg font-semibold text-gray-900">
                                        Version {selectedVersion.version} - {selectedVersion.title}
                                   </h3>
                                   <button
                                        onClick={() => setSelectedVersion(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                   >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                   </button>
                              </div>

                              <div className="p-6 space-y-4">
                                   <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                                        <p className="text-gray-600">{selectedVersion.description}</p>
                                   </div>

                                   <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                                        <dl className="grid grid-cols-2 gap-4 text-sm">
                                             <div>
                                                  <dt className="text-gray-500">Duration</dt>
                                                  <dd className="text-gray-900">{selectedVersion.estimatedDuration} minutes</dd>
                                             </div>
                                             <div>
                                                  <dt className="text-gray-500">Difficulty</dt>
                                                  <dd className="text-gray-900">Level {selectedVersion.difficultyLevel}</dd>
                                             </div>
                                             <div>
                                                  <dt className="text-gray-500">Language</dt>
                                                  <dd className="text-gray-900">{selectedVersion.language || 'N/A'}</dd>
                                             </div>
                                             <div>
                                                  <dt className="text-gray-500">Created</dt>
                                                  <dd className="text-gray-900">{formatDate(selectedVersion.createdAt)}</dd>
                                             </div>
                                        </dl>
                                   </div>

                                   {selectedVersion.changeNotes && (
                                        <div>
                                             <h4 className="font-medium text-gray-700 mb-2">Change Notes</h4>
                                             <p className="text-gray-600">{selectedVersion.changeNotes}</p>
                                        </div>
                                   )}

                                   <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Content Preview</h4>
                                        <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                                             <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                                  {JSON.stringify(selectedVersion.content, null, 2)}
                                             </pre>
                                        </div>
                                   </div>

                                   <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                                        <button
                                             onClick={() => setSelectedVersion(null)}
                                             className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                        >
                                             Close
                                        </button>
                                        <button
                                             onClick={() => handleRestoreVersion(selectedVersion.version)}
                                             disabled={restoring}
                                             className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                             {restoring ? 'Restoring...' : 'Restore This Version'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
