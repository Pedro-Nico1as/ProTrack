-- Migration: 20260516221500_add_exercise_id_to_set_logs.sql
-- Description: Add exercise_id to user_set_logs to support ad-hoc workouts where session_exercise_id is null.
-- Rollback: ALTER TABLE user_set_logs DROP COLUMN IF EXISTS exercise_id;

ALTER TABLE user_set_logs
ADD COLUMN IF NOT EXISTS exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL;

-- Index for analytics and user progress queries
CREATE INDEX IF NOT EXISTS idx_user_set_logs_exercise_id ON user_set_logs(exercise_id);
