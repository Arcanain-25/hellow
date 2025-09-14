import { User, LoginCredentials, RegisterCredentials } from '../../types/common';

// Временный сервис для тестирования без реальных Firebase ключей
export class MockUserService {
  private static USERS_KEY = 'mock_users';
  private static SESSIONS_KEY = 'mock_sessions';

  // Получить всех пользователей из localStorage
  private static getStoredUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Сохранить пользователей в localStorage
  private static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Регистрация нового пользователя
  static async registerUser(credentials: RegisterCredentials): Promise<User> {
    const users = this.getStoredUsers();
    
    // Проверяем, существует ли пользователь с таким email
    const existingUser = users.find(user => user.email === credentials.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Пароли не совпадают');
    }

    if (!credentials.agreeToTerms) {
      throw new Error('Необходимо согласиться с условиями использования');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      phone: credentials.phone,
      address: credentials.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        newsletter: credentials.subscribeToNewsletter || false,
        notifications: true
      }
    };
    
    users.push(newUser);
    this.saveUsers(users);
    
    // Создаем сессию
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '{}');
    sessions[newUser.id] = {
      userId: newUser.id,
      loginTime: new Date().toISOString(),
      isActive: true
    };
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    
    console.log('✅ Пользователь успешно зарегистрирован:', newUser.email);
    return newUser;
  }
  
  // Вход пользователя
  static async loginUser(credentials: LoginCredentials): Promise<User> {
    const users = this.getStoredUsers();
    
    const user = users.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // В реальном приложении здесь была бы проверка пароля
    // Для демо принимаем любой пароль
    
    // Обновляем сессию
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '{}');
    sessions[user.id] = {
      userId: user.id,
      loginTime: new Date().toISOString(),
      isActive: true
    };
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    
    console.log('✅ Пользователь успешно вошел в систему:', user.email);
    return user;
  }
  
  // Выход пользователя
  static async removeUserSession(userId: string): Promise<void> {
    const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_KEY) || '{}');
    delete sessions[userId];
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    console.log('✅ Пользователь вышел из системы');
  }
  
  // Получить всех пользователей
  static async getAllUsers(): Promise<User[]> {
    return this.getStoredUsers();
  }
  
  // Подписаться на изменения пользователя (заглушка)
  static subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    const users = this.getStoredUsers();
    const user = users.find(u => u.id === userId);
    callback(user || null);
    
    // Возвращаем функцию отписки (заглушка)
    return () => {};
  }

  // Инициализация демо-пользователей
  static async initializeDemoUsers(): Promise<void> {
    const users = this.getStoredUsers();
    
    if (users.length === 0) {
      console.log('🔄 Создание демо-пользователей...');
      
      const demoUsers = [
        {
          email: 'admin@example.com',
          password: '123456',
          confirmPassword: '123456',
          name: 'Администратор',
          phone: '+7 (999) 123-45-67',
          address: 'Москва, ул. Примерная, д. 1',
          agreeToTerms: true,
          subscribeToNewsletter: true
        },
        {
          email: 'user@example.com',
          password: '123456',
          confirmPassword: '123456',
          name: 'Пользователь',
          phone: '+7 (999) 765-43-21',
          address: 'Санкт-Петербург, ул. Тестовая, д. 2',
          agreeToTerms: true,
          subscribeToNewsletter: false
        }
      ];

      for (const demoUser of demoUsers) {
        try {
          await this.registerUser(demoUser);
        } catch (error) {
          console.log(`Демо-пользователь ${demoUser.email} уже существует`);
        }
      }
      
      console.log('✅ Демо-пользователи созданы!');
      console.log('📧 Email: admin@example.com, пароль: 123456');
      console.log('📧 Email: user@example.com, пароль: 123456');
    }
  }
}
