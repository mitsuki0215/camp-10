import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
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
    // 実際の実装では、APIにデータを送信
    console.log('投稿データ:', questions);
  };

  return (
    <div className="anq-container">
      <h1 className="anq-title">アンケート作成</h1>
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
    </div>
  );
};

export default Anq;
