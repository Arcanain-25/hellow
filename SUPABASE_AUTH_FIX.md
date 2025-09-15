# ИСПРАВЛЕНИЕ ПРОБЛЕМЫ "Email not confirmed"

## Проблема
При входе в систему появляется ошибка: `Email not confirmed`

## Решение

### Вариант 1: Отключить подтверждение email в Supabase Dashboard
1. Откройте https://supabase.com/dashboard
2. Выберите проект `mcdhnxkzsbcifsaijieu`
3. Перейдите в **Authentication → Settings**
4. Найдите секцию **"Email confirmation"**
5. **Отключите** опцию "Enable email confirmations"
6. Сохраните изменения

### Вариант 2: SQL команда для подтверждения существующих пользователей
Если нужно подтвердить уже зарегистрированных пользователей:

```sql
-- Подтверждаем email для всех пользователей
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### Вариант 3: Подтверждение конкретного пользователя
```sql
-- Подтверждаем email для конкретного пользователя
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'toliakovalciuck999@gmail.com';
```

## После исправления
1. Попробуйте войти в систему снова
2. Вход должен работать без ошибок
3. Новые пользователи будут регистрироваться без требования подтверждения email
