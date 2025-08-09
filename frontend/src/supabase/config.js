import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Firebase AuthのJWTを使用する設定
    detectSessionInUrl: false,
    persistSession: false, // Firebase Authで認証管理するため無効
    autoRefreshToken: false,
  },
  // APIキーを使用してアクセス（開発時のみ）
  global: {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

export default supabase;