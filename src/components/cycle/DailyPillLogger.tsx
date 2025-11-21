import { useState, useMemo, useCallback } from 'react';
import { useBirthControlStore } from '../../stores/useBirthControlStore';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import PillPackVisualization from './PillPackVisualization';

export default function DailyPillLogger() {
  const { user } = useAuth();
  const {
    activeBirthControl,
    pillLogs,
    logPill,
    getTodaysPillLog,
    getConsecutiveMissedDays,
  } = useBirthControlStore();

  const [showPackView, setShowPackView] = useState(true);

  // Memoize last 7 days generation
  const last7Days = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    }), []
  );

  // Memoize today's log and missed days
  const birthControlId = activeBirthControl?.id || '';
  const todaysLog = useMemo(() => getTodaysPillLog(birthControlId), [pillLogs, birthControlId]);
  const missedDays = useMemo(() => getConsecutiveMissedDays(birthControlId), [pillLogs, birthControlId]);

  // Optimize handleLogPill with useCallback
  const handleLogPill = useCallback(async (date: string, taken: boolean) => {
    if (!activeBirthControl || !user) return;
    await logPill(activeBirthControl.id, user.id, date, taken);
  }, [activeBirthControl, user, logPill]);

  // Memoize log lookup
  const getLogForDate = useCallback((date: string) => {
    return pillLogs.find(log => log.date === date);
  }, [pillLogs]);

  // Memoize stats calculation
  const stats = useMemo(() => ({
    pillsTaken: pillLogs.filter(log => log.taken).length,
    pillsMissed: pillLogs.filter(log => log.missed).length,
    adherence: pillLogs.length > 0 
      ? Math.round((pillLogs.filter(log => log.taken).length / pillLogs.length) * 100)
      : 0
  }), [pillLogs]);

  if (!activeBirthControl || activeBirthControl.type !== 'pill') {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Daily Pill Tracker
          </h3>
          {activeBirthControl.reminder_time && (
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              Reminder set for {activeBirthControl.reminder_time}
            </p>
          )}
        </div>
      </div>

      {/* Missed Pills Warning */}
      {missedDays > 0 && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-semibold mb-1">
                {missedDays} Consecutive Missed {missedDays === 1 ? 'Day' : 'Days'}
              </h4>
              <p className="text-red-700 text-sm font-medium">
                {missedDays >= 2 
                  ? 'Use backup contraception and consult your healthcare provider.'
                  : 'Take the missed pill as soon as you remember.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Quick Log */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl border border-purple-300">
        <p className="text-gray-700 font-semibold mb-3">Did you take your pill today?</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleLogPill(format(new Date(), 'yyyy-MM-dd'), true)}
            disabled={todaysLog?.taken}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              todaysLog?.taken
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300'
            }`}
          >
            <Check className="w-5 h-5" />
            {todaysLog?.taken ? 'Taken ✓' : 'Yes, I took it'}
          </button>
          <button
            onClick={() => handleLogPill(format(new Date(), 'yyyy-MM-dd'), false)}
            disabled={todaysLog?.missed}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              todaysLog?.missed
                ? 'bg-red-500 text-white cursor-default'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            <X className="w-5 h-5" />
            {todaysLog?.missed ? 'Missed' : 'No, I missed it'}
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">
          {showPackView ? '28-Day Pack View' : 'Last 7 Days'}
        </h4>
        <button
          onClick={() => setShowPackView(!showPackView)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {showPackView ? 'Week View' : 'Pack View'}
        </button>
      </div>

      {/* Pill Pack or Weekly View */}
      {showPackView ? (
        <PillPackVisualization pillLogs={pillLogs} packSize={28} />
      ) : (
        <div>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date) => {
            const log = getLogForDate(date);
            const isToday = date === format(new Date(), 'yyyy-MM-dd');
            const dayName = format(new Date(date), 'EEE');
            const dayNum = format(new Date(date), 'd');

            return (
              <div
                key={date}
                className={`text-center p-3 rounded-xl transition-all duration-200 ${
                  isToday 
                    ? 'bg-purple-100 border-2 border-purple-400' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-xs text-gray-600 mb-1 font-medium">{dayName}</div>
                <div className="text-lg font-bold text-gray-900 mb-2">{dayNum}</div>
                <div className="flex justify-center">
                  {log ? (
                    log.taken ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    )
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats for Week View */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">
              {stats.pillsTaken}
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Pills Taken</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">
              {stats.pillsMissed}
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Pills Missed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.adherence}%
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Adherence</div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
