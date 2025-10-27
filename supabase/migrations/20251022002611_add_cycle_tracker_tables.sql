/*
  # Cycle Tracker Additional Tables

  This migration adds tables needed for advanced cycle tracking features:
  - Birth control tracking
  - Pill logs for daily adherence
  - Daily mood/energy logs
  - Medications tracking
  - Medication logs

  ## Tables Added

  ### 1. `birth_control`
  Tracks birth control methods
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `type` (text: pill, iud, implant, patch, ring, injection, condom, other)
  - `brand_name` (text)
  - `start_date` (date)
  - `end_date` (date, nullable)
  - `reminder_time` (time, nullable)
  - `is_active` (boolean)
  - `notes` (text, nullable)
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `pill_logs`
  Daily pill adherence tracking
  - `id` (uuid, PK)
  - `birth_control_id` (uuid, FK to birth_control)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `taken` (boolean)
  - `taken_at` (timestamptz, nullable)
  - `missed` (boolean)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - UNIQUE(birth_control_id, date)

  ### 3. `daily_logs`
  Daily mood, energy, and sleep tracking
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `mood` (text: terrible, bad, okay, good, great)
  - `energy_level` (integer 1-5)
  - `sleep_quality` (text: poor, fair, good, excellent)
  - `exercise_minutes` (integer, nullable)
  - `stress_level` (integer 1-5, nullable)
  - `notes` (text, nullable)
  - `created_at`, `updated_at` (timestamptz)
  - UNIQUE(user_id, date)

  ### 4. `medications`
  Medication tracking
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `name` (text)
  - `dosage` (text, nullable)
  - `frequency` (text: daily, twice_daily, three_times_daily, weekly, as_needed)
  - `time_of_day` (time, nullable)
  - `start_date` (date)
  - `end_date` (date, nullable)
  - `is_active` (boolean)
  - `reminder_enabled` (boolean)
  - `notes` (text, nullable)
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `medication_logs`
  Daily medication adherence
  - `id` (uuid, PK)
  - `medication_id` (uuid, FK to medications)
  - `user_id` (uuid, FK to profiles)
  - `date` (date)
  - `taken` (boolean)
  - `taken_at` (timestamptz, nullable)
  - `skipped` (boolean)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - UNIQUE(medication_id, date)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Indexes for performance optimization
*/

-- Create birth_control table
CREATE TABLE IF NOT EXISTS birth_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('pill', 'iud', 'implant', 'patch', 'ring', 'injection', 'condom', 'other')) NOT NULL,
  brand_name text,
  start_date date NOT NULL,
  end_date date,
  reminder_time time,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pill_logs table
CREATE TABLE IF NOT EXISTS pill_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_control_id uuid REFERENCES birth_control(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  taken boolean DEFAULT false,
  taken_at timestamptz,
  missed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(birth_control_id, date)
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood text CHECK (mood IN ('terrible', 'bad', 'okay', 'good', 'great')),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  sleep_quality text CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  exercise_minutes integer,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text,
  frequency text CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed')) NOT NULL,
  time_of_day time,
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  reminder_enabled boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  taken boolean DEFAULT false,
  taken_at timestamptz,
  skipped boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(medication_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS birth_control_user_idx ON birth_control(user_id);
CREATE INDEX IF NOT EXISTS birth_control_active_idx ON birth_control(user_id, is_active);
CREATE INDEX IF NOT EXISTS pill_logs_bc_idx ON pill_logs(birth_control_id);
CREATE INDEX IF NOT EXISTS pill_logs_user_date_idx ON pill_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS daily_logs_user_date_idx ON daily_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS medications_user_idx ON medications(user_id);
CREATE INDEX IF NOT EXISTS medications_active_idx ON medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS medication_logs_med_idx ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS medication_logs_user_date_idx ON medication_logs(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE birth_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE pill_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for birth_control
CREATE POLICY "Users can view own birth control"
  ON birth_control FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birth control"
  ON birth_control FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birth control"
  ON birth_control FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own birth control"
  ON birth_control FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pill_logs
CREATE POLICY "Users can view own pill logs"
  ON pill_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pill logs"
  ON pill_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pill logs"
  ON pill_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pill logs"
  ON pill_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_logs
CREATE POLICY "Users can view own daily logs"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
  ON daily_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medication_logs
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication logs"
  ON medication_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication logs"
  ON medication_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_birth_control_updated_at BEFORE UPDATE ON birth_control
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
