import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../../../store/store';
import { PATHS } from '../../../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу логина с сохранением текущего пути
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
