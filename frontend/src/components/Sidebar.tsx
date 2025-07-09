import React from 'react';
import NavigationItem from './NavigationItem';
import NotificationBadge from './NotificationBadge';
import { useDailyTaskCount } from '../hooks/useDailyTaskCount';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate?: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath, onNavigate }) => {
  const { count: dailyTaskCount } = useDailyTaskCount();
  
  const navigationItems = [
    { path: '/', label: 'ダッシュボード', icon: 'home' },
    { path: '/tasks', label: 'タスク管理', icon: 'assignment' },
    { path: '/recurring-tasks', label: '繰り返しタスク', icon: 'loop' },
    { path: '/settings', label: '設定', icon: 'settings' }
  ];

  const handleNavigationClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <nav role="navigation" className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* モバイル用の閉じるボタン */}
      <button 
        onClick={onClose}
        aria-label="サイドバーを閉じる"
        className="close-button"
      >
        ×
      </button>
      
      {/* ナビゲーション項目 */}
      <div className="nav-items">
        {navigationItems.map(item => (
          <NavigationItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            isActive={currentPath === item.path}
            onClick={handleNavigationClick}
            badge={item.label === 'タスク管理' ? 
              <NotificationBadge count={dailyTaskCount} /> : 
              undefined
            }
          />
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;