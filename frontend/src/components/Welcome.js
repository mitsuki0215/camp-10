import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // ユーザーがログイン済みの場合はホームに遷移
    if (user) {
      navigate('/', { replace: true });
      return;
    }

    // 初回訪問チェック
    // 直接サインインページへ遷移
    navigate('/signin', { replace: true });
  }, [user, loading, navigate]);

  // ローディング中の表示
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #6b46c1, #a855f7)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 1rem',
          animation: 'spin 2s linear infinite'
        }}>
          🎓
        </div>
        <h2 style={{ 
          color: '#1e293b', 
          margin: '0 0 0.5rem 0',
          fontSize: '1.5rem',
          fontWeight: '700'
        }}>
          Questly
        </h2>
        <p style={{ 
          color: '#64748b', 
          margin: 0,
          fontSize: '1rem'
        }}>
          読み込み中...
        </p>
      </div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Welcome;
