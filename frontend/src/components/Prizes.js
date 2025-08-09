import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Prizes.css';

const Prizes = () => {
  const [userPoints, setUserPoints] = useState(5000); // デモ用のポイント
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);

  const prizes = [
    { id: 1, name: '100円ゲット!', probability: 0.1, value: 100, color: '#FFD700', icon: '💰' },
    { id: 2, name: '50円ゲット!', probability: 0.2, value: 50, color: '#C0C0C0', icon: '💎' },
    { id: 3, name: '10円ゲット!', probability: 0.3, value: 10, color: '#CD7F32', icon: '🪙' },
    { id: 4, name: 'はずれ', probability: 0.4, value: 0, color: '#FF6B6B', icon: '😢' }
  ];

  const spinGacha = async () => {
    if (userPoints < 1000) {
      alert('ポイントが足りません！アンケートに回答してポイントを貯めましょう。');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setUserPoints(prev => prev - 1000);

    // ガチャの結果を決定
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedPrize = prizes[prizes.length - 1]; // デフォルトははずれ

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // アニメーション時間
    setTimeout(() => {
      setIsSpinning(false);
      setPrizeResult(selectedPrize);
      setShowResult(true);
      setSpinCount(prev => prev + 1);
    }, 3000);
  };

  const resetResult = () => {
    setShowResult(false);
    setPrizeResult(null);
  };

  return (
    <div className="prizes-container">
      {/* ヘッダー */}
      <div className="prizes-header">
        <Link to="/" className="back-button">
          ← ホームに戻る
        </Link>
        <h1 className="page-title">懸賞ガチャ</h1>
      </div>

      {/* ポイント表示 */}
      <div className="points-display">
        <div className="points-card">
          <div className="points-icon">💰</div>
          <div className="points-info">
            <h3>保有ポイント</h3>
            <p className="points-value">{userPoints.toLocaleString()} P</p>
          </div>
        </div>
      </div>

      {/* ガチャ説明 */}
      <div className="gacha-info">
        <h2>🎰 ポイントガチャ</h2>
        <div className="gacha-rules">
          <p><strong>1000ポイント</strong>で1回挑戦できます！</p>
          <div className="prize-list">
            <div className="prize-item gold">
              <span className="prize-icon">💰</span>
              <span className="prize-name">100円ゲット!</span>
              <span className="prize-rate">10%</span>
            </div>
            <div className="prize-item silver">
              <span className="prize-icon">💎</span>
              <span className="prize-name">50円ゲット!</span>
              <span className="prize-rate">20%</span>
            </div>
            <div className="prize-item bronze">
              <span className="prize-icon">🪙</span>
              <span className="prize-name">10円ゲット!</span>
              <span className="prize-rate">30%</span>
            </div>
            <div className="prize-item miss">
              <span className="prize-icon">😢</span>
              <span className="prize-name">はずれ</span>
              <span className="prize-rate">40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ガチャマシン */}
      <div className="gacha-machine">
        <div className="machine-body">
          <div className="machine-top">
            <div className="machine-light"></div>
          </div>
          
          <div className="machine-screen">
            {!isSpinning && !showResult && (
              <div className="screen-idle">
                <span className="screen-icon">🎰</span>
                <p>ガチャを回そう！</p>
              </div>
            )}
            
            {isSpinning && (
              <div className="screen-spinning">
                <div className="spinning-wheel">
                  <div className="wheel-segment" style={{backgroundColor: '#FFD700'}}>💰</div>
                  <div className="wheel-segment" style={{backgroundColor: '#C0C0C0'}}>💎</div>
                  <div className="wheel-segment" style={{backgroundColor: '#CD7F32'}}>🪙</div>
                  <div className="wheel-segment" style={{backgroundColor: '#FF6B6B'}}>😢</div>
                </div>
                <p className="spinning-text">回転中...</p>
              </div>
            )}
            
            {showResult && prizeResult && (
              <div className={`screen-result ${prizeResult.value > 0 ? 'win' : 'lose'}`}>
                <div className="result-icon" style={{color: prizeResult.color}}>
                  {prizeResult.icon}
                </div>
                <h3 className="result-name">{prizeResult.name}</h3>
                {prizeResult.value > 0 && (
                  <p className="result-value">おめでとうございます！</p>
                )}
              </div>
            )}
          </div>

          <button 
            className={`gacha-button ${isSpinning ? 'spinning' : ''}`}
            onClick={spinGacha}
            disabled={isSpinning || userPoints < 1000}
          >
            {isSpinning ? '回転中...' : userPoints < 1000 ? 'ポイント不足' : 'ガチャを回す (1000P)'}
          </button>

          {showResult && (
            <button className="reset-button" onClick={resetResult}>
              もう一度挑戦
            </button>
          )}
        </div>

        <div className="machine-base">
          <div className="coin-slot"></div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="gacha-stats">
        <h3>挑戦回数: {spinCount}回</h3>
        <p>ポイントを貯めてもっとガチャを楽しもう！</p>
        <Link to="/" className="back-to-surveys">
          アンケートに回答してポイントを貯める →
        </Link>
      </div>
    </div>
  );
};

export default Prizes;
