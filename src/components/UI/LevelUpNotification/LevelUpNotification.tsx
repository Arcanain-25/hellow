import React, { useState, useEffect } from 'react';
import classes from './LevelUpNotification.module.css';

interface LevelUpEvent {
  newLevel: number;
  coinsEarned: number;
  totalCoins: number;
}

const LevelUpNotification: React.FC = () => {
  const [notification, setNotification] = useState<LevelUpEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent<LevelUpEvent>) => {
      setNotification(event.detail);
      setIsVisible(true);

      // Автоматически скрыть уведомление через 5 секунд
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setNotification(null), 300); // Дождаться окончания анимации
      }, 5000);
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className={`${classes.notification} ${isVisible ? classes.visible : ''}`}>
      <div className={classes.content}>
        <div className={classes.title}>🎉 ПОЗДРАВЛЯЕМ! 🎉</div>
        <div className={classes.levelText}>
          Уровень повышен до <span className={classes.level}>{notification.newLevel}</span>!
        </div>
        <div className={classes.reward}>
          <div className={classes.coinIcon}>💰</div>
          <span className={classes.coinText}>+{notification.coinsEarned.toLocaleString()} монет</span>
        </div>
        <div className={classes.totalCoins}>
          Всего монет: {notification.totalCoins.toLocaleString()}
        </div>
        <div className={classes.privileges}>
          🌟 Новые привилегии разблокированы! 🌟
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotification;
