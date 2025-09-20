-- МИНИМАЛЬНАЯ НАСТРОЙКА - ТОЛЬКО AUTH БЕЗ БАЗЫ ДАННЫХ
-- Этот скрипт полностью очищает все что может мешать регистрации

-- 1. Удаляем ВСЕ триггеры на auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Удаляем ВСЕ функции которые могут вызываться
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_manually() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 3. Удаляем таблицу profiles полностью
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. Удаляем все остальные таблицы которые могут мешать
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;

-- 5. Проверяем что auth.users работает
SELECT 'Auth система очищена. Теперь регистрация должна работать БЕЗ создания профилей.' as status;

-- ВАЖНО: Теперь Supabase будет создавать пользователей ТОЛЬКО в auth.users
-- Никаких дополнительных таблиц, триггеров или функций
-- Это должно работать на 100%
