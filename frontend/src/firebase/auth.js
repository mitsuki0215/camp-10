import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './config';

// Googleログイン
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// メール/パスワードでサインアップ
export const signUpWithEmail = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // プロフィールを更新
    await updateProfile(user, { displayName: name });
    
    // メール認証を送信
    await sendEmailVerification(user);
    
    return user;
  } catch (error) {
    throw error;
  }
};

// メール/パスワードでサインイン
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// ログアウト
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};