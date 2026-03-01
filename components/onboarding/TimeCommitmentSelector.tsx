'use client';

interface TimeCommitmentSelectorProps {
     value: number | null;
     onChange: (value: number) => void;
     error?: string;
}

const timeOptions = [
     { value: 2, label: '1-2 hours/week', description: 'Perfect for busy schedules' },
     { value: 5, label: '3-5 hours/week', description: 'Steady progress' },
     { value: 10, label: '6-10 hours/week', description: 'Accelerated learning' },
     { value: 15, label: '10+ hours/week', description: 'Intensive learning' },
];

export default function TimeCommitmentSelector({
     value,
     onChange,
     error,
}: TimeCommitmentSelectorProps) {
     return (
          <div className="space-y-4">
               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                         How much time can you commit per week?
                    </label>
                    <p className="text-sm text-gray-500">
                         This helps us pace your learning journey appropriately.
                    </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timeOptions.map((option) => (
                         <button
                              key={option.value}
                              type="button"
                              onClick={() => onChange(option.value)}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${value === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                   }`}
                         >
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                         </button>
                    ))}
               </div>
               {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
     );
}
