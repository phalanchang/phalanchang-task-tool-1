import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h2>📊 ダッシュボード</h2>
        <p>タスク管理の概要を表示します</p>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="stat-card">
            <h3>今日のタスク</h3>
            <div className="stat-number">5</div>
            <p>未完了タスク</p>
          </div>
          
          <div className="stat-card">
            <h3>完了率</h3>
            <div className="stat-number">75%</div>
            <p>今週の進捗</p>
          </div>
          
          <div className="stat-card">
            <h3>優先度高</h3>
            <div className="stat-number">3</div>
            <p>緊急タスク</p>
          </div>
        </div>
        
        <div className="quick-actions">
          <h3>クイックアクション</h3>
          <button className="action-button">新しいタスクを作成</button>
          <button className="action-button">今日のタスクを確認</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;