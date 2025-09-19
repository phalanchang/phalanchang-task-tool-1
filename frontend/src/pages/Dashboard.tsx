import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDailyTaskStats } from '../hooks/useDailyTaskStats';
import '../Dashboard.css';

const Dashboard: React.FC = () => {
  const { stats, loading, error, refetch } = useDailyTaskStats();

  if (loading && !stats) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>統計情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="page-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refetch} className="retry-button">再試行</button>
        </div>
      </div>
    );
  }

  // グラフ用のデータを準備
  const weeklyChartData = stats?.thisWeek.dailyBreakdown.map(day => ({
    date: new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
    完了: day.completed,
    全体: day.total,
    完了率: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0
  })) || [];

  // 先週との比較
  const weekComparison = stats ? {
    difference: stats.thisWeek.completionRate - stats.lastWeek.completionRate,
    isImproved: stats.thisWeek.completionRate >= stats.lastWeek.completionRate
  } : null;

  return (
    <div className="page-container">
      <div className="dashboard-content">
        {/* 今日の統計カード */}
        <div className="stats-section">
          <h2>今日のデイリータスク</h2>
          <div className="stats-cards">
            <div className="stat-card primary">
              <h3>完了率</h3>
              <div className="stat-number">{stats?.today.completionRate || 0}%</div>
              <p>{stats?.today.completedTasks || 0} / {stats?.today.totalTasks || 0} タスク</p>
            </div>
            
            <div className="stat-card success">
              <h3>獲得ポイント</h3>
              <div className="stat-number">{stats?.today.earnedPoints || 0}</div>
              <p>ポイント</p>
            </div>
            
            <div className="stat-card warning">
              <h3>未完了</h3>
              <div className="stat-number">{stats?.today.incompleteTasks || 0}</div>
              <p>タスク</p>
            </div>
          </div>
        </div>

        {/* 週間統計 */}
        <div className="weekly-stats-section">
          <div className="section-header">
            <h2>今週の実績</h2>
            <button onClick={refetch} className="refresh-button">更新</button>
          </div>
          
          <div className="weekly-overview">
            <div className="week-stat">
              <span className="label">完了率:</span>
              <span className="value">{stats?.thisWeek.completionRate || 0}%</span>
            </div>
            <div className="week-stat">
              <span className="label">完了タスク:</span>
              <span className="value">{stats?.thisWeek.completedTasks || 0} / {stats?.thisWeek.totalTasks || 0}</span>
            </div>
            <div className="week-stat">
              <span className="label">獲得ポイント:</span>
              <span className="value">{stats?.thisWeek.earnedPoints || 0}</span>
            </div>
          </div>

          {/* 週間グラフ */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="完了" fill="#4CAF50" />
                <Bar dataKey="全体" fill="#E0E0E0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 先週との比較 */}
        {weekComparison && (
          <div className="comparison-section">
            <h3>先週との比較</h3>
            <div className={`comparison-card ${weekComparison.isImproved ? 'improved' : 'declined'}`}>
              <div className="comparison-icon">
                {weekComparison.isImproved ? '📈' : '📉'}
              </div>
              <div className="comparison-content">
                <p className="comparison-label">完了率の変化</p>
                <p className="comparison-value">
                  {weekComparison.difference > 0 ? '+' : ''}{weekComparison.difference.toFixed(1)}%
                </p>
                <p className="comparison-detail">
                  先週: {stats?.lastWeek.completionRate || 0}% → 今週: {stats?.thisWeek.completionRate || 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* タスク別成功率 */}
        <div className="task-breakdown-section">
          <h2>タスク別成功率</h2>
          <div className="task-list">
            {stats?.taskBreakdown.map((task) => (
              <div key={task.taskId} className="task-item">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className="success-rate">
                    ({task.completedAttempts}/{task.totalAttempts}) {task.successRate}%
                  </span>
                </div>
                <div className="task-details">
                  <div className="streak">
                    🔥 {task.streak}日連続
                  </div>
                  <div className="seven-days">
                    {task.lastSevenDays.map((completed, index) => (
                      <span
                        key={index}
                        className={`day-indicator ${completed ? 'completed' : 'missed'}`}
                        title={`${7 - index}日前`}
                      >
                        {completed ? '✓' : '×'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${task.successRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;