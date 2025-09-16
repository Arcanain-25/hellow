import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ProgressionService } from '../supabase/services/progressionService';

interface PlayerStats {
  level: number;
  experience: number;
  maxExperience: number;
  coins: number;
}

interface UsePlayerProgressionReturn {
  playerStats: PlayerStats;
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
  resetProgress: () => void;
  isLoading: boolean;
}

const INITIAL_STATS: PlayerStats = {
  level: 1,
  experience: 0,
  maxExperience: 1000,
  coins: 0
};

const XP_GAIN_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
const XP_GAIN_AMOUNT = 100;
const COINS_PER_LEVEL = 5000;

// Функция для расчета максимального опыта для уровня
const calculateMaxExperience = (level: number): number => {
  return 1000 + (level - 1) * 500;
};

// Функция для загрузки данных из localStorage (fallback)
const loadProgressionDataFromLocal = (): PlayerStats => {
  try {
    const saved = localStorage.getItem('playerProgression');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        level: parsed.level || INITIAL_STATS.level,
        experience: parsed.experience || INITIAL_STATS.experience,
        maxExperience: parsed.maxExperience || calculateMaxExperience(parsed.level || INITIAL_STATS.level),
        coins: parsed.coins || INITIAL_STATS.coins
      };
    }
  } catch (error) {
    console.error('Error loading progression data from localStorage:', error);
  }
  return INITIAL_STATS;
};

// Функция для сохранения данных в localStorage (fallback)
const saveProgressionDataToLocal = (stats: PlayerStats): void => {
  try {
    localStorage.setItem('playerProgression', JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving progression data to localStorage:', error);
  }
};

export const usePlayerProgression = (): UsePlayerProgressionReturn => {
  const { user } = useSelector((state: RootState) => state.user);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastXpGain, setLastXpGain] = useState<Date | null>(null);

  // Загрузка данных прогрессии при входе пользователя
  useEffect(() => {
    const loadUserProgression = async () => {
      if (!user?.id) {
        // Если пользователь не авторизован, используем localStorage
        setPlayerStats(loadProgressionDataFromLocal());
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let progression = await ProgressionService.getUserProgression(user.id);
        
        if (!progression) {
          // Создаем начальную прогрессию для нового пользователя
          progression = await ProgressionService.initializeUserProgression(user.id);
        }

        if (progression) {
          setPlayerStats({
            level: progression.level,
            experience: progression.experience,
            maxExperience: progression.max_experience,
            coins: progression.coins
          });
          setLastXpGain(new Date(progression.last_xp_gain));
        } else {
          // Fallback к localStorage если Supabase недоступен
          setPlayerStats(loadProgressionDataFromLocal());
        }
      } catch (error) {
        console.error('Error loading user progression:', error);
        // Fallback к localStorage при ошибке
        setPlayerStats(loadProgressionDataFromLocal());
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProgression();
  }, [user?.id]);

  // Сохранение в localStorage для неавторизованных пользователей
  useEffect(() => {
    if (!user?.id) {
      saveProgressionDataToLocal(playerStats);
    }
  }, [playerStats, user?.id]);

  // Автоматическое получение опыта каждые 2 минуты
  useEffect(() => {
    const checkAndGainXP = async () => {
      if (!lastXpGain) return;
      
      const now = new Date();
      const timeDiff = now.getTime() - lastXpGain.getTime();
      
      if (timeDiff >= XP_GAIN_INTERVAL) {
        await addExperience(XP_GAIN_AMOUNT);
        setLastXpGain(now);
      }
    };

    const interval = setInterval(checkAndGainXP, 60000); // Проверяем каждую минуту
    
    // Также проверяем сразу при загрузке
    if (lastXpGain) {
      checkAndGainXP();
    }

    return () => clearInterval(interval);
  }, [lastXpGain]);

  const addExperience = useCallback(async (amount: number) => {
    if (user?.id) {
      try {
        // Обновляем опыт в Supabase
        const updatedProgression = await ProgressionService.updateUserExperience(user.id, amount);
        
        if (updatedProgression) {
          const oldLevel = playerStats.level;
          const newStats = {
            level: updatedProgression.level,
            experience: updatedProgression.experience,
            maxExperience: updatedProgression.max_experience,
            coins: updatedProgression.coins
          };
          
          setPlayerStats(newStats);
          
          // Проверяем повышение уровня
          if (newStats.experience >= newStats.maxExperience) {
            const levelUpResult = await ProgressionService.levelUpUser(user.id);
            
            if (levelUpResult && levelUpResult.success) {
              const leveledUpStats = {
                level: levelUpResult.new_level,
                experience: levelUpResult.remaining_experience,
                maxExperience: levelUpResult.new_max_experience,
                coins: levelUpResult.total_coins
              };
              
              setPlayerStats(leveledUpStats);
              
              // Показываем уведомление о повышении уровня
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('levelUp', { 
                  detail: { 
                    newLevel: levelUpResult.new_level, 
                    coinsEarned: levelUpResult.coins_earned,
                    totalCoins: levelUpResult.total_coins
                  } 
                });
                window.dispatchEvent(event);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating experience in Supabase:', error);
        // Fallback к локальному обновлению
        updateStatsLocally(amount, 0);
      }
    } else {
      // Локальное обновление для неавторизованных пользователей
      updateStatsLocally(amount, 0);
    }
  }, [user?.id, playerStats]);

  const addCoins = useCallback(async (amount: number) => {
    if (user?.id) {
      try {
        const updatedProgression = await ProgressionService.updateUserCoins(user.id, amount);
        
        if (updatedProgression) {
          setPlayerStats(prev => ({
            ...prev,
            coins: updatedProgression.coins
          }));
        }
      } catch (error) {
        console.error('Error updating coins in Supabase:', error);
        // Fallback к локальному обновлению
        updateStatsLocally(0, amount);
      }
    } else {
      // Локальное обновление для неавторизованных пользователей
      updateStatsLocally(0, amount);
    }
  }, [user?.id]);

  const updateStatsLocally = useCallback((expAmount: number, coinAmount: number) => {
    setPlayerStats(prev => {
      let newExp = prev.experience + expAmount;
      let newLevel = prev.level;
      let newCoins = prev.coins + coinAmount;
      let newMaxExp = prev.maxExperience;

      // Проверяем повышение уровня
      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newCoins += COINS_PER_LEVEL;
        newMaxExp = calculateMaxExperience(newLevel);
        
        // Показываем уведомление о повышении уровня
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('levelUp', { 
            detail: { 
              newLevel, 
              coinsEarned: COINS_PER_LEVEL,
              totalCoins: newCoins
            } 
          });
          window.dispatchEvent(event);
        }
      }

      return {
        ...prev,
        level: newLevel,
        experience: newExp,
        maxExperience: newMaxExp,
        coins: newCoins
      };
    });
  }, []);

  const resetProgress = useCallback(async () => {
    if (user?.id) {
      try {
        await ProgressionService.initializeUserProgression(user.id);
        setPlayerStats(INITIAL_STATS);
      } catch (error) {
        console.error('Error resetting progression in Supabase:', error);
      }
    }
    
    setPlayerStats(INITIAL_STATS);
    localStorage.removeItem('playerProgression');
  }, [user?.id]);

  return {
    playerStats,
    addExperience,
    addCoins,
    resetProgress,
    isLoading
  };
};
