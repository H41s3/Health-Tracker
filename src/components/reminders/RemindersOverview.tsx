import { useMemo } from 'react';
import { Clock, CheckCircle2, TrendingUp, Flame } from 'lucide-react';
import { Reminder } from '../../types/database';
import { format, isToday, parseISO, differenceInMinutes } from 'date-fns';

interface RemindersOverviewProps {
  reminders: Reminder[];
  completedToday: string[];
}

export default function RemindersOverview({ reminders, completedToday }: RemindersOverviewProps) {
  const stats = useMemo(() => {
    const active = reminders.filter(r => r.is_active);
    const today = new Date();
    
    // Get today's reminders
    const todaysReminders = active.filter(reminder => {
      if (reminder.frequency === 'daily') return true;
      if (reminder.frequency === 'weekly' && reminder.days_of_week) {
        return reminder.days_of_week.includes(today.getDay());
      }
      if (reminder.frequency === 'custom' && reminder.days_of_week) {
        return reminder.days_of_week.includes(today.getDay());
      }
      return false;
    });

    const totalToday = todaysReminders.length;
    const completed = completedToday.length;
    const completionRate = totalToday > 0 ? Math.round((completed / totalToday) * 100) : 0;

    // Find next reminder
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const upcomingReminders = todaysReminders
      .map(r => {
        const [hours, minutes] = r.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        return { ...r, minutesFromNow: reminderTime - currentTime };
      })
      .filter(r => r.minutesFromNow > 0)
      .sort((a, b) => a.minutesFromNow - b.minutesFromNow);

    const nextReminder = upcomingReminders[0] || null;

    // Calculate streak (mock for now - would need completion history)
    const streak = 7; // This would come from actual completion data

    return {
      totalToday,
      completed,
      completionRate,
      nextReminder,
      streak,
      upcomingSoon: upcomingReminders.filter(r => r.minutesFromNow <= 60).length,
    };
  }, [reminders, completedToday]);

  const getTimeUntilNext = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="card-elevated p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
          <p className="text-sm text-gray-600">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.completed}/{stats.totalToday}
          </div>
          <div className="text-xs text-gray-600 mt-1">Completed</div>
          <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Next Reminder */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Next Up</span>
          </div>
          {stats.nextReminder ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {getTimeUntilNext(stats.nextReminder.minutesFromNow)}
              </div>
              <div className="text-xs text-gray-600 mt-1 truncate">
                {stats.nextReminder.title}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900">—</div>
              <div className="text-xs text-gray-600 mt-1">All done!</div>
            </>
          )}
        </div>

        {/* Upcoming Soon */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Soon</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.upcomingSoon}
          </div>
          <div className="text-xs text-gray-600 mt-1">Next hour</div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.streak}
          </div>
          <div className="text-xs text-gray-600 mt-1">Days</div>
        </div>
      </div>

      {/* Progress Message */}
      {stats.completionRate === 100 ? (
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🎉</span>
            <span className="font-semibold">Perfect day! All reminders completed!</span>
          </div>
        </div>
      ) : stats.completionRate >= 75 ? (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">💪</span>
            <span className="font-semibold">Great progress! Keep it up!</span>
          </div>
        </div>
      ) : stats.completionRate >= 50 ? (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">👍</span>
            <span className="font-semibold">You're doing well! Stay consistent!</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            <span className="font-semibold">Let's make today count! You've got this!</span>
          </div>
        </div>
      )}
    </div>
  );
}

