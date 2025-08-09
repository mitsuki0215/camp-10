import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { apiClient } from '../utils/api';
import './Anq.css';

const defaultQuestion = () => ({
  id: uuidv4(),
  text: "質問内容を入力",
  type: "short", // 'short' | 'paragraph' | 'radio' | 'checkbox'
  options: ["選択肢1", "選択肢2"],
  required: false,
});

const Anq = () => {
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // 質問を追加
  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  // 質問を削除
  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // 質問の内容を更新
  const updateQuestion = (id, newData) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...newData } : q)));
  };

  // 選択肢の内容を更新
  const updateOption = (id, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // 選択肢を追加
  const addOption = (id) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, options: [...q.options, `選択肢${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  // 選択肢を削除
  const deleteOption = (id, index) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = q.options.filter((_, i) => i !== index);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // アンケート投稿処理（仮実装）
  const handleSubmit = () => {
    alert('アンケートが投稿されました！');
    console.log('投稿データ:', questions);
  };

  // アンケートを保存
  const saveSurvey = async () => {
    if (!title.trim()) {
      alert('アンケートのタイトルを入力してください');
      return;
    }

    try {
      setSaving(true);
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options,
          required: q.required
        }))
      };

      await apiClient.post('/api/surveys', surveyData);
      alert('アンケートが保存されました！');

      // フォームをリセット
      setTitle('');
      setDescription('');
      setQuestions([defaultQuestion()]);
    } catch (error) {
      console.error('Failed to save survey:', error);
      alert('アンケートの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="anq-container">
      <h1 className="anq-title">アンケート作成</h1>

      {/* アンケート基本情報 */}
      <div className="survey-info-section">
        <div className="input-group">
          <label htmlFor="survey-title">アンケートタイトル *</label>
          <input
            id="survey-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="アンケートのタイトルを入力してください"
            className="survey-title-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="survey-description">説明</label>
          <textarea
            id="survey-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="アンケートの説明を入力してください（任意）"
            className="survey-description-input"
            rows="3"
          />
        </div>
      </div>

      {questions.map(q => (
        <div key={q.id} className="question-card">
          <div className="question-header">
            <input
              className="question-input"
              value={q.text}
              onChange={e => updateQuestion(q.id, { text: e.target.value })}
              placeholder="質問内容を入力"
            />
            <button
              className="delete-question-btn"
              onClick={() => deleteQuestion(q.id)}
              aria-label="質問を削除"
            >
              削除
            </button>
          </div>

          <div className="question-controls">
            <select
              className="question-select"
              value={q.type}
              onChange={e => updateQuestion(q.id, { type: e.target.value })}
            >
              <option value="short">短文</option>
              <option value="paragraph">段落</option>
              <option value="radio">ラジオ</option>
              <option value="checkbox">チェックボックス</option>
            </select>
            <label className="required-label">
              <input
                type="checkbox"
                checked={q.required}
                onChange={e => updateQuestion(q.id, { required: e.target.checked })}
              />
              <span>必須</span>
            </label>
          </div>

          {(q.type === 'radio' || q.type === 'checkbox') && (
            <div className="options-list">
              {q.options.map((opt, index) => (
                <div key={index} className="option-item">
                  <input
                    className="option-input"
                    value={opt}
                    onChange={e => updateOption(q.id, index, e.target.value)}
                  />
                  <button
                    className="delete-option-btn"
                    onClick={() => deleteOption(q.id, index)}
                    aria-label="選択肢を削除"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="add-option-btn"
                onClick={() => addOption(q.id)}
              >
                ＋ 選択肢を追加
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        className="add-question-main-btn"
        onClick={addQuestion}
      >
        ＋ 質問を追加
      </button>

      {/* アクションボタン */}
      <div className="action-buttons">
        <Link to="/" className="cancel-btn">
          キャンセル
        </Link>
        <button className="submit-btn" onClick={handleSubmit}>
          アンケート投稿
        </button>
      </div>

      {/* 元の保存ボタン（コメントアウト済み）
      <div className="survey-actions">
        <button
          className="add-question-main-btn"
          onClick={addQuestion}
        >
          ＋ 質問を追加
        </button>
        <button
          className="save-survey-btn"
          onClick={saveSurvey}
          disabled={saving}
        >
          {saving ? '保存中...' : 'アンケートを保存'}
        </button>
      </div>
      */}
    </div>
  );
};

export default Anq;
