import { useState, useEffect, useCallback, useRef } from 'react';
import { HealthMetric } from '../../types/database';

interface QuickLogProps {
  todayMetric?: HealthMetric;
  onUpdateMetric: (field: string, value: string) => Promise<void>;
  isSaving: boolean;
}

export default function QuickLog({ todayMetric, onUpdateMetric, isSaving }: QuickLogProps) {
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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" id="quick-log">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Log</h2>
      <div className="space-y-4">
        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
          <input
            type="number"
            value={quickLog.steps}
            onChange={(e) => handleInputChange('steps', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-50"
            disabled={isSaving}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => increment('steps', 500)}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              +500
            </button>
            <button
              onClick={() => increment('steps', 1000)}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              +1000
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-50"
            disabled={isSaving}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => increment('water_ml', 250)}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              +250ml
            </button>
            <button
              onClick={() => increment('water_ml', 500)}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              +500ml
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Mood (1-5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleInputChange('mood_rating', rating.toString())}
                disabled={isSaving}
                className={`flex-1 py-2 rounded-lg border-2 transition disabled:opacity-50 ${
                  quickLog.mood_rating === rating.toString()
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
