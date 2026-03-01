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
     const [isSaving, setIsSaving] = useState(false);

     const handleEditorDidMount: OnMount = (editor, monaco) => {
          editorRef.current = editor;

          // Configure editor options
          editor.updateOptions({
               minimap: { enabled: true },
               lineNumbers: 'on',
               readOnly,
               fontSize: 14,
               tabSize: 2,
               automaticLayout: true,
               scrollBeyondLastLine: false,
               wordWrap: 'on',
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

     return (
          <div className="relative h-full w-full">
               {isSaving && (
                    <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded text-sm">
                         Saved!
                    </div>
               )}
               <Editor
                    height="100%"
                    language={getMonacoLanguage()}
                    value={value}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                         minimap: { enabled: true },
                         lineNumbers: 'on',
                         readOnly,
                         fontSize: 14,
                         tabSize: 2,
                         automaticLayout: true,
                         scrollBeyondLastLine: false,
                         wordWrap: 'on',
                    }}
               />
          </div>
     );
}
