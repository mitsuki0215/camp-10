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
        
        // Supabaseからアンケートと回答データを取得
        const result = await surveyService.getSurveyResponses(surveyId);
        setSurvey(result.survey);
        setResponses(result.responses);
        
      } catch (error) {
        console.error('Failed to fetch survey results:', error);
        setError('アンケート結果の取得に失敗しました: ' + error.message);
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
      // SupabaseデータからCSVを生成
      const csvBlob = await surveyService.exportSurveyCSVFromSupabase(surveyId);
      
      // CSVファイルをダウンロード
      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);
      link.setAttribute('href', url);
      link.setAttribute('download', `survey_${surveyId}_${survey?.title || 'results'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('CSV出力に失敗しました: ' + error.message);
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
            <span className="stat-value">
              Supabaseデータ
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
          <>
            <div className="questions-analysis">
              {analysis && Object.entries(analysis).map(([questionKey, data]) => 
                renderQuestionAnalysis(questionKey, data)
              )}
            </div>
            
            {/* Supabaseの生データ表示 */}
            <div className="raw-responses-section">
              <h3 className="section-subtitle">回答データ一覧 (Supabase)</h3>
              <div className="responses-table">
                <table className="responses-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ユーザー</th>
                      <th>回答日時</th>
                      <th>回答データ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr key={response.id || index}>
                        <td>{response.id}</td>
                        <td>
                          {response.users?.name || '匿名'}
                          {response.user_id && (
                            <small className="user-id">ID: {response.user_id}</small>
                          )}
                        </td>
                        <td>
                          {new Date(response.created_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="response-data">
                          <details>
                            <summary>詳細を表示</summary>
                            <pre className="json-data">
                              {JSON.stringify(response.responses, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;