import React, { useEffect, useState } from 'react';
import './NotificationBadge.css';

interface NotificationBadgeProps {
  count: number;
  visible?: boolean;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  visible = true, 
  className = '' 
}) => {
  const [prevCount, setPrevCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count !== prevCount && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  if (!visible || count === 0) {
    return null;
  }

  return (
    <span 
      className={`notification-badge ${isAnimating ? 'animate' : ''} ${className}`}
      aria-label={`${count}件の未完了タスク`}
      role="status"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;