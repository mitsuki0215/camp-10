import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { refreshSupabaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // 編集用の状態管理
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
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

  // アバター表示のヘルパー関数
  const getValidAvatar = (avatarUrl) => {
    if (!avatarUrl) return "👤";
    
    // URLっぽい文字列（http, https, データURLなど）は除外
    if (avatarUrl.includes('http') || avatarUrl.includes('data:')) {
      console.log('ProfileEdit: Invalid avatar (URL detected):', avatarUrl);
      return "👤";
    }
    
    // 許可されたアバター絵文字のホワイトリスト
    const allowedAvatars = [
      "👤", "😀", "😊", "🤓", "😎", "🤗", "🙂", "😌", "🥸", 
      "👨‍🎓", "👩‍🎓", "🧑‍💻"
    ];
    
    if (allowedAvatars.includes(avatarUrl)) {
      console.log('ProfileEdit: Valid avatar confirmed:', avatarUrl);
      return avatarUrl; // 許可された絵文字の場合はそのまま使用
    }
    
    console.log('ProfileEdit: Invalid avatar (not in whitelist):', avatarUrl);
    return "👤"; // デフォルトアイコンを返す
  };

  // 現在のユーザー情報を取得
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/signin');
          return;
        }

        const data = await userService.getUserByFirebaseUid(user.uid);
        if (data) {
          setFormData({
            name: data.name || "",
            grade: data.grade || "B1",
            avatar: getValidAvatar(data.avatar_url)
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        alert('ユーザー情報の取得に失敗しました');
      }
    };

    loadUserData();
  }, [navigate]);

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

  // 保存ハンドラー
  const handleSave = async () => {
    if (loading) return;

    // バリデーション
    if (!formData.name.trim()) {
      alert('名前を入力してください');
      return;
    }

    // アバターが有効な絵文字かチェック
    const validAvatar = getValidAvatar(formData.avatar);

    setLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        grade: formData.grade,
        avatar_url: validAvatar
      };

      await userService.updateUserProfile(updateData);
      
      // AuthContextのユーザーデータを更新
      await refreshSupabaseUser();
      
      alert('プロフィールが保存されました！');
      navigate('/profile');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('プロフィールの保存に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      {/* ヘッダー部分 */}
      <div className="profile-edit-header">
        <Link to="/profile" className="profile-edit-back-button">
          ← プロフィールに戻る
        </Link>
        <h1 className="profile-edit-page-title">プロフィール編集</h1>
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '保存中...' : '💾 保存'}
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
          <button 
            className="save-main-btn" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
