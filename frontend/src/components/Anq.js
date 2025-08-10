import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { surveyService } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import './Anq.css';

const defaultQuestion = () => ({
  id: uuidv4(),
  text: "",
  type: "short", // 'short' | 'paragraph' | 'radio' | 'checkbox'
  options: ["", ""],
  required: false,
});

const Anq = () => {
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requiredPoints, setRequiredPoints] = useState('');
  const [targetResponses, setTargetResponses] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
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
        return { ...q, options: [...q.options, ""] };
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
      newErrors.title = 'アンケートタイトルを設定してください';
    }

    // 締切日必須
    if (!deadline) {
      newErrors.deadline = '回答期限を設定してください';
    }

    // ポイントのバリデーション
    if (!requiredPoints) {
      newErrors.requiredPoints = '使用ポイントを入力してください';
    } else if (!/^\d+$/.test(requiredPoints)) {
      newErrors.requiredPoints = '半角数字で設定してください';
    } else {
      const pointsValue = parseInt(requiredPoints) || 0;
      const userPoints = supabaseUser?.points || 0;
      
      if (pointsValue < 1000) {
        newErrors.requiredPoints = '必要ポイントが足りません';
      } else if (pointsValue % 100 !== 0) {
        newErrors.requiredPoints = '必要ポイントは100ポイント単位で設定してください';
      } else if (pointsValue > userPoints) {
        newErrors.requiredPoints = `所持ポイント（${userPoints.toLocaleString()}P）が不足しています。必要なポイントは${pointsValue.toLocaleString()}Pです。`;
      }
    }

    // 回答者数のバリデーション
    if (!targetResponses) {
      newErrors.targetResponses = '目標回答者数を設定してください';
    } else if (!/^\d+$/.test(targetResponses)) {
      newErrors.targetResponses = '半角数字で設定してください';
    } else {
      const responsesValue = parseInt(targetResponses) || 0;
      if (responsesValue < 1) {
        newErrors.targetResponses = '目標回答者数を設定してください';
      }
    }

    // 推定時間のバリデーション
    if (!estimatedTime) {
      newErrors.estimatedTime = '回答時間の目安を設定してください';
    } else if (!/^\d+$/.test(estimatedTime)) {
      newErrors.estimatedTime = '半角数字で設定してください';
    } else {
      const timeValue = parseInt(estimatedTime) || 0;
      if (timeValue < 1) {
        newErrors.estimatedTime = '回答時間の目安を設定してください';
      }
    }

    // 質問のバリデーション
    if (questions.length === 0) {
      newErrors.questions = '質問内容が一つも登録されていません';
    } else {
      // 各質問の内容チェック
      const questionErrors = {};
      questions.forEach((question, index) => {
        const qErrors = {};
        
        // 質問文が空
        if (!question.text.trim()) {
          qErrors.text = '質問内容を入力してください';
        }

        // ラジオボタンの選択肢チェック
        if (question.type === 'radio') {
          if (question.options.length < 2) {
            qErrors.options = 'ラジオボタンの選択肢を最低2つ設定してください';
          } else if (question.options.some(opt => !opt.trim())) {
            qErrors.options = 'ラジオボタンの選択肢が空です';
          }
        }

        // チェックボックスの選択肢チェック
        if (question.type === 'checkbox') {
          if (question.options.length < 2) {
            qErrors.options = 'チェックボックスの選択肢を最低2つ設定してください';
          } else if (question.options.some(opt => !opt.trim())) {
            qErrors.options = 'チェックボックスの選択肢が空です';
          }
        }

        if (Object.keys(qErrors).length > 0) {
          questionErrors[question.id] = qErrors;
        }
      });

      if (Object.keys(questionErrors).length > 0) {
        newErrors.questionErrors = questionErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSurvey = async () => {
    if (!validateForm()) {
      // エラーがある場合、最初のエラー要素までスクロール
      setTimeout(() => {
        const errorElements = [
          document.querySelector('.survey-title-input.error'),
          document.querySelector('.survey-input.error'),
          document.querySelector('.question-input.error'),
          document.querySelector('.general-error'),
          document.querySelector('.error-message')
        ].filter(Boolean);
        
        if (errorElements.length > 0) {
          errorElements[0].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      return;
    }

    try {
      setSaving(true);
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline,
        requiredPoints: parseInt(requiredPoints) || 0,
        targetResponses: parseInt(targetResponses) || 0,
        estimatedTime: parseInt(estimatedTime) || 0,
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
      setRequiredPoints('');
      setTargetResponses('');
      setEstimatedTime('');
      setQuestions([defaultQuestion()]);
      setErrors({});

      // ホーム画面に遷移
      navigate('/');
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
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title && e.target.value.trim()) {
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }
              }}
              placeholder="アンケートのタイトルを入力してください"
              className={`survey-title-input ${errors.title ? 'error' : ''}`}
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
                onChange={(e) => {
                  setDeadline(e.target.value);
                  if (errors.deadline && e.target.value) {
                    const newErrors = { ...errors };
                    delete newErrors.deadline;
                    setErrors(newErrors);
                  }
                }}
                min={new Date().toISOString().slice(0, 16)}
                className={`survey-input ${errors.deadline ? 'error' : ''}`}
              />
              {errors.deadline && <span className="error-message">{errors.deadline}</span>}
            </div>
            
            <div className="input-group">
              <label htmlFor="required-points">
                必要ポイント * 
                <span className="points-info">（現在の所持ポイント: {(supabaseUser?.points || 0).toLocaleString()}P）</span>
              </label>
              <input
                id="required-points"
                type="text"
                value={requiredPoints}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setRequiredPoints(inputValue);
                  
                  // リアルタイムでエラーをクリア
                  if (errors.requiredPoints && inputValue && /^\d+$/.test(inputValue)) {
                    const value = parseInt(inputValue);
                    if (value >= 1000 && value % 100 === 0) {
                      const newErrors = { ...errors };
                      delete newErrors.requiredPoints;
                      setErrors(newErrors);
                    }
                  }
                }}
                placeholder="半角数字"
                className={`survey-input ${errors.requiredPoints ? 'error' : ''}`}
              />
              {errors.requiredPoints && <span className="error-message">{errors.requiredPoints}</span>}
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="target-responses">目標回答者数 *</label>
              <input
                id="target-responses"
                type="text"
                value={targetResponses}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setTargetResponses(inputValue);
                  
                  // リアルタイムでエラーをクリア
                  if (errors.targetResponses && inputValue && /^\d+$/.test(inputValue)) {
                    const value = parseInt(inputValue);
                    if (value >= 1) {
                      const newErrors = { ...errors };
                      delete newErrors.targetResponses;
                      setErrors(newErrors);
                    }
                  }
                }}
                placeholder="半角数字"
                className={`survey-input ${errors.targetResponses ? 'error' : ''}`}
              />
              {errors.targetResponses && <span className="error-message">{errors.targetResponses}</span>}
            </div>
            
            <div className="input-group">
              <label htmlFor="estimated-time">回答時間の目安（分） *</label>
              <input
                id="estimated-time"
                type="text"
                value={estimatedTime}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setEstimatedTime(inputValue);
                  
                  // リアルタイムでエラーをクリア
                  if (errors.estimatedTime && inputValue && /^\d+$/.test(inputValue)) {
                    const value = parseInt(inputValue);
                    if (value >= 1) {
                      const newErrors = { ...errors };
                      delete newErrors.estimatedTime;
                      setErrors(newErrors);
                    }
                  }
                }}
                placeholder="半角数字"
                className={`survey-input ${errors.estimatedTime ? 'error' : ''}`}
              />
              {errors.estimatedTime && <span className="error-message">{errors.estimatedTime}</span>}
            </div>
          </div>
        </div>

        {/* 質問一覧のエラー表示 */}
        {errors.questions && (
          <div className="general-error">
            <span className="error-message">{errors.questions}</span>
          </div>
        )}

      {questions.map(q => (
        <div key={q.id} className={`question-card ${errors.questionErrors?.[q.id] ? 'has-error' : ''}`}>
          <div className="question-header">
            <input
              className={`question-input ${errors.questionErrors?.[q.id]?.text ? 'error' : ''}`}
              value={q.text}
              onChange={e => {
                updateQuestion(q.id, { text: e.target.value });
                // エラーをクリア
                if (errors.questionErrors?.[q.id]?.text) {
                  const newErrors = { ...errors };
                  if (newErrors.questionErrors?.[q.id]) {
                    delete newErrors.questionErrors[q.id].text;
                    if (Object.keys(newErrors.questionErrors[q.id]).length === 0) {
                      delete newErrors.questionErrors[q.id];
                    }
                  }
                  setErrors(newErrors);
                }
              }}
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
          {errors.questionErrors?.[q.id]?.text && (
            <span className="error-message">{errors.questionErrors[q.id].text}</span>
          )}

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
                    placeholder={`選択肢${index + 1}`}
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
              {errors.questionErrors?.[q.id]?.options && (
                <span className="error-message">{errors.questionErrors[q.id].options}</span>
              )}
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
