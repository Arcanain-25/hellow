import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { logout } from '../../../store/UserSlice';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../constants/routes';
import classes from './Profile.module.css';
import DiscountCoupons from '../../UI/DiscountCoupons/DiscountCoupons';
import { usePlayerProgression } from '../../../hooks/usePlayerProgression';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, cart, wishlist } = useSelector((state: RootState) => state.user);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'coupons'>('profile');
  const { playerStats } = usePlayerProgression();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(PATHS.showcase);
  };

  if (!user) {
    return (
      <div className={classes.container}>
        <div className={classes.error}>
          <h2>Ошибка</h2>
          <p>Пользователь не найден. Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    );
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.title}>Личный кабинет</h1>
        <button className={classes.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className={classes.userInfo}>
        <div className={classes.avatar}>
          <span className={classes.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className={classes.userDetails}>
          <h2 className={classes.userName}>{user.name}</h2>
          <p className={classes.userEmail}>{user.email}</p>
          {user.phone && <p className={classes.userPhone}>{user.phone}</p>}
          {user.address && <p className={classes.userAddress}>{user.address}</p>}
        </div>
        <div className={classes.gameStats}>
          <div className={classes.statItem}>
            <span className={classes.statLabel}>Уровень:</span>
            <span className={classes.statValue}>{playerStats.level}</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statLabel}>Опыт:</span>
            <span className={classes.statValue}>{playerStats.experience}/{playerStats.maxExperience}</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statLabel}>💰 Монеты:</span>
            <span className={classes.statValue}>{playerStats.coins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={classes.tabs}>
        <button
          className={`${classes.tab} ${activeTab === 'profile' ? classes.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button
          className={`${classes.tab} ${activeTab === 'orders' ? classes.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы ({cart.length})
        </button>
        <button
          className={`${classes.tab} ${activeTab === 'wishlist' ? classes.active : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Избранное ({wishlist.length})
        </button>
        <button
          className={`${classes.tab} ${activeTab === 'coupons' ? classes.active : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎫 Магазин купонов
        </button>
      </div>

      <div className={classes.content}>
        {activeTab === 'profile' && (
          <div className={classes.tabContent}>
            <h3>Информация о профиле</h3>
            <div className={classes.profileInfo}>
              <div className={classes.infoItem}>
                <label>Имя:</label>
                <span>{user.name}</span>
              </div>
              <div className={classes.infoItem}>
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className={classes.infoItem}>
                  <label>Телефон:</label>
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className={classes.infoItem}>
                  <label>Адрес:</label>
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={classes.tabContent}>
            <h3>Корзина</h3>
            {cart.length === 0 ? (
              <p className={classes.emptyMessage}>Корзина пуста</p>
            ) : (
              <div className={classes.cartSummary}>
                <div className={classes.cartStats}>
                  <p>Товаров в корзине: <strong>{totalCartItems}</strong></p>
                  <p>Общая сумма: <strong>{totalCartPrice.toFixed(2)} ₽</strong></p>
                </div>
                <div className={classes.cartItems}>
                  {cart.map((item) => (
                    <div key={item.productId} className={classes.cartItem}>
                      <div className={classes.itemInfo}>
                        <h4>{item.name}</h4>
                        <p>Цена: {item.price} ₽</p>
                        <p>Количество: {item.quantity}</p>
                        <p>Сумма: {(item.price * item.quantity).toFixed(2)} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className={classes.tabContent}>
            <h3>Избранное</h3>
            {wishlist.length === 0 ? (
              <p className={classes.emptyMessage}>Список избранного пуст</p>
            ) : (
              <div className={classes.wishlistItems}>
                <p>Количество товаров в избранном: <strong>{wishlist.length}</strong></p>
                <div className={classes.wishlistList}>
                  {wishlist.map((productId) => (
                    <div key={productId} className={classes.wishlistItem}>
                      <span>Товар ID: {productId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className={classes.tabContent}>
            <DiscountCoupons />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

