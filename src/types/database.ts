export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface HealthGoals {
  steps: number;
  water_ml: number;
  sleep_hours: number;
  calories: number | null;
}

export const DEFAULT_GOALS: HealthGoals = {
  steps: 10000,
  water_ml: 2000,
  sleep_hours: 8,
  calories: null,
};
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
  totp_secret: string | null;
  totp_enabled: boolean;
  totp_backup_codes: string[] | null;
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

export type BirthControlType = 'pill' | 'iud' | 'implant' | 'patch' | 'ring' | 'injection' | 'condom' | 'other';

export interface BirthControl {
  id: string;
  user_id: string;
  type: BirthControlType;
  brand_name: string | null;
  start_date: string;
  end_date: string | null;
  reminder_time: string | null; // HH:MM format for pill reminders
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PillLog {
  id: string;
  birth_control_id: string;
  user_id: string;
  date: string;
  taken: boolean;
  taken_at: string | null; // timestamp when marked as taken
  missed: boolean;
  notes: string | null;
  created_at: string;
}

export type MoodLevel = 'terrible' | 'bad' | 'okay' | 'good' | 'great';
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  mood: MoodLevel | null;
  energy_level: EnergyLevel | null;
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent' | null;
  exercise_minutes: number | null;
  stress_level: EnergyLevel | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string | null; // HH:MM format
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  reminder_enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  date: string;
  taken: boolean;
  taken_at: string | null;
  skipped: boolean;
  notes: string | null;
  created_at: string;
}
