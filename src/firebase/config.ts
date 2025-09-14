import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Конфигурация Firebase для вашей базы данных
const firebaseConfig = {
  apiKey: "AIzaSyDvK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K", // Реальный API ключ нужен для работы
  authDomain: "eccomer-2d8d2.firebaseapp.com",
  databaseURL: "https://eccomer-2d8d2-default-rtdb.firebaseio.com/",
  projectId: "eccomer-2d8d2",
  storageBucket: "eccomer-2d8d2.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Получаем экземпляр базы данных
export const database = getDatabase(app);

export default app;

