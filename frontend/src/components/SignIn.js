import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail } from '../firebase/auth';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      await signInWithGoogle();
      setMessage('Googleログイン成功！');
      
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
      await signInWithEmail(formData.email, formData.password);
      setMessage('ログイン成功！');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>サインイン</h1>
      
      {message && <p>{message}</p>}
      
      {/* Googleログインボタン */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleGoogleSignIn} 
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
          {loading ? 'Googleでログイン中...' : 'Googleでログイン'}
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
          {loading ? 'ログイン中...' : 'メールでログイン'}
        </button>
      </form>
      
      <p>
        アカウントをお持ちでないですか？{' '}
        <a href="/signup">サインアップ</a>
      </p>
    </div>
  );
};

export default SignIn;