import React from 'react';
import './Home.css';

const Home = () => {
  // ダミーデータ - アンケート一覧
  const surveys = [
    {
      id: 1,
      title: "大学生活に関するアンケート",
      description: "大学生活の満足度や改善点について教えてください",
      responseCount: 24,
      duration: "約3分"
    },
    {
      id: 2,
      title: "オンライン授業の評価調査",
      description: "オンライン授業の効果性や課題について",
      responseCount: 18,
      duration: "約5分"
    },
    {
      id: 3,
      title: "キャンパス施設利用に関するアンケート",
      description: "図書館や食堂、体育館などの施設利用について",
      responseCount: 42,
      duration: "約4分"
    },
    {
      id: 4,
      title: "就職活動支援サービスについて",
      description: "キャリア支援センターやインターンシップについて",
      responseCount: 31,
      duration: "約6分"
    },
    {
      id: 5,
      title: "学食メニューの改善提案",
      description: "学食のメニューや価格についてのご意見をお聞かせください",
      responseCount: 67,
      duration: "約2分"
    }
  ];

  return (
    <div className="home-container">
      {/* ヘッダー部分 */}
      <div className="home-header">
        <h1 className="app-title">Questly</h1>
        <div className="header-actions">
          <button className="add-survey-btn">
            <span className="plus-icon">+</span>
            アンケート作成
          </button>
          <div className="profile-icon">
            <div className="profile-avatar">
              <span>👤</span>
            </div>
          </div>
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
        <div className="surveys-list">
          {surveys.map(survey => (
            <div key={survey.id} className="survey-card">
              <div className="survey-content">
                <h3 className="survey-title">{survey.title}</h3>
                <p className="survey-description">{survey.description}</p>
                <div className="survey-meta">
                  <span className="response-count">{survey.responseCount}人が回答</span>
                  <span className="duration">{survey.duration}</span>
                </div>
              </div>
              <div className="survey-actions">
                <button className="answer-btn">回答する</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
