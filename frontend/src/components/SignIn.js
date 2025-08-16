import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import './SignIn.css';

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      
      // Optional: Add additional scopes if needed
      // provider.addScope('email');
      // provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
      // ログイン完了後すぐにホームへ
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      
      // エラーメッセージを日本語で表示
      if (error.code === 'auth/unauthorized-domain') {
        setError('このドメインからのログインは許可されていません。管理者にお問い合わせください。');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('ログインがキャンセルされました。');
      } else if (error.code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされました。ブラウザの設定を確認してください。');
      } else {
        setError('ログインに失敗しました。しばらく後でお試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // デバッグ用：現在のオリジンを確認
    console.log('Current origin:', window.location.origin);
    
    // すでにログイン済みならホームへ
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="signin-container">
      <div className="signin-card">
        {/* アプリロゴ */}
        <div className="app-logo">
          <h1 className="logo-title">Questly</h1>
          <p className="logo-subtitle">学生向けアンケートサービス</p>
        </div>

        {/* サインインセクション */}
        <h2 className="signin-title">ログイン</h2>
        <p className="signin-description">
          Googleアカウントでログインして、<br />
          アンケートの作成・回答を始めましょう
        </p>

        {/* エラーメッセージ */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Googleログインボタン */}
        <button 
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <div className="google-icon"></div>
          {isLoading ? 'ログイン中...' : 'Googleアカウントでログイン'}
        </button>

        {/* フッター */}
        <div className="signin-footer">
          <p className="footer-text">
            ログインすることで、
            <Link to="/terms" className="footer-link">利用規約</Link>と
            <Link to="/privacy" className="footer-link">プライバシーポリシー</Link>に
            同意したことになります。
          </p>
        </div>
      </div>
    </div>
  );
}