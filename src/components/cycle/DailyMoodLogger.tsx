import { useEffect, useCallback, useMemo } from 'react';
import { useDailyLogStore } from '../../stores/useDailyLogStore';
import { useAuth } from '../../contexts/AuthContext';
import { Smile, Frown, Meh, Battery, Moon, Activity, Heart, Zap, Droplet, Wind } from 'lucide-react';
import { format } from 'date-fns';
import { MoodLevel, EnergyLevel } from '../../types/database';
import { debounce } from '../../utils/optimization';

export default function DailyMoodLogger() {
  const { user } = useAuth();
  const { dailyLogs, fetchDailyLogs, logDay, getTodaysLog } = useDailyLogStore();

  useEffect(() => {
    if (user) {
      const startDate = format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd');
      fetchDailyLogs(user.id, startDate);
    }
  }, [user, fetchDailyLogs]);

  const todaysLog = useMemo(() => getTodaysLog(), [dailyLogs]);

  // Memoize handlers with useCallback
  const handleLogMood = useCallback(debounce(async (mood: MoodLevel) => {
    if (!user) return;
    await logDay(user.id, format(new Date(), 'yyyy-MM-dd'), { mood });
  }, 150), [user, logDay]);

  const handleLogEnergy = useCallback(debounce(async (energy_level: EnergyLevel) => {
    if (!user) return;
    await logDay(user.id, format(new Date(), 'yyyy-MM-dd'), { energy_level });
  }, 150), [user, logDay]);

  const handleLogSleep = useCallback(debounce(async (sleep_quality: 'poor' | 'fair' | 'good' | 'excellent') => {
    if (!user) return;
    await logDay(user.id, format(new Date(), 'yyyy-MM-dd'), { sleep_quality });
  }, 150), [user, logDay]);

  // Memoize arrays to prevent re-renders
  const moods = useMemo(() => [
    { value: 'terrible' as MoodLevel, label: 'Terrible', icon: Frown, color: '#ff5874' },
    { value: 'bad' as MoodLevel, label: 'Bad', icon: Meh, color: '#f78c6c' },
    { value: 'okay' as MoodLevel, label: 'Okay', icon: Wind, color: '#ffcb6b' },
    { value: 'good' as MoodLevel, label: 'Good', icon: Smile, color: '#7fdbca' },
    { value: 'great' as MoodLevel, label: 'Great', icon: Heart, color: '#addb67' },
  ], []);

  const energyLevels = useMemo(() => [
    { value: 1 as EnergyLevel, label: 'Very Low', icon: Battery },
    { value: 2 as EnergyLevel, label: 'Low', icon: Battery },
    { value: 3 as EnergyLevel, label: 'Medium', icon: Zap },
    { value: 4 as EnergyLevel, label: 'High', icon: Zap },
    { value: 5 as EnergyLevel, label: 'Very High', icon: Zap },
  ], []);

  const sleepQuality = useMemo(() => [
    { value: 'poor' as const, label: 'Poor', icon: Moon, color: '#5f7e97' },
    { value: 'fair' as const, label: 'Fair', icon: Droplet, color: '#82aaff' },
    { value: 'good' as const, label: 'Good', icon: Moon, color: '#c792ea' },
    { value: 'excellent' as const, label: 'Excellent', icon: Activity, color: '#7fdbca' },
  ], []);

  // Memoize stats to prevent recalculation
  const stats = useMemo(() => {
    if (!dailyLogs.length) return null;
    return {
      goodDays: dailyLogs.filter(log => log.mood === 'good' || log.mood === 'great').length,
      highEnergy: dailyLogs.filter(log => log.energy_level && log.energy_level >= 4).length,
      goodSleep: dailyLogs.filter(log => log.sleep_quality === 'good' || log.sleep_quality === 'excellent').length,
    };
  }, [dailyLogs]);

  return (
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl" style={{ background: 'rgba(199, 146, 234, 0.15)' }}>
          <Smile className="w-5 h-5" style={{ color: '#c792ea' }} />
        </div>
        <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>Daily Check-In</h3>
      </div>

      <div className="space-y-6">
        {/* Mood */}
        <div>
          <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#5f7e97' }}>
            <Smile className="w-4 h-4" />
            How are you feeling today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = todaysLog?.mood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleLogMood(mood.value)}
                  className="group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden"
                  style={isSelected ? {
                    background: `linear-gradient(135deg, ${mood.color}40, ${mood.color}20)`,
                    borderColor: mood.color,
                    color: mood.color
                  } : {
                    background: 'rgba(11, 41, 66, 0.5)',
                    borderColor: 'rgba(127, 219, 202, 0.2)',
                    color: '#5f7e97'
                  }}
                >
                  <Icon className="w-7 h-7 mx-auto mb-2" style={{ color: isSelected ? mood.color : '#5f7e97' }} strokeWidth={2.5} />
                  <div className="text-xs font-semibold relative z-10" style={{ color: isSelected ? mood.color : '#d6deeb' }}>{mood.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level */}
        <div>
          <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#5f7e97' }}>
            <Battery className="w-4 h-4" />
            Energy Level
          </label>
          <div className="grid grid-cols-5 gap-2">
            {energyLevels.map((level) => {
              const Icon = level.icon;
              const isSelected = todaysLog?.energy_level === level.value;
              return (
                <button
                  key={level.value}
                  onClick={() => handleLogEnergy(level.value)}
                  className="group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden"
                  style={isSelected ? {
                    background: 'linear-gradient(135deg, rgba(130, 170, 255, 0.3), rgba(130, 170, 255, 0.1))',
                    borderColor: '#82aaff',
                    color: '#82aaff'
                  } : {
                    background: 'rgba(11, 41, 66, 0.5)',
                    borderColor: 'rgba(127, 219, 202, 0.2)',
                    color: '#5f7e97'
                  }}
                >
                  <Icon 
                    className="w-6 h-6 mx-auto mb-2" 
                    style={{ color: isSelected ? '#82aaff' : '#5f7e97' }}
                    fill={isSelected ? 'currentColor' : 'none'} 
                    strokeWidth={2.5} 
                  />
                  <div className="text-xs font-semibold relative z-10">
                    <div className="text-xl font-bold" style={{ color: isSelected ? '#82aaff' : '#d6deeb' }}>{level.value}</div>
                    <span style={{ color: isSelected ? '#82aaff' : '#5f7e97' }}>{level.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#5f7e97' }}>
            <Moon className="w-4 h-4" />
            Sleep Quality (last night)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {sleepQuality.map((sleep) => {
              const Icon = sleep.icon;
              const isSelected = todaysLog?.sleep_quality === sleep.value;
              return (
                <button
                  key={sleep.value}
                  onClick={() => handleLogSleep(sleep.value)}
                  className="group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden"
                  style={isSelected ? {
                    background: `linear-gradient(135deg, ${sleep.color}40, ${sleep.color}20)`,
                    borderColor: sleep.color,
                    color: sleep.color
                  } : {
                    background: 'rgba(11, 41, 66, 0.5)',
                    borderColor: 'rgba(127, 219, 202, 0.2)',
                    color: '#5f7e97'
                  }}
                >
                  <Icon 
                    className="w-7 h-7 mx-auto mb-2" 
                    style={{ color: isSelected ? sleep.color : '#5f7e97' }}
                    fill={isSelected ? 'currentColor' : 'none'} 
                    strokeWidth={2.5} 
                  />
                  <div className="text-xs font-semibold relative z-10" style={{ color: isSelected ? sleep.color : '#d6deeb' }}>{sleep.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        {dailyLogs.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div 
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(11, 41, 66, 0.5)' }}
            >
              <div className="text-2xl font-bold" style={{ color: '#addb67' }}>
                {stats?.goodDays}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Good Days</div>
            </div>
            <div 
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(11, 41, 66, 0.5)' }}
            >
              <div className="text-2xl font-bold" style={{ color: '#82aaff' }}>
                {stats?.highEnergy}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>High Energy</div>
            </div>
            <div 
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(11, 41, 66, 0.5)' }}
            >
              <div className="text-2xl font-bold" style={{ color: '#c792ea' }}>
                {stats?.goodSleep}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Good Sleep</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
