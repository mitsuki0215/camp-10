import React from 'react';

const Navigation = () => {
  const isLoggedIn = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/signin';
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
      <a href="/" style={{ marginRight: '1rem' }}>ホーム</a>
      {isLoggedIn ? (
        <>
          <a href="/anq" style={{ marginRight: '1rem' }}>アンケート作成</a>
          <a href="/profile" style={{ marginRight: '1rem' }}>プロフィール</a>
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