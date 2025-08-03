import './Anq.css';
import { v4 as uuidv4 } from "uuid";
import React, { useState } from 'react';

const defaultQuestion = () => ({
  id: uuidv4(),
  text: "質問内容を入力",
  type: "short", // 'short' | 'paragraph' | 'radio' | 'checkbox'
  options: ["選択肢1", "選択肢2"]
});

const Anq = () => {
  const [questions, setQuestions] = useState([defaultQuestion()]);

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const updateQuestion = (id, newData) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...newData } : q)));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">アンケート作成</h1>
      {questions.map(q => (
        <div key={q.id} className="border p-4 rounded shadow bg-white">
          <input
            className="w-full p-2 border rounded mb-2"
            value={q.text}
            onChange={e => updateQuestion(q.id, { text: e.target.value })}
          />
          <select
            className="p-2 border rounded"
            value={q.type}
            onChange={e => updateQuestion(q.id, { type: e.target.value })}
          >
            <option value="short">短文</option>
            <option value="paragraph">段落</option>
            <option value="radio">ラジオ</option>
            <option value="checkbox">チェックボックス</option>
          </select>
        </div>
      ))}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={addQuestion}
      >
        質問を追加
      </button>
    </div>
  );
};

export default Anq;


    