import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="page-container">
      
      <div className="settings-content">
        <section className="settings-section">
          <h3>表示設定</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              ダークモード
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              通知を有効にする
            </label>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>タスク設定</h3>
          <div className="setting-item">
            <label>
              デフォルト優先度:
              <select>
                <option>低</option>
                <option>中</option>
                <option>高</option>
              </select>
            </label>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>データ管理</h3>
          <button className="danger-button">すべてのタスクを削除</button>
        </section>
      </div>
    </div>
  );
};

export default Settings;