-- Minimal auth + profiles setup for working registration (no triggers, no RLS)
-- Safe to run multiple times; uses IF EXISTS/IF NOT EXISTS where possible.

-- 1) Remove any triggers/functions that may interfere with signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;Нетрогай 
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2) Create a simple open profiles table (no RLS, no policies)
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3) Make table open (no RLS) and grant access to anon/authenticated/service_role
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4) Optional: helper function to upsert a profile manually from the app if needed
CREATE OR REPLACE FUNCTION public.create_or_update_profile(
  p_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, created_at, updated_at)
  VALUES (p_id, p_email, p_name, p_phone, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 5) Quick sanity checks
SELECT '✅ Minimal auth + profiles is ready (no RLS, no triggers)' AS status;
SELECT COUNT(*) AS existing_profiles FROM public.profiles;
