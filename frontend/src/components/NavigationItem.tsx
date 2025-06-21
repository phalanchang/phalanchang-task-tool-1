import React from 'react';

interface NavigationItemProps {
  path: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: (path: string) => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  path, 
  label, 
  icon, 
  isActive, 
  onClick 
}) => {
  const handleClick = () => {
    onClick(path);
  };

  // Material Iconsのフォールバック対応
  const getIconDisplay = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'home': '🏠',
      'assignment': '📋', 
      'settings': '⚙️'
    };
    
    return iconMap[iconName] || iconName;
  };

  return (
    <button
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-label={`${label}へ移動`}
      tabIndex={0}
    >
      <span className="nav-icon" aria-hidden="true">
        <span className="material-icons">{icon}</span>
        <span className="icon-fallback">{getIconDisplay(icon)}</span>
      </span>
      <span className="nav-label">
        {label}
      </span>
    </button>
  );
};

export default NavigationItem;