import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { HealthMetric } from '../../types/database';

interface QuickLogProps {
  todayMetric?: HealthMetric;
  onUpdateMetric: (field: string, value: string) => Promise<void>;
  isSaving: boolean;
}

const QuickLog = memo(function QuickLog({ todayMetric, onUpdateMetric, isSaving }: QuickLogProps) {
  const [quickLog, setQuickLog] = useState({
    steps: todayMetric?.steps?.toString() || '',
    water_ml: todayMetric?.water_ml?.toString() || '',
    sleep_hours: todayMetric?.sleep_hours?.toString() || '',
    weight_kg: todayMetric?.weight_kg?.toString() || '',
    mood_rating: todayMetric?.mood_rating?.toString() || '',
  });

  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  
  const debouncedSave = useCallback((field: string, value: string) => {
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]);
    }
    
    timeoutRefs.current[field] = setTimeout(async () => {
      try {
        await onUpdateMetric(field, value);
      } catch {
        // Error handling is done in parent component
      }
    }, 500);
  }, [onUpdateMetric]);

  const handleInputChange = (field: string, value: string) => {
    setQuickLog(prev => ({ ...prev, [field]: value }));
    debouncedSave(field, value);
  };

  const increment = (field: 'steps' | 'water_ml', amount: number) => {
    const current = Number(quickLog[field] || 0);
    const next = String(Math.max(0, current + amount));
    setQuickLog({ ...quickLog, [field]: next });
    debouncedSave(field, next);
  };

  useEffect(() => {
    if (todayMetric) {
      setQuickLog({
        steps: todayMetric.steps?.toString() || '',
        water_ml: todayMetric.water_ml?.toString() || '',
        sleep_hours: todayMetric.sleep_hours?.toString() || '',
        weight_kg: todayMetric.weight_kg?.toString() || '',
        mood_rating: todayMetric.mood_rating?.toString() || '',
      });
    }
  }, [todayMetric]);

  const inputStyle = {
    background: 'rgba(11, 41, 66, 0.8)',
    border: '1px solid rgba(127, 219, 202, 0.2)',
    color: '#d6deeb',
  };

  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300" 
      id="quick-log"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>Quick Log</h2>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7fdbca' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#7fdbca' }} />
            Saving...
          </div>
        )}
      </div>
      <div className="space-y-4">
        {/* Steps */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Steps</label>
          <input
            type="number"
            value={quickLog.steps}
            onChange={(e) => handleInputChange('steps', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#7fdbca';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 219, 202, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isSaving}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: '🚶 Walk', amount: 500 },
              { label: '🏃 Jog', amount: 1000 },
              { label: '🏃‍♂️ Run', amount: 2500 },
            ].map(({ label, amount }) => (
              <button
                key={amount}
                onClick={() => increment('steps', amount)}
                disabled={isSaving}
                className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                style={{
                  background: 'rgba(127, 219, 202, 0.1)',
                  border: '1px solid rgba(127, 219, 202, 0.2)',
                  color: '#7fdbca'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(127, 219, 202, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                }}
              >
                {label}
                <span className="block text-xs" style={{ color: '#5f7e97' }}>+{amount >= 1000 ? `${amount/1000}k` : amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Water */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Water (ml)</label>
          <input
            type="number"
            value={quickLog.water_ml}
            onChange={(e) => handleInputChange('water_ml', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#82aaff';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(130, 170, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isSaving}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: '💧 Glass', amount: 250 },
              { label: '🍶 Bottle', amount: 500 },
              { label: '💦 Large', amount: 1000 },
            ].map(({ label, amount }) => (
              <button
                key={amount}
                onClick={() => increment('water_ml', amount)}
                disabled={isSaving}
                className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                style={{
                  background: 'rgba(130, 170, 255, 0.1)',
                  border: '1px solid rgba(130, 170, 255, 0.2)',
                  color: '#82aaff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(130, 170, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(130, 170, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(130, 170, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(130, 170, 255, 0.2)';
                }}
              >
                {label}
                <span className="block text-xs" style={{ color: '#5f7e97' }}>+{amount >= 1000 ? `${amount/1000}L` : `${amount}ml`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Sleep (hours)</label>
          <input
            type="number"
            step="0.5"
            value={quickLog.sleep_hours}
            onChange={(e) => handleInputChange('sleep_hours', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c792ea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isSaving}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#5f7e97' }}>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={quickLog.weight_kg}
            onChange={(e) => handleInputChange('weight_kg', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f78c6c';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247, 140, 108, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isSaving}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>How are you feeling?</label>
          <div className="flex gap-2">
            {[
              { rating: 1, emoji: '😢', label: 'Bad' },
              { rating: 2, emoji: '😕', label: 'Low' },
              { rating: 3, emoji: '😐', label: 'Okay' },
              { rating: 4, emoji: '😊', label: 'Good' },
              { rating: 5, emoji: '😄', label: 'Great' },
            ].map(({ rating, emoji, label }) => {
              const isSelected = quickLog.mood_rating === rating.toString();
              return (
                <button
                  key={rating}
                  onClick={() => handleInputChange('mood_rating', rating.toString())}
                  disabled={isSaving}
                  className="flex-1 py-3 px-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex flex-col items-center gap-1"
                  style={isSelected ? {
                    background: 'rgba(199, 146, 234, 0.2)',
                    border: '1px solid rgba(199, 146, 234, 0.5)',
                    color: '#c792ea',
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(199, 146, 234, 0.2)'
                  } : {
                    background: 'rgba(95, 126, 151, 0.1)',
                    border: '1px solid rgba(95, 126, 151, 0.2)',
                    color: '#5f7e97'
                  }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuickLog;
