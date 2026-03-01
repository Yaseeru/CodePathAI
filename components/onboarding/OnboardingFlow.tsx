'use client';

import { useState } from 'react';
import GoalInput from './GoalInput';
import TimeCommitmentSelector from './TimeCommitmentSelector';
import ExperienceLevelSelector from './ExperienceLevelSelector';

interface OnboardingData {
  goal: string;
  timeCommitment: number | null;
  experienceLevel: string | null;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => Promise<void>;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    goal: '',
    timeCommitment: null,
    experienceLevel: null,
  });

  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (formData.goal.length < 20) {
        newErrors.goal = 'Please provide at least 20 characters';
      } else if (formData.goal.length > 500) {
        newErrors.goal = 'Please keep your goal under 500 characters';
      }
    } else if (step === 2) {
      if (!formData.timeCommitment) {
        newErrors.timeCommitment = 'Please select your time commitment';
      }
    } else if (step === 3) {
      if (!formData.experienceLevel) {
        newErrors.experienceLevel = 'Please select your experience level';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    { title: 'Welcome to CodePath AI! 🎯', subtitle: 'Tell us what you want to build.' },
    { title: 'Time Commitment ⏰', subtitle: 'How much time can you dedicate to learning each week?' },
    { title: 'Experience Level 📚', subtitle: 'Tell us about your coding background.' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step}
              </div>
              {step < totalSteps && <div className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">Step {currentStep} of {totalSteps}</div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{stepTitles[currentStep - 1].title}</h2>
        <p className="text-gray-600 mb-6">{stepTitles[currentStep - 1].subtitle}</p>

        {currentStep === 1 && (
          <GoalInput
            value={formData.goal}
            onChange={(value) => setFormData({ ...formData, goal: value })}
            error={errors.goal}
          />
        )}
        {currentStep === 2 && (
          <TimeCommitmentSelector
            value={formData.timeCommitment}
            onChange={(value) => setFormData({ ...formData, timeCommitment: value })}
            error={errors.timeCommitment}
          />
        )}
        {currentStep === 3 && (
          <ExperienceLevelSelector
            value={formData.experienceLevel}
            onChange={(value) => setFormData({ ...formData, experienceLevel: value })}
            error={errors.experienceLevel}
          />
        )}

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1 || loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : currentStep === totalSteps ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
