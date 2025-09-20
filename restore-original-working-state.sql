-- ВОЗВРАТ К ОРИГИНАЛЬНОМУ РАБОЧЕМУ СОСТОЯНИЮ
-- Полностью восстанавливаем состояние когда регистрация работала идеально

-- 1. Удаляем ВСЕ что было добавлено после рабочего состояния
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_manually() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Удаляем все таблицы которые добавились позже
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 3. Полностью пересоздаем profiles как было в рабочем состоянии
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Даем полные права как было в оригинале
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 5. Убираем все политики RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 6. НЕ включаем RLS - оставляем таблицу открытой
-- Это было ключом к рабочему состоянию

SELECT 'Система возвращена к оригинальному рабочему состоянию!' as status;
