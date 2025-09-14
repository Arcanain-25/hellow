# 🔥 Настройка Firebase Realtime Database

## Шаги для подключения к вашему Firebase проекту:

### 1. Создайте проект в Firebase Console
1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект"
3. Следуйте инструкциям мастера

### 2. Включите Realtime Database
1. В левом меню выберите "Realtime Database"
2. Нажмите "Создать базу данных"
3. Выберите режим: "Начать в тестовом режиме" (для разработки)
4. Выберите регион (ближайший к вам)

### 3. Получите конфигурацию
1. В настройках проекта (шестеренка) выберите "Настройки проекта"
2. Прокрутите вниз до раздела "Ваши приложения"
3. Нажмите "Добавить приложение" → "Web" (</>)
4. Зарегистрируйте приложение
5. Скопируйте конфигурацию Firebase

### 4. Обновите конфигурацию в проекте
Откройте файл `src/firebase/config.ts` и замените значения:

```typescript
const firebaseConfig = {
  apiKey: "ваш-api-key",
  authDomain: "ваш-project-id.firebaseapp.com",
  databaseURL: "https://ваш-project-id-default-rtdb.firebaseio.com/",
  projectId: "ваш-project-id",
  storageBucket: "ваш-project-id.appspot.com",
  messagingSenderId: "ваш-sender-id",
  appId: "ваш-app-id"
};
```

### 5. Установите Firebase SDK
```bash
npm install firebase
```

### 6. Настройте правила безопасности (опционально)
В Firebase Console → Realtime Database → Правила:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "carts": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "wishlists": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

## Структура данных в Firebase:

```
your-project-id-default-rtdb/
├── users/
│   ├── userId1/
│   │   ├── id: "userId1"
│   │   ├── email: "user@example.com"
│   │   ├── name: "Имя пользователя"
│   │   ├── phone: "+7 (999) 123-45-67"
│   │   ├── address: "Адрес пользователя"
│   │   ├── password: "hashed_password"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   └── userId2/...
├── carts/
│   ├── userId1/
│   │   └── [массив товаров корзины]
│   └── userId2/...
├── wishlists/
│   ├── userId1/
│   │   └── [массив ID избранных товаров]
│   └── userId2/...
└── userSessions/
    ├── userId1/
    │   ├── userId: "userId1"
    │   ├── loginTime: timestamp
    │   └── isActive: true
    └── userId2/...
```

## Возможности системы:

✅ **Аутентификация пользователей**
- Регистрация с валидацией
- Вход в систему
- Выход из системы
- Управление сессиями

✅ **Корзина покупок**
- Добавление товаров
- Удаление товаров
- Обновление количества
- Синхронизация между устройствами

✅ **Избранное**
- Добавление/удаление товаров
- Синхронизация между устройствами

✅ **Реальное время**
- Автоматическое обновление данных
- Подписка на изменения
- Офлайн поддержка

## Тестирование:

1. Запустите приложение: `npm start`
2. Перейдите на `/register` для регистрации
3. Перейдите на `/login` для входа
4. Проверьте работу корзины и избранного
5. Данные должны сохраняться в Firebase Console

## Безопасность:

⚠️ **Важно для продакшена:**
- Используйте Firebase Authentication для безопасности
- Настройте правила безопасности базы данных
- Хешируйте пароли на сервере
- Используйте HTTPS
- Настройте CORS политики

