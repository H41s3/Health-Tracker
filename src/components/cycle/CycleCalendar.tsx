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

  const calculateFertility = (periodStartDate: Date, avgCycleLength: number) => {
    const ovulationDay = new Date(periodStartDate);
    ovulationDay.setDate(ovulationDay.getDate() + avgCycleLength - 14);
    
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    return { ovulationDay, fertileStart, fertileEnd };
  };

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

  const getDayInfo = useCallback((date: Date): DayInfo => {
    const info: DayInfo = {
      isPeriod: false,
      isLightFlow: false,
      isFertile: false,
      isOvulation: false,
      isPredicted: false,
      hasSymptoms: false,
    };

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

    if (predictNextPeriod) {
      const predictedStart = predictNextPeriod.date;
      const predictedEnd = new Date(predictedStart);
      predictedEnd.setDate(predictedEnd.getDate() + 5);
      
      if (date >= predictedStart && date <= predictedEnd && !info.isPeriod) {
        info.isPredicted = true;
      }
    }

    return info;
  }, [cycles, predictNextPeriod]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfWeek = start.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      prevMonthDays.push(day);
    }
    
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

  const handlePrevMonth = useCallback(() => setCurrentMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const handleNextMonth = useCallback(() => setCurrentMonth(addMonths(currentMonth, 1)), [currentMonth]);

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
    <div 
      className="p-6 rounded-xl"
      style={{
        background: 'rgba(29, 59, 83, 0.6)',
        border: '1px solid rgba(127, 219, 202, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>Cycle Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#5f7e97' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold min-w-[140px] text-center" style={{ color: '#d6deeb' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#5f7e97' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(127, 219, 202, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5874' }} />
          <span className="font-medium" style={{ color: '#d6deeb' }}>Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: '#7fdbca' }} />
          <span className="font-medium" style={{ color: '#d6deeb' }}>Fertile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: '#82aaff' }} />
          <span className="font-medium" style={{ color: '#d6deeb' }}>Ovulation</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full border-2 border-dashed"
            style={{ background: 'rgba(199, 146, 234, 0.3)', borderColor: '#c792ea' }}
          />
          <span className="font-medium" style={{ color: '#d6deeb' }}>Predicted</span>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: '#5f7e97' }}>
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

          let bgStyle: React.CSSProperties = {};
          if (dayInfo.isPeriod) {
            bgStyle = { background: 'rgba(255, 88, 116, 0.3)' };
          } else if (dayInfo.isOvulation) {
            bgStyle = { background: 'rgba(130, 170, 255, 0.3)' };
          } else if (dayInfo.isFertile) {
            bgStyle = { background: 'rgba(127, 219, 202, 0.2)' };
          } else if (dayInfo.isPredicted) {
            bgStyle = { 
              background: 'rgba(199, 146, 234, 0.2)', 
              border: '2px dashed #c792ea' 
            };
          }

          return (
            <button
              key={index}
              onClick={() => onDateClick(day)}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              className="aspect-square p-2 rounded-xl transition-all duration-200 relative"
              style={{
                ...bgStyle,
                opacity: isCurrentMonth ? 1 : 0.3,
                boxShadow: isToday ? '0 0 0 2px #c792ea' : isSelected ? '0 0 0 2px #7fdbca, 0 0 0 4px rgba(127, 219, 202, 0.2)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div className="text-sm font-medium" style={{ color: '#d6deeb' }}>
                {format(day, 'd')}
              </div>
              
              {/* Indicators */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {dayInfo.isPeriod && (
                  <Circle className="w-1.5 h-1.5" style={{ fill: '#ff5874', color: '#ff5874' }} />
                )}
                {dayInfo.isOvulation && (
                  <Circle className="w-1.5 h-1.5" style={{ fill: '#82aaff', color: '#82aaff' }} />
                )}
                {dayInfo.hasSymptoms && (
                  <Circle className="w-1.5 h-1.5" style={{ fill: '#ffcb6b', color: '#ffcb6b' }} />
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
          <div 
            className="rounded-lg shadow-2xl p-3 max-w-xs mb-2"
            style={{
              background: '#1d3b53',
              border: '1px solid rgba(127, 219, 202, 0.2)'
            }}
          >
            <div className="font-semibold mb-1" style={{ color: '#d6deeb' }}>{format(hoveredDate, 'MMMM dd, yyyy')}</div>
            {(() => {
              const dayInfo = getDayInfo(hoveredDate);
              const cycleDetails = getCycleDetails(hoveredDate);
              return (
                <div className="text-xs space-y-1">
                  {dayInfo.isPeriod && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3" style={{ fill: '#ff5874', color: '#ff5874' }} />
                      <span style={{ color: '#d6deeb' }}>Period Day</span>
                      {dayInfo.flowIntensity && (
                        <span style={{ color: '#ff6ac1' }}>({dayInfo.flowIntensity} flow)</span>
                      )}
                    </div>
                  )}
                  {dayInfo.isOvulation && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3" style={{ fill: '#82aaff', color: '#82aaff' }} />
                      <span style={{ color: '#d6deeb' }}>Ovulation Day</span>
                    </div>
                  )}
                  {dayInfo.isFertile && !dayInfo.isPeriod && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3" style={{ fill: '#7fdbca', color: '#7fdbca' }} />
                      <span style={{ color: '#d6deeb' }}>Fertile Window</span>
                    </div>
                  )}
                  {dayInfo.isPredicted && (
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3" style={{ fill: '#c792ea', color: '#c792ea' }} />
                      <span style={{ color: '#d6deeb' }}>Predicted Period</span>
                    </div>
                  )}
                  {cycleDetails?.symptoms && cycleDetails.symptoms.length > 0 && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(127, 219, 202, 0.2)' }}>
                      <div className="font-medium mb-1" style={{ color: '#7fdbca' }}>Symptoms:</div>
                      <div className="flex flex-wrap gap-1">
                        {cycleDetails.symptoms.slice(0, 3).map((symptom) => (
                          <span 
                            key={symptom} 
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: 'rgba(199, 146, 234, 0.3)', color: '#c792ea' }}
                          >
                            {symptom}
                          </span>
                        ))}
                        {cycleDetails.symptoms.length > 3 && (
                          <span style={{ color: '#5f7e97' }}>+{cycleDetails.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {cycleDetails?.notes && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(127, 219, 202, 0.2)' }}>
                      <div className="italic" style={{ color: '#5f7e97' }}>&quot;{cycleDetails.notes.slice(0, 60)}{cycleDetails.notes.length > 60 ? '...' : ''}&quot;</div>
                    </div>
                  )}
                  {!dayInfo.isPeriod && !dayInfo.isFertile && !dayInfo.isOvulation && !dayInfo.isPredicted && (
                    <div style={{ color: '#5f7e97' }}>No cycle data</div>
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
