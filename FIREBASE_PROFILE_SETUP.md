# Настройка Firebase для личного кабинета

## Шаги для настройки Firebase

### 1. Получите конфигурацию Firebase

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект `eccomer-2d8d2`
3. Перейдите в **Project Settings** (шестеренка рядом с Project Overview)
4. Прокрутите вниз до раздела **Your apps**
5. Если у вас еще нет веб-приложения, нажмите **Add app** и выберите веб-иконку
6. Скопируйте конфигурацию Firebase

### 2. Обновите файл конфигурации

Откройте файл `src/firebase/config.ts` и замените значения на ваши реальные данные:

```typescript
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "eccomer-2d8d2.firebaseapp.com",
  databaseURL: "https://eccomer-2d8d2-default-rtdb.firebaseio.com/",
  projectId: "eccomer-2d8d2",
  storageBucket: "eccomer-2d8d2.appspot.com",
  messagingSenderId: "ВАШ_SENDER_ID",
  appId: "ВАШ_APP_ID"
};
```

### 3. Настройте правила базы данных

В Firebase Console перейдите в **Realtime Database** → **Rules** и установите следующие правила:

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
    },
    "sessions": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 4. Включите аутентификацию (опционально)

Если хотите использовать Firebase Authentication:

1. Перейдите в **Authentication** → **Sign-in method**
2. Включите **Email/Password**
3. Обновите код в `UserService` для использования Firebase Auth

## Функциональность личного кабинета

### Что включено:

1. **Профиль пользователя**
   - Отображение информации о пользователе
   - Аватар с первой буквой имени
   - Контактная информация

2. **Корзина**
   - Просмотр товаров в корзине
   - Общая сумма заказа
   - Количество товаров

3. **Избранное**
   - Список избранных товаров
   - Количество товаров в избранном

4. **Навигация**
   - Ссылка "Личный кабинет" в заголовке
   - Защищенный маршрут (только для авторизованных пользователей)

### Структура данных в Firebase:

```
eccomer-2d8d2-default-rtdb.firebaseio.com/
├── users/
│   ├── userId1/
│   │   ├── id: "userId1"
│   │   ├── email: "user@example.com"
│   │   ├── name: "Имя пользователя"
│   │   ├── phone: "+7 (999) 123-45-67"
│   │   └── address: "Адрес пользователя"
│   └── userId2/...
├── carts/
│   ├── userId1/
│   │   ├── productId1/
│   │   │   ├── productId: "productId1"
│   │   │   ├── name: "Название товара"
│   │   │   ├── price: 1000
│   │   │   └── quantity: 2
│   │   └── productId2/...
│   └── userId2/...
├── wishlists/
│   ├── userId1/
│   │   ├── productId1: true
│   │   └── productId2: true
│   └── userId2/...
└── sessions/
    ├── userId1/
    │   ├── userId: "userId1"
    │   ├── loginTime: "2024-01-01T00:00:00.000Z"
    │   └── isActive: true
    └── userId2/...
```

## Демо-пользователи

После настройки Firebase будут созданы демо-пользователи:

- **Email:** admin@example.com, **Пароль:** 123456
- **Email:** user@example.com, **Пароль:** 123456

## Запуск приложения

1. Установите зависимости: `npm install`
2. Настройте Firebase конфигурацию
3. Запустите приложение: `npm start`
4. Откройте http://localhost:3000

## Безопасность

- Все данные пользователей хранятся в Firebase
- Каждый пользователь может видеть только свои данные
- Сессии пользователей отслеживаются
- Данные синхронизируются в реальном времени

