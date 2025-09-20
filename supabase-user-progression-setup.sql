-- Создание таблицы для прогрессии пользователей (уровень, опыт, монеты)
CREATE TABLE user_progression (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 NOT NULL,
    experience INTEGER DEFAULT 0 NOT NULL,
    max_experience INTEGER DEFAULT 1000 NOT NULL,
    coins INTEGER DEFAULT 0 NOT NULL,
    last_xp_gain TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Создание таблицы для купленных купонов пользователей
CREATE TABLE user_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coupon_id VARCHAR(50) NOT NULL,
    coupon_name VARCHAR(100) NOT NULL,
    discount_percent INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Создание таблицы для корзины пользователей (улучшенная версия)
CREATE TABLE user_cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_user_progression_user_id ON user_progression(user_id);
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_unused ON user_coupons(user_id, is_used);
CREATE INDEX idx_user_cart_items_user_id ON user_cart_items(user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_progression_updated_at 
    BEFORE UPDATE ON user_progression 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cart_items_updated_at 
    BEFORE UPDATE ON user_cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггеры удалены для избежания конфликтов с регистрацией

-- RLS политики временно отключены для упрощения регистрации
-- ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_cart_items ENABLE ROW LEVEL SECURITY;

-- Все политики временно отключены для упрощения регистрации

-- Функции удалены для упрощения системы

-- Функция для повышения уровня удалена для упрощения

-- RPC функции удалены для избежания конфликтов с регистрацией
