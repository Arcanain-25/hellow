# Настройка Firebase для работы регистрации и логина

## Проблема
Регистрация и логин не работают, потому что в файле `src/firebase/config.ts` используются заглушки вместо реальных API ключей.

## Решение

### 1. Получите реальные ключи Firebase:

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект `eccomer-2d8d2`
3. Перейдите в "Project Settings" (шестеренка в левом меню)
4. Во вкладке "General" найдите раздел "Your apps"
5. Выберите веб-приложение или создайте новое
6. Скопируйте конфигурацию Firebase

### 2. Замените конфигурацию в файле `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "ВАШ_РЕАЛЬНЫЙ_API_KEY",
  authDomain: "eccomer-2d8d2.firebaseapp.com",
  databaseURL: "https://eccomer-2d8d2-default-rtdb.firebaseio.com/",
  projectId: "eccomer-2d8d2",
  storageBucket: "eccomer-2d8d2.appspot.com",
  messagingSenderId: "ВАШ_РЕАЛЬНЫЙ_SENDER_ID",
  appId: "ВАШ_РЕАЛЬНЫЙ_APP_ID"
};
```

### 3. Настройте правила безопасности Firebase Realtime Database:

В Firebase Console перейдите в "Realtime Database" > "Rules" и установите:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true
    },
    "sessions": {
      ".read": true,
      ".write": true
    },
    "brands": {
      ".read": true,
      ".write": true
    },
    "products": {
      ".read": true,
      ".write": true
    },
    "categories": {
      ".read": true,
      ".write": true
    },
    "cart": {
      ".read": true,
      ".write": true
    },
    "wishlist": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 4. Тестирование

После настройки ключей:
1. Перезапустите приложение
2. Попробуйте зарегистрировать нового пользователя
3. Проверьте, что данные сохраняются в Firebase Realtime Database
4. Попробуйте войти с созданными учетными данными

### 5. Демо-пользователи

После настройки Firebase автоматически создадутся демо-пользователи:
- Email: `admin@example.com`, пароль: `123456`
- Email: `user@example.com`, пароль: `123456`

## Безопасность

⚠️ **Важно**: Не коммитьте реальные API ключи в публичный репозиторий! 
Используйте переменные окружения для продакшена.
