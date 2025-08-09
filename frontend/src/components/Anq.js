import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { surveyService } from '../services/surveyService';
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
  const [deadline, setDeadline] = useState('');
  const [requiredPoints, setRequiredPoints] = useState(1000);
  const [targetResponses, setTargetResponses] = useState(50);
  const [estimatedTime, setEstimatedTime] = useState(5);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, newData) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...newData } : q)));
  };

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

  const addOption = (id) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, options: [...q.options, `選択肢${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const deleteOption = (id, index) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = q.options.filter((_, i) => i !== index);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // タイトル必須
    if (!title.trim()) {
      newErrors.title = 'アンケートのタイトルを入力してください';
    }

    // 締切日必須
    if (!deadline) {
      newErrors.deadline = '回答期限を設定してください';
    }

    // ポイントのバリデーション
    if (requiredPoints < 1000) {
      newErrors.requiredPoints = '最低1000ポイントが必要です';
    } else if (requiredPoints % 100 !== 0) {
      newErrors.requiredPoints = '100ポイント刻みで設定してください';
    }

    // 回答者数必須
    if (targetResponses < 1) {
      newErrors.targetResponses = '1人以上の回答者数を設定してください';
    }

    // 推定時間必須
    if (estimatedTime < 1) {
      newErrors.estimatedTime = '1分以上の回答時間を設定してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSurvey = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline,
        requiredPoints: requiredPoints,
        targetResponses: targetResponses,
        estimatedTime: estimatedTime,
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options,
          required: q.required
        }))
      };

      await surveyService.createSurvey(surveyData);
      alert('アンケートが保存されました！');

      // フォームリセット
      setTitle('');
      setDescription('');
      setDeadline('');
      setRequiredPoints(1000);
      setTargetResponses(50);
      setEstimatedTime(5);
      setQuestions([defaultQuestion()]);
      setErrors({});
    } catch (error) {
      console.error('Failed to save survey:', error);
      alert('アンケートの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="anq-container">
      <div className="anq-content">
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
            {errors.title && <span className="error-message">{errors.title}</span>}
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

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="survey-deadline">回答期限 *</label>
              <input
                id="survey-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="survey-input"
              />
              {errors.deadline && <span className="error-message">{errors.deadline}</span>}
            </div>
            
            <div className="input-group">
              <label htmlFor="required-points">必要ポイント *</label>
              <input
                id="required-points"
                type="number"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(parseInt(e.target.value) || 0)}
                min="1000"
                step="100"
                className="survey-input"
              />
              {errors.requiredPoints && <span className="error-message">{errors.requiredPoints}</span>}
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="target-responses">目標回答者数 *</label>
              <input
                id="target-responses"
                type="number"
                value={targetResponses}
                onChange={(e) => setTargetResponses(parseInt(e.target.value) || 0)}
                min="1"
                className="survey-input"
              />
              {errors.targetResponses && <span className="error-message">{errors.targetResponses}</span>}
            </div>
            
            <div className="input-group">
              <label htmlFor="estimated-time">回答時間の目安（分） *</label>
              <input
                id="estimated-time"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                min="1"
                className="survey-input"
              />
              {errors.estimatedTime && <span className="error-message">{errors.estimatedTime}</span>}
            </div>
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

          <button 
            className="submit-btn" 
            onClick={saveSurvey}
            disabled={saving}
          >
            {saving ? '保存中...' : 'アンケート保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Anq;
