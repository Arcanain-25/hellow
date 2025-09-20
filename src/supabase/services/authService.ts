import { supabase } from '../config';
import { User, LoginCredentials, RegisterCredentials } from '../../types/common';

export class SupabaseAuthService {
  // Получить текущего пользователя
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Получаем профиль пользователя из таблицы profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.warn('Profile not found, using auth data:', profileError);
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || 'Пользователь',
          phone: user.user_metadata?.phone,
          createdAt: user.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.date_of_birth,
        gender: profileData.gender,
        profileImage: profileData.profile_image,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        preferences: {
          newsletter: profileData.newsletter_subscription,
          notifications: profileData.notifications_enabled,
        },
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Регистрация нового пользователя
  static async registerUser(credentials: RegisterCredentials): Promise<User> {
    try {
      const email = (credentials.email || '').trim().toLowerCase();
      const password = (credentials.password || '').trim();
      const confirmPassword = (credentials.confirmPassword || '').trim();
      const name = (credentials.name || '').trim();

      if (password !== confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      if (!credentials.agreeToTerms) {
        throw new Error('Необходимо согласиться с условиями использования');
      }

      // Базовая проверка email перед отправкой в Supabase
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Введите корректный email');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Ошибка регистрации пользователя');
      }
      // Минимальная регистрация: не пишем в profiles напрямую на этапе signup
      // Пытаемся мягко сохранить профиль через RPC (если функция создана SQL-скриптом)
      try {
        await supabase.rpc('create_or_update_profile', {
          p_id: authData.user.id,
          p_email: email,
          p_name: name || 'Пользователь',
          p_phone: credentials.phone || null,
        });
      } catch (rpcErr) {
        console.warn('RPC create_or_update_profile failed (non-blocking):', rpcErr);
      }

      return {
        id: authData.user.id,
        email,
        name,
        phone: credentials.phone || '',
        createdAt: authData.user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Вход пользователя
  static async loginUser(credentials: LoginCredentials): Promise<User> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Ошибка входа в систему');
      }

      // Получаем профиль пользователя из таблицы profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.warn('Profile not found, using auth data:', profileError);
        // Создаем базовый профиль из данных аутентификации
        const user: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          name: authData.user.user_metadata?.name || 'Пользователь',
          phone: authData.user.user_metadata?.phone,
          createdAt: authData.user.created_at,
          updatedAt: new Date().toISOString(),
        };
        return user;
      }

      // Возвращаем пользователя в нашем формате
      const user: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return user;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  // Выход пользователя
  static async logoutUser(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  // Подписаться на изменения аутентификации
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}