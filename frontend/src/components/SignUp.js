import React, { useState } from 'react';
import { signInWithGoogle, signUpWithEmail } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setMessage('');

    try {
      await signInWithGoogle();
      setMessage('Googleアカウントでの登録成功！');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await signUpWithEmail(formData.email, formData.password, formData.name);
      setMessage(`
        ✅ 登録完了！
        
        ${formData.email} 宛に認証メールを送信しました。
        
        メール内のリンクをクリックして、メールアドレスを確認してください。
        確認後、サービスをご利用いただけます。
        
        ※ メールが届かない場合は迷惑メールフォルダをご確認ください。
      `);
      setFormData({ email: '', name: '', password: '' });
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>サインアップ</h1>
      
      {message && (
        <div style={{ 
          whiteSpace: 'pre-line', 
          padding: '10px', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: message.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}
      
      {/* Googleサインアップボタン */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleGoogleSignUp} 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Googleで登録中...' : 'Googleで登録'}
        </button>
      </div>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <span>または</span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>メールアドレス:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label>名前:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label>パスワード:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : 'メールで登録'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <p>
          すでにアカウントをお持ちですか？{' '}
          <a href="/signin">サインイン</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;