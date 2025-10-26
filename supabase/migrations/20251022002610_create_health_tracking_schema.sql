/*
  # Health Tracking Dashboard - Complete Database Schema

  ## Overview
  This migration creates a comprehensive health tracking system with support for:
  - User profiles with customizable preferences
  - Daily health metrics (activity, sleep, hydration, weight, mood, calories)
  - Period and cycle tracking with predictions
  - Custom user-defined metrics
  - Health notes and journal entries
  - Reminders and notifications

  ## Tables Created

  ### 1. `profiles`
  Stores user profile information and preferences
  - `id` (uuid, FK to auth.users)
  - `full_name` (text)
  - `date_of_birth` (date)
  - `gender` (text: male, female, other, prefer_not_to_say)
  - `height_cm` (numeric)
  - `preferences` (jsonb) - user settings like units, theme, etc.
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `health_metrics`
  Daily health tracking data
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `steps` (integer)
  - `calories_consumed` (numeric)
  - `calories_burned` (numeric)
  - `water_ml` (integer)
  - `weight_kg` (numeric)
  - `sleep_hours` (numeric)
  - `mood_rating` (integer 1-5)
  - `mood_notes` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `cycle_tracking`
  Menstrual cycle tracking
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `period_start_date` (date)
  - `period_end_date` (date)
  - `cycle_length_days` (integer)
  - `flow_intensity` (text: light, medium, heavy)
  - `symptoms` (jsonb) - array of symptoms
  - `notes` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `custom_metrics`
  User-defined custom tracking metrics
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `metric_name` (text)
  - `metric_type` (text: number, boolean, text, scale)
  - `unit` (text)
  - `icon` (text)
  - `color` (text)
  - `created_at` (timestamptz)

  ### 5. `custom_metric_logs`
  Logs for custom metrics
  - `id` (uuid, PK)
  - `metric_id` (uuid, FK to custom_metrics)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `value` (text) - stores all types as text, parsed by frontend
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 6. `health_notes`
  Journal entries and health notes
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `title` (text)
  - `content` (text)
  - `tags` (jsonb) - array of tags
  - `created_at`, `updated_at` (timestamptz)

  ### 7. `reminders`
  User reminders and notifications
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `title` (text)
  - `description` (text)
  - `reminder_type` (text: hydration, medication, workout, sleep, custom)
  - `time` (time)
  - `frequency` (text: daily, weekly, custom)
  - `days_of_week` (jsonb) - array of day numbers
  - `is_active` (boolean)
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
  - Authenticated users only

  ## Indexes
  - Composite indexes on user_id + date for efficient queries
  - Individual indexes on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5,2),
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  steps integer DEFAULT 0,
  calories_consumed numeric(7,2),
  calories_burned numeric(7,2),
  water_ml integer DEFAULT 0,
  weight_kg numeric(5,2),
  sleep_hours numeric(4,2),
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  mood_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create cycle_tracking table
CREATE TABLE IF NOT EXISTS cycle_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period_start_date date NOT NULL,
  period_end_date date,
  cycle_length_days integer,
  flow_intensity text CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
  symptoms jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create custom_metrics table
CREATE TABLE IF NOT EXISTS custom_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric_name text NOT NULL,
  metric_type text CHECK (metric_type IN ('number', 'boolean', 'text', 'scale')) NOT NULL,
  unit text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create custom_metric_logs table
CREATE TABLE IF NOT EXISTS custom_metric_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id uuid REFERENCES custom_metrics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  value text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create health_notes table
CREATE TABLE IF NOT EXISTS health_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  title text NOT NULL,
  content text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  reminder_type text CHECK (reminder_type IN ('hydration', 'medication', 'workout', 'sleep', 'custom')) NOT NULL,
  time time NOT NULL,
  frequency text CHECK (frequency IN ('daily', 'weekly', 'custom')) NOT NULL,
  days_of_week jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS health_metrics_user_date_idx ON health_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS cycle_tracking_user_date_idx ON cycle_tracking(user_id, period_start_date DESC);
CREATE INDEX IF NOT EXISTS custom_metric_logs_metric_date_idx ON custom_metric_logs(metric_id, date DESC);
CREATE INDEX IF NOT EXISTS health_notes_user_date_idx ON health_notes(user_id, date DESC);
CREATE INDEX IF NOT EXISTS reminders_user_active_idx ON reminders(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_metric_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for health_metrics
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics"
  ON health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics"
  ON health_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health metrics"
  ON health_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for cycle_tracking
CREATE POLICY "Users can view own cycle data"
  ON cycle_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle data"
  ON cycle_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle data"
  ON cycle_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle data"
  ON cycle_tracking FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for custom_metrics
CREATE POLICY "Users can view own custom metrics"
  ON custom_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom metrics"
  ON custom_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom metrics"
  ON custom_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom metrics"
  ON custom_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for custom_metric_logs
CREATE POLICY "Users can view own metric logs"
  ON custom_metric_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metric logs"
  ON custom_metric_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metric logs"
  ON custom_metric_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own metric logs"
  ON custom_metric_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for health_notes
CREATE POLICY "Users can view own notes"
  ON health_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON health_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON health_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON health_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reminders
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at BEFORE UPDATE ON health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cycle_tracking_updated_at BEFORE UPDATE ON cycle_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_notes_updated_at BEFORE UPDATE ON health_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();