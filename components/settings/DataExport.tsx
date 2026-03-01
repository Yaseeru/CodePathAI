'use client';

import { useState } from 'react';

export function DataExport() {
     const [isExporting, setIsExporting] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [success, setSuccess] = useState(false);

     const handleExportData = async () => {
          setIsExporting(true);
          setError(null);
          setSuccess(false);

          try {
               const response = await fetch('/api/user/export', {
                    method: 'GET',
               });

               if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to export data');
               }

               // Get the blob and create a download link
               const blob = await response.blob();
               const url = window.URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;

               // Extract filename from Content-Disposition header or use default
               const contentDisposition = response.headers.get('Content-Disposition');
               const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
               const filename = filenameMatch ? filenameMatch[1] : `codepath-ai-export-${Date.now()}.json`;

               a.download = filename;
               document.body.appendChild(a);
               a.click();
               window.URL.revokeObjectURL(url);
               document.body.removeChild(a);

               setSuccess(true);
               setTimeout(() => setSuccess(false), 5000);
          } catch (err) {
               setError(err instanceof Error ? err.message : 'Failed to export data');
          } finally {
               setIsExporting(false);
          }
     };

     return (
          <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Your Data</h2>

               <p className="text-sm text-gray-600 mb-4">
                    Download all your data in JSON format. This includes your profile, roadmaps, progress,
                    conversations, code submissions, and activity history.
               </p>

               {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                         <p className="text-sm text-red-800">{error}</p>
                    </div>
               )}

               {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                         <p className="text-sm text-green-800">Your data has been exported successfully!</p>
                    </div>
               )}

               <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                    {isExporting ? 'Exporting...' : 'Export My Data'}
               </button>
          </div>
     );
}
