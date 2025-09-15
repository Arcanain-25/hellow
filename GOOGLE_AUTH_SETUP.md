# Настройка аутентификации через Google

## 1. Настройка в Google Cloud Console

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Включите Google+ API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google+ API" и включите его
4. Создайте OAuth 2.0 credentials:
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
   - Выберите "Web application"
   - Добавьте authorized redirect URIs:
     - `https://mcdhnxkzsbcifsaijieu.supabase.co/auth/v1/callback`
     - `http://localhost:3001` (для разработки)
5. Скопируйте Client ID и Client Secret

## 2. Настройка в Supabase

1. Откройте https://supabase.com/dashboard
2. Выберите проект `mcdhnxkzsbcifsaijieu`
3. Перейдите в "Authentication" > "Providers"
4. Найдите "Google" и включите его
5. Вставьте Client ID и Client Secret из Google Console
6. Сохраните изменения

## 3. Обновление кода приложения

Код уже готов к работе с Google OAuth - Supabase автоматически обрабатывает OAuth провайдеров.

## 4. Добавление кнопки "Войти через Google"

В формы входа и регистрации будет добавлена кнопка для входа через Google.

## Преимущества Google OAuth:
- Не нужно запоминать пароли
- Быстрая регистрация и вход
- Автоматическое получение имени и email
- Высокий уровень безопасности
