import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #e0e7ff 100%)',
        fontFamily: "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif"
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(107, 70, 193, 0.15)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>⏳</div>
          <div style={{
            color: '#64748b',
            fontSize: '1rem'
          }}>認証状態を確認中...</div>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/welcome" replace />;
};

export default PrivateRoute;