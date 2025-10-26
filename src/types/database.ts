export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FlowIntensity = 'light' | 'medium' | 'heavy';
export type MetricType = 'number' | 'boolean' | 'text' | 'scale';
export type ReminderType = 'hydration' | 'medication' | 'workout' | 'sleep' | 'custom';
export type Frequency = 'daily' | 'weekly' | 'custom';

export interface Profile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  height_cm: number | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  calories_consumed: number | null;
  calories_burned: number | null;
  water_ml: number;
  weight_kg: number | null;
  sleep_hours: number | null;
  mood_rating: number | null;
  mood_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleTracking {
  id: string;
  user_id: string;
  period_start_date: string;
  period_end_date: string | null;
  cycle_length_days: number | null;
  flow_intensity: FlowIntensity | null;
  symptoms: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomMetric {
  id: string;
  user_id: string;
  metric_name: string;
  metric_type: MetricType;
  unit: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface CustomMetricLog {
  id: string;
  metric_id: string;
  user_id: string;
  date: string;
  value: string;
  notes: string | null;
  created_at: string;
}

export interface HealthNote {
  id: string;
  user_id: string;
  date: string;
  title: string;
  content: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: ReminderType;
  time: string;
  frequency: Frequency;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
