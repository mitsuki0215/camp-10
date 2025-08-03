import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProfileEdit.css';

const ProfileEdit = () => {
  // 編集用の状態管理
  const [formData, setFormData] = useState({
    name: "田中 太郎",
    grade: "B3",
    avatar: "👤"
  });

  // アバターアイコンの選択肢
  const avatarOptions = ["👤", "😀", "😊", "🤓", "😎", "🤗", "🙂", "😌", "🥸", "👨‍🎓", "👩‍🎓", "🧑‍💻"];

  // 学年の選択肢
  const gradeOptions = [
    "B1", "B2", "B3", "B4",
    "M1", "M2",
    "D1", "D2", "D3", "D4"
  ];

  // フォームの変更ハンドラー
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // アバター変更ハンドラー
  const handleAvatarChange = (avatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }));
  };

  // 保存ハンドラー（現在は仮実装）
  const handleSave = () => {
    alert('プロフィールが保存されました！');
    // 実際の実装では、APIに保存処理を送信
  };

  return (
    <div className="profile-edit-container">
      {/* ヘッダー部分 */}
      <div className="profile-edit-header">
        <Link to="/profile" className="back-button">
          ← プロフィールに戻る
        </Link>
        <h1 className="page-title">プロフィール編集</h1>
        <button className="save-btn" onClick={handleSave}>
          💾 保存
        </button>
      </div>

      {/* 編集フォーム */}
      <div className="edit-form-container">
        {/* アバター編集セクション */}
        <div className="edit-section">
          <h3 className="section-title">アイコン</h3>
          <div className="avatar-edit-section">
            <div className="current-avatar">
              <div className="avatar-preview">
                <span>{formData.avatar}</span>
              </div>
              <p>現在のアイコン</p>
            </div>
            <div className="avatar-options">
              <p className="options-title">アイコンを選択:</p>
              <div className="avatar-grid">
                {avatarOptions.map((avatar, index) => (
                  <button
                    key={index}
                    className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarChange(avatar)}
                  >
                    <span>{avatar}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 名前編集セクション */}
        <div className="edit-section">
          <h3 className="section-title">名前</h3>
          <div className="input-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="name-input"
              placeholder="名前を入力してください"
            />
          </div>
        </div>

        {/* 学年編集セクション */}
        <div className="edit-section">
          <h3 className="section-title">学年</h3>
          <div className="input-group">
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="grade-select"
            >
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* プレビューセクション */}
        <div className="preview-section">
          <h3 className="section-title">プレビュー</h3>
          <div className="profile-preview">
            <div className="preview-avatar">
              <span>{formData.avatar}</span>
            </div>
            <div className="preview-info">
              <h4 className="preview-name">
                {formData.name} 
                <span className="preview-grade">{formData.grade}</span>
              </h4>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="action-buttons">
          <Link to="/profile" className="cancel-btn">
            キャンセル
          </Link>
          <button className="save-main-btn" onClick={handleSave}>
            変更を保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
