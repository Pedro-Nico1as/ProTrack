-- Migration: 20260516220000_performance_indexes.sql
-- Description: Add missing indexes on foreign keys to optimize query performance and joins.
-- Rollback: DROP INDEX IF EXISTS idx_workout_plans_athlete_id;
--           DROP INDEX IF EXISTS idx_session_exercises_exercise_id;
--           DROP INDEX IF EXISTS idx_user_workout_logs_session_id;
--           DROP INDEX IF EXISTS idx_user_set_logs_session_exercise_id;

-- 1. Index on athlete_id in workout_plans
CREATE INDEX IF NOT EXISTS idx_workout_plans_athlete_id ON workout_plans(athlete_id);

-- 2. Index on exercise_id in session_exercises (heavily used in joins)
CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_id ON session_exercises(exercise_id);

-- 3. Index on session_id in user_workout_logs (used to link workouts to templates)
CREATE INDEX IF NOT EXISTS idx_user_workout_logs_session_id ON user_workout_logs(session_id);

-- 4. Index on session_exercise_id in user_set_logs (crucial for user progress tracking)
CREATE INDEX IF NOT EXISTS idx_user_set_logs_session_exercise_id ON user_set_logs(session_exercise_id);
