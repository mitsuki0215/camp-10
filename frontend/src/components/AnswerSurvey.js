import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';
import './AnswerSurvey.css';

const AnswerSurvey = () => {
  const { id } = useParams();
  const { supabaseUser } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 実際のAPIからアンケートデータを取得
        const surveyData = await surveyService.getSurvey(id);
        setSurvey(surveyData);
        
        // 現在のユーザーがアンケート作成者かチェック
        if (supabaseUser && surveyData.creator_id === supabaseUser.id) {
          setIsCreator(true);
        }
        
      } catch (error) {
        console.error('Failed to fetch survey:', error);
        setError('アンケートの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSurvey();
    }
  }, [id, supabaseUser]);

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

  // アンケート回答送信
  const handleSubmit = async () => {
    // アンケート作成者は回答できない
    if (isCreator) {
      alert('自分で作成したアンケートには回答できません。');
      return;
    }

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

    try {
      // 回答データを質問インデックスベースに変換
      const responseData = {};
      survey.questions.forEach((question, index) => {
        const answer = answers[index];
        if (answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0)) {
          responseData[index.toString()] = answer;
        }
      });

      await surveyService.submitSurveyResponse(id, responseData);
      alert('アンケートの回答を送信しました！ありがとうございました。');
      // ホームページに戻る
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      alert('回答の送信に失敗しました。もう一度お試しください。');
    }
  };

  if (loading) {
    return (
      <div className="answer-survey-container">
        <div className="loading-message">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="answer-survey-container">
        <div className="error-message">{error}</div>
        <Link to="/" className="back-home-btn">ホームに戻る</Link>
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

  // アンケート作成者の場合の警告表示
  if (isCreator) {
    return (
      <div className="answer-survey-container">
        <div className="answer-header">
          <Link to="/" className="back-button">
            ← ホームに戻る
          </Link>
          <h1 className="page-title">アンケート詳細</h1>
        </div>
        
        <div className="survey-info">
          <h2 className="survey-title">{survey.title}</h2>
          <p className="survey-description">{survey.description}</p>
        </div>
        
        <div className="creator-warning">
          <h3>⚠️ 作成者は回答できません</h3>
          <p>あなたが作成したアンケートのため、回答することはできません。</p>
          <p>結果を確認したい場合は、プロフィールページから「結果を見る」をクリックしてください。</p>
          <div className="creator-actions">
            <Link to="/profile" className="view-profile-btn">
              プロフィールページを見る
            </Link>
            <Link to={`/survey-results/${id}`} className="view-results-btn">
              結果を見る
            </Link>
          </div>
        </div>
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
          <div key={question.id || index} className="question-card">
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
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="回答を入力してください"
                />
              )}

              {question.type === 'paragraph' && (
                <textarea
                  className="textarea-input"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
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
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
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
                        checked={(answers[index] || []).includes(option)}
                        onChange={(e) => handleCheckboxChange(index, option, e.target.checked)}
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
