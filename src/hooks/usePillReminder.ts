import { useEffect, useRef } from 'react';
import { useBirthControlStore } from '../stores/useBirthControlStore';
import { useToastStore } from '../stores/useToastStore';

function parseTimeToToday(reminderTime: string): Date {
  const [h, m] = reminderTime.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

function isWithinQuietHours(date: Date): boolean {
  const hour = date.getHours();
  return hour < 8 || hour >= 22; // 10pm–8am
}

export function usePillReminder() {
  const { activeBirthControl, getTodaysPillLog } = useBirthControlStore();
  const { show } = useToastStore.getState();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // clear any existing timer
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!activeBirthControl || activeBirthControl.type !== 'pill' || !activeBirthControl.reminder_time) {
      return;
    }

    const schedule = async () => {
      // Request notification permission once
      if ('Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch {}
      }

      const reminderAt = parseTimeToToday(activeBirthControl.reminder_time as unknown as string);
      const now = new Date();
      const takenToday = !!getTodaysPillLog(activeBirthControl.id)?.taken;

      // If already taken today, schedule for tomorrow at reminder time
      let target = reminderAt;
      if (takenToday || now > addHours(reminderAt, 24)) {
        target = new Date(reminderAt.getTime());
        target.setDate(target.getDate() + 1);
      }

      // Late pill alert: 12h past reminder, not taken
      const lateAt = addHours(reminderAt, 12);
      const shouldLateAlert = now >= lateAt && !takenToday;

      const fire = () => {
        const stillNotTaken = !getTodaysPillLog(activeBirthControl.id)?.taken;
        if (!stillNotTaken) return; // auto-skip

        const body = shouldLateAlert ? 'Your pill is over 12 hours late. Consider guidance for missed pills.' : 'Time to take your pill.';
        // In-app toast
        show(body, shouldLateAlert ? 'error' : 'info');
        // System notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try { new Notification('Pill reminder', { body }); } catch {}
        }

        // Reschedule for tomorrow
        const next = new Date(reminderAt.getTime());
        next.setDate(next.getDate() + 1);
        const delay = Math.max(0, next.getTime() - Date.now());
        timerRef.current = window.setTimeout(fire, delay) as unknown as number;
      };

      // If quiet hours, delay to 8am next valid time today/tomorrow
      let firstTarget = target;
      if (isWithinQuietHours(firstTarget)) {
        firstTarget = new Date(firstTarget);
        firstTarget.setHours(8, 0, 0, 0);
        if (firstTarget < now) {
          firstTarget.setDate(firstTarget.getDate() + 1);
        }
      }

      // If target time already passed today, trigger immediately (soft) or schedule for tomorrow
      const delay = Math.max(0, firstTarget.getTime() - now.getTime());
      timerRef.current = window.setTimeout(fire, delay) as unknown as number;
    };

    schedule();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeBirthControl, getTodaysPillLog]);
}


