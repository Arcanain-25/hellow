import { supabase } from '../config';
import { CartItem } from '../../types/common';

export class SupabaseCartService {
  // Получить корзину пользователя
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Преобразуем данные в формат CartItem
      const cartItems: CartItem[] = data.map(item => ({
        productId: item.product_id,
        name: '', // Нужно будет получить из таблицы products
        price: 0, // Нужно будет получить из таблицы products
        quantity: item.quantity,
        totalPrice: 0,
        weight: 0,
        totalWeight: 0,
      }));

      return cartItems;
    } catch (error) {
      console.error('Error getting user cart:', error);
      return [];
    }
  }

  // Добавить товар в корзину
  static async addToCart(userId: string, item: CartItem): Promise<void> {
    try {
      // Проверяем, есть ли уже такой товар в корзине
      const { data: existingItems, error: selectError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.productId);

      if (selectError) {
        throw new Error(selectError.message);
      }

      if (existingItems && existingItems.length > 0) {
        // Обновляем количество
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItems[0].quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems[0].id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        // Добавляем новый товар
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            user_id: userId,
            product_id: item.productId,
            quantity: item.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      console.log('✅ Товар добавлен в корзину');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Удалить товар из корзины
  static async removeFromCart(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Товар удален из корзины');
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Обновить количество товара в корзине
  static async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(userId, productId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Количество товара обновлено');
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  // Очистить корзину
  static async clearCart(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Корзина очищена');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Получить избранное пользователя
  static async getUserWishlist(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return data.map(item => item.product_id);
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return [];
    }
  }

  // Переключить товар в избранном
  static async toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
    try {
      // Проверяем, есть ли товар в избранном
      const { data: existingItems, error: selectError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (selectError) {
        throw new Error(selectError.message);
      }

      if (existingItems && existingItems.length > 0) {
        // Удаляем из избранного
        const { error: deleteError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', existingItems[0].id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        console.log('✅ Товар удален из избранного');
        return false;
      } else {
        // Добавляем в избранное
        const { error: insertError } = await supabase
          .from('wishlist_items')
          .insert([{
            user_id: userId,
            product_id: productId,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          throw new Error(insertError.message);
        }

        console.log('✅ Товар добавлен в избранное');
        return true;
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      throw error;
    }
  }

  // Обновить корзину пользователя (полная замена)
  static async updateUserCart(userId: string, cartItems: CartItem[]): Promise<void> {
    try {
      // Сначала очищаем корзину
      await this.clearCart(userId);

      // Затем добавляем все товары
      for (const item of cartItems) {
        await this.addToCart(userId, item);
      }

      console.log('✅ Корзина пользователя обновлена');
    } catch (error) {
      console.error('Error updating user cart:', error);
      throw error;
    }
  }

  // Обновить избранное пользователя (полная замена)
  static async updateUserWishlist(userId: string, productIds: string[]): Promise<void> {
    try {
      // Сначала очищаем избранное
      const { error: clearError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId);

      if (clearError) {
        throw new Error(clearError.message);
      }

      // Затем добавляем все товары
      if (productIds.length > 0) {
        const wishlistItems = productIds.map(productId => ({
          user_id: userId,
          product_id: productId,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('wishlist_items')
          .insert(wishlistItems);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      console.log('✅ Избранное пользователя обновлено');
    } catch (error) {
      console.error('Error updating user wishlist:', error);
      throw error;
    }
  }
}
