'use client';

import { useState, useEffect } from 'react';
import { AnalyticsEvents } from '@/lib/monitoring/posthog';

interface UseNPSSurveyReturn {
     shouldShowSurvey: boolean;
     showSurvey: () => void;
     hideSurvey: () => void;
     submitSurvey: (score: number, feedback?: string) => Promise<void>;
}

/**
 * Hook to manage NPS survey display and submission
 * Triggers after 5 completed lessons
 */
export function useNPSSurvey(completedLessonsCount: number): UseNPSSurveyReturn {
     const [shouldShowSurvey, setShouldShowSurvey] = useState(false);
     const [hasShownSurvey, setHasShownSurvey] = useState(false);

     useEffect(() => {
          // Check if we should show the survey
          if (completedLessonsCount >= 5 && !hasShownSurvey) {
               // Check if user has already submitted NPS survey
               const hasSubmittedNPS = localStorage.getItem('nps_survey_submitted');

               if (!hasSubmittedNPS) {
                    setShouldShowSurvey(true);
                    setHasShownSurvey(true);

                    // Track that survey was shown
                    if (typeof window !== 'undefined') {
                         const posthog = require('posthog-js').default;
                         posthog.capture(AnalyticsEvents.NPS_SURVEY_SHOWN, {
                              completed_lessons: completedLessonsCount,
                         });
                    }
               }
          }
     }, [completedLessonsCount, hasShownSurvey]);

     const showSurvey = () => {
          setShouldShowSurvey(true);
     };

     const hideSurvey = () => {
          setShouldShowSurvey(false);
     };

     const submitSurvey = async (score: number, feedback?: string) => {
          try {
               const response = await fetch('/api/analytics/nps', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ score, feedback }),
               });

               if (!response.ok) {
                    throw new Error('Failed to submit NPS survey');
               }

               // Mark as submitted in localStorage
               localStorage.setItem('nps_survey_submitted', 'true');

               setShouldShowSurvey(false);
          } catch (error) {
               console.error('Error submitting NPS survey:', error);
               throw error;
          }
     };

     return {
          shouldShowSurvey,
          showSurvey,
          hideSurvey,
          submitSurvey,
     };
}
