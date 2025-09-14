import {
  ref,
  set,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
  remove
} from 'firebase/database';
import { database } from '../config';
import { User, LoginCredentials, RegisterCredentials } from '../../types/common';
import { MockUserService } from './mockUserService';

export class UserService {
  // Проверяем, доступен ли Firebase
  private static async isFirebaseAvailable(): Promise<boolean> {
    try {
      const testRef = ref(database, '.info/connected');
      await get(testRef);
      return true;
    } catch (error) {
      console.warn('Firebase недоступен, используем MockUserService:', error);
      return false;
    }
  }

  // Регистрация нового пользователя
  static async registerUser(credentials: RegisterCredentials): Promise<User> {
    // Проверяем доступность Firebase
    const firebaseAvailable = await this.isFirebaseAvailable();
    
    if (!firebaseAvailable) {
      return MockUserService.registerUser(credentials);
    }

    try {
      // Проверяем, существует ли пользователь с таким email
      const usersRef = ref(database, 'users');
      const userQuery = query(usersRef, orderByChild('email'), equalTo(credentials.email));
      const snapshot = await get(userQuery);
      
      if (snapshot.exists()) {
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
      
      // Сохраняем пользователя в Firebase
      const userRef = ref(database, `users/${newUser.id}`);
      await set(userRef, newUser);
      
      // Создаем сессию пользователя
      const sessionRef = ref(database, `sessions/${newUser.id}`);
      await set(sessionRef, {
        userId: newUser.id,
        loginTime: new Date().toISOString(),
        isActive: true
      });
      
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      // Fallback к MockUserService при ошибке Firebase
      return MockUserService.registerUser(credentials);
    }
  }
  
  // Вход пользователя
  static async loginUser(credentials: LoginCredentials): Promise<User> {
    // Проверяем доступность Firebase
    const firebaseAvailable = await this.isFirebaseAvailable();
    
    if (!firebaseAvailable) {
      return MockUserService.loginUser(credentials);
    }

    try {
      const usersRef = ref(database, 'users');
      const userQuery = query(usersRef, orderByChild('email'), equalTo(credentials.email));
      const snapshot = await get(userQuery);
      
      if (!snapshot.exists()) {
        throw new Error('Пользователь не найден');
      }
      
      const userData = Object.values(snapshot.val())[0] as User;
      
      // В реальном приложении здесь была бы проверка пароля
      // Обновляем сессию пользователя
      const sessionRef = ref(database, `sessions/${userData.id}`);
      await set(sessionRef, {
        userId: userData.id,
        loginTime: new Date().toISOString(),
        isActive: true
      });
      
      return userData;
    } catch (error) {
      console.error('Error logging in user:', error);
      // Fallback к MockUserService при ошибке Firebase
      return MockUserService.loginUser(credentials);
    }
  }
  
  // Выход пользователя
  static async removeUserSession(userId: string): Promise<void> {
    const firebaseAvailable = await this.isFirebaseAvailable();
    
    if (!firebaseAvailable) {
      return MockUserService.removeUserSession(userId);
    }

    try {
      const sessionRef = ref(database, `sessions/${userId}`);
      await remove(sessionRef);
    } catch (error) {
      console.error('Error removing user session:', error);
      MockUserService.removeUserSession(userId);
    }
  }
  
  // Получить всех пользователей
  static async getAllUsers(): Promise<User[]> {
    const firebaseAvailable = await this.isFirebaseAvailable();
    
    if (!firebaseAvailable) {
      return MockUserService.getAllUsers();
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return MockUserService.getAllUsers();
    }
  }
  
  // Подписаться на изменения пользователя
  static subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    const userRef = ref(database, `users/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot: any) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
    
    return unsubscribe;
  }
}

