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
      <label htmlFor="goal" className="block text-sm font-medium text-text-primary">
        What do you want to build or achieve?
      </label>
      <p className="text-sm text-text-secondary">
        Describe your coding goal in your own words. Be specific!
      </p>
      <textarea
        id="goal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: I want to build a personal portfolio website to showcase my projects..."
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-text-primary bg-surface ${
          error ? 'border-error' : 'border-border'
        }`}
        rows={5}
      />
      <div className="flex justify-between items-center">
        <span
          className={`text-sm ${
            charCount < minLength
              ? 'text-text-tertiary'
              : isValid
              ? 'text-success'
              : 'text-error'
          }`}
        >
          {charCount} / {maxLength} characters
          {charCount < minLength && ` (minimum ${minLength})`}
        </span>
        {error && <span className="text-sm text-error">{error}</span>}
      </div>
    </div>
  );
}
