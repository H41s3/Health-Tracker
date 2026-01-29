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
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: '#d6deeb' }}>
            Daily Pill Tracker
          </h3>
          {activeBirthControl.reminder_time && (
            <p className="text-sm mt-1 flex items-center gap-1 font-medium" style={{ color: '#5f7e97' }}>
              <Clock className="w-3 h-3" />
              Reminder set for {activeBirthControl.reminder_time}
            </p>
          )}
        </div>
      </div>

      {/* Missed Pills Warning */}
      {missedDays > 0 && (
        <div 
          className="mb-4 p-4 rounded-xl"
          style={{ background: 'rgba(255, 88, 116, 0.15)', border: '1px solid rgba(255, 88, 116, 0.3)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff5874' }} />
            <div>
              <h4 className="font-semibold mb-1" style={{ color: '#ff5874' }}>
                {missedDays} Consecutive Missed {missedDays === 1 ? 'Day' : 'Days'}
              </h4>
              <p className="text-sm font-medium" style={{ color: 'rgba(255, 88, 116, 0.8)' }}>
                {missedDays >= 2 
                  ? 'Use backup contraception and consult your healthcare provider.'
                  : 'Take the missed pill as soon as you remember.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Quick Log */}
      <div 
        className="mb-6 p-4 rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(199, 146, 234, 0.15), rgba(255, 88, 116, 0.15))',
          border: '1px solid rgba(199, 146, 234, 0.3)'
        }}
      >
        <p className="font-semibold mb-3" style={{ color: '#d6deeb' }}>Did you take your pill today?</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleLogPill(format(new Date(), 'yyyy-MM-dd'), true)}
            disabled={todaysLog?.taken}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={todaysLog?.taken ? {
              background: '#addb67',
              color: '#011627',
              cursor: 'default'
            } : {
              background: 'rgba(173, 219, 103, 0.15)',
              color: '#addb67',
              border: '1px solid rgba(173, 219, 103, 0.3)'
            }}
          >
            <Check className="w-5 h-5" />
            {todaysLog?.taken ? 'Taken ✓' : 'Yes, I took it'}
          </button>
          <button
            onClick={() => handleLogPill(format(new Date(), 'yyyy-MM-dd'), false)}
            disabled={todaysLog?.missed}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={todaysLog?.missed ? {
              background: '#ff5874',
              color: '#011627',
              cursor: 'default'
            } : {
              background: 'rgba(255, 88, 116, 0.15)',
              color: '#ff5874',
              border: '1px solid rgba(255, 88, 116, 0.3)'
            }}
          >
            <X className="w-5 h-5" />
            {todaysLog?.missed ? 'Missed' : 'No, I missed it'}
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold" style={{ color: '#d6deeb' }}>
          {showPackView ? '28-Day Pack View' : 'Last 7 Days'}
        </h4>
        <button
          onClick={() => setShowPackView(!showPackView)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ 
            background: 'rgba(199, 146, 234, 0.15)',
            color: '#c792ea'
          }}
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
                className="text-center p-3 rounded-xl transition-all duration-200"
                style={isToday ? {
                  background: 'rgba(199, 146, 234, 0.15)',
                  border: '2px solid #c792ea'
                } : {
                  background: 'rgba(11, 41, 66, 0.5)',
                  border: '1px solid rgba(127, 219, 202, 0.1)'
                }}
              >
                <div className="text-xs mb-1 font-medium" style={{ color: '#5f7e97' }}>{dayName}</div>
                <div className="text-lg font-bold mb-2" style={{ color: '#d6deeb' }}>{dayNum}</div>
                <div className="flex justify-center">
                  {log ? (
                    log.taken ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#addb67' }}>
                        <Check className="w-4 h-4" style={{ color: '#011627' }} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#ff5874' }}>
                        <X className="w-4 h-4" style={{ color: '#011627' }} />
                      </div>
                    )
                  ) : (
                    <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats for Week View */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div 
            className="text-center p-3 rounded-xl"
            style={{ background: 'rgba(11, 41, 66, 0.5)' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#addb67' }}>
              {stats.pillsTaken}
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Pills Taken</div>
          </div>
          <div 
            className="text-center p-3 rounded-xl"
            style={{ background: 'rgba(11, 41, 66, 0.5)' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#ff5874' }}>
              {stats.pillsMissed}
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Pills Missed</div>
          </div>
          <div 
            className="text-center p-3 rounded-xl"
            style={{ background: 'rgba(11, 41, 66, 0.5)' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#7fdbca' }}>
              {stats.adherence}%
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Adherence</div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
