import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import './SurveyResults.css';

const SurveyResults = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurveyResults = async () => {
      try {
        setLoading(true);
        
        // アンケート詳細を取得
        const surveyData = await surveyService.getSurvey(surveyId);
        setSurvey(surveyData);
        
        // 回答データを取得
        const responsesData = await surveyService.getSurveyResponsesAPI(surveyId);
        setResponses(responsesData);
        
      } catch (error) {
        console.error('Failed to fetch survey results:', error);
        setError('アンケート結果の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurveyResults();
    }
  }, [surveyId]);

  const handleExportCSV = async () => {
    try {
      const csvBlob = await surveyService.exportSurveyCSV(surveyId);
      
      // CSVファイルをダウンロード
      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);
      link.setAttribute('href', url);
      link.setAttribute('download', `survey_${surveyId}_results.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('CSV出力に失敗しました');
    }
  };

  const analyzeResponses = () => {
    if (!survey || !responses.length) return null;

    const analysis = {};
    
    survey.questions.forEach((question, index) => {
      const questionKey = index.toString();
      const answers = responses.map(response => response.responses[questionKey]).filter(Boolean);
      
      analysis[questionKey] = {
        question: question.text,
        type: question.type,
        totalResponses: answers.length,
        answers: answers
      };

      // 選択式の場合は集計
      if (question.type === 'radio' || question.type === 'checkbox') {
        const counts = {};
        answers.forEach(answer => {
          if (Array.isArray(answer)) {
            answer.forEach(item => {
              counts[item] = (counts[item] || 0) + 1;
            });
          } else {
            counts[answer] = (counts[answer] || 0) + 1;
          }
        });
        analysis[questionKey].counts = counts;
      }
    });

    return analysis;
  };

  const renderQuestionAnalysis = (questionKey, data) => {
    const { question, type, totalResponses, counts, answers } = data;

    return (
      <div key={questionKey} className="question-analysis">
        <h3 className="question-title">Q{parseInt(questionKey) + 1}: {question}</h3>
        <p className="response-count">回答数: {totalResponses}</p>
        
        {type === 'radio' || type === 'checkbox' ? (
          <div className="choice-results">
            {Object.entries(counts || {}).map(([choice, count]) => {
              const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
              return (
                <div key={choice} className="choice-result">
                  <div className="choice-info">
                    <span className="choice-text">{choice}</span>
                    <span className="choice-stats">{count}人 ({percentage}%)</span>
                  </div>
                  <div className="choice-bar">
                    <div 
                      className="choice-progress" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-results">
            <div className="text-responses">
              {answers.slice(0, 10).map((answer, index) => (
                <div key={index} className="text-response">
                  <p>"{answer}"</p>
                </div>
              ))}
              {answers.length > 10 && (
                <p className="more-responses">
                  他 {answers.length - 10} 件の回答があります
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="error">{error}</div>
        <Link to="/profile" className="back-button">
          ← プロフィールに戻る
        </Link>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="results-container">
        <div className="error">アンケートが見つかりません</div>
        <Link to="/profile" className="back-button">
          ← プロフィールに戻る
        </Link>
      </div>
    );
  }

  const analysis = analyzeResponses();

  return (
    <div className="results-container">
      {/* ヘッダー */}
      <div className="results-header">
        <Link to="/profile" className="back-button">
          ← プロフィールに戻る
        </Link>
        <h1 className="page-title">アンケート結果</h1>
        <button 
          onClick={handleExportCSV}
          className="export-csv-btn"
          disabled={responses.length === 0}
        >
          📊 CSV出力
        </button>
      </div>

      {/* アンケート情報 */}
      <div className="survey-info-card">
        <h2 className="survey-title">{survey.title}</h2>
        {survey.description && (
          <p className="survey-description">{survey.description}</p>
        )}
        <div className="survey-stats">
          <div className="stat-item">
            <span className="stat-label">総回答数</span>
            <span className="stat-value">{responses.length}件</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">作成日</span>
            <span className="stat-value">
              {new Date(survey.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ステータス</span>
            <span className={`status-badge ${survey.is_active ? 'active' : 'inactive'}`}>
              {survey.is_active ? '公開中' : '終了'}
            </span>
          </div>
        </div>
      </div>

      {/* 結果分析 */}
      <div className="results-analysis">
        <h2 className="section-title">回答結果</h2>
        
        {responses.length === 0 ? (
          <div className="no-responses">
            <p>まだ回答がありません</p>
          </div>
        ) : (
          <div className="questions-analysis">
            {analysis && Object.entries(analysis).map(([questionKey, data]) => 
              renderQuestionAnalysis(questionKey, data)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;