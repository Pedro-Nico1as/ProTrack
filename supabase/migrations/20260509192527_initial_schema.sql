-- Migration: 20260509192527_initial_schema.sql
-- Description: Initial schema for ProTrack & Flow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    level TEXT CHECK (level IN ('beginner','intermediate','advanced')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. athletes
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    instagram TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. workout_plans
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('beginner','intermediate','advanced')),
    duration_weeks INT,
    days_per_week INT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    youtube_video_id TEXT,
    instructions TEXT,
    equipment TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. workout_sessions
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title TEXT,
    estimated_minutes INT
);

-- 6. session_exercises
CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INT NOT NULL,
    sets INT NOT NULL,
    reps_target TEXT NOT NULL,
    rest_seconds INT DEFAULT 60,
    notes TEXT
);

-- 7. user_workout_logs
CREATE TABLE user_workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    notes TEXT,
    synced_at TIMESTAMPTZ,
    client_id UUID NOT NULL UNIQUE
);

-- 8. user_set_logs
CREATE TABLE user_set_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES user_workout_logs(id) ON DELETE CASCADE,
    session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE SET NULL,
    set_number INT NOT NULL,
    weight_kg NUMERIC(6,2),
    reps_done INT,
    completed_at TIMESTAMPTZ NOT NULL,
    client_id UUID NOT NULL UNIQUE
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

CREATE TRIGGER set_workout_plans_updated_at
BEFORE UPDATE ON workout_plans
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Indexes for performance
CREATE INDEX idx_workout_plans_is_published ON workout_plans(is_published);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_user_workout_logs_user_completed ON user_workout_logs(user_id, completed_at);
CREATE INDEX idx_workout_sessions_plan_id ON workout_sessions(plan_id);
CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
CREATE INDEX idx_user_set_logs_log_id ON user_set_logs(log_id);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_set_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- athletes
CREATE POLICY "Athletes are viewable by everyone" ON athletes FOR SELECT USING (true);
-- Insert/Update/Delete should be restricted to admin (Service Role bypasses RLS)

-- workout_plans
CREATE POLICY "Published plans are viewable by everyone" ON workout_plans FOR SELECT USING (is_published = true);

-- exercises
CREATE POLICY "Exercises are viewable by everyone" ON exercises FOR SELECT USING (true);

-- workout_sessions
CREATE POLICY "Sessions are viewable by everyone" ON workout_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM workout_plans 
        WHERE workout_plans.id = workout_sessions.plan_id 
        AND workout_plans.is_published = true
    )
);

-- session_exercises
CREATE POLICY "Session exercises are viewable by everyone" ON session_exercises FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM workout_sessions
        JOIN workout_plans ON workout_sessions.plan_id = workout_plans.id
        WHERE workout_sessions.id = session_exercises.session_id
        AND workout_plans.is_published = true
    )
);

-- user_workout_logs
CREATE POLICY "Users can view their own logs" ON user_workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON user_workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON user_workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON user_workout_logs FOR DELETE USING (auth.uid() = user_id);

-- user_set_logs
CREATE POLICY "Users can view their own set logs" ON user_set_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_workout_logs
        WHERE user_workout_logs.id = user_set_logs.log_id
        AND user_workout_logs.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their own set logs" ON user_set_logs FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_workout_logs
        WHERE user_workout_logs.id = log_id
        AND user_workout_logs.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update their own set logs" ON user_set_logs FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_workout_logs
        WHERE user_workout_logs.id = user_set_logs.log_id
        AND user_workout_logs.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their own set logs" ON user_set_logs FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM user_workout_logs
        WHERE user_workout_logs.id = user_set_logs.log_id
        AND user_workout_logs.user_id = auth.uid()
    )
);
