import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // ログイン完了後すぐにホームへ
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
            <span className="footer-link">利用規約</span>と
            <span className="footer-link">プライバシーポリシー</span>に
            同意したことになります。
          </p>
        </div>
      </div>
    </div>
  );
}