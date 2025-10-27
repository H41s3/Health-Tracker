import { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { CycleTracking } from '../../types/database';

interface CycleCalendarProps {
  cycles: CycleTracking[];
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}

interface DayInfo {
  isPeriod: boolean;
  isLightFlow: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPredicted: boolean;
  hasSymptoms: boolean;
  flowIntensity?: string;
}

export default function CycleCalendar({ cycles, onDateClick, selectedDate }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate fertility window and ovulation
  const calculateFertility = (periodStartDate: Date, avgCycleLength: number) => {
    // Ovulation typically occurs 14 days before next period
    const ovulationDay = new Date(periodStartDate);
    ovulationDay.setDate(ovulationDay.getDate() + avgCycleLength - 14);
    
    // Fertile window: 5 days before ovulation + ovulation day + 1 day after
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    return { ovulationDay, fertileStart, fertileEnd };
  };

  // Predict next period
  const predictNextPeriod = useMemo(() => {
    if (cycles.length < 2) return null;
    
    const cycleLengths = cycles
      .filter(c => c.cycle_length_days)
      .map(c => c.cycle_length_days!);
    
    if (cycleLengths.length === 0) return null;
    
    const avgLength = Math.round(
      cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
    );
    
    const lastCycle = cycles[0];
    const lastDate = new Date(lastCycle.period_start_date);
    const predictedDate = new Date(lastDate);
    predictedDate.setDate(predictedDate.getDate() + avgLength);
    
    return { date: predictedDate, avgLength };
  }, [cycles]);

  // Get day info for a specific date - memoize expensive calculation
  const getDayInfo = useCallback((date: Date): DayInfo => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let info: DayInfo = {
      isPeriod: false,
      isLightFlow: false,
      isFertile: false,
      isOvulation: false,
      isPredicted: false,
      hasSymptoms: false,
    };

    // Check if date is in any period
    for (const cycle of cycles) {
      const startDate = new Date(cycle.period_start_date);
      const endDate = cycle.period_end_date ? new Date(cycle.period_end_date) : startDate;
      
      if (date >= startDate && date <= endDate) {
        info.isPeriod = true;
        info.flowIntensity = cycle.flow_intensity || 'medium';
        info.isLightFlow = cycle.flow_intensity === 'light';
        info.hasSymptoms = cycle.symptoms && cycle.symptoms.length > 0;
        break;
      }
    }

    // Calculate fertility for current cycle
    if (cycles.length > 0 && predictNextPeriod) {
      const lastCycle = cycles[0];
      const cycleStart = new Date(lastCycle.period_start_date);
      const { ovulationDay, fertileStart, fertileEnd } = calculateFertility(
        cycleStart,
        predictNextPeriod.avgLength
      );

      if (isSameDay(date, ovulationDay)) {
        info.isOvulation = true;
      }

      if (date >= fertileStart && date <= fertileEnd && !info.isPeriod) {
        info.isFertile = true;
      }
    }

    // Check if predicted period
    if (predictNextPeriod) {
      const predictedStart = predictNextPeriod.date;
      const predictedEnd = new Date(predictedStart);
      predictedEnd.setDate(predictedEnd.getDate() + 5); // Assume 5-day period
      
      if (date >= predictedStart && date <= predictedEnd && !info.isPeriod) {
        info.isPredicted = true;
      }
    }

    return info;
  }, [cycles, predictNextPeriod]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month to fill first week
    const firstDayOfWeek = start.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      prevMonthDays.push(day);
    }
    
    // Add days from next month to fill last week
    const lastDayOfWeek = end.getDay();
    const nextMonthDays = [];
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const day = new Date(end);
      day.setDate(day.getDate() + i);
      nextMonthDays.push(day);
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  }, [currentMonth]);

  const weekDays = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  // Memoize month navigation handlers
  const handlePrevMonth = useCallback(() => setCurrentMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const handleNextMonth = useCallback(() => setCurrentMonth(addMonths(currentMonth, 1)), [currentMonth]);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Cycle Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-gray-900 font-semibold min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <span className="text-gray-700 font-medium">Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-700 font-medium">Fertile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700 font-medium">Ovulation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-400 rounded-full border-2 border-purple-300 border-dashed"></div>
          <span className="text-gray-700 font-medium">Predicted</span>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayInfo = getDayInfo(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={index}
              onClick={() => onDateClick(day)}
              className={`
                aspect-square p-2 rounded-xl transition-all duration-200 relative
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'ring-2 ring-purple-400' : ''}
                ${isSelected ? 'bg-purple-500/40 ring-2 ring-purple-300' : 'hover:bg-gray-100'}
                ${dayInfo.isPeriod ? 'bg-rose-500/30' : ''}
                ${dayInfo.isFertile && !dayInfo.isPeriod ? 'bg-emerald-500/20' : ''}
                ${dayInfo.isOvulation ? 'bg-blue-500/30' : ''}
                ${dayInfo.isPredicted ? 'bg-purple-400/20 border-2 border-dashed border-purple-300' : ''}
              `}
            >
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'd')}
              </div>
              
              {/* Indicators */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {dayInfo.isPeriod && (
                  <Circle className="w-1.5 h-1.5 fill-rose-500 text-rose-500" />
                )}
                {dayInfo.isOvulation && (
                  <Circle className="w-1.5 h-1.5 fill-blue-500 text-blue-500" />
                )}
                {dayInfo.hasSymptoms && (
                  <Circle className="w-1.5 h-1.5 fill-yellow-500 text-yellow-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
