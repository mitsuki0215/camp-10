import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './AnswerSurvey.css';

const AnswerSurvey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ダミーアンケートデータ（useEffect内に移動）
    const dummySurveys = [
      {
        id: 1,
        title: "大学生活に関するアンケート",
        description: "大学生活の満足度や改善点について教えてください",
        questions: [
          {
            id: 1,
            text: "大学生活に満足していますか？",
            type: "radio",
            options: ["とても満足", "満足", "どちらでもない", "不満", "とても不満"],
            required: true
          },
          {
            id: 2,
            text: "改善してほしい点があれば教えてください",
            type: "paragraph",
            required: false
          },
          {
            id: 3,
            text: "利用している施設を選んでください（複数選択可）",
            type: "checkbox",
            options: ["図書館", "食堂", "体育館", "研究室", "サークル施設"],
            required: false
          },
          {
            id: 4,
            text: "あなたの学年を教えてください",
            type: "radio",
            options: ["B1", "B2", "B3", "B4", "M1", "M2", "D1", "D2", "D3", "D4"],
            required: true
          }
        ]
      },
      {
        id: 2,
        title: "オンライン授業の評価調査",
        description: "オンライン授業の効果性や課題について",
        questions: [
          {
            id: 1,
            text: "オンライン授業の理解度はいかがですか？",
            type: "radio",
            options: ["とても良い", "良い", "普通", "悪い", "とても悪い"],
            required: true
          },
          {
            id: 2,
            text: "オンライン授業で困っていることがあれば教えてください",
            type: "paragraph",
            required: false
          }
        ]
      }
    ];

    // アンケートデータを取得（ダミーデータを使用）
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        // 実際のAPIコール: const surveyData = await apiClient.get(`/api/surveys/${id}`);
        const surveyData = dummySurveys.find(s => s.id === parseInt(id));
        setSurvey(surveyData);
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  // 回答の更新
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // チェックボックスの回答処理
  const handleCheckboxChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(item => item !== option)
        };
      }
    });
  };

  // アンケート回答送信（現在は仮実装）
  const handleSubmit = () => {
    // 必須項目のチェック
    const requiredQuestions = survey?.questions.filter(q => q.required) || [];
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || 
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0) ||
      answers[q.id] === ''
    );

    if (missingAnswers.length > 0) {
      alert('必須項目に回答してください。');
      return;
    }

    alert('アンケートの回答を送信しました！');
    // 実際の実装では、APIに回答データを送信
  };

  if (loading) {
    return (
      <div className="answer-survey-container">
        <div className="loading-message">読み込み中...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="answer-survey-container">
        <div className="error-message">アンケートが見つかりません</div>
        <Link to="/" className="back-home-btn">ホームに戻る</Link>
      </div>
    );
  }

  return (
    <div className="answer-survey-container">
      {/* ヘッダー */}
      <div className="answer-header">
        <Link to="/" className="back-button">
          ← ホームに戻る
        </Link>
        <h1 className="page-title">アンケート回答</h1>
      </div>

      {/* アンケート情報 */}
      <div className="survey-info">
        <h2 className="survey-title">{survey.title}</h2>
        <p className="survey-description">{survey.description}</p>
      </div>

      {/* 質問一覧 */}
      <div className="questions-container">
        {survey.questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <h3 className="question-number">質問 {index + 1}</h3>
              {question.required && <span className="required-mark">必須</span>}
            </div>
            <p className="question-text">{question.text}</p>

            <div className="answer-section">
              {question.type === 'short' && (
                <input
                  type="text"
                  className="text-input"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="回答を入力してください"
                />
              )}

              {question.type === 'paragraph' && (
                <textarea
                  className="textarea-input"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="回答を入力してください"
                  rows="4"
                />
              )}

              {question.type === 'radio' && (
                <div className="radio-options">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="radio-option">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                      <span className="radio-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'checkbox' && (
                <div className="checkbox-options">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={(answers[question.id] || []).includes(option)}
                        onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                      />
                      <span className="checkbox-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="action-buttons">
        <Link to="/" className="cancel-btn">
          キャンセル
        </Link>
        <button className="submit-btn" onClick={handleSubmit}>
          回答する
        </button>
      </div>
    </div>
  );
};

export default AnswerSurvey;
