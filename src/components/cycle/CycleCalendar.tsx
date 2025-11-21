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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
    const info: DayInfo = {
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

  // Get cycle details for tooltip
  const getCycleDetails = useCallback((date: Date) => {
    const cycle = cycles.find(c => {
      const startDate = new Date(c.period_start_date);
      const endDate = c.period_end_date ? new Date(c.period_end_date) : startDate;
      return date >= startDate && date <= endDate;
    });
    return cycle;
  }, [cycles]);

  const handleMouseEnter = useCallback((date: Date, event: React.MouseEvent) => {
    setHoveredDate(date);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredDate(null);
  }, []);

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
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              className={`
                aspect-square p-2 rounded-xl transition-all duration-200 relative
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'ring-2 ring-purple-400 animate-pulse-soft' : ''}
                ${isSelected ? 'bg-purple-500/40 ring-2 ring-purple-300 scale-105' : 'hover:bg-gray-100 hover:scale-105'}
                ${dayInfo.isPeriod ? 'bg-rose-500/30 hover:bg-rose-500/40' : ''}
                ${dayInfo.isFertile && !dayInfo.isPeriod ? 'bg-emerald-500/20 hover:bg-emerald-500/30' : ''}
                ${dayInfo.isOvulation ? 'bg-blue-500/30 hover:bg-blue-500/40' : ''}
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

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-3 max-w-xs mb-2 animate-in">
            <div className="font-semibold mb-1">{format(hoveredDate, 'MMMM dd, yyyy')}</div>
            {(() => {
              const dayInfo = getDayInfo(hoveredDate);
              const cycleDetails = getCycleDetails(hoveredDate);
              return (
                <div className="text-xs space-y-1">
                  {dayInfo.isPeriod && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>Period Day</span>
                      {dayInfo.flowIntensity && (
                        <span className="text-rose-300">({dayInfo.flowIntensity} flow)</span>
                      )}
                    </div>
                  )}
                  {dayInfo.isOvulation && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                      <span>Ovulation Day</span>
                    </div>
                  )}
                  {dayInfo.isFertile && !dayInfo.isPeriod && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                      <span>Fertile Window</span>
                    </div>
                  )}
                  {dayInfo.isPredicted && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-purple-400 text-purple-400" />
                      <span>Predicted Period</span>
                    </div>
                  )}
                  {cycleDetails?.symptoms && cycleDetails.symptoms.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="font-medium mb-1">Symptoms:</div>
                      <div className="flex flex-wrap gap-1">
                        {cycleDetails.symptoms.slice(0, 3).map((symptom) => (
                          <span key={symptom} className="px-2 py-0.5 bg-violet-500/30 rounded text-xs">
                            {symptom}
                          </span>
                        ))}
                        {cycleDetails.symptoms.length > 3 && (
                          <span className="text-gray-400">+{cycleDetails.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {cycleDetails?.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="italic text-gray-300">&quot;{cycleDetails.notes.slice(0, 60)}{cycleDetails.notes.length > 60 ? '...' : ''}&quot;</div>
                    </div>
                  )}
                  {!dayInfo.isPeriod && !dayInfo.isFertile && !dayInfo.isOvulation && !dayInfo.isPredicted && (
                    <div className="text-gray-400">No cycle data</div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
