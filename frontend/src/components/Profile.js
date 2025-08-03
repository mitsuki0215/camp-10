import React from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  // ダミーデータ - ユーザー情報
  const user = {
    name: "田中 太郎",
    grade: "B3",
    rank: "Silver",
    experience: 1250,
    experienceToNext: 1500,
    points: 340
  };

  // ダミーデータ - 自分が作成したアンケート
  const myPosts = [
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
  ];

  // 経験値の進捗率を計算
  const experienceProgress = (user.experience / user.experienceToNext) * 100;

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
      </div>

      {/* ユーザー情報カード */}
      <div className="user-info-card">
        <div className="user-avatar-large">
          <span>👤</span>
        </div>
        <div className="user-details">
          <h2 className="user-name">{user.name}</h2>
          <div className="user-grade">
            <span className="grade-label">学年:</span>
            <span className="grade-value">{user.grade}</span>
          </div>
        </div>
      </div>

      {/* ランク・経験値セクション */}
      <div className="rank-section">
        <div className="rank-info">
          <div className="rank-badge" style={{ borderColor: getRankColor(user.rank) }}>
            <span className="rank-icon">🏆</span>
            <span className="rank-name" style={{ color: getRankColor(user.rank) }}>
              {user.rank}
            </span>
          </div>
          <div className="experience-info">
            <div className="experience-text">
              <span>経験値: {user.experience} / {user.experienceToNext} XP</span>
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
            <p className="points-value">{user.points} P</p>
            <p className="points-description">アンケート作成に使用できます</p>
          </div>
        </div>
      </div>

      {/* 作成したアンケート一覧 */}
      <div className="my-surveys-section">
        <h2 className="section-title">作成したアンケート</h2>
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
                <button className="edit-survey-btn">編集</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
