-- Migration: remove_auto_confirm_prod
-- Description: Removes the email auto-confirmation trigger created for development environments.
--
-- Rollback action:
-- Run migration `20260523204500_auto_confirm_users.sql` to restore trigger.

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user();
