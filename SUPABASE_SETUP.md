# Настройка Supabase для E-commerce приложения

## 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и анонимный ключ

## 2. Настройка конфигурации

Обновите файл `src/supabase/config.ts`:

```typescript
const supabaseUrl = 'https://your-project-ref.supabase.co'; // Ваш URL
const supabaseAnonKey = 'your-anon-key'; // Ваш анонимный ключ
```

## 3. Создание таблиц в базе данных

Выполните следующие SQL команды в Supabase SQL Editor:

### Таблица профилей пользователей
```sql
-- Создание таблицы profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  profile_image TEXT,
  newsletter_subscription BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть и редактировать только свои профили
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Таблица корзины
```sql
-- Создание таблицы cart_items
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Включение RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Политики для корзины
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);
```

### Таблица избранного
```sql
-- Создание таблицы wishlist_items
CREATE TABLE wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Включение RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Политики для избранного
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id);
```

### Функция для автоматического создания профиля
```sql
-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 4. Настройка аутентификации

В настройках Supabase Authentication:

1. Включите Email authentication
2. Отключите "Confirm email" для тестирования (можно включить позже)
3. Настройте URL редиректа для вашего домена

## 5. Переменные окружения (опционально)

Создайте файл `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Тестирование

После настройки:

1. Запустите приложение: `npm start`
2. Попробуйте зарегистрировать нового пользователя
3. Проверьте, что данные сохраняются в Supabase Dashboard
4. Протестируйте вход в систему

## Особенности Supabase

- **Автоматическая аутентификация**: Supabase управляет сессиями автоматически
- **Row Level Security**: Каждый пользователь видит только свои данные
- **Realtime**: Можно подписаться на изменения в реальном времени
- **PostgreSQL**: Полнофункциональная SQL база данных
