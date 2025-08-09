import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../utils/api';

const EmailVerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('認証中...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage('❌ 認証トークンが見つかりません');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          // トークンを保存
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          
          setMessage(`✅ ${data.message}`);
          
          // 3秒後にホームページにリダイレクト
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else {
          setMessage(`❌ ${data.message}`);
        }
      } catch (error) {
        setMessage(`❌ 認証エラー: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>メール認証</h1>
      
      {loading ? (
        <div>
          <p>認証を処理中...</p>
          <div style={{ margin: '20px 0' }}>⏳</div>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          border: message.includes('✅') ? '2px solid #28a745' : '2px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da'
        }}>
          <div style={{ 
            fontSize: '48px', 
            margin: '20px 0' 
          }}>
            {message.includes('✅') ? '🎉' : '😕'}
          </div>
          
          <p style={{ 
            fontSize: '18px',
            whiteSpace: 'pre-line'
          }}>
            {message}
          </p>
          
          {message.includes('✅') && (
            <div style={{ marginTop: '20px' }}>
              <p>3秒後に自動的にホームページに移動します...</p>
              <button 
                onClick={() => navigate('/', { replace: true })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                今すぐホームに移動
              </button>
            </div>
          )}
          
          {!message.includes('✅') && (
            <div style={{ marginTop: '20px' }}>
              <a href="/signin">サインインページに戻る</a>
              <br />
              <a href="/verify-email" style={{ marginLeft: '10px' }}>手動認証ページ</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailVerificationSuccess;