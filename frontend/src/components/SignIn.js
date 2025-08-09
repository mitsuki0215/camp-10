import React, { useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // ログイン完了後すぐにホームへ
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
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
    <div>
      <h2>Googleでログイン</h2>
      <button onClick={handleGoogleLogin}>Googleアカウントでログイン</button>
    </div>
  );
}