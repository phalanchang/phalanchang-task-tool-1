import React, { useState, useEffect } from 'react';
import { useDailyTaskRefresh } from '../contexts/DailyTaskContext';
import './PointsDisplay.css';

interface UserPoints {
  user_id: string;
  total_points: number;
  daily_points: number;
  last_updated: string;
}

interface PointsDisplayProps {
  className?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ className }) => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // リアルタイム更新用
  const { refreshTrigger } = useDailyTaskRefresh();

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/tasks/user-points');
      
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }
      
      const data = await response.json();
      if (data.success) {
        // アニメーション効果
        if (points && data.data.total_points > points.total_points) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
        setPoints(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch points');
      }
    } catch (err) {
      console.error('ポイント取得エラー:', err);
      setError('ポイントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className={`points-display ${className || ''}`}>
        <div className="points-loading">
          <span className="loading-spinner">⏳</span>
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`points-display ${className || ''}`}>
        <div className="points-error">
          <span className="error-icon">❌</span>
          <span>ポイント取得エラー</span>
        </div>
      </div>
    );
  }

  if (!points) {
    return null;
  }

  return (
    <div className={`points-display ${className || ''} ${isAnimating ? 'animate' : ''}`}>
      <div className="points-container">
        <div className="total-points">
          <span className="points-icon">🏆</span>
          <div className="points-info">
            <span className="points-label">合計</span>
            <span className="points-value">{points.total_points.toLocaleString()}</span>
          </div>
        </div>
        <div className="daily-points">
          <span className="points-icon">⭐</span>
          <div className="points-info">
            <span className="points-label">今日</span>
            <span className="points-value">{points.daily_points}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;