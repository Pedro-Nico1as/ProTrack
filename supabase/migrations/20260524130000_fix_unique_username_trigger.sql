-- Migration: 20260524130000_fix_unique_username_trigger.sql
-- Description: Fixes the handle_new_user trigger to generate unique usernames.
--   The previous version used full_name directly as username, causing UNIQUE
--   constraint violations when two users registered with the same name.
--   Now sanitizes the name (lowercase, no special chars) and appends a numeric
--   suffix if the username already exists.
-- Rollback:
--   CREATE OR REPLACE FUNCTION public.handle_new_user()
--   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $function$
--   BEGIN
--     INSERT INTO public.profiles (id, username, full_name)
--     VALUES (
--       new.id,
--       COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'user_' || substr(new.id::text, 1, 8)),
--       new.raw_user_meta_data->>'full_name'
--     );
--     RETURN new;
--   END;
--   $function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  base_username text;
  final_username text;
  suffix int := 0;
BEGIN
  -- Gera um username base a partir do full_name ou email
  base_username := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1),
    'user'
  );
  -- Remove espaços e caracteres especiais, converte para lowercase
  base_username := LOWER(REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '_', 'g'));
  -- Remove underscores consecutivos e trailing underscores
  base_username := REGEXP_REPLACE(base_username, '_+', '_', 'g');
  base_username := RTRIM(base_username, '_');

  -- Tenta o username base primeiro
  final_username := base_username;

  -- Se já existe, adiciona um sufixo numérico
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    final_username,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$function$;
