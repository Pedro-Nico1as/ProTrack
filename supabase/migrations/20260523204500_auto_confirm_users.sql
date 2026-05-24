-- Migration: 20260523204500_auto_confirm_users.sql
-- Description: Adds a trigger to automatically confirm new users by setting email_confirmed_at to NOW() on insert
-- Rollback:
--   DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
--   DROP FUNCTION IF EXISTS public.auto_confirm_user();

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();
