import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import './Prizes.css';

const Prizes = () => {
  const { supabaseUser, refreshSupabaseUser } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const prizes = [
    { id: 1, name: '100円ゲット!', probability: 0.01, value: 100, color: '#FFD700', icon: '💰' },
    { id: 2, name: '50円ゲット!', probability: 0.03, value: 50, color: '#C0C0C0', icon: '💎' },
    { id: 3, name: '10円ゲット!', probability: 0.06, value: 10, color: '#CD7F32', icon: '🪙' },
    { id: 4, name: '1円ゲット!', probability: 0.10, value: 1, color: '#FFA500', icon: '🪙' },
    { id: 5, name: 'もう一度無料ガチャ!', probability: 0.05, value: 'free', color: '#4CAF50', icon: '🎁' },
    { id: 6, name: 'はずれ', probability: 0.75, value: 0, color: '#FF6B6B', icon: '😢' }
  ];

  // ユーザーポイントの初期化（軽量）
  useEffect(() => {
    if (supabaseUser) {
      setCurrentPoints(supabaseUser.points || 0);
      setLoading(false);
    }
  }, [supabaseUser]);

  const spinGacha = async () => {
    if (currentPoints < 1000) {
      alert('ポイントが足りません！アンケートに回答してポイントを貯めましょう。');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);

    try {
      // ポイントを消費
      const result = await userService.updateUserPoints(-1000);
      setCurrentPoints(result.new_points);
      
      // コンテキストも更新（軽量）
      await refreshSupabaseUser();
    } catch (error) {
      console.error('Failed to deduct points:', error);
      alert('ポイントの消費に失敗しました。');
      setIsSpinning(false);
      return;
    }

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
    setTimeout(async () => {
      setIsSpinning(false);
      setPrizeResult(selectedPrize);
      setShowResult(true);
      setSpinCount(prev => prev + 1);
      
      //ここの処理変えたい
      // 無料ガチャが当たった場合はポイントを返還
      if (selectedPrize.value === 'free') {
        try {
          const result = await userService.updateUserPoints(1000);
          setCurrentPoints(result.new_points);
          await refreshSupabaseUser();
        } catch (error) {
          console.error('Failed to refund points:', error);
        }
      }
    }, 3000);
  };

  const resetResult = () => {
    setShowResult(false);
    setPrizeResult(null);
  };

  if (loading) {
    return (
      <div className="prizes-container">
        <div className="loading-message">ユーザー情報を読み込み中...</div>
      </div>
    );
  }

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
            <p className="points-value">{currentPoints.toLocaleString()} P</p>
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
              <span className="prize-rate">1%</span>
            </div>
            <div className="prize-item silver">
              <span className="prize-icon">💎</span>
              <span className="prize-name">50円ゲット!</span>
              <span className="prize-rate">3%</span>
            </div>
            <div className="prize-item bronze">
              <span className="prize-icon">🪙</span>
              <span className="prize-name">10円ゲット!</span>
              <span className="prize-rate">6%</span>
            </div>
            <div className="prize-item copper">
              <span className="prize-icon">🪙</span>
              <span className="prize-name">1円ゲット!</span>
              <span className="prize-rate">10%</span>
            </div>
            <div className="prize-item special">
              <span className="prize-icon">🎁</span>
              <span className="prize-name">もう一度無料ガチャ!</span>
              <span className="prize-rate">5%</span>
            </div>
            <div className="prize-item miss">
              <span className="prize-icon">😢</span>
              <span className="prize-name">はずれ</span>
              <span className="prize-rate">75%</span>
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
                  <div className="wheel-segment" style={{backgroundColor: '#FFA500'}}>🪙</div>
                  <div className="wheel-segment" style={{backgroundColor: '#4CAF50'}}>🎁</div>
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
                {prizeResult.value > 0 && prizeResult.value !== 'free' && (
                  <p className="result-value">おめでとうございます！</p>
                )}
                {prizeResult.value === 'free' && (
                  <p className="result-value">ラッキー！もう一度挑戦できます！</p>
                )}
              </div>
            )}
          </div>

          <button 
            className={`gacha-button ${isSpinning ? 'spinning' : ''}`}
            onClick={spinGacha}
            disabled={isSpinning || currentPoints < 1000}
          >
            {isSpinning ? '回転中...' : currentPoints < 1000 ? 'ポイント不足' : 'ガチャを回す (1000P)'}
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
