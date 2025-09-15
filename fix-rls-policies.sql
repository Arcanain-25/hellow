-- Исправление политик RLS для решения проблем с извлечением данных

-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- Создаем более простые и надежные политики
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Проверяем, что RLS включен
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Временно отключаем RLS для тестирования (можно включить обратно после проверки)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
