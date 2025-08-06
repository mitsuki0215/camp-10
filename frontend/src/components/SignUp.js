import React, { useState } from 'react';
import { apiClient } from '../utils/api';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    grade: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/auth/register', formData);
      setMessage(`
        ✅ 登録申請完了！
        
        ${formData.email} 宛に認証メールを送信しました。
        
        メール内のリンクをクリックして、アカウント作成を完了してください。
        クリックすると自動的にログインされ、サービスをご利用いただけます。
        
        ※ メールが届かない場合は迷惑メールフォルダをご確認ください。
      `);
      setFormData({ email: '', name: '', grade: '', password: '' });
    } catch (error) {
      setMessage(`エラー: ${error.response?.data?.detail || error.message}`);
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
          <label>学年:</label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
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
          {loading ? '登録中...' : '登録'}
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