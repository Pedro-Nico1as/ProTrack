-- Migration: 20260523200000_restore_rls.sql
-- Description: Re-enable Row Level Security (RLS) for user_workout_logs and user_set_logs
-- Rollback: 
--   ALTER TABLE public.user_workout_logs DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.user_set_logs DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_set_logs ENABLE ROW LEVEL SECURITY;
