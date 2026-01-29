import { memo, useMemo } from 'react';
import { Scale, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateBMI, getBMIRangePosition } from '../../utils/bmi';

interface BMICardProps {
  heightCm: number | null;
  currentWeight: number | null;
  previousWeight?: number | null;
  isLoading?: boolean;
}

const BMICard = memo(function BMICard({ 
  heightCm, 
  currentWeight, 
  previousWeight,
  isLoading 
}: BMICardProps) {
  const bmiResult = useMemo(() => {
    if (!heightCm || !currentWeight) return null;
    return calculateBMI(currentWeight, heightCm);
  }, [heightCm, currentWeight]);

  const previousBMI = useMemo(() => {
    if (!heightCm || !previousWeight) return null;
    return calculateBMI(previousWeight, heightCm);
  }, [heightCm, previousWeight]);

  const bmiChange = useMemo(() => {
    if (!bmiResult || !previousBMI) return null;
    return Math.round((bmiResult.value - previousBMI.value) * 10) / 10;
  }, [bmiResult, previousBMI]);

  if (isLoading) {
    return (
      <div 
        className="p-6 rounded-xl"
        style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
            <div className="h-6 w-24 rounded" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
          </div>
          <div className="h-16 rounded-lg" style={{ background: 'rgba(95, 126, 151, 0.2)' }} />
        </div>
      </div>
    );
  }

  // No data available
  if (!heightCm || !currentWeight) {
    return (
      <div 
        className="p-6 rounded-xl"
        style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(95, 126, 151, 0.2)' }}
          >
            <Scale className="w-6 h-6" style={{ color: '#5f7e97' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>BMI Calculator</h3>
        </div>
        
        <div 
          className="p-4 rounded-lg flex items-center gap-3"
          style={{ background: 'rgba(130, 170, 255, 0.1)', border: '1px solid rgba(130, 170, 255, 0.2)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#82aaff' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#d6deeb' }}>
              {!heightCm && !currentWeight 
                ? 'Add your height in Settings and log your weight to see BMI'
                : !heightCm 
                  ? 'Add your height in Settings to calculate BMI'
                  : 'Log your weight today to calculate BMI'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!bmiResult) return null;

  const rangePosition = getBMIRangePosition(bmiResult.value);

  return (
    <div 
      className="p-6 rounded-xl"
      style={{ background: 'rgba(29, 59, 83, 0.6)', border: '1px solid rgba(127, 219, 202, 0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${bmiResult.color}20` }}
          >
            <Scale className="w-6 h-6" style={{ color: bmiResult.color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#d6deeb' }}>BMI</h3>
            <p className="text-xs" style={{ color: '#5f7e97' }}>Body Mass Index</p>
          </div>
        </div>
        
        {/* BMI Change Indicator */}
        {bmiChange !== null && bmiChange !== 0 && (
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
            style={{ 
              background: bmiChange > 0 ? 'rgba(255, 88, 116, 0.15)' : 'rgba(173, 219, 103, 0.15)',
              color: bmiChange > 0 ? '#ff5874' : '#addb67'
            }}
          >
            {bmiChange > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {bmiChange > 0 ? '+' : ''}{bmiChange}
          </div>
        )}
      </div>

      {/* BMI Value and Category */}
      <div className="flex items-baseline gap-3 mb-4">
        <span 
          className="text-4xl font-bold"
          style={{ color: bmiResult.color }}
        >
          {bmiResult.value}
        </span>
        <div>
          <span 
            className="text-sm font-semibold px-2 py-1 rounded-lg"
            style={{ background: `${bmiResult.color}20`, color: bmiResult.color }}
          >
            {bmiResult.label}
          </span>
        </div>
      </div>

      {/* BMI Scale */}
      <div className="mb-3">
        <div 
          className="relative h-3 rounded-full overflow-hidden"
          style={{ 
            background: 'linear-gradient(to right, #82aaff 0%, #addb67 27%, #ffcb6b 54%, #ff5874 100%)'
          }}
        >
          {/* Position indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500"
            style={{ 
              left: `calc(${rangePosition}% - 8px)`,
              background: '#011627',
              borderColor: bmiResult.color,
              boxShadow: `0 0 8px ${bmiResult.color}`
            }}
          />
        </div>
        
        {/* Scale labels */}
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#5f7e97' }}>
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm" style={{ color: '#5f7e97' }}>
        {bmiResult.description}
      </p>

      {/* Weight & Height Info */}
      <div 
        className="mt-4 pt-4 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid rgba(127, 219, 202, 0.1)' }}
      >
        <span style={{ color: '#5f7e97' }}>
          Based on {currentWeight} kg / {heightCm} cm
        </span>
        {bmiChange === 0 && previousWeight && (
          <span className="flex items-center gap-1" style={{ color: '#5f7e97' }}>
            <Minus className="w-3 h-3" /> No change
          </span>
        )}
      </div>
    </div>
  );
});

export default BMICard;
