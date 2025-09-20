-- Полная очистка базы данных от всех триггеров, функций и политик
-- Выполните этот скрипт в Supabase SQL Editor для полной очистки

-- 1. Удаляем все триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS update_user_progression_updated_at ON user_progression;
DROP TRIGGER IF EXISTS update_user_cart_items_updated_at ON user_cart_items;

-- 2. Удаляем все функции
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.get_all_users();
DROP FUNCTION IF EXISTS public.get_user_by_id(uuid);
DROP FUNCTION IF EXISTS public.get_users_count();
DROP FUNCTION IF EXISTS public.get_user_progression(uuid);
DROP FUNCTION IF EXISTS public.update_user_progression(uuid, integer, integer, integer);
DROP FUNCTION IF EXISTS public.level_up_user(uuid);
DROP FUNCTION IF EXISTS public.add_user_experience(uuid, integer);
DROP FUNCTION IF EXISTS public.get_user_coupons(uuid);
DROP FUNCTION IF EXISTS public.purchase_coupon(uuid, text, text, integer, integer, text);
DROP FUNCTION IF EXISTS public.use_coupon(uuid);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 3. Удаляем все политики RLS
DROP POLICY IF EXISTS "Users can view own progression" ON user_progression;
DROP POLICY IF EXISTS "Users can update own progression" ON user_progression;
DROP POLICY IF EXISTS "Users can insert own progression" ON user_progression;
DROP POLICY IF EXISTS "Users can view own coupons" ON user_coupons;
DROP POLICY IF EXISTS "Users can insert own coupons" ON user_coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON user_coupons;
DROP POLICY IF EXISTS "Users can view own cart items" ON user_cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON user_cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON user_cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON user_cart_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 4. Отключаем RLS на всех таблицах
ALTER TABLE IF EXISTS user_progression DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 5. Удаляем таблицу profiles если она существует
DROP TABLE IF EXISTS profiles CASCADE;

-- 6. Очищаем существующие таблицы (но не удаляем их структуру)
TRUNCATE TABLE IF EXISTS user_progression CASCADE;
TRUNCATE TABLE IF EXISTS user_coupons CASCADE;
TRUNCATE TABLE IF EXISTS user_cart_items CASCADE;

-- Теперь база данных полностью очищена от всех триггеров, функций и политик
-- Можно безопасно выполнять регистрацию пользователей
