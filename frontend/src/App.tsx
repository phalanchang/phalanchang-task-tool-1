import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './pages/Pages.css';
import Sidebar from './components/Sidebar';
import PointsDisplay from './components/PointsDisplay';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import RecurringTasks from './pages/RecurringTasks';
import Settings from './pages/Settings';
import { useDailyTaskCount } from './hooks/useDailyTaskCount';
import { usePageTitle } from './hooks/usePageTitle';
import { DailyTaskProvider } from './contexts/DailyTaskContext';

// ルーター対応のメインコンポーネント
const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // サイドバー管理（モバイル用）
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Daily タスクの未完了数を取得
  const { count: dailyTaskCount } = useDailyTaskCount();
  
  // ページタイトルにバッジ表示
  usePageTitle('Task Management App', dailyTaskCount);

  /**
   * サイドバーを閉じる
   */
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  /**
   * ハンバーガーメニューをクリック
   */
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * ナビゲーション処理
   */
  const handleNavigation = (path: string) => {
    navigate(path);
    // モバイルでサイドバーを閉じる
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="App">
      {/* サイドバー */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />
      
      {/* モバイル用オーバーレイ */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={handleCloseSidebar} />}
      
      {/* メインコンテンツエリア */}
      <div className="main-content">
        <header className="App-header">
          {/* モバイル用ハンバーガーメニュー */}
          <button 
            className="hamburger-menu"
            onClick={handleMenuClick}
            aria-label="メニューを開く"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          <h1>タスク管理アプリ</h1>
          
          {/* ポイント表示 */}
          <PointsDisplay />
        </header>
        
        <main>
          {/* ルーティング */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/recurring-tasks" element={<RecurringTasks />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ルーター統合版のAppコンポーネント
function App() {
  return (
    <Router>
      <DailyTaskProvider>
        <AppContent />
      </DailyTaskProvider>
    </Router>
  );
}

export default App;