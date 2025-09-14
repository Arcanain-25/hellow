import { supabase } from '../config';
import { User, LoginCredentials, RegisterCredentials } from '../../types/common';

export class SupabaseAuthService {
  // Регистрация нового пользователя
  static async registerUser(credentials: RegisterCredentials): Promise<User> {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      if (!credentials.agreeToTerms) {
        throw new Error('Необходимо согласиться с условиями использования');
      }

      // Регистрируем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: undefined, // Отключаем редирект после подтверждения
          data: {
            name: credentials.name,
            phone: credentials.phone || '',
            address: credentials.address || '',
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Ошибка создания пользователя');
      }

      // Создаем профиль пользователя в таблице profiles
      const profileData = {
        id: authData.user.id,
        email: credentials.email,
        name: credentials.name,
        phone: credentials.phone || null,
        address: credentials.address || null,
        date_of_birth: credentials.dateOfBirth || null,
        gender: credentials.gender || null,
        newsletter_subscription: credentials.subscribeToNewsletter || false,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Не бросаем ошибку, так как пользователь уже создан в Auth
      }

      // Возвращаем пользователя в нашем формате
      const user: User = {
        id: authData.user.id,
        email: credentials.email,
        name: credentials.name,
        phone: credentials.phone,
        address: credentials.address,
        dateOfBirth: credentials.dateOfBirth,
        gender: credentials.gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          newsletter: credentials.subscribeToNewsletter || false,
          notifications: true,
        },
      };

      console.log('✅ Пользователь успешно зарегистрирован в Supabase:', user.email);
      return user;

    } catch (error) {
      console.error('Error registering user:', error);
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
          address: authData.user.user_metadata?.address,
          createdAt: authData.user.created_at,
          updatedAt: new Date().toISOString(),
          preferences: {
            newsletter: false,
            notifications: true,
          },
        };
        return user;
      }

      // Возвращаем пользователя в нашем формате
      const user: User = {
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

      console.log('✅ Пользователь успешно вошел в систему:', user.email);
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
      console.log('✅ Пользователь вышел из системы');
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  // Получить текущего пользователя
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }

      // Получаем профиль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.warn('Profile not found:', profileError);
        return null;
      }

      const user: User = {
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

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Обновить профиль пользователя
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.gender !== undefined) updateData.gender = updates.gender;
      if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
      if (updates.preferences?.newsletter !== undefined) updateData.newsletter_subscription = updates.preferences.newsletter;
      if (updates.preferences?.notifications !== undefined) updateData.notifications_enabled = updates.preferences.notifications;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        profileImage: data.profile_image,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        preferences: {
          newsletter: data.newsletter_subscription,
          notifications: data.notifications_enabled,
        },
      };

      console.log('✅ Профиль пользователя обновлен');
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
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
