import React, { useState, useEffect } from 'react';
import classes from './GameHUD.module.css';

interface GameHUDProps {
  playerStats?: {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    experience: number;
    maxExperience: number;
    level: number;
  };
  resources?: {
    gold: number;
    gems: number;
    items: number;
  };
  quests?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  notifications?: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

const GameHUD: React.FC<GameHUDProps> = ({
  playerStats = {
    health: 85,
    maxHealth: 100,
    mana: 60,
    maxMana: 100,
    experience: 750,
    maxExperience: 1000,
    level: 12
  },
  resources = {
    gold: 2547,
    gems: 45,
    items: 23
  },
  quests = [
    { id: '1', title: 'Найти редкий товар', completed: false },
    { id: '2', title: 'Пополнить инвентарь', completed: false },
    { id: '3', title: 'Изучить каталог', completed: true }
  ],
  notifications = []
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSkill, setActiveSkill] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const healthPercentage = (playerStats.health / playerStats.maxHealth) * 100;
  const manaPercentage = (playerStats.mana / playerStats.maxMana) * 100;
  const expPercentage = (playerStats.experience / playerStats.maxExperience) * 100;

  const skills = ['⚔️', '🛡️', '🏹', '✨', '🔥', '❄️'];

  return (
    <div className={classes.gameHUD}>
      {/* Правая верхняя панель - только опыт */}
      <div className={classes.topRightPanel}>
        <div className={classes.statBar}>
          <div 
            className={`${classes.statBarFill} ${classes.expBar}`}
            style={{ width: `${expPercentage}%` }}
          />
          <div className={classes.statBarText}>
            LVL {playerStats.level} - EXP: {playerStats.experience}/{playerStats.maxExperience}
          </div>
        </div>
      </div>


      {/* Нижняя левая панель - ресурсы */}
      <div className={classes.bottomLeftPanel}>
        <div className={classes.resourceCounter}>
          <div className={classes.coinIcon} />
          <span className={classes.resourceText}>{resources.gold.toLocaleString()}</span>
        </div>
        
        <div className={classes.resourceCounter}>
          <span style={{ fontSize: '16px' }}>💎</span>
          <span className={classes.resourceText}>{resources.gems}</span>
        </div>
        
        <div className={classes.resourceCounter}>
          <span style={{ fontSize: '16px' }}>🎒</span>
          <span className={classes.resourceText}>{resources.items}</span>
        </div>

        <div className={classes.resourceCounter}>
          <span style={{ fontSize: '14px' }}>🕐</span>
          <span className={classes.resourceText}>
            {currentTime.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>


      {/* Панель навыков */}
      <div className={classes.skillPanel}>
        {skills.map((skill, index) => (
          <div
            key={index}
            className={`${classes.skillSlot} ${activeSkill === index ? classes.active : ''}`}
            onClick={() => setActiveSkill(index)}
            title={`Навык ${index + 1}`}
          >
            {skill}
          </div>
        ))}
      </div>

      {/* Центральные уведомления */}
      {notifications.length > 0 && (
        <div className={classes.centerPanel}>
          {notifications.map(notification => (
            <div key={notification.id} className={classes.notification}>
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHUD;
