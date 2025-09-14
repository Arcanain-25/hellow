import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import { AlertType, CartItem, Product, User, AuthState, LoginCredentials, RegisterCredentials } from '../types/common';
import { RootState } from './store';
import { showAlert } from './CommonSlice';
import { ADDED_TO_WISHLIST, REMOVED_FROM_WISHLIST } from '../constants/messages';
import { UserService } from '../firebase/services/userService';
import { CartService } from '../firebase/services/cartService';
import { SupabaseAuthService } from '../supabase/services/authService';
import { SupabaseCartService } from '../supabase/services/cartService';

type WishList = Product['id'][];

export type UserState = AuthState & {
  wishlist: WishList;
  cart: CartItem[];
};

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  wishlist: [],
  cart: [],
};

export const setToLocalStorage = createAsyncThunk<void, string, { state: RootState }>(
  'user/setToLS',
  async (key, { getState }) => {
    const {
      user: { wishlist, cart },
    } = getState();

    if (key === 'wishlist') {
      localStorage.setItem(key, JSON.stringify(wishlist));
    }

    if (key === 'cart') {
      localStorage.setItem(key, JSON.stringify(cart));
    }
  }
);

export const getFromLocalStorage = createAsyncThunk<void, string>('user/setWishlistToLS', async (key, { dispatch }) => {
  if (key === 'wishlist') {
    const wishlist = JSON.parse(localStorage.getItem(key) as any);
    if (!wishlist) return;
    dispatch(setWishlist(wishlist));
  }

  if (key === 'cart') {
    const cart = JSON.parse(localStorage.getItem(key) as any);
    if (!cart) return;
    dispatch(setProductsToCart(cart));
  }

  if (key === 'user') {
    const user = JSON.parse(localStorage.getItem(key) as any);
    if (!user) return;
    dispatch(setUser(user));
  }
});

// Аутентификация
export const login = createAsyncThunk<User, LoginCredentials, { state: RootState }>(
  'user/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // Используем Supabase для входа
      const user = await SupabaseAuthService.loginUser(credentials);
      
      // Сохраняем пользователя в localStorage для быстрого доступа
      localStorage.setItem('user', JSON.stringify(user));
      
      // Загружаем данные корзины и избранного из Supabase
      const cart = await SupabaseCartService.getUserCart(user.id);
      const wishlist = await SupabaseCartService.getUserWishlist(user.id);
      
      dispatch(setProductsToCart(cart));
      dispatch(setWishlist(wishlist));
      
      dispatch(showAlert({ type: AlertType.Success, message: 'Успешный вход в систему' }));
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неверный email или пароль';
      dispatch(showAlert({ type: AlertType.Error, message: errorMessage }));
      return rejectWithValue(error);
    }
  }
);

export const register = createAsyncThunk<User, RegisterCredentials, { state: RootState }>(
  'user/register',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // Используем Supabase для регистрации
      const newUser = await SupabaseAuthService.registerUser(credentials);
      
      // Сохраняем пользователя в localStorage для быстрого доступа
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Инициализируем пустые корзину и избранное в Supabase
      await SupabaseCartService.updateUserCart(newUser.id, []);
      await SupabaseCartService.updateUserWishlist(newUser.id, []);
      
      dispatch(showAlert({ type: AlertType.Success, message: 'Регистрация прошла успешно' }));
      
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      dispatch(showAlert({ type: AlertType.Error, message: errorMessage }));
      return rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  'user/logout',
  async (_, { dispatch, getState }) => {
    try {
      // Выходим из Supabase
      await SupabaseAuthService.logoutUser();
      
      // Очищаем localStorage
      localStorage.removeItem('user');
      
      dispatch(showAlert({ type: AlertType.Info, message: 'Вы вышли из системы' }));
    } catch (error) {
      console.error('Error during logout:', error);
      // Даже если произошла ошибка, очищаем локальные данные
      localStorage.removeItem('user');
      dispatch(showAlert({ type: AlertType.Info, message: 'Вы вышли из системы' }));
    }
  }
);

export const wishListHandler = createAsyncThunk<void, { id: string; isWished: boolean }, { state: RootState }>(
  'user/wishListHandler',
  async ({ id, isWished }, { dispatch, getState }) => {
    try {
      const { user } = getState().user;
      
      if (!user) {
        dispatch(showAlert({ type: AlertType.Error, message: 'Необходимо войти в систему' }));
        return;
      }

      // Обновляем избранное в Supabase
      const isAdded = await SupabaseCartService.toggleWishlistItem(user.id, id);
      
      // Обновляем локальное состояние
      dispatch(handleWishlist(id));
      
      if (isAdded) {
        dispatch(showAlert({ type: AlertType.Success, message: ADDED_TO_WISHLIST, action: 'wishlist' }));
      } else {
        dispatch(showAlert({ type: AlertType.Info, message: REMOVED_FROM_WISHLIST }));
      }
    } catch (error) {
      console.error('Error handling wishlist:', error);
      dispatch(showAlert({ type: AlertType.Error, message: 'Ошибка при работе с избранным' }));
    }
  }
);

// Новые функции для работы с корзиной через Firebase
export const addToCartFirebase = createAsyncThunk<void, CartItem, { state: RootState }>(
  'user/addToCartFirebase',
  async (item, { dispatch, getState }) => {
    try {
      const { user } = getState().user;
      
      if (!user) {
        dispatch(showAlert({ type: AlertType.Error, message: 'Необходимо войти в систему' }));
        return;
      }

      await SupabaseCartService.addToCart(user.id, item);
      
      // Обновляем локальное состояние
      const updatedCart = await SupabaseCartService.getUserCart(user.id);
      dispatch(syncCartWithFirebase(updatedCart));
      
      dispatch(showAlert({ type: AlertType.Success, message: 'Товар добавлен в корзину' }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch(showAlert({ type: AlertType.Error, message: 'Ошибка при добавлении в корзину' }));
    }
  }
);

export const removeFromCartFirebase = createAsyncThunk<void, string, { state: RootState }>(
  'user/removeFromCartFirebase',
  async (productId, { dispatch, getState }) => {
    try {
      const { user } = getState().user;
      
      if (!user) {
        dispatch(showAlert({ type: AlertType.Error, message: 'Необходимо войти в систему' }));
        return;
      }

      await SupabaseCartService.removeFromCart(user.id, productId);
      
      // Обновляем локальное состояние
      const updatedCart = await SupabaseCartService.getUserCart(user.id);
      dispatch(syncCartWithFirebase(updatedCart));
      
      dispatch(showAlert({ type: AlertType.Info, message: 'Товар удален из корзины' }));
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch(showAlert({ type: AlertType.Error, message: 'Ошибка при удалении из корзины' }));
    }
  }
);

export const clearCartFirebase = createAsyncThunk<void, void, { state: RootState }>(
  'user/clearCartFirebase',
  async (_, { dispatch, getState }) => {
    try {
      const { user } = getState().user;
      
      if (!user) {
        dispatch(showAlert({ type: AlertType.Error, message: 'Необходимо войти в систему' }));
        return;
      }

      await SupabaseCartService.clearCart(user.id);
      
      // Обновляем локальное состояние
      dispatch(clearCart());
      
      dispatch(showAlert({ type: AlertType.Info, message: 'Корзина очищена' }));
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch(showAlert({ type: AlertType.Error, message: 'Ошибка при очистке корзины' }));
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setWishlist: (state, action) => {
      state.wishlist = action.payload;
    },

    handleWishlist: (state, action: PayloadAction<Product['id']>) => {
      const isProductLiked = state.wishlist.find((wish) => wish === action.payload);
      if (isProductLiked) {
        const updatedWishlist = state.wishlist.filter((wish) => wish !== action.payload);
        state.wishlist = updatedWishlist;
        return;
      }
      state.wishlist.push(action.payload);
    },

    setProductsToCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cart = action.payload;
    },

    setProductToCart: (state, action: PayloadAction<CartItem>) => {
      const product = { ...action.payload };

      if (product.discountedPrice !== undefined) {
        product.profit = product.price - product.discountedPrice;
        product.totalPrice = product.discountedPrice;
      }

      state.cart.push(product);
    },

    increment: (state, action: PayloadAction<CartItem['productId']>) => {
      const product = state.cart.find((cartItem) => cartItem.productId === action.payload);
      if (!product) return;

      product.totalWeight += product.weight;
      product.quantity++;

      if (product.discountedPrice !== undefined) {
        product.totalPrice += product.discountedPrice;
        product.profit = product.quantity * (product.price - product.discountedPrice);
        return;
      }

      product.totalPrice += product.price;
    },

    decrement: (state, action: PayloadAction<CartItem['productId']>) => {
      const product = state.cart.find((cartItem) => cartItem.productId === action.payload);
      if (!product) return;
      product.totalWeight -= product.weight;
      product.quantity--;

      if (product.discountedPrice !== undefined) {
        product.totalPrice -= product.discountedPrice;
        product.profit = product.quantity * (product.price - product.discountedPrice);
        return;
      }

      product.totalPrice -= product.price;
    },

    removeProductFromCart: (state, action: PayloadAction<CartItem['productId']>) => {
      const updatedCart = state.cart.filter((cartItem) => cartItem.productId !== action.payload);
      state.cart = updatedCart;
    },

    clearCart: (state) => {
      state.cart = initialState.cart;
    },

    // Новые функции для работы с Firebase
    syncCartWithFirebase: (state, action: PayloadAction<CartItem[]>) => {
      state.cart = action.payload;
    },

    syncWishlistWithFirebase: (state, action: PayloadAction<string[]>) => {
      state.wishlist = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state) => {
        state.isLoading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  setUser,
  clearUser,
  handleWishlist,
  setWishlist,
  setProductToCart,
  increment,
  decrement,
  removeProductFromCart,
  clearCart,
  setProductsToCart,
  syncCartWithFirebase,
  syncWishlistWithFirebase,
} = userSlice.actions;

export default userSlice.reducer;
