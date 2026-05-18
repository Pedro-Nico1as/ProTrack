-- Migration: 20260517210000_bypass_rls_for_mvp.sql
-- Description: Desativa temporariamente o Row Level Security para permitir
-- que o aplicativo funcione sem autenticação durante a fase MVP.

ALTER TABLE user_workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_set_logs DISABLE ROW LEVEL SECURITY;
