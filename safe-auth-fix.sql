-- БЕЗОПАСНОЕ исправление проблем с аутентификацией
-- Этот скрипт НЕ удаляет существующие аккаунты!

-- 1. Сначала проверяем что у нас есть
SELECT 'Существующие пользователи в auth.users:' as info;
SELECT count(*) as user_count FROM auth.users;

SELECT 'Существующие профили:' as info;
SELECT count(*) as profile_count FROM public.profiles;

-- 2. Удаляем только триггеры (НЕ затрагивает пользователей)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Отключаем RLS только на profiles (НЕ затрагивает auth.users)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Удаляем политики на profiles (НЕ затрагивает пользователей)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 5. Даем права на таблицу profiles
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;

-- 6. Проверяем что пользователи остались
SELECT 'Пользователи после изменений:' as info;
SELECT count(*) as user_count FROM auth.users;

-- ВАЖНО: Этот скрипт НЕ удаляет:
-- - Таблицу auth.users (ваши аккаунты)
-- - Существующие профили в public.profiles
-- - Любые пользовательские данные
