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

  // Debounced save function with timeout management
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  
  const debouncedSave = useCallback((field: string, value: string) => {
    // Clear existing timeout for this field
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]);
    }
    
    // Set new timeout
    timeoutRefs.current[field] = setTimeout(async () => {
      try {
        await onUpdateMetric(field, value);
      } catch {
        // Error handling is done in parent component
      }
    }, 500); // 500ms delay
  }, [onUpdateMetric]);

  // Update local state immediately, save to API with debounce
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

  // Update local state when todayMetric changes
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow" id="quick-log">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Log</h2>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            Saving...
          </div>
        )}
      </div>
      <div className="space-y-4">
        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
          <input
            type="number"
            value={quickLog.steps}
            onChange={(e) => handleInputChange('steps', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-50 transition-all"
            disabled={isSaving}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => increment('steps', 500)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 transition-all font-medium text-emerald-700"
            >
              🚶 Walk
              <span className="block text-xs text-emerald-600">+500</span>
            </button>
            <button
              onClick={() => increment('steps', 1000)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 transition-all font-medium text-emerald-700"
            >
              🏃 Jog
              <span className="block text-xs text-emerald-600">+1k</span>
            </button>
            <button
              onClick={() => increment('steps', 2500)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 transition-all font-medium text-emerald-700"
            >
              🏃‍♂️ Run
              <span className="block text-xs text-emerald-600">+2.5k</span>
            </button>
          </div>
        </div>

        {/* Water */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Water (ml)</label>
          <input
            type="number"
            value={quickLog.water_ml}
            onChange={(e) => handleInputChange('water_ml', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none disabled:bg-gray-50 transition-all"
            disabled={isSaving}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => increment('water_ml', 250)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 disabled:opacity-50 transition-all font-medium text-sky-700"
            >
              💧 Glass
              <span className="block text-xs text-sky-600">+250ml</span>
            </button>
            <button
              onClick={() => increment('water_ml', 500)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 disabled:opacity-50 transition-all font-medium text-sky-700"
            >
              🍶 Bottle
              <span className="block text-xs text-sky-600">+500ml</span>
            </button>
            <button
              onClick={() => increment('water_ml', 1000)}
              disabled={isSaving}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 disabled:opacity-50 transition-all font-medium text-sky-700"
            >
              💦 Large
              <span className="block text-xs text-sky-600">+1L</span>
            </button>
          </div>
        </div>

        {/* Sleep */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sleep (hours)</label>
          <input
            type="number"
            step="0.5"
            value={quickLog.sleep_hours}
            onChange={(e) => handleInputChange('sleep_hours', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-50"
            disabled={isSaving}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={quickLog.weight_kg}
            onChange={(e) => handleInputChange('weight_kg', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-50"
            disabled={isSaving}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
          <div className="flex gap-2">
            {[
              { rating: 1, emoji: '😢', label: 'Bad' },
              { rating: 2, emoji: '😕', label: 'Low' },
              { rating: 3, emoji: '😐', label: 'Okay' },
              { rating: 4, emoji: '😊', label: 'Good' },
              { rating: 5, emoji: '😄', label: 'Great' },
            ].map(({ rating, emoji, label }) => (
              <button
                key={rating}
                onClick={() => handleInputChange('mood_rating', rating.toString())}
                disabled={isSaving}
                className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all disabled:opacity-50 flex flex-col items-center gap-1 ${
                  quickLog.mood_rating === rating.toString()
                    ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuickLog;
