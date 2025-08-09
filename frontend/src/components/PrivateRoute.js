import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>認証状態を確認中...</div>;
  }
  
  return user ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;