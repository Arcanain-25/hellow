import React, { useEffect, useState } from 'react';
import classes from './App.module.css';
import { PATHS } from './constants/routes';
import { useRoutes } from 'react-router-dom';
import { MockUserService } from './firebase/services/mockUserService';
import { SupabaseAuthService } from './supabase/services/authService';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import { fetchProducts } from './store/ProductSlice';
import CategoryPage from './components/pages/showcasePages/CategoryPage/CategoryPage';
import ProductsPage from './components/pages/adminPages/ProductsPage/ProductsPage';
import SettingsPage from './components/pages/adminPages/SettingsPage/SettingsPage';
import AdminPage from './components/pages/adminPages/AdminPage/AdminPage';
import DiscountProductsPage from './components/pages/showcasePages/DiscountProductsPage/DiscountProductsPage';
import ShowcasePage from './components/pages/showcasePages/ShowcasePage/ShowcasePage';
import { getFromLocalStorage, setUser } from './store/UserSlice';
import WishlistPage from './components/pages/showcasePages/WishlistPage/WishlistPage';
import ProductPage from './components/pages/showcasePages/ProductPage/ProductPage';
import Loader from './components/UI/Loader/Loader';
import CartPage from './components/pages/showcasePages/CartPage/CartPage';
import OrdersPage from './components/pages/adminPages/OrdersPage/OrdersPage';
import CheckoutSuccessPage from './components/pages/showcasePages/CheckoutSuccessPage/CheckoutSuccessPage';
import NotFound from './components/pages/showcasePages/NotFound/NotFound';
import LoginPage from './components/pages/authPages/LoginPage/LoginPage';
import RegisterPage from './components/pages/authPages/RegisterPage/RegisterPage';
import ProfilePage from './components/pages/authPages/ProfilePage/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import { initializeDemoUsers } from './utils/demoUsers';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, products } = useSelector((state: RootState) => state.product);
  const isDataLoaded = !isLoading && products.length > 0;

  // 🔹 состояние для размера шрифта
  const [fontSize, setFontSize] = useState(16);

  const routes = useRoutes([
    {
      path: PATHS.showcase,
      element: <ShowcasePage />,
      children: [
        {
          path: '/',
          element: isDataLoaded ? <DiscountProductsPage /> : <Loader />,
        },
        {
          path: ':url',
          children: [
            {
              index: true,
              element: isDataLoaded ? <CategoryPage /> : <Loader />,
            },
            {
              path: ':id',
              element: isDataLoaded ? <ProductPage /> : <Loader />,
            },
          ],
        },
        { path: PATHS.wishlist, element: isDataLoaded ? <WishlistPage /> : <Loader /> },
        {
          path: PATHS.cart,
          element: isDataLoaded ? <CartPage /> : <Loader />,
        },
        {
          path: `${PATHS.cart}/${PATHS.success}`,
          element: <CheckoutSuccessPage />,
        },
      ],
    },
    {
      path: PATHS.login,
      element: <LoginPage />,
    },
    {
      path: PATHS.register,
      element: <RegisterPage />,
    },
    {
      path: PATHS.profile,
      element: (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      ),
    },
    {
      path: PATHS.admin,
      element: <AdminPage />,
      children: [
        {
          index: true,
          path: PATHS.orders,
          element: <OrdersPage />,
        },
        {
          path: PATHS.products,
          element: <ProductsPage />,
        },
        {
          path: PATHS.settings,
          element: <SettingsPage />,
        },
      ],
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Проверяем текущего пользователя в Supabase
        const currentUser = await SupabaseAuthService.getCurrentUser();
        if (currentUser) {
          dispatch(setUser(currentUser));
        } else {
          // Если нет пользователя в Supabase, проверяем localStorage
          dispatch(getFromLocalStorage('user'));
        }
        
        // Инициализируем демо-пользователей
        await MockUserService.initializeDemoUsers();
        
        dispatch(getFromLocalStorage('wishlist'));
        dispatch(getFromLocalStorage('cart'));
        dispatch(fetchProducts());
      } catch (error) {
        console.log('Fetch error App.tsx:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <div
      className={classes.app}
      style={{ fontSize: `${fontSize}px` }} // применяем размер
    >
      {/* 🔹 Кнопки управления шрифтом */}
      <div className={classes.fontControls}>
        <button onClick={() => setFontSize((prev) => Math.max(prev - 2, 12))}>A-</button>
        <button onClick={() => setFontSize(16)}>Reset</button>
        <button onClick={() => setFontSize((prev) => Math.min(prev + 2, 28))}>A+</button>
      </div>

      {routes}
    </div>
  );
};

export default App;

