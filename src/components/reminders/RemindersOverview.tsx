import { useMemo } from 'react';
import { Clock, CheckCircle2, TrendingUp, Flame } from 'lucide-react';
import { Reminder } from '../../types/database';
import { format } from 'date-fns';

interface RemindersOverviewProps {
  reminders: Reminder[];
  completedToday: string[];
}

export default function RemindersOverview({ reminders, completedToday }: RemindersOverviewProps) {
  const stats = useMemo(() => {
    const active = reminders.filter(r => r.is_active);
    const today = new Date();
    
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
    const streak = 7;

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
    <div 
      className="p-6 mb-6 rounded-xl"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-xl"
          style={{ background: 'rgba(130, 170, 255, 0.15)' }}
        >
          <Clock className="w-6 h-6" style={{ color: '#82aaff' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#d6deeb' }}>Today's Schedule</h2>
          <p className="text-sm" style={{ color: '#5f7e97' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Completion Rate */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'rgba(173, 219, 103, 0.1)',
            border: '1px solid rgba(173, 219, 103, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#addb67' }} />
            <span className="text-xs font-medium" style={{ color: '#addb67' }}>Today</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
            {stats.completed}/{stats.totalToday}
          </div>
          <div className="text-xs mt-1" style={{ color: '#5f7e97' }}>Completed</div>
          <div 
            className="mt-2 rounded-full h-2 overflow-hidden"
            style={{ background: 'rgba(95, 126, 151, 0.3)' }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{ 
                width: `${stats.completionRate}%`,
                background: 'linear-gradient(90deg, #7fdbca 0%, #addb67 100%)'
              }}
            />
          </div>
        </div>

        {/* Next Reminder */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'rgba(130, 170, 255, 0.1)',
            border: '1px solid rgba(130, 170, 255, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5" style={{ color: '#82aaff' }} />
            <span className="text-xs font-medium" style={{ color: '#82aaff' }}>Next Up</span>
          </div>
          {stats.nextReminder ? (
            <>
              <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
                {getTimeUntilNext(stats.nextReminder.minutesFromNow)}
              </div>
              <div className="text-xs mt-1 truncate" style={{ color: '#5f7e97' }}>
                {stats.nextReminder.title}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>—</div>
              <div className="text-xs mt-1" style={{ color: '#5f7e97' }}>All done!</div>
            </>
          )}
        </div>

        {/* Upcoming Soon */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255, 203, 107, 0.1)',
            border: '1px solid rgba(255, 203, 107, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#ffcb6b' }} />
            <span className="text-xs font-medium" style={{ color: '#ffcb6b' }}>Soon</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
            {stats.upcomingSoon}
          </div>
          <div className="text-xs mt-1" style={{ color: '#5f7e97' }}>Next hour</div>
        </div>

        {/* Streak */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'rgba(247, 140, 108, 0.1)',
            border: '1px solid rgba(247, 140, 108, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5" style={{ color: '#f78c6c' }} />
            <span className="text-xs font-medium" style={{ color: '#f78c6c' }}>Streak</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>
            {stats.streak}
          </div>
          <div className="text-xs mt-1" style={{ color: '#5f7e97' }}>Days</div>
        </div>
      </div>

      {/* Progress Message */}
      {stats.completionRate === 100 ? (
        <div 
          className="rounded-lg p-3 text-center"
          style={{ background: 'linear-gradient(135deg, #7fdbca 0%, #addb67 100%)' }}
        >
          <div className="flex items-center justify-center gap-2" style={{ color: '#011627' }}>
            <span className="text-xl">🎉</span>
            <span className="font-semibold">Perfect day! All reminders completed!</span>
          </div>
        </div>
      ) : stats.completionRate >= 75 ? (
        <div 
          className="rounded-lg p-3 text-center"
          style={{ background: 'linear-gradient(135deg, #82aaff 0%, #c792ea 100%)' }}
        >
          <div className="flex items-center justify-center gap-2" style={{ color: '#011627' }}>
            <span className="text-xl">💪</span>
            <span className="font-semibold">Great progress! Keep it up!</span>
          </div>
        </div>
      ) : stats.completionRate >= 50 ? (
        <div 
          className="rounded-lg p-3 text-center"
          style={{ background: 'linear-gradient(135deg, #ffcb6b 0%, #f78c6c 100%)' }}
        >
          <div className="flex items-center justify-center gap-2" style={{ color: '#011627' }}>
            <span className="text-xl">👍</span>
            <span className="font-semibold">You're doing well! Stay consistent!</span>
          </div>
        </div>
      ) : (
        <div 
          className="rounded-lg p-3 text-center"
          style={{ background: 'linear-gradient(135deg, #c792ea 0%, #ff6ac1 100%)' }}
        >
          <div className="flex items-center justify-center gap-2" style={{ color: '#011627' }}>
            <span className="text-xl">✨</span>
            <span className="font-semibold">Let's make today count! You've got this!</span>
          </div>
        </div>
      )}
    </div>
  );
}
