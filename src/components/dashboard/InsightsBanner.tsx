import { CheckCircle, AlertCircle, TrendingUp, Droplet, Activity } from 'lucide-react';
import { HealthMetric } from '../../types/database';

interface InsightsBannerProps {
  todayMetric?: HealthMetric;
  isLoading?: boolean;
}

export default function InsightsBanner({ todayMetric, isLoading }: InsightsBannerProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-red-50 rounded-xl p-4 border border-purple-200 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!todayMetric) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-blue-100 rounded-full">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <span className="font-medium">Welcome!</span> Start logging your health metrics to get personalized insights.
          </div>
        </div>
      </div>
    );
  }

  const insights = [];
  const goals = {
    steps: 10000,
    water: 2000,
    sleep: 8,
  };

  // Check goal achievements
  if (todayMetric.steps >= goals.steps) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Step goal achieved! Great job staying active.',
      color: 'emerald',
    });
  } else if (todayMetric.steps > 0) {
    const remaining = goals.steps - todayMetric.steps;
    insights.push({
      type: 'info',
      icon: Activity,
      message: `Just ${remaining.toLocaleString()} more steps to reach your goal!`,
      color: 'blue',
    });
  }

  if (todayMetric.water_ml >= goals.water) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Hydration goal met! You\'re well hydrated.',
      color: 'emerald',
    });
  } else if (todayMetric.water_ml > 0) {
    const remaining = goals.water - todayMetric.water_ml;
    insights.push({
      type: 'info',
      icon: Droplet,
      message: `Drink ${remaining}ml more water to reach your goal.`,
      color: 'sky',
    });
  }

  if (todayMetric.sleep_hours && todayMetric.sleep_hours >= goals.sleep) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Great sleep! You got enough rest.',
      color: 'emerald',
    });
  } else if (todayMetric.sleep_hours && todayMetric.sleep_hours < 6) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      message: 'Try to get more sleep tonight for better recovery.',
      color: 'amber',
    });
  }

  // Rule-based insights
  if (todayMetric.mood_rating && todayMetric.mood_rating <= 2) {
    insights.push({
      type: 'info',
      icon: TrendingUp,
      message: 'Consider some light exercise or meditation to boost your mood.',
      color: 'purple',
    });
  }

  if (todayMetric.steps > 0 && todayMetric.water_ml > 0 && todayMetric.sleep_hours && todayMetric.sleep_hours > 0) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      message: 'Complete day logged! You\'re building great habits.',
      color: 'emerald',
    });
  }

  // Show the most relevant insight
  const primaryInsight = insights[0];

  if (!primaryInsight) {
    return null;
  }

  const Icon = primaryInsight.icon;
  const bgColor = primaryInsight.type === 'success' 
    ? 'from-yellow-50 to-orange-50 border-yellow-200' 
    : primaryInsight.type === 'warning'
    ? 'from-red-50 to-orange-50 border-red-200'
    : 'from-purple-50 to-indigo-50 border-purple-200';

  const textColor = primaryInsight.type === 'success' 
    ? 'text-yellow-800' 
    : primaryInsight.type === 'warning'
    ? 'text-red-800'
    : 'text-purple-800';

  const iconColor = primaryInsight.type === 'success' 
    ? 'text-yellow-600' 
    : primaryInsight.type === 'warning'
    ? 'text-red-600'
    : 'text-purple-600';

  return (
    <div className={`bg-gradient-to-r ${bgColor} rounded-xl p-4 border ${primaryInsight.type === 'success' ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1 bg-${primaryInsight.color}-100 rounded-full`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className={`text-sm ${textColor}`}>
          <span className="font-medium">{primaryInsight.message}</span>
        </div>
      </div>
    </div>
  );
}
