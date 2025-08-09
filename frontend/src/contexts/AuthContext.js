import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../firebase/auth';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Firebase認証成功時にSupabaseにユーザー情報を同期（ログは1回だけ）
          console.log('Firebase認証成功、Supabaseと同期中...');
          const supabaseUserData = await userService.syncUserWithSupabase(firebaseUser);
          setSupabaseUser(supabaseUserData);
          
          console.log('Supabase同期完了:', supabaseUserData);
        } else {
          // ログアウト時
          setSupabaseUser(null);
        }
      } catch (error) {
        console.error('Auth context error:', error);
        // エラーが発生してもFirebase認証は継続
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []); // 依存配列を空にして無限ループを防止

  const value = {
    user, // Firebase user
    supabaseUser, // Supabase user data
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};