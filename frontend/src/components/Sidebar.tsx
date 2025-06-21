import React from 'react';
import NavigationItem from './NavigationItem';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate?: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath, onNavigate }) => {
  const navigationItems = [
    { path: '/', label: 'ダッシュボード', icon: 'home' },
    { path: '/tasks', label: 'タスク管理', icon: 'assignment' },
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
          />
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;