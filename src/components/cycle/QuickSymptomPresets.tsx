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
          <h4 className="text-sm font-semibold" style={{ color: '#d6deeb' }}>Quick Presets</h4>
          <p className="text-xs" style={{ color: '#5f7e97' }}>Select common symptom combinations</p>
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
                className="w-full p-4 rounded-xl border-2 transition-all duration-300 text-left"
                style={hasMatches ? {
                  background: `linear-gradient(135deg, rgba(199, 146, 234, 0.3), rgba(255, 88, 116, 0.3))`,
                  borderColor: '#c792ea',
                  color: '#d6deeb'
                } : {
                  background: 'rgba(11, 41, 66, 0.5)',
                  borderColor: 'rgba(199, 146, 234, 0.2)',
                  color: '#d6deeb'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <Icon className="w-4 h-4" style={{ color: hasMatches ? '#d6deeb' : '#5f7e97' }} />
                </div>
                <div className="text-sm font-semibold">
                  {preset.name}
                </div>
                {hasMatches && (
                  <div className="mt-2 text-xs font-medium" style={{ color: 'rgba(214, 222, 235, 0.8)' }}>
                    {matchCount}/{preset.symptoms.length} selected
                  </div>
                )}
              </button>

              {/* Expanded view with individual symptoms */}
              {isExpanded && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 z-10 rounded-xl border-2 p-4 animate-in"
                  style={{ 
                    background: 'rgba(29, 59, 83, 0.95)', 
                    borderColor: '#c792ea',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-sm" style={{ color: '#d6deeb' }}>{preset.name}</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPreset(null);
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: '#5f7e97' }}
                    >
                      <X className="w-4 h-4" />
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
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                          style={isSelected ? {
                            background: 'rgba(199, 146, 234, 0.2)',
                            color: '#c792ea'
                          } : {
                            background: 'rgba(11, 41, 66, 0.5)',
                            color: '#d6deeb'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{symptom}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#c792ea' }}>
                                <Plus className="w-3 h-3 rotate-45" style={{ color: '#011627' }} />
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
                    className="w-full mt-3 py-2 font-semibold rounded-lg transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #c792ea 0%, #ff5874 100%)',
                      color: '#011627'
                    }}
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
        <div 
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ 
            background: 'rgba(199, 146, 234, 0.1)', 
            border: '1px solid rgba(199, 146, 234, 0.2)' 
          }}
        >
          <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>
            {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => selectedSymptoms.forEach(s => onToggleSymptom(s))}
            className="text-sm font-medium transition-colors"
            style={{ color: '#c792ea' }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
