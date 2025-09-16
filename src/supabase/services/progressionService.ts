import { supabase } from '../config';

export interface UserProgression {
  id: string;
  user_id: string;
  level: number;
  experience: number;
  max_experience: number;
  coins: number;
  last_xp_gain: string;
  created_at: string;
  updated_at: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  coupon_name: string;
  discount_percent: number;
  cost: number;
  rarity: string;
  is_used: boolean;
  purchased_at: string;
  used_at?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  added_at: string;
  updated_at: string;
}

export class ProgressionService {
  // Получить прогрессию пользователя
  static async getUserProgression(userId: string): Promise<UserProgression | null> {
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user progression:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProgression:', error);
      return null;
    }
  }

  // Создать начальную прогрессию для нового пользователя
  static async initializeUserProgression(userId: string): Promise<UserProgression | null> {
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .insert({
          user_id: userId,
          level: 1,
          experience: 0,
          max_experience: 1000,
          coins: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error initializing user progression:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in initializeUserProgression:', error);
      return null;
    }
  }

  // Обновить опыт пользователя
  static async updateUserExperience(userId: string, experienceGain: number): Promise<UserProgression | null> {
    try {
      // Сначала получаем текущие данные
      const { data: currentData, error: fetchError } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentData) {
        console.error('Error fetching current progression:', fetchError);
        return null;
      }

      // Обновляем с новыми значениями
      const { data, error } = await supabase
        .from('user_progression')
        .update({
          experience: currentData.experience + experienceGain,
          last_xp_gain: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user experience:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserExperience:', error);
      return null;
    }
  }

  // Обновить монеты пользователя
  static async updateUserCoins(userId: string, coinChange: number): Promise<UserProgression | null> {
    try {
      // Сначала получаем текущие данные
      const { data: currentData, error: fetchError } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentData) {
        console.error('Error fetching current progression:', fetchError);
        return null;
      }

      // Обновляем с новыми значениями
      const { data, error } = await supabase
        .from('user_progression')
        .update({
          coins: currentData.coins + coinChange
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user coins:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserCoins:', error);
      return null;
    }
  }

  // Повысить уровень пользователя (используя функцию базы данных)
  static async levelUpUser(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('level_up_user', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error leveling up user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in levelUpUser:', error);
      return null;
    }
  }

  // Получить купоны пользователя
  static async getUserCoupons(userId: string, onlyUnused: boolean = false): Promise<UserCoupon[]> {
    try {
      let query = supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (onlyUnused) {
        query = query.eq('is_used', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user coupons:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserCoupons:', error);
      return [];
    }
  }

  // Купить купон
  static async purchaseCoupon(
    userId: string,
    couponId: string,
    couponName: string,
    discountPercent: number,
    cost: number,
    rarity: string
  ): Promise<boolean> {
    try {
      // Начинаем транзакцию
      const { data: progression, error: progressionError } = await supabase
        .from('user_progression')
        .select('coins')
        .eq('user_id', userId)
        .single();

      if (progressionError || !progression) {
        console.error('Error fetching user progression for purchase:', progressionError);
        return false;
      }

      // Проверяем, достаточно ли монет
      if (progression.coins < cost) {
        console.error('Not enough coins for purchase');
        return false;
      }

      // Списываем монеты
      const { error: coinsError } = await supabase
        .from('user_progression')
        .update({ coins: progression.coins - cost })
        .eq('user_id', userId);

      if (coinsError) {
        console.error('Error deducting coins:', coinsError);
        return false;
      }

      // Добавляем купон
      const { error: couponError } = await supabase
        .from('user_coupons')
        .insert({
          user_id: userId,
          coupon_id: couponId,
          coupon_name: couponName,
          discount_percent: discountPercent,
          cost: cost,
          rarity: rarity
        });

      if (couponError) {
        console.error('Error adding coupon:', couponError);
        // Возвращаем монеты обратно
        await supabase
          .from('user_progression')
          .update({ coins: progression.coins })
          .eq('user_id', userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in purchaseCoupon:', error);
      return false;
    }
  }

  // Использовать купон
  static async useCoupon(userId: string, couponId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_coupons')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('id', couponId)
        .eq('is_used', false);

      if (error) {
        console.error('Error using coupon:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in useCoupon:', error);
      return false;
    }
  }

  // Получить корзину пользователя
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_cart_items')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching user cart:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserCart:', error);
      return [];
    }
  }

  // Добавить товар в корзину
  static async addToCart(
    userId: string,
    productId: string,
    productName: string,
    productPrice: number,
    quantity: number = 1
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_cart_items')
        .upsert({
          user_id: userId,
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          quantity: quantity
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) {
        console.error('Error adding to cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
  }

  // Обновить количество товара в корзине
  static async updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      if (quantity <= 0) {
        // Удаляем товар из корзины если количество 0 или меньше
        return await this.removeFromCart(userId, productId);
      }

      const { error } = await supabase
        .from('user_cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error updating cart item quantity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateCartItemQuantity:', error);
      return false;
    }
  }

  // Удалить товар из корзины
  static async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    }
  }

  // Очистить корзину
  static async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  }
}
