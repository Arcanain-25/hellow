-- ПРОСТАЯ РАБОЧАЯ РЕГИСТРАЦИЯ
-- Этот скрипт создает минимальную рабочую систему регистрации

-- 1. Удаляем все что может мешать
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Удаляем таблицу profiles если есть проблемы
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Создаем простую таблицу profiles БЕЗ RLS
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Даем полные права всем
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 5. НЕ включаем RLS - оставляем таблицу открытой
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; -- НЕ ДЕЛАЕМ ЭТО!

-- 6. Создаем простую функцию для создания профиля (без триггера)
CREATE OR REPLACE FUNCTION public.create_profile_manually(
    user_id UUID,
    user_email TEXT,
    user_name TEXT DEFAULT '',
    user_phone TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, phone)
    VALUES (user_id, user_email, user_name, user_phone)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RETURN user_id;
END;
$$;

-- 7. Даем права на функцию
GRANT EXECUTE ON FUNCTION public.create_profile_manually TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_manually TO authenticated;

-- 8. Проверяем что все готово
SELECT 'Простая регистрация настроена! Таблица profiles создана БЕЗ RLS.' as status;
SELECT 'Теперь можно тестировать регистрацию через test-supabase-direct.html' as next_step;
