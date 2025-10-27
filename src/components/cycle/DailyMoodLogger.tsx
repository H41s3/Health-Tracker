import { useEffect, useState, useCallback, useMemo } from 'react';
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
    { value: 'terrible' as MoodLevel, label: 'Terrible', icon: Frown, color: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
    { value: 'bad' as MoodLevel, label: 'Bad', icon: Meh, color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
    { value: 'okay' as MoodLevel, label: 'Okay', icon: Wind, color: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-600' },
    { value: 'good' as MoodLevel, label: 'Good', icon: Smile, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    { value: 'great' as MoodLevel, label: 'Great', icon: Heart, color: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
  ], []);

  const energyLevels = useMemo(() => [
    { value: 1 as EnergyLevel, label: 'Very Low', icon: Battery },
    { value: 2 as EnergyLevel, label: 'Low', icon: Battery },
    { value: 3 as EnergyLevel, label: 'Medium', icon: Zap },
    { value: 4 as EnergyLevel, label: 'High', icon: Zap },
    { value: 5 as EnergyLevel, label: 'Very High', icon: Zap },
  ], []);

  const sleepQuality = useMemo(() => [
    { value: 'poor' as const, label: 'Poor', icon: Moon, gradient: 'from-slate-400 to-slate-500' },
    { value: 'fair' as const, label: 'Fair', icon: Droplet, gradient: 'from-blue-400 to-blue-500' },
    { value: 'good' as const, label: 'Good', icon: Moon, gradient: 'from-purple-400 to-purple-500' },
    { value: 'excellent' as const, label: 'Excellent', icon: Activity, gradient: 'from-violet-400 to-violet-500' },
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
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-violet-100/20 to-pink-100/20 rounded-xl">
          <Smile className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Daily Check-In</h3>
      </div>

      <div className="space-y-6">
        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Smile className="w-4 h-4" />
            How are you feeling today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleLogMood(mood.value)}
                  className={`group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
                    todaysLog?.mood === mood.value
                      ? `bg-gradient-to-br ${mood.gradient} border-transparent text-white shadow-xl scale-105`
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  {todaysLog?.mood === mood.value && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className={`w-7 h-7 mx-auto mb-2 ${todaysLog?.mood === mood.value ? 'text-white' : 'text-gray-600'}`} strokeWidth={2.5} />
                  <div className="text-xs font-semibold relative z-10">{mood.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
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
                  className={`group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-transparent text-white shadow-xl scale-105'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} 
                        fill={isSelected ? 'currentColor' : 'none'} 
                        strokeWidth={2.5} />
                  <div className="text-xs font-semibold relative z-10">
                    <div className="text-xl font-bold">{level.value}</div>
                    {level.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
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
                  className={`group relative py-4 px-3 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-br ${sleep.gradient} border-transparent text-white shadow-xl scale-105`
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className={`w-7 h-7 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} 
                        fill={isSelected ? 'currentColor' : 'none'} 
                        strokeWidth={2.5} />
                  <div className="text-xs font-semibold relative z-10">{sleep.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        {dailyLogs.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.goodDays}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">Good Days</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.highEnergy}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">High Energy</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.goodSleep}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">Good Sleep</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
