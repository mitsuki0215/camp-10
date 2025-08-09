import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user: firebaseUser, supabaseUser } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // ユーザーの統計情報を取得
        const stats = await userService.getUserStats();
        setUserStats(stats);

        // 自分が作成したアンケートを取得
        const surveysData = await surveyService.getUserSurveys();
        setMyPosts(surveysData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // フォールバック: ダミーデータを使用
        setMyPosts([
          {
            id: 1,
            title: "大学生のアルバイト事情について",
            description: "大学生のアルバイトの実態調査",
            responseCount: 34,
            createdAt: "2024-07-15",
            status: "公開中"
          },
          {
            id: 2,
            title: "オンライン授業の満足度調査",
            description: "オンライン授業に対する学生の意見",
            responseCount: 28,
            createdAt: "2024-07-10",
            status: "公開中"
          },
          {
            id: 3,
            title: "学食利用頻度アンケート",
            description: "学食の利用実態について",
            responseCount: 45,
            createdAt: "2024-07-05",
            status: "終了"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ユーザー情報のフォールバック
  const displayUser = {
    name: supabaseUser?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'ユーザー',
    email: supabaseUser?.email || firebaseUser?.email || '',
    rank: userStats?.rank || supabaseUser?.rank || 'Bronze',
    experience: userStats?.experience || supabaseUser?.experience || 0,
    experience_to_next: userStats?.experience_to_next || supabaseUser?.experience_to_next || 100,
    points: userStats?.points || supabaseUser?.points || 0,
    grade: supabaseUser?.grade || '',
    created_at: supabaseUser?.created_at || new Date().toISOString(),
    created_surveys: userStats?.created_surveys || 0,
    active_surveys: userStats?.active_surveys || 0,
    responses_given: userStats?.responses_given || 0
  };

  // 経験値の進捗率を計算
  const experienceProgress = (displayUser.experience / displayUser.experience_to_next) * 100;

  // ランクに応じた色を取得
  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#C0C0C0';
    }
  };

  return (
    <div className="profile-container">
      {/* ヘッダー部分 */}
      <div className="profile-header">
        <Link to="/" className="back-button">
          ← ホームに戻る
        </Link>
        <h1 className="page-title">プロフィール</h1>
        <Link to="/profile/edit" className="edit-profile-btn">
          ✏️ プロフィール編集
        </Link>
      </div>

      {/* ユーザー情報カード */}
      <div className="user-info-card">
        <div className="user-avatar-large">
          <span>👤</span>
        </div>
        <div className="user-details">
          <h2 className="user-name">
            {displayUser.name} 
            <span className="grade-value">{displayUser.grade}</span>
          </h2>
          <p className="user-email">{displayUser.email}</p>
          <p className="join-date">
            登録日: {new Date(displayUser.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>

      {/* ランク・経験値セクション */}
      <div className="rank-section">
        <div className="rank-info">
          <div className="rank-badge" style={{ borderColor: getRankColor(displayUser.rank) }}>
            <span className="rank-icon">🏆</span>
            <span className="rank-name" style={{ color: getRankColor(displayUser.rank) }}>
              {displayUser.rank}
            </span>
          </div>
          <div className="experience-info">
            <div className="experience-text">
              <span>経験値: {displayUser.experience} / {displayUser.experience_to_next} XP</span>
            </div>
            <div className="experience-bar">
              <div 
                className="experience-progress" 
                style={{ width: `${experienceProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ポイント情報 */}
      <div className="points-section">
        <div className="points-card">
          <div className="points-icon">💰</div>
          <div className="points-info">
            <h3>保有ポイント</h3>
            <p className="points-value">{displayUser.points} P</p>
            <p className="points-description">アンケート作成に使用できます</p>
          </div>
        </div>
      </div>

      {/* 作成したアンケート一覧 */}
      <div className="my-surveys-section">
        <h2 className="section-title">作成したアンケート</h2>
        {loading && <p>読み込み中...</p>}
        <div className="my-surveys-list">
          {myPosts.map(post => (
            <div key={post.id} className="my-survey-card">
              <div className="survey-status">
                <span className={`status-badge ${post.status === '公開中' ? 'active' : 'inactive'}`}>
                  {post.status}
                </span>
                <span className="created-date">{post.createdAt}</span>
              </div>
              <div className="survey-content">
                <h3 className="survey-title">{post.title}</h3>
                <p className="survey-description">{post.description}</p>
                <div className="survey-stats">
                  <span className="response-count">
                    👥 {post.responseCount}人が回答
                  </span>
                </div>
              </div>
              <div className="survey-actions">
                <button className="view-results-btn">結果を見る</button>
                <button className="publish-toggle-btn">
                  {post.status === '公開中' ? '公開終了' : '公開開始'}
                </button>
                <button className="delete-survey-btn">削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
