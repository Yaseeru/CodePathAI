'use client';

import { useState } from 'react';

interface GoalInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function GoalInput({ value, onChange, error }: GoalInputProps) {
  const minLength = 20;
  const maxLength = 500;
  const charCount = value.length;
  const isValid = charCount >= minLength && charCount <= maxLength;

  return (
    <div className="space-y-2">
      <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
        What do you want to build or achieve?
      </label>
      <p className="text-sm text-gray-500">
        Describe your coding goal in your own words. Be specific!
      </p>
      <textarea
        id="goal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: I want to build a personal portfolio website to showcase my projects..."
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        rows={5}
      />
      <div className="flex justify-between items-center">
        <span
          className={`text-sm ${
            charCount < minLength
              ? 'text-gray-400'
              : isValid
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {charCount} / {maxLength} characters
          {charCount < minLength && ` (minimum ${minLength})`}
        </span>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
