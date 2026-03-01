'use client';

import { useEffect, useRef, useState } from 'react';
import CodeEditor from './CodeEditor';

interface CodeEditorWithAutoSaveProps {
     language: 'javascript' | 'python' | 'html';
     initialValue: string;
     lessonId?: string;
     projectId?: string;
     readOnly?: boolean;
     onRun?: () => void;
}

export default function CodeEditorWithAutoSave({
     language,
     initialValue,
     lessonId,
     projectId,
     readOnly = false,
     onRun,
}: CodeEditorWithAutoSaveProps) {
     const [code, setCode] = useState(initialValue);
     const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
     const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
     const lastSavedCodeRef = useRef(initialValue);

     // Auto-save every 30 seconds
     useEffect(() => {
          if (readOnly) return;

          // Clear existing timer
          if (autoSaveTimerRef.current) {
               clearTimeout(autoSaveTimerRef.current);
          }

          // Only save if code has changed
          if (code !== lastSavedCodeRef.current) {
               autoSaveTimerRef.current = setTimeout(() => {
                    handleSave();
               }, 30000); // 30 seconds
          }

          return () => {
               if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
               }
          };
     }, [code, readOnly]);

     const handleSave = async () => {
          if (code === lastSavedCodeRef.current) {
               return; // No changes to save
          }

          setSaveStatus('saving');

          try {
               const response = await fetch('/api/code/save', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         lessonId,
                         projectId,
                         code,
                         language,
                    }),
               });

               if (!response.ok) {
                    throw new Error('Failed to save code');
               }

               lastSavedCodeRef.current = code;
               setSaveStatus('saved');

               // Reset to idle after 2 seconds
               setTimeout(() => {
                    setSaveStatus('idle');
               }, 2000);
          } catch (error) {
               console.error('Error saving code:', error);
               setSaveStatus('error');

               // Reset to idle after 3 seconds
               setTimeout(() => {
                    setSaveStatus('idle');
               }, 3000);
          }
     };

     const handleCodeChange = (newCode: string) => {
          setCode(newCode);
     };

     return (
          <div className="relative h-full w-full">
               {/* Save status indicator */}
               <div className="absolute top-2 right-2 z-10">
                    {saveStatus === 'saving' && (
                         <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                         </div>
                    )}
                    {saveStatus === 'saved' && (
                         <div className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                              ✓ Saved
                         </div>
                    )}
                    {saveStatus === 'error' && (
                         <div className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                              ✗ Save failed
                         </div>
                    )}
               </div>

               <CodeEditor
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    readOnly={readOnly}
                    onSave={handleSave}
                    onRun={onRun}
               />
          </div>
     );
}
