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

-- Функция для инициализации прогрессии нового пользователя
CREATE OR REPLACE FUNCTION initialize_user_progression()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_progression (user_id, level, experience, max_experience, coins)
    VALUES (NEW.id, 1, 0, 1000, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматической инициализации прогрессии при регистрации
CREATE TRIGGER initialize_user_progression_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_progression();

-- RLS (Row Level Security) политики для безопасности
ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cart_items ENABLE ROW LEVEL SECURITY;

-- Политики для user_progression
CREATE POLICY "Users can view own progression" ON user_progression
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progression" ON user_progression
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progression" ON user_progression
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для user_coupons
CREATE POLICY "Users can view own coupons" ON user_coupons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons" ON user_coupons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" ON user_coupons
    FOR UPDATE USING (auth.uid() = user_id);

-- Политики для user_cart_items
CREATE POLICY "Users can view own cart" ON user_cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON user_cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON user_cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON user_cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Функция для расчета максимального опыта для уровня
CREATE OR REPLACE FUNCTION calculate_max_experience(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Формула: базовый опыт (1000) + (уровень - 1) * 500
    RETURN 1000 + (current_level - 1) * 500;
END;
$$ language 'plpgsql';

-- Функция для повышения уровня пользователя
CREATE OR REPLACE FUNCTION level_up_user(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    current_progression user_progression%ROWTYPE;
    new_max_exp INTEGER;
    coins_reward INTEGER := 5000;
    result JSON;
BEGIN
    -- Получаем текущую прогрессию
    SELECT * INTO current_progression FROM user_progression WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "User progression not found"}'::JSON;
    END IF;
    
    -- Проверяем, достаточно ли опыта для повышения уровня
    IF current_progression.experience < current_progression.max_experience THEN
        RETURN '{"error": "Not enough experience"}'::JSON;
    END IF;
    
    -- Вычисляем новый максимальный опыт
    new_max_exp := calculate_max_experience(current_progression.level + 1);
    
    -- Обновляем прогрессию
    UPDATE user_progression 
    SET 
        level = level + 1,
        experience = experience - current_progression.max_experience,
        max_experience = new_max_exp,
        coins = coins + coins_reward,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Возвращаем результат
    SELECT json_build_object(
        'success', true,
        'new_level', current_progression.level + 1,
        'remaining_experience', current_progression.experience - current_progression.max_experience,
        'new_max_experience', new_max_exp,
        'coins_earned', coins_reward,
        'total_coins', current_progression.coins + coins_reward
    ) INTO result;
    
    RETURN result;
END;
$$ language 'plpgsql';
