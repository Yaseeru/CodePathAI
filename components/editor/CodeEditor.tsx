'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
     language: 'javascript' | 'python' | 'html';
     value: string;
     onChange: (value: string) => void;
     readOnly?: boolean;
     onSave?: () => void;
     onRun?: () => void;
}

export default function CodeEditor({
     language,
     value,
     onChange,
     readOnly = false,
     onSave,
     onRun,
}: CodeEditorProps) {
     const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
     const containerRef = useRef<HTMLDivElement | null>(null);
     const [isSaving, setIsSaving] = useState(false);
     const [isFullscreen, setIsFullscreen] = useState(false);
     const [isMobile, setIsMobile] = useState(false);

     // Detect mobile device
     useEffect(() => {
          const checkMobile = () => {
               setIsMobile(window.innerWidth < 768);
          };
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
     }, []);

     // Handle fullscreen toggle
     const toggleFullscreen = () => {
          if (!containerRef.current) return;

          if (!isFullscreen) {
               if (containerRef.current.requestFullscreen) {
                    containerRef.current.requestFullscreen();
               }
          } else {
               if (document.exitFullscreen) {
                    document.exitFullscreen();
               }
          }
          setIsFullscreen(!isFullscreen);
     };

     // Handle fullscreen change events
     useEffect(() => {
          const handleFullscreenChange = () => {
               setIsFullscreen(!!document.fullscreenElement);
          };

          document.addEventListener('fullscreenchange', handleFullscreenChange);
          return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
     }, []);

     const handleEditorDidMount: OnMount = (editor, monaco) => {
          editorRef.current = editor;

          // Configure editor options - responsive based on device
          editor.updateOptions({
               minimap: { enabled: !isMobile }, // Disable minimap on mobile
               lineNumbers: 'on',
               readOnly,
               fontSize: isMobile ? 14 : 14,
               tabSize: 2,
               automaticLayout: true,
               scrollBeyondLastLine: false,
               wordWrap: 'on',
               // Mobile-specific optimizations
               glyphMargin: !isMobile,
               folding: !isMobile,
               lineDecorationsWidth: isMobile ? 5 : 10,
               lineNumbersMinChars: isMobile ? 3 : 5,
               // Better touch support
               scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                    verticalScrollbarSize: isMobile ? 14 : 10,
                    horizontalScrollbarSize: isMobile ? 14 : 10,
               },
          });

          // Add keyboard shortcuts
          // Ctrl+S for save
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
               if (onSave) {
                    setIsSaving(true);
                    onSave();
                    setTimeout(() => setIsSaving(false), 1000);
               }
          });

          // Ctrl+Enter for run
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
               if (onRun) {
                    onRun();
               }
          });

          // Configure language-specific settings
          if (language === 'javascript') {
               monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
               });
               monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2020,
                    allowNonTsExtensions: true,
               });
          }
     };

     const handleEditorChange = (value: string | undefined) => {
          onChange(value || '');
     };

     // Map language to Monaco language identifier
     const getMonacoLanguage = () => {
          switch (language) {
               case 'javascript':
                    return 'javascript';
               case 'python':
                    return 'python';
               case 'html':
                    return 'html';
               default:
                    return 'javascript';
          }
     };

     const handleSave = () => {
          if (onSave) {
               setIsSaving(true);
               onSave();
               setTimeout(() => setIsSaving(false), 1000);
          }
     };

     const handleRun = () => {
          if (onRun) {
               onRun();
          }
     };

     return (
          <div
               ref={containerRef}
               className={`relative h-full w-full flex flex-col ${isFullscreen ? 'bg-[#1e1e1e]' : ''}`}
               role="region"
               aria-label="Code editor"
          >
               {/* Mobile-friendly control bar */}
               <div className="flex items-center justify-between bg-[#1e1e1e] text-white px-2 sm:px-4 py-2 border-b border-gray-700" role="toolbar" aria-label="Code editor controls">
                    <div className="flex items-center space-x-2">
                         <span className="text-xs sm:text-sm text-gray-400" role="status" aria-label={`Programming language: ${language}`}>
                              {language.toUpperCase()}
                         </span>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2">
                         {/* Save button - 44x44px touch target */}
                         {onSave && (
                              <button
                                   onClick={handleSave}
                                   className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs sm:text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                   aria-label="Save code (Ctrl+S or Cmd+S)"
                                   type="button"
                              >
                                   <span className="hidden sm:inline">Save</span>
                                   <span className="sm:hidden" aria-hidden="true">💾</span>
                              </button>
                         )}

                         {/* Run button - 44x44px touch target */}
                         {onRun && (
                              <button
                                   onClick={handleRun}
                                   className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs sm:text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                   aria-label="Run code (Ctrl+Enter or Cmd+Enter)"
                                   type="button"
                              >
                                   <span className="hidden sm:inline">Run</span>
                                   <span className="sm:hidden" aria-hidden="true">▶️</span>
                              </button>
                         )}

                         {/* Fullscreen button - mobile only */}
                         {isMobile && (
                              <button
                                   onClick={toggleFullscreen}
                                   className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                   aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                   aria-pressed={isFullscreen}
                                   type="button"
                              >
                                   <span aria-hidden="true">{isFullscreen ? '⤓' : '⤢'}</span>
                              </button>
                         )}
                    </div>
               </div>

               {/* Saving indicator */}
               {isSaving && (
                    <div className="absolute top-14 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded text-xs sm:text-sm" role="status" aria-live="polite">
                         Saved!
                    </div>
               )}

               {/* Editor */}
               <div className="flex-1" role="textbox" aria-label={`Code editor for ${language}`} aria-multiline="true">
                    <Editor
                         height="100%"
                         language={getMonacoLanguage()}
                         value={value}
                         onChange={handleEditorChange}
                         onMount={handleEditorDidMount}
                         theme="vs-dark"
                         options={{
                              minimap: { enabled: !isMobile },
                              lineNumbers: 'on',
                              readOnly,
                              fontSize: 14,
                              tabSize: 2,
                              automaticLayout: true,
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              glyphMargin: !isMobile,
                              folding: !isMobile,
                              lineDecorationsWidth: isMobile ? 5 : 10,
                              lineNumbersMinChars: isMobile ? 3 : 5,
                              scrollbar: {
                                   vertical: 'auto',
                                   horizontal: 'auto',
                                   useShadows: false,
                                   verticalScrollbarSize: isMobile ? 14 : 10,
                                   horizontalScrollbarSize: isMobile ? 14 : 10,
                              },
                              ariaLabel: `Code editor for ${language}. Use keyboard shortcuts: Ctrl+S to save, Ctrl+Enter to run code.`,
                         }}
                    />
               </div>

               {/* Mobile keyboard helper */}
               {isMobile && (
                    <div className="bg-[#1e1e1e] text-white px-2 py-1 text-xs text-center border-t border-gray-700" role="note">
                         Tip: Use external keyboard for best experience
                    </div>
               )}
          </div>
     );
}
