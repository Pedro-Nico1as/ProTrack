-- Migration: remove_offline_columns
-- Description: Removes client_id and synced_at columns used for offline deduplication
-- and adds performance index for user_set_logs.
--
-- Rollback actions (commented):
-- ALTER TABLE user_workout_logs ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE;
-- ALTER TABLE user_workout_logs ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
-- ALTER TABLE user_set_logs ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE;
-- DROP INDEX IF EXISTS idx_user_set_logs_exercise_completed;

-- Remove client_id and synced_at columns from user_workout_logs
ALTER TABLE user_workout_logs
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS synced_at;

-- Remove client_id column from user_set_logs
ALTER TABLE user_set_logs
  DROP COLUMN IF EXISTS client_id;

-- Add composite index to accelerate queries in user-progress edge function
CREATE INDEX IF NOT EXISTS idx_user_set_logs_exercise_completed
  ON user_set_logs(exercise_id, completed_at DESC);
