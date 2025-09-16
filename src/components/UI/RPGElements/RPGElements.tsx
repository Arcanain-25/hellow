import React from 'react';
import classes from './RPGElements.module.css';

// Энергетические сферы для углов
export const EnergyOrbs: React.FC = () => (
  <>
    <div className={`${classes.energyOrb} ${classes['top-left']}`} />
    <div className={`${classes.energyOrb} ${classes['top-right']}`} />
    <div className={`${classes.energyOrb} ${classes['bottom-left']}`} />
    <div className={`${classes.energyOrb} ${classes['bottom-right']}`} />
  </>
);

// RPG заголовок с рунами
interface RPGTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const RPGTitle: React.FC<RPGTitleProps> = ({ children, className = '' }) => (
  <h1 className={`${classes.rpgTitle} ${className}`}>
    {children}
  </h1>
);

// Технологическая панель
interface TechPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const TechPanel: React.FC<TechPanelProps> = ({ children, className = '' }) => (
  <div className={`${classes.techPanel} ${className}`}>
    <EnergyOrbs />
    {children}
  </div>
);

// Статусный индикатор
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning';
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => (
  <div className={`${classes.statusIndicator} ${classes[status]}`}>
    <div className={`${classes.statusDot} ${classes[status]}`} />
    {label}
  </div>
);

// RPG прогресс бар
interface RPGProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export const RPGProgressBar: React.FC<RPGProgressBarProps> = ({ progress, className = '' }) => (
  <div className={`${classes.rpgProgressBar} ${className}`}>
    <div 
      className={classes.rpgProgressFill} 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// RPG кнопка действия
interface RPGActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const RPGActionButton: React.FC<RPGActionButtonProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false 
}) => (
  <button 
    className={`${classes.rpgActionButton} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Голографическая карточка
interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
}

export const HoloCard: React.FC<HoloCardProps> = ({ children, className = '' }) => (
  <div className={`${classes.holoCard} ${className}`}>
    {children}
  </div>
);

// Комплексный RPG контейнер
interface RPGContainerProps {
  title?: string;
  children: React.ReactNode;
  showOrbs?: boolean;
  className?: string;
}

export const RPGContainer: React.FC<RPGContainerProps> = ({ 
  title, 
  children, 
  showOrbs = true,
  className = '' 
}) => (
  <div className={`${classes.techPanel} ${className}`}>
    {showOrbs && <EnergyOrbs />}
    {title && <RPGTitle>{title}</RPGTitle>}
    {children}
  </div>
);

export default {
  EnergyOrbs,
  RPGTitle,
  TechPanel,
  StatusIndicator,
  RPGProgressBar,
  RPGActionButton,
  HoloCard,
  RPGContainer
};
