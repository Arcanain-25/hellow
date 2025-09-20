-- Временно отключаем RLS для отладки регистрации
-- ВНИМАНИЕ: Это только для тестирования!

-- Отключаем RLS на таблице profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на auth.users (если включен)
-- ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики на profiles (временно)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Удаляем триггеры если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
