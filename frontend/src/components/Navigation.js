import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
      <a href="/" style={{ marginRight: '1rem' }}>ホーム</a>
      {user ? (
        <>
          <a href="/anq" style={{ marginRight: '1rem' }}>アンケート作成</a>
          <a href="/profile" style={{ marginRight: '1rem' }}>プロフィール</a>
          <span style={{ marginRight: '1rem' }}>
            こんにちは、{user.displayName || user.email}さん
          </span>
          <button onClick={handleLogout}>ログアウト</button>
        </>
      ) : (
        <>
          <a href="/signin" style={{ marginRight: '1rem' }}>サインイン</a>
          <a href="/signup" style={{ marginRight: '1rem' }}>サインアップ</a>
        </>
      )}
    </nav>
  );
};

export default Navigation;