import {
  ref,
  set,
  get,
  onValue,
  remove
} from 'firebase/database';
import { database } from '../config';
import { CartItem } from '../../types/common';

export class CartService {
  // Получить корзину пользователя
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = ref(database, `carts/${userId}`);
      const snapshot = await get(cartRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user cart:', error);
      return [];
    }
  }
  
  // Обновить корзину пользователя
  static async updateUserCart(userId: string, cart: CartItem[]): Promise<void> {
    try {
      const cartRef = ref(database, `carts/${userId}`);
      await set(cartRef, cart);
    } catch (error) {
      console.error('Error updating user cart:', error);
      throw error;
    }
  }
  
  // Добавить товар в корзину
  static async addToCart(userId: string, item: CartItem): Promise<void> {
    try {
      const cart = await this.getUserCart(userId);
      const existingItemIndex = cart.findIndex(cartItem => cartItem.productId === item.productId);
      
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += item.quantity;
      } else {
        cart.push(item);
      }
      
      await this.updateUserCart(userId, cart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }
  
  // Удалить товар из корзины
  static async removeFromCart(userId: string, productId: string): Promise<void> {
    try {
      const cart = await this.getUserCart(userId);
      const updatedCart = cart.filter(item => item.productId !== productId);
      await this.updateUserCart(userId, updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }
  
  // Очистить корзину
  static async clearCart(userId: string): Promise<void> {
    try {
      const cartRef = ref(database, `carts/${userId}`);
      await remove(cartRef);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
  
  // Получить избранное пользователя
  static async getUserWishlist(userId: string): Promise<string[]> {
    try {
      const wishlistRef = ref(database, `wishlists/${userId}`);
      const snapshot = await get(wishlistRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return [];
    }
  }
  
  // Обновить избранное пользователя
  static async updateUserWishlist(userId: string, wishlist: string[]): Promise<void> {
    try {
      const wishlistRef = ref(database, `wishlists/${userId}`);
      await set(wishlistRef, wishlist);
    } catch (error) {
      console.error('Error updating user wishlist:', error);
      throw error;
    }
  }
  
  // Переключить товар в избранном
  static async toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getUserWishlist(userId);
      const isInWishlist = wishlist.includes(productId);
      
      if (isInWishlist) {
        const updatedWishlist = wishlist.filter(id => id !== productId);
        await this.updateUserWishlist(userId, updatedWishlist);
        return false; // Удален из избранного
      } else {
        const updatedWishlist = [...wishlist, productId];
        await this.updateUserWishlist(userId, updatedWishlist);
        return true; // Добавлен в избранное
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      throw error;
    }
  }
  
  // Подписаться на изменения корзины
  static subscribeToCart(userId: string, callback: (cart: CartItem[]) => void): () => void {
    const cartRef = ref(database, `carts/${userId}`);
    
    const unsubscribe = onValue(cartRef, (snapshot: any) => {
      if (snapshot.exists()) {
        callback(Object.values(snapshot.val()));
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }
  
  // Подписаться на изменения избранного
  static subscribeToWishlist(userId: string, callback: (wishlist: string[]) => void): () => void {
    const wishlistRef = ref(database, `wishlists/${userId}`);
    
    const unsubscribe = onValue(wishlistRef, (snapshot: any) => {
      if (snapshot.exists()) {
        callback(Object.values(snapshot.val()));
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }
}

