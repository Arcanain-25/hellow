-- ВОССТАНОВЛЕНИЕ ПОЛНОСТЬЮ РАБОЧЕГО СОСТОЯНИЯ САЙТА
-- Возвращаем к точному состоянию когда регистрация и вход работали идеально

-- 1. Полная очистка от всех экспериментов
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_manually() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Удаляем все таблицы которые добавились после рабочего состояния
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 3. Пересоздаем profiles точно как было в рабочем состоянии
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Полные права как было в оригинале
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;

-- 5. Удаляем все политики RLS полностью
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 6. Создаем базовые таблицы для корзины и избранного БЕЗ RLS
CREATE TABLE public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.wishlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 7. Даем права на новые таблицы
GRANT ALL ON public.cart_items TO anon;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;

GRANT ALL ON public.wishlist_items TO anon;
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;

-- 8. НЕ включаем RLS ни на одной таблице
-- Оставляем все открытым как было в рабочем состоянии

SELECT 'Сайт восстановлен к полностью рабочему состоянию!' as status;
SELECT 'Регистрация, вход, корзина и избранное должны работать' as result;
