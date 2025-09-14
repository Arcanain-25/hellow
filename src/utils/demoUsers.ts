// Начальные данные для демонстрации с Firebase
// Этот файл можно удалить в продакшене

import { UserService } from '../firebase/services/userService';

export const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '123456',
    name: 'Администратор',
    phone: '+7 (999) 123-45-67',
    address: 'Москва, ул. Примерная, д. 1'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: '123456',
    name: 'Пользователь',
    phone: '+7 (999) 765-43-21',
    address: 'Санкт-Петербург, ул. Тестовая, д. 2'
  }
];

// Функция для инициализации демо-пользователей в Firebase
export const initializeDemoUsers = async () => {
  try {
    // Проверяем, есть ли уже пользователи в Firebase
    const existingUsers = await UserService.getAllUsers();
    
    if (existingUsers.length === 0) {
      console.log('Создание демо-пользователей в Firebase...');
      
      // Создаем демо-пользователей
      for (const demoUser of DEMO_USERS) {
        try {
          await UserService.registerUser({
            email: demoUser.email,
            password: demoUser.password,
            confirmPassword: demoUser.password,
            name: demoUser.name,
            phone: demoUser.phone,
            address: demoUser.address,
            agreeToTerms: true,
          });
          console.log(`Демо-пользователь ${demoUser.email} создан`);
        } catch (error) {
          console.log(`Демо-пользователь ${demoUser.email} уже существует`);
        }
      }
      
      console.log('Демо-пользователи созданы в Firebase!');
      console.log('Email: admin@example.com, пароль: 123456');
      console.log('Email: user@example.com, пароль: 123456');
    } else {
      console.log('Демо-пользователи уже существуют в Firebase');
    }
  } catch (error) {
    console.error('Ошибка при инициализации демо-пользователей:', error);
    console.log('Убедитесь, что Firebase настроен правильно');
  }
};
