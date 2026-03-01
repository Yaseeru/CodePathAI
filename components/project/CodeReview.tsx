'use client';

/**
 * CodeReview Display Component
 * Shows AI-generated code review feedback with strengths, issues, and suggestions
 */

import { CodeReview as CodeReviewType, CodeIssue } from '@/lib/types';
import { useState } from 'react';

interface CodeReviewProps {
     review: CodeReviewType;
     onAskAboutIssue?: (issue: CodeIssue) => void;
}

export function CodeReview({ review, onAskAboutIssue }: CodeReviewProps) {
     const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

     const toggleIssue = (index: number) => {
          const newExpanded = new Set(expandedIssues);
          if (newExpanded.has(index)) {
               newExpanded.delete(index);
          } else {
               newExpanded.add(index);
          }
          setExpandedIssues(newExpanded);
     };

     const getScoreColor = (score: number): string => {
          if (score >= 90) return 'text-green-600';
          if (score >= 70) return 'text-blue-600';
          if (score >= 50) return 'text-yellow-600';
          return 'text-red-600';
     };

     const getScoreBackground = (score: number): string => {
          if (score >= 90) return 'bg-green-50 border-green-200';
          if (score >= 70) return 'bg-blue-50 border-blue-200';
          if (score >= 50) return 'bg-yellow-50 border-yellow-200';
          return 'bg-red-50 border-red-200';
     };

     const getSeverityColor = (severity: 'error' | 'warning' | 'info'): string => {
          switch (severity) {
               case 'error':
                    return 'bg-red-100 text-red-800 border-red-300';
               case 'warning':
                    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
               case 'info':
                    return 'bg-blue-100 text-blue-800 border-blue-300';
          }
     };

     const getSeverityIcon = (severity: 'error' | 'warning' | 'info'): string => {
          switch (severity) {
               case 'error':
                    return '❌';
               case 'warning':
                    return '⚠️';
               case 'info':
                    return 'ℹ️';
          }
     };

     // Group issues by severity
     const issuesBySeverity = {
          error: review.issues.filter((i) => i.severity === 'error'),
          warning: review.issues.filter((i) => i.severity === 'warning'),
          info: review.issues.filter((i) => i.severity === 'info'),
     };

     return (
          <div className="space-y-6">
               {/* Overall Feedback and Score */}
               <div className={`p-6 rounded-lg border-2 ${getScoreBackground(review.score)}`}>
                    <div className="flex items-start justify-between mb-4">
                         <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                   Code Review Results
                              </h3>
                              <p className="text-gray-700 leading-relaxed">{review.overallFeedback}</p>
                         </div>
                         <div className="ml-6 flex flex-col items-center">
                              <div
                                   className={`text-4xl font-bold ${getScoreColor(review.score)}`}
                              >
                                   {review.score}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">out of 100</div>
                         </div>
                    </div>
               </div>

               {/* Strengths Section */}
               {review.strengths.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                         <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                              <span className="mr-2">✨</span>
                              What You Did Well
                         </h4>
                         <ul className="space-y-2">
                              {review.strengths.map((strength, index) => (
                                   <li key={index} className="flex items-start">
                                        <span className="text-green-600 mr-2 mt-1">✓</span>
                                        <span className="text-gray-700">{strength}</span>
                                   </li>
                              ))}
                         </ul>
                    </div>
               )}

               {/* Issues Section */}
               {review.issues.length > 0 && (
                    <div className="space-y-4">
                         <h4 className="text-lg font-semibold text-gray-900">
                              Issues to Address
                         </h4>

                         {/* Errors */}
                         {issuesBySeverity.error.length > 0 && (
                              <div className="space-y-2">
                                   <h5 className="text-sm font-medium text-red-800 uppercase tracking-wide">
                                        Errors ({issuesBySeverity.error.length})
                                   </h5>
                                   {issuesBySeverity.error.map((issue, index) => (
                                        <IssueCard
                                             key={`error-${index}`}
                                             issue={issue}
                                             index={index}
                                             isExpanded={expandedIssues.has(index)}
                                             onToggle={() => toggleIssue(index)}
                                             onAskAbout={onAskAboutIssue}
                                        />
                                   ))}
                              </div>
                         )}

                         {/* Warnings */}
                         {issuesBySeverity.warning.length > 0 && (
                              <div className="space-y-2">
                                   <h5 className="text-sm font-medium text-yellow-800 uppercase tracking-wide">
                                        Warnings ({issuesBySeverity.warning.length})
                                   </h5>
                                   {issuesBySeverity.warning.map((issue, index) => (
                                        <IssueCard
                                             key={`warning-${index}`}
                                             issue={issue}
                                             index={
                                                  issuesBySeverity.error.length + index
                                             }
                                             isExpanded={expandedIssues.has(
                                                  issuesBySeverity.error.length + index
                                             )}
                                             onToggle={() =>
                                                  toggleIssue(
                                                       issuesBySeverity.error.length + index
                                                  )
                                             }
                                             onAskAbout={onAskAboutIssue}
                                        />
                                   ))}
                              </div>
                         )}

                         {/* Info */}
                         {issuesBySeverity.info.length > 0 && (
                              <div className="space-y-2">
                                   <h5 className="text-sm font-medium text-blue-800 uppercase tracking-wide">
                                        Suggestions ({issuesBySeverity.info.length})
                                   </h5>
                                   {issuesBySeverity.info.map((issue, index) => (
                                        <IssueCard
                                             key={`info-${index}`}
                                             issue={issue}
                                             index={
                                                  issuesBySeverity.error.length +
                                                  issuesBySeverity.warning.length +
                                                  index
                                             }
                                             isExpanded={expandedIssues.has(
                                                  issuesBySeverity.error.length +
                                                  issuesBySeverity.warning.length +
                                                  index
                                             )}
                                             onToggle={() =>
                                                  toggleIssue(
                                                       issuesBySeverity.error.length +
                                                       issuesBySeverity.warning.length +
                                                       index
                                                  )
                                             }
                                             onAskAbout={onAskAboutIssue}
                                        />
                                   ))}
                              </div>
                         )}
                    </div>
               )}

               {/* General Suggestions */}
               {review.suggestions.length > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                         <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                              <span className="mr-2">💡</span>
                              General Suggestions
                         </h4>
                         <ul className="space-y-2">
                              {review.suggestions.map((suggestion, index) => (
                                   <li key={index} className="flex items-start">
                                        <span className="text-purple-600 mr-2 mt-1">→</span>
                                        <span className="text-gray-700">{suggestion}</span>
                                   </li>
                              ))}
                         </ul>
                    </div>
               )}
          </div>
     );
}

interface IssueCardProps {
     issue: CodeIssue;
     index: number;
     isExpanded: boolean;
     onToggle: () => void;
     onAskAbout?: (issue: CodeIssue) => void;
}

function IssueCard({ issue, index, isExpanded, onToggle, onAskAbout }: IssueCardProps) {
     const getSeverityColor = (severity: 'error' | 'warning' | 'info'): string => {
          switch (severity) {
               case 'error':
                    return 'border-red-300 bg-red-50';
               case 'warning':
                    return 'border-yellow-300 bg-yellow-50';
               case 'info':
                    return 'border-blue-300 bg-blue-50';
          }
     };

     const getSeverityBadgeColor = (severity: 'error' | 'warning' | 'info'): string => {
          switch (severity) {
               case 'error':
                    return 'bg-red-100 text-red-800';
               case 'warning':
                    return 'bg-yellow-100 text-yellow-800';
               case 'info':
                    return 'bg-blue-100 text-blue-800';
          }
     };

     const getSeverityIcon = (severity: 'error' | 'warning' | 'info'): string => {
          switch (severity) {
               case 'error':
                    return '❌';
               case 'warning':
                    return '⚠️';
               case 'info':
                    return 'ℹ️';
          }
     };

     return (
          <div className={`border-2 rounded-lg overflow-hidden ${getSeverityColor(issue.severity)}`}>
               <button
                    onClick={onToggle}
                    className="w-full p-4 text-left hover:bg-opacity-50 transition-colors"
               >
                    <div className="flex items-start justify-between">
                         <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                   <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                                   <span
                                        className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityBadgeColor(
                                             issue.severity
                                        )}`}
                                   >
                                        {issue.severity}
                                   </span>
                                   {issue.line !== null && (
                                        <span className="text-xs text-gray-600">
                                             Line {issue.line}
                                        </span>
                                   )}
                              </div>
                              <p className="text-gray-900 font-medium">{issue.message}</p>
                         </div>
                         <span className="ml-4 text-gray-500">
                              {isExpanded ? '▼' : '▶'}
                         </span>
                    </div>
               </button>

               {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                         <div className="pt-2 border-t border-gray-300">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                   How to fix:
                              </p>
                              <p className="text-sm text-gray-600">{issue.suggestion}</p>
                         </div>

                         {onAskAbout && (
                              <button
                                   onClick={() => onAskAbout(issue)}
                                   className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                              >
                                   <span>💬</span>
                                   Ask AI about this
                              </button>
                         )}
                    </div>
               )}
          </div>
     );
}
