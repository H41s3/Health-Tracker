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
            <h4 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>
              {packSize}-Day Pill Pack
            </h4>
            <p className="text-sm" style={{ color: '#5f7e97' }}>Current cycle visualization</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: '#7fdbca' }}>{stats.adherence}%</div>
            <div className="text-xs" style={{ color: '#5f7e97' }}>Adherence</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#addb67' }}>
              <Check className="w-4 h-4" style={{ color: '#011627' }} />
            </div>
            <span className="font-medium" style={{ color: '#d6deeb' }}>Taken</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ff5874' }}>
              <X className="w-4 h-4" style={{ color: '#011627' }} />
            </div>
            <span className="font-medium" style={{ color: '#d6deeb' }}>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(95, 126, 151, 0.3)' }}>
              <Circle className="w-4 h-4" style={{ color: '#5f7e97' }} />
            </div>
            <span className="font-medium" style={{ color: '#d6deeb' }}>Not Logged</span>
          </div>
          {packSize === 28 && (
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg border-2 border-dashed" style={{ background: 'rgba(11, 41, 66, 0.3)', borderColor: 'rgba(95, 126, 151, 0.5)' }} />
              <span className="font-medium" style={{ color: '#d6deeb' }}>Placebo</span>
            </div>
          )}
        </div>

        {/* Pill Pack Grid */}
        <div 
          className="rounded-xl p-6"
          style={{ 
            background: 'linear-gradient(135deg, rgba(199, 146, 234, 0.1), rgba(255, 88, 116, 0.1))',
            border: '1px solid rgba(199, 146, 234, 0.2)'
          }}
        >
          <div className="grid grid-cols-7 gap-2">
            {pillPack.map((pill) => {
              let bgStyle: React.CSSProperties = { background: 'rgba(95, 126, 151, 0.3)' };
              let icon = null;
              let ringStyle = '';

              if (pill.isPlacebo) {
                bgStyle = { 
                  background: 'rgba(11, 41, 66, 0.3)', 
                  border: '2px dashed rgba(95, 126, 151, 0.5)' 
                };
              } else if (pill.log?.taken) {
                bgStyle = { background: '#addb67' };
                icon = <Check className="w-5 h-5" style={{ color: '#011627' }} />;
              } else if (pill.log?.missed) {
                bgStyle = { background: '#ff5874' };
                icon = <X className="w-5 h-5" style={{ color: '#011627' }} />;
              } else {
                bgStyle = { 
                  background: 'rgba(29, 59, 83, 0.8)', 
                  border: '2px solid rgba(95, 126, 151, 0.3)' 
                };
                icon = <Circle className="w-4 h-4" style={{ color: '#5f7e97' }} />;
              }

              const isToday = pill.isToday;

              return (
                <div
                  key={pill.dayNum}
                  className="relative group"
                  title={format(pill.date, 'MMM dd, yyyy')}
                >
                  <div
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ${isToday ? 'ring-4 ring-c792ea scale-110' : ''}`}
                    style={{
                      ...bgStyle,
                      ...(isToday ? { boxShadow: '0 0 0 4px #c792ea' } : {})
                    }}
                  >
                    <div 
                      className="text-xs font-bold mb-1"
                      style={{ color: pill.log?.taken || pill.log?.missed ? '#011627' : '#d6deeb' }}
                    >
                      {pill.dayNum}
                    </div>
                    <div className="flex items-center justify-center">
                      {icon}
                    </div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div 
                      className="text-xs rounded px-2 py-1 whitespace-nowrap"
                      style={{ background: '#1d3b53', color: '#d6deeb', border: '1px solid rgba(127, 219, 202, 0.2)' }}
                    >
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
        <div 
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#addb67' }}>{stats.taken}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Taken</div>
        </div>
        <div 
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#ff5874' }}>{stats.missed}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Missed</div>
        </div>
        <div 
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#d6deeb' }}>{stats.logged}</div>
          <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Logged</div>
        </div>
        <div 
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#c792ea' }}>{stats.adherence}%</div>
          <div className="text-xs mt-1 font-medium" style={{ color: '#5f7e97' }}>Score</div>
        </div>
      </div>

      {/* Adherence Progress Bar */}
      <div 
        className="rounded-xl p-4"
        style={{ background: 'rgba(11, 41, 66, 0.5)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#d6deeb' }}>Pack Progress</span>
          <span className="text-sm" style={{ color: '#5f7e97' }}>{stats.logged} / {stats.total} days logged</span>
        </div>
        <div 
          className="w-full rounded-full h-3 overflow-hidden"
          style={{ background: 'rgba(95, 126, 151, 0.3)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(stats.logged / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #7fdbca 0%, #addb67 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
