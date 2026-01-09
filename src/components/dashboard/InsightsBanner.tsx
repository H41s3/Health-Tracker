import { CheckCircle, AlertCircle, TrendingUp, Droplet, Activity, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HealthMetric } from '../../types/database';
import { useState } from 'react';

interface InsightsBannerProps {
  todayMetric?: HealthMetric;
  isLoading?: boolean;
}

// Night Owl themed insight styles
const insightStyles = {
  success: {
    background: 'rgba(173, 219, 103, 0.1)',
    border: '1px solid rgba(173, 219, 103, 0.2)',
    textColor: '#addb67',
    iconColor: '#addb67',
  },
  warning: {
    background: 'rgba(255, 203, 107, 0.1)',
    border: '1px solid rgba(255, 203, 107, 0.2)',
    textColor: '#ffcb6b',
    iconColor: '#ffcb6b',
  },
  info: {
    background: 'rgba(130, 170, 255, 0.1)',
    border: '1px solid rgba(130, 170, 255, 0.2)',
    textColor: '#82aaff',
    iconColor: '#82aaff',
  },
};

export default function InsightsBanner({ todayMetric, isLoading }: InsightsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading) {
    return (
      <div 
        className="rounded-xl p-4"
        style={{
          background: 'rgba(29, 59, 83, 0.6)',
          border: '1px solid rgba(127, 219, 202, 0.1)'
        }}
      >
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
          <div className="h-5 w-48 rounded" style={{ background: 'rgba(95, 126, 151, 0.3)' }} />
        </div>
      </div>
    );
  }

  if (dismissed) {
    return null;
  }

  if (!todayMetric) {
    return (
      <div 
        className="rounded-xl p-4"
        style={{
          background: 'rgba(130, 170, 255, 0.1)',
          border: '1px solid rgba(130, 170, 255, 0.2)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-1 rounded-full"
            style={{ background: 'rgba(130, 170, 255, 0.2)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: '#82aaff' }} />
          </div>
          <div className="text-sm" style={{ color: '#82aaff' }}>
            <span className="font-medium">Welcome!</span> Start logging your health metrics to get personalized insights.
          </div>
        </div>
      </div>
    );
  }

  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    icon: typeof CheckCircle;
    message: string;
  }> = [];
  
  const goals = {
    steps: 10000,
    water: 2000,
    sleep: 8,
  };

  if (todayMetric.steps >= goals.steps) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Step goal achieved! Great job staying active.',
    });
  } else if (todayMetric.steps > 0) {
    const remaining = goals.steps - todayMetric.steps;
    insights.push({
      type: 'info',
      icon: Activity,
      message: `Just ${remaining.toLocaleString()} more steps to reach your goal!`,
    });
  }

  if (todayMetric.water_ml >= goals.water) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Hydration goal met! You\'re well hydrated.',
    });
  } else if (todayMetric.water_ml > 0) {
    const remaining = goals.water - todayMetric.water_ml;
    insights.push({
      type: 'info',
      icon: Droplet,
      message: `Drink ${remaining}ml more water to reach your goal.`,
    });
  }

  if (todayMetric.sleep_hours && todayMetric.sleep_hours >= goals.sleep) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Great sleep! You got enough rest.',
    });
  } else if (todayMetric.sleep_hours && todayMetric.sleep_hours < 6) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      message: 'Try to get more sleep tonight for better recovery.',
    });
  }

  if (todayMetric.mood_rating && todayMetric.mood_rating <= 2) {
    insights.push({
      type: 'info',
      icon: TrendingUp,
      message: 'Consider some light exercise or meditation to boost your mood.',
    });
  }

  if (todayMetric.steps > 0 && todayMetric.water_ml > 0 && todayMetric.sleep_hours && todayMetric.sleep_hours > 0) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Complete day logged! You\'re building great habits.',
    });
  }

  if (insights.length === 0) {
    return null;
  }

  const currentInsight = insights[currentIndex];
  const Icon = currentInsight.icon;
  const style = insightStyles[currentInsight.type];

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div 
      className="rounded-xl p-4 transition-all duration-300"
      style={{
        background: style.background,
        border: style.border
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="p-1 rounded-full"
          style={{ background: style.background }}
        >
          <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
        </div>
        <div className="flex-1 text-sm font-medium" style={{ color: style.textColor }}>
          {currentInsight.message}
        </div>
        
        <div className="flex items-center gap-1">
          {insights.length > 1 && (
            <>
              <button
                onClick={prevInsight}
                className="p-1 rounded-lg transition-colors"
                style={{ color: style.textColor }}
                aria-label="Previous insight"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs px-2" style={{ color: '#5f7e97' }}>
                {currentIndex + 1}/{insights.length}
              </span>
              <button
                onClick={nextInsight}
                className="p-1 rounded-lg transition-colors"
                style={{ color: style.textColor }}
                aria-label="Next insight"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg transition-colors ml-1"
            style={{ color: '#5f7e97' }}
            aria-label="Dismiss insight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
