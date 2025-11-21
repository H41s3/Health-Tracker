import { useState } from 'react';
import { Zap, Calendar, Moon, Heart, Plus, X } from 'lucide-react';

interface QuickSymptomPresetsProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptom: string) => void;
  onApplyPreset: (symptoms: string[]) => void;
}

const presets = [
  {
    id: 'pms',
    name: 'PMS Combo',
    emoji: '😫',
    icon: Moon,
    symptoms: ['Mood Swings', 'Cramps', 'Bloating', 'Fatigue', 'Irritability', 'Headache'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'period-day1',
    name: 'Period Day 1',
    emoji: '🩸',
    icon: Calendar,
    symptoms: ['Heavy Flow', 'Severe Cramps', 'Lower Back Pain', 'Fatigue', 'Nausea'],
    gradient: 'from-red-500 to-rose-500',
  },
  {
    id: 'ovulation',
    name: 'Ovulation',
    emoji: '🌸',
    icon: Heart,
    symptoms: ['Breast Tenderness', 'Increased Energy', 'Clear Discharge', 'Light Cramps'],
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'light-period',
    name: 'Light Period',
    emoji: '🌊',
    icon: Zap,
    symptoms: ['Light Flow', 'Mild Cramps', 'Spotting', 'Lower Back Pain'],
    gradient: 'from-teal-500 to-cyan-500',
  },
];

export default function QuickSymptomPresets({
  selectedSymptoms,
  onToggleSymptom,
  onApplyPreset,
}: QuickSymptomPresetsProps) {
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: typeof presets[0]) => {
    if (expandedPreset === preset.id) {
      setExpandedPreset(null);
    } else {
      setExpandedPreset(preset.id);
    }
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    // Add all symptoms from preset that aren't already selected
    const symptomsToAdd = preset.symptoms.filter(s => !selectedSymptoms.includes(s));
    symptomsToAdd.forEach(symptom => onToggleSymptom(symptom));
    setExpandedPreset(null);
  };

  const getPresetMatchCount = (preset: typeof presets[0]) => {
    return preset.symptoms.filter(s => selectedSymptoms.includes(s)).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Quick Presets</h4>
          <p className="text-xs text-gray-600">Select common symptom combinations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const matchCount = getPresetMatchCount(preset);
          const isExpanded = expandedPreset === preset.id;
          const hasMatches = matchCount > 0;

          return (
            <div key={preset.id} className="relative">
              <button
                onClick={() => handlePresetClick(preset)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${hasMatches
                    ? `bg-gradient-to-br ${preset.gradient} border-transparent text-white shadow-lg scale-105`
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <Icon className={`w-4 h-4 ${hasMatches ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className={`text-sm font-semibold ${hasMatches ? 'text-white' : 'text-gray-900'}`}>
                  {preset.name}
                </div>
                {hasMatches && (
                  <div className="mt-2 text-xs text-white/80 font-medium">
                    {matchCount}/{preset.symptoms.length} selected
                  </div>
                )}
              </button>

              {/* Expanded view with individual symptoms */}
              {isExpanded && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-white rounded-xl border-2 border-purple-300 shadow-2xl p-4 animate-in">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900 text-sm">{preset.name}</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPreset(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {preset.symptoms.map((symptom) => {
                      const isSelected = selectedSymptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSymptom(symptom);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                            ${isSelected
                              ? 'bg-purple-100 text-purple-700 font-medium'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span>{symptom}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                <Plus className="w-3 h-3 text-white rotate-45" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(preset);
                    }}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Apply All
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
          <span className="text-sm font-medium text-purple-900">
            {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => selectedSymptoms.forEach(s => onToggleSymptom(s))}
            className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

