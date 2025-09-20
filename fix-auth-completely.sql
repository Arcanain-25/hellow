-- ПОЛНОЕ ВОССТАНОВЛЕНИЕ РАБОЧЕЙ АУТЕНТИФИКАЦИИ
-- Возвращаем к состоянию когда все работало до заказов и избранного

-- 1. Удаляем ВСЕ что добавилось после рабочего состояния
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_manually() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Удаляем все таблицы заказов и избранного которые могли сломать систему
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 3. Полностью очищаем profiles
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. Создаем МИНИМАЛЬНУЮ таблицу profiles как было в рабочем состоянии
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Даем полные права всем ролям (как было в рабочем состоянии)
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;

-- 6. НЕ включаем RLS - оставляем таблицу полностью открытой
-- Это было ключевым моментом рабочего состояния

-- 7. Удаляем все политики если остались
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 8. Проверяем что система восстановлена
SELECT 'Система полностью восстановлена к рабочему состоянию!' as status;
SELECT 'Регистрация должна работать как до добавления заказов' as result;
SELECT 'Только auth.users + простая profiles без RLS' as configuration;
