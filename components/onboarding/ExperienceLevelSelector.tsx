'use client';

interface ExperienceLevelSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
}

const experienceLevels = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to coding or just starting out',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some coding experience, familiar with basics',
    icon: '🚀',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced coder, looking to expand skills',
    icon: '⚡',
  },
];

export default function ExperienceLevelSelector({
  value,
  onChange,
  error,
}: ExperienceLevelSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your current coding experience?
        </label>
        <p className="text-sm text-gray-500">
          This helps us tailor the difficulty and pace of your lessons.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {experienceLevels.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={`p-4 border-2 rounded-lg text-left transition-all flex items-start gap-4 ${
              value === level.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{level.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{level.label}</div>
              <div className="text-sm text-gray-500 mt-1">{level.description}</div>
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
