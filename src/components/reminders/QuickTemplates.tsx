import { Droplet, Pill, Dumbbell, Moon, Apple, Coffee, Zap } from 'lucide-react';
import { ReminderType, Frequency } from '../../types/database';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: ReminderType;
  time: string;
  frequency: Frequency;
  days_of_week?: number[];
  gradient: string;
}

interface QuickTemplatesProps {
  onSelectTemplate: (template: Omit<Template, 'id' | 'icon' | 'gradient' | 'description'>) => void;
}

const templates: Template[] = [
  {
    id: 'water-2h',
    title: 'Hydration Reminder',
    description: 'Drink water every 2 hours',
    icon: Droplet,
    type: 'hydration',
    time: '09:00',
    frequency: 'daily',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'vitamins',
    title: 'Morning Vitamins',
    description: 'Take vitamins after breakfast',
    icon: Pill,
    type: 'medication',
    time: '08:00',
    frequency: 'daily',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'workout',
    title: 'Gym Time',
    description: 'Workout reminder 3x/week',
    icon: Dumbbell,
    type: 'workout',
    time: '18:00',
    frequency: 'custom',
    days_of_week: [1, 3, 5], // Mon, Wed, Fri
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    id: 'sleep',
    title: 'Sleep Schedule',
    description: 'Wind down for bed',
    icon: Moon,
    type: 'sleep',
    time: '22:00',
    frequency: 'daily',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep',
    description: 'Sunday meal preparation',
    icon: Apple,
    type: 'custom',
    time: '10:00',
    frequency: 'weekly',
    days_of_week: [0], // Sunday
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    description: 'Start your day right',
    icon: Coffee,
    type: 'custom',
    time: '07:00',
    frequency: 'daily',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'stretch',
    title: 'Stretch Break',
    description: 'Quick stretch every 2 hours',
    icon: Zap,
    type: 'workout',
    time: '10:00',
    frequency: 'daily',
    gradient: 'from-teal-500 to-cyan-500',
  },
];

export default function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  const handleTemplateClick = (template: Template) => {
    onSelectTemplate({
      title: template.title,
      type: template.type,
      time: template.time,
      frequency: template.frequency,
      days_of_week: template.days_of_week,
    });
  };

  return (
    <div className="card p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Templates</h3>
        <p className="text-sm text-gray-600">Start with a common reminder preset</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="group relative p-4 rounded-xl border-2 border-gray-200 hover:border-transparent transition-all duration-200 hover:scale-105 hover:shadow-lg bg-white overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
              
              <div className="relative">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-gray-900 text-center leading-tight">
                  {template.title}
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {template.time}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 text-center">
          💡 <span className="font-medium">Tip:</span> Click any template to customize it with your preferred time and settings
        </p>
      </div>
    </div>
  );
}

