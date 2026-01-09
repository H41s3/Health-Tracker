import { Droplet, Pill, Dumbbell, Moon, Apple, Coffee, Zap } from 'lucide-react';
import { ReminderType, Frequency } from '../../types/database';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  type: ReminderType;
  time: string;
  frequency: Frequency;
  days_of_week?: number[];
  color: string;
}

interface QuickTemplatesProps {
  onSelectTemplate: (template: Omit<Template, 'id' | 'icon' | 'color' | 'description'>) => void;
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
    color: '#82aaff',
  },
  {
    id: 'vitamins',
    title: 'Morning Vitamins',
    description: 'Take vitamins after breakfast',
    icon: Pill,
    type: 'medication',
    time: '08:00',
    frequency: 'daily',
    color: '#c792ea',
  },
  {
    id: 'workout',
    title: 'Gym Time',
    description: 'Workout reminder 3x/week',
    icon: Dumbbell,
    type: 'workout',
    time: '18:00',
    frequency: 'custom',
    days_of_week: [1, 3, 5],
    color: '#7fdbca',
  },
  {
    id: 'sleep',
    title: 'Sleep Schedule',
    description: 'Wind down for bed',
    icon: Moon,
    type: 'sleep',
    time: '22:00',
    frequency: 'daily',
    color: '#82aaff',
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep',
    description: 'Sunday meal preparation',
    icon: Apple,
    type: 'custom',
    time: '10:00',
    frequency: 'weekly',
    days_of_week: [0],
    color: '#ff6ac1',
  },
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    description: 'Start your day right',
    icon: Coffee,
    type: 'custom',
    time: '07:00',
    frequency: 'daily',
    color: '#ffcb6b',
  },
  {
    id: 'stretch',
    title: 'Stretch Break',
    description: 'Quick stretch every 2 hours',
    icon: Zap,
    type: 'workout',
    time: '10:00',
    frequency: 'daily',
    color: '#7fdbca',
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
    <div 
      className="p-6 mb-6 rounded-xl"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1" style={{ color: '#d6deeb' }}>Quick Templates</h3>
        <p className="text-sm" style={{ color: '#5f7e97' }}>Start with a common reminder preset</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="group relative p-4 rounded-xl transition-all duration-200 overflow-hidden"
              style={{
                background: 'rgba(11, 41, 66, 0.5)',
                border: '1px solid rgba(127, 219, 202, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = template.color;
                e.currentTarget.style.boxShadow = `0 8px 32px ${template.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="relative">
                <div 
                  className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${template.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: template.color }} />
                </div>
                <div className="text-xs font-semibold text-center leading-tight" style={{ color: '#d6deeb' }}>
                  {template.title}
                </div>
                <div className="text-xs text-center mt-1" style={{ color: '#5f7e97' }}>
                  {template.time}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div 
        className="mt-4 p-3 rounded-lg"
        style={{
          background: 'rgba(130, 170, 255, 0.1)',
          border: '1px solid rgba(130, 170, 255, 0.2)'
        }}
      >
        <p className="text-xs text-center" style={{ color: '#82aaff' }}>
          💡 <span className="font-medium">Tip:</span> Click any template to customize it with your preferred time and settings
        </p>
      </div>
    </div>
  );
}
