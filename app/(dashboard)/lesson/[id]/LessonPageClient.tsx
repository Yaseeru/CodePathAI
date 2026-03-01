'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LessonContent from '@/components/lesson/LessonContent';
import LessonTimer from '@/components/lesson/LessonTimer';
import LessonProgress from '@/components/lesson/LessonProgress';
import CodeOutput from '@/components/editor/CodeOutput';
import CodeControls from '@/components/editor/CodeControls';
import Notification from '@/components/ui/Notification';
import { useNotification } from '@/lib/hooks/useNotification';
import EditorSkeleton from '@/components/editor/EditorSkeleton';

// Dynamic import for Monaco Editor (heavy component, SSR disabled)
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  error?: string;
}

interface LessonPageClientProps {
  lesson: any;
  savedCode: string;
  userId: string;
  startTime: string;
}

export default function LessonPageClient({
  lesson,
  savedCode,
  userId,
  startTime,
}: LessonPageClientProps) {
  const [code, setCode] = useState(savedCode);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { notifications, showNotification, removeNotification } = useNotification();

  // Auto-save code every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (code !== savedCode) {
        handleSaveCode();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [code, savedCode]);

  const handleSaveCode = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          code,
          language: lesson.language,
        }),
      });

      if (response.ok) {
        setLastSaveTime(new Date());
      }
    } catch (error) {
      console.error('Failed to save code:', error);
    } finally {
      setIsSaving(false);
    }
  }, [code, lesson.id, lesson.language, isSaving]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: lesson.language,
        }),
      });

      const result = await response.json();
      setOutput(result);
    } catch (error) {
      setOutput({
        stdout: '',
        stderr: '',
        exitCode: 1,
        executionTime: 0,
        error: 'Failed to execute code. Please try again.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopCode = () => {
    setIsRunning(false);
  };

  const handleClearOutput = () => {
    setOutput(null);
  };

  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset the code to the starter template?')) {
      setCode(lesson.starter_code || '');
      setOutput(null);
    }
  };

  // Calculate lesson progress (simplified - you can enhance this)
  const totalSteps = lesson.content?.exercises?.length || 1;
  const completedSteps = 0; // This would be tracked based on exercise completion

  // Function to handle lesson completion
  const handleCompleteLesson = useCallback(async (completionTime: number) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionTime }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success notification
        showNotification({
          type: 'success',
          title: 'Lesson Completed!',
          message: 'Great job! Moving to the next lesson.',
        });

        // Show difficulty adjustment notification if present
        if (result.difficultyNotification) {
          showNotification({
            type: 'difficulty_adjustment',
            title: result.difficultyNotification.title,
            message: result.difficultyNotification.message,
            oldLevel: result.difficultyNotification.oldLevel,
            newLevel: result.difficultyNotification.newLevel,
          });
        }

        // Redirect to next lesson or dashboard
        if (result.nextLesson) {
          setTimeout(() => {
            window.location.href = `/lesson/${result.nextLesson.id}`;
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete lesson. Please try again.',
      });
    }
  }, [lesson.id, showNotification]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Notifications */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          oldLevel={notification.oldLevel}
          newLevel={notification.newLevel}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {lesson.title}
            </h1>
            <p className="text-sm text-gray-500">
              {lesson.language.toUpperCase()} • {lesson.estimated_duration} min
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastSaveTime && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
            {isSaving && (
              <span className="text-xs text-blue-600">Saving...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Lesson Content */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
          {/* Timer and Progress */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <LessonTimer
              startTime={new Date(startTime)}
              targetDuration={lesson.estimated_duration}
            />
            <LessonProgress
              totalSteps={totalSteps}
              completedSteps={completedSteps}
              currentStep={1}
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <LessonContent lesson={lesson} />
          </div>
        </div>

        {/* Right Panel - Code Editor and Output */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          {/* Code Controls */}
          <CodeControls
            onRun={handleRunCode}
            onStop={handleStopCode}
            onClearOutput={handleClearOutput}
            onResetCode={handleResetCode}
            isRunning={isRunning}
            executionTime={output?.executionTime}
          />

          {/* Editor and Output Split */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Code Editor */}
            <div className="h-1/2 border-b border-gray-700">
              <CodeEditor
                language={lesson.language}
                value={code}
                onChange={setCode}
                onSave={handleSaveCode}
                onRun={handleRunCode}
              />
            </div>

            {/* Code Output */}
            <div className="h-1/2">
              <CodeOutput result={output} onClear={handleClearOutput} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Warning - Show on small screens */}
      <div className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Desktop Required
          </h2>
          <p className="text-gray-600">
            For the best coding experience, please use a desktop or laptop computer
            with a larger screen.
          </p>
        </div>
      </div>
    </div>
  );
}
