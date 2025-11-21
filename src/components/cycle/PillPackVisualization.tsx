import { useMemo } from 'react';
import { format, subDays, isSameDay, startOfMonth } from 'date-fns';
import { Check, X, Circle } from 'lucide-react';

interface PillPackVisualizationProps {
  pillLogs: Array<{
    id: string;
    date: string;
    taken: boolean;
    missed: boolean;
  }>;
  packSize?: 21 | 28;
}

export default function PillPackVisualization({ pillLogs, packSize = 28 }: PillPackVisualizationProps) {
  // Generate 28-day pack starting from today going backwards
  const pillPack = useMemo(() => {
    const today = new Date();
    return Array.from({ length: packSize }, (_, i) => {
      const date = subDays(today, packSize - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = pillLogs.find(l => l.date === dateStr);
      const isToday = isSameDay(date, today);
      const dayNum = i + 1;
      const isPlacebo = packSize === 28 && dayNum > 21;
      
      return {
        date,
        dateStr,
        dayNum,
        log,
        isToday,
        isPlacebo,
      };
    });
  }, [pillLogs, packSize]);

  // Calculate stats
  const stats = useMemo(() => {
    const activePills = pillPack.filter(p => !p.isPlacebo);
    const taken = activePills.filter(p => p.log?.taken).length;
    const missed = activePills.filter(p => p.log?.missed).length;
    const logged = taken + missed;
    
    return {
      taken,
      missed,
      logged,
      total: activePills.length,
      adherence: logged > 0 ? Math.round((taken / logged) * 100) : 0,
    };
  }, [pillPack]);

  return (
    <div className="space-y-6">
      {/* Pack Visualization */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {packSize}-Day Pill Pack
            </h4>
            <p className="text-sm text-gray-600">Current cycle visualization</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.adherence}%</div>
            <div className="text-xs text-gray-600">Adherence</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Taken</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
              <Circle className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-700 font-medium">Not Logged</span>
          </div>
          {packSize === 28 && (
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300" />
              <span className="text-gray-700 font-medium">Placebo</span>
            </div>
          )}
        </div>

        {/* Pill Pack Grid */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="grid grid-cols-7 gap-2">
            {pillPack.map((pill) => {
              let bgClass = 'bg-gray-200';
              let icon = null;
              let borderClass = '';

              if (pill.isPlacebo) {
                bgClass = 'bg-gray-100 border-2 border-dashed border-gray-300';
              } else if (pill.log?.taken) {
                bgClass = 'bg-emerald-500';
                icon = <Check className="w-5 h-5 text-white" />;
              } else if (pill.log?.missed) {
                bgClass = 'bg-red-500';
                icon = <X className="w-5 h-5 text-white" />;
              } else {
                bgClass = 'bg-white border-2 border-gray-300';
                icon = <Circle className="w-4 h-4 text-gray-400" />;
              }

              if (pill.isToday) {
                borderClass = 'ring-4 ring-purple-500 scale-110';
              }

              return (
                <div
                  key={pill.dayNum}
                  className="relative group"
                  title={format(pill.date, 'MMM dd, yyyy')}
                >
                  <div
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center
                      transition-all duration-200 hover:scale-105 cursor-pointer
                      ${bgClass} ${borderClass}
                    `}
                  >
                    <div className="text-xs font-bold text-gray-900 mb-1">
                      {pill.dayNum}
                    </div>
                    <div className="flex items-center justify-center">
                      {icon}
                    </div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {format(pill.date, 'MMM dd')}
                      {pill.isToday && ' (Today)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.taken}</div>
          <div className="text-xs text-gray-600 mt-1 font-medium">Taken</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
          <div className="text-xs text-gray-600 mt-1 font-medium">Missed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.logged}</div>
          <div className="text-xs text-gray-600 mt-1 font-medium">Logged</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.adherence}%</div>
          <div className="text-xs text-gray-600 mt-1 font-medium">Score</div>
        </div>
      </div>

      {/* Adherence Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Pack Progress</span>
          <span className="text-sm text-gray-600">{stats.logged} / {stats.total} days logged</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(stats.logged / stats.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

