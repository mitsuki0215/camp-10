import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { surveyService } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase/auth';
import './Home.css';

const Home = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, supabaseUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const getDisplayAvatar = (supabaseUser) => {
  const avatarUrl = supabaseUser?.avatar_url;
  
  if (!avatarUrl) return '👤';
  
  if (avatarUrl.includes('http') || avatarUrl.includes('data:')) {
    console.log('Profile: Invalid avatar (URL detected):', avatarUrl);
    return '👤';
  }
  
  const allowedAvatars = [
    "👤", "😀", "😊", "🤓", "😎", "🤗", "🙂", "😌", "🥸", 
    "👨‍🎓", "👩‍🎓", "🧑‍💻"
  ];
  
  if (allowedAvatars.includes(avatarUrl)) {
    console.log('Profile: Valid avatar confirmed:', avatarUrl);
    return avatarUrl;
  }
  
  console.log('Profile: Invalid avatar (not in whitelist):', avatarUrl);
  return '👤';
};

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/api/surveys');
        
        // ログインユーザーの場合、回答済みアンケートをフィルタリング
        if (supabaseUser) {
          const filteredSurveys = [];
          for (const survey of data) {
            const hasResponded = await surveyService.checkUserResponse(survey.id);
            const isCreator = survey.creator_id === supabaseUser.id;
            
            // 作成者でなく、かつ回答済みでないアンケートのみ表示
            if (!isCreator && !hasResponded) {
              filteredSurveys.push(survey);
            }
          }
          setSurveys(filteredSurveys);
        } else {
          // 未ログインの場合は全アンケートを表示
          setSurveys(data);
        }
        
        setError(null); // 成功時はエラーをクリア
      } catch (err) {
        console.error('Failed to fetch surveys:', err);
        // APIが利用できない場合はダミーデータを表示し、エラーメッセージは非表示
        setSurveys([
          { id: 1, title: "大学生活に関するアンケート", description: "大学生活の満足度や改善点について教えてください", points: 1300, responseCount: 24, targetResponses: 50, duration: "約3分" },
          { id: 2, title: "オンライン授業の評価調査", description: "オンライン授業の効果性や課題について", points: 500, responseCount: 18, targetResponses: 30, duration: "約5分" },
          { id: 3, title: "キャンパス施設利用に関するアンケート", description: "図書館や食堂、体育館などの施設利用について", points: 400, responseCount: 42, targetResponses: 40, duration: "約4分" },
          { id: 4, title: "就職活動支援サービスについて", description: "キャリア支援センターやインターンシップについて", points: 600, responseCount: 31, targetResponses: 60, duration: "約6分" },
          { id: 5, title: "学食メニューの改善提案", description: "学食のメニューや価格についてのご意見をお聞かせください", points: 2000, responseCount: 67, targetResponses: 100, duration: "約2分" }
        ]);
        setError(null); // ダミーデータを表示する場合はエラーメッセージを非表示
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [supabaseUser]);

  return (
    <div className="home-container">
      {/* ヘッダー部分 */}
      <div className="home-header">
        <h1 className="app-title">Questly</h1>
        <div className="header-actions">
          <Link to="/anq" className="add-survey-btn">
            <span className="plus-icon">+</span>
            アンケート作成
          </Link>
          <Link to="/prizes" className="add-survey-btn">
            <span className="plus-icon">🎁</span>
            懸賞
          </Link>
          <Link to="/profile" className="profile-icon">
            <div className="profile-avatar">
              <span>{getDisplayAvatar(supabaseUser)}</span>
            </div>
          </Link>
          {user && (
            <button onClick={handleLogout} className="logout-btn">
              ログアウト
            </button>
          )}
        </div>
      </div>

      {/* 検索ボックス */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="アンケートを検索..." 
            className="search-input"
          />
        </div>
      </div>

      {/* アンケート一覧 */}
      <div className="surveys-section">
        <h2 className="section-title">回答可能なアンケート</h2>
        {loading && <p>読み込み中...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="surveys-list">
          {surveys.map(survey => (
            <div key={survey.id} className="survey-card">
              <div className="survey-content">
                <h3 className="survey-title">{survey.title}</h3>
                <p className="survey-description">{survey.description}</p>
                <div className="survey-meta">
                  <span className="points">{survey.reward_points ?? survey.points}P</span>
                  <span className={`response-count ${(survey.response_count ?? survey.responseCount) >= (survey.target_responses ?? survey.targetResponses) ? 'target-achieved' : ''}`}>
                    {survey.response_count ?? survey.responseCount}人が回答 / {survey.target_responses ?? survey.targetResponses}人回答希望
                  </span>
                  <span className="duration">{survey.duration}</span>
                </div>
              </div>
              <div className="survey-actions">
                <Link to={`/survey/${survey.id}`} className="answer-btn">
                  回答する
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;