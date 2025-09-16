import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import classes from './DiscountCoupons.module.css';
import { usePlayerProgression } from '../../../hooks/usePlayerProgression';
import { ProgressionService } from '../../../supabase/services/progressionService';

interface Coupon {
  id: string;
  name: string;
  discount: number;
  cost: number;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: 'common_5',
    name: 'Скидка 5%',
    discount: 5,
    cost: 1000,
    description: 'Базовая скидка на любой товар',
    icon: '🎫',
    rarity: 'common'
  },
  {
    id: 'common_10',
    name: 'Скидка 10%',
    discount: 10,
    cost: 2500,
    description: 'Хорошая скидка для экономии',
    icon: '🎟️',
    rarity: 'common'
  },
  {
    id: 'rare_15',
    name: 'Скидка 15%',
    discount: 15,
    cost: 5000,
    description: 'Редкая скидка для умных покупок',
    icon: '🎭',
    rarity: 'rare'
  },
  {
    id: 'rare_20',
    name: 'Скидка 20%',
    discount: 20,
    cost: 8000,
    description: 'Отличная скидка для больших покупок',
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'epic_25',
    name: 'Скидка 25%',
    discount: 25,
    cost: 12000,
    description: 'Эпическая скидка для настоящих ценителей',
    icon: '💎',
    rarity: 'epic'
  },
  {
    id: 'legendary_30',
    name: 'Скидка 30%',
    discount: 30,
    cost: 20000,
    description: 'Легендарная скидка для избранных',
    icon: '👑',
    rarity: 'legendary'
  }
];

const DiscountCoupons: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { playerStats, addCoins } = usePlayerProgression();
  const [purchasedCoupons, setPurchasedCoupons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка купленных купонов при монтировании компонента
  useEffect(() => {
    const loadPurchasedCoupons = async () => {
      if (!user?.id) {
        // Для неавторизованных пользователей используем localStorage
        const saved = localStorage.getItem('purchasedCoupons');
        setPurchasedCoupons(saved ? JSON.parse(saved) : []);
        setIsLoading(false);
        return;
      }

      try {
        const coupons = await ProgressionService.getUserCoupons(user.id);
        const couponIds = coupons.map(coupon => coupon.coupon_id);
        setPurchasedCoupons(couponIds);
      } catch (error) {
        console.error('Error loading purchased coupons:', error);
        // Fallback к localStorage
        const saved = localStorage.getItem('purchasedCoupons');
        setPurchasedCoupons(saved ? JSON.parse(saved) : []);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchasedCoupons();
  }, [user?.id]);

  const handlePurchase = async (coupon: Coupon) => {
    if (playerStats.coins >= coupon.cost && !purchasedCoupons.includes(coupon.id)) {
      if (user?.id) {
        try {
          // Покупаем купон через Supabase
          const success = await ProgressionService.purchaseCoupon(
            user.id,
            coupon.id,
            coupon.name,
            coupon.discount,
            coupon.cost,
            coupon.rarity
          );

          if (success) {
            // Обновляем локальный список купленных купонов
            const newPurchased = [...purchasedCoupons, coupon.id];
            setPurchasedCoupons(newPurchased);
            
            // Показываем уведомление
            const event = new CustomEvent('couponPurchased', { 
              detail: { 
                coupon,
                remainingCoins: playerStats.coins - coupon.cost
              } 
            });
            window.dispatchEvent(event);
          } else {
            alert('Ошибка при покупке купона. Попробуйте еще раз.');
          }
        } catch (error) {
          console.error('Error purchasing coupon:', error);
          alert('Ошибка при покупке купона. Попробуйте еще раз.');
        }
      } else {
        // Для неавторизованных пользователей используем localStorage
        addCoins(-coupon.cost);
        
        const newPurchased = [...purchasedCoupons, coupon.id];
        setPurchasedCoupons(newPurchased);
        localStorage.setItem('purchasedCoupons', JSON.stringify(newPurchased));
        
        // Показываем уведомление
        const event = new CustomEvent('couponPurchased', { 
          detail: { 
            coupon,
            remainingCoins: playerStats.coins - coupon.cost
          } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'common': return classes.common;
      case 'rare': return classes.rare;
      case 'epic': return classes.epic;
      case 'legendary': return classes.legendary;
      default: return classes.common;
    }
  };

  return (
    <div className={classes.couponsContainer}>
      <div className={classes.header}>
        <h2 className={classes.title}>🛒 Магазин Купонов</h2>
        <div className={classes.playerCoins}>
          <span className={classes.coinIcon}>💰</span>
          <span className={classes.coinAmount}>{playerStats.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className={classes.couponsGrid}>
        {AVAILABLE_COUPONS.map(coupon => {
          const isPurchased = purchasedCoupons.includes(coupon.id);
          const canAfford = playerStats.coins >= coupon.cost;
          
          return (
            <div 
              key={coupon.id} 
              className={`${classes.couponCard} ${getRarityClass(coupon.rarity)} ${isPurchased ? classes.purchased : ''}`}
            >
              <div className={classes.couponIcon}>{coupon.icon}</div>
              <div className={classes.couponName}>{coupon.name}</div>
              <div className={classes.couponDescription}>{coupon.description}</div>
              
              <div className={classes.couponFooter}>
                <div className={classes.couponCost}>
                  <span className={classes.costIcon}>💰</span>
                  <span>{coupon.cost.toLocaleString()}</span>
                </div>
                
                <button
                  className={`${classes.purchaseButton} ${!canAfford || isPurchased ? classes.disabled : ''}`}
                  onClick={() => handlePurchase(coupon)}
                  disabled={!canAfford || isPurchased}
                >
                  {isPurchased ? '✅ Куплено' : canAfford ? 'Купить' : 'Недостаточно монет'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={classes.info}>
        <p>💡 Купоны можно использовать при оформлении заказа для получения скидки</p>
        <p>🎮 Зарабатывайте монеты, проводя время на сайте (+100 опыта каждые 2 минуты)</p>
        <p>🏆 За каждый новый уровень вы получаете +5000 монет!</p>
      </div>
    </div>
  );
};

export default DiscountCoupons;
