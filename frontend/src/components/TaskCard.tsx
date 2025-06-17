/**
 * TaskCard コンポーネント（TDD Green Phase）
 * 
 * テストを通すための最小限の実装
 */

import React from 'react';
import { Task } from './TaskList';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task, updateData: any) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  // 優先度別クラス名を生成
  const getPriorityClass = (priority: string) => {
    return `task-card--${priority}`;
  };

  // ステータス別クラス名を生成
  const getStatusClass = (status: string) => {
    return `task-card--${status}`;
  };

  // カード全体のクラス名を組み合わせ
  const cardClassName = [
    'task-card',
    getPriorityClass(task.priority),
    getStatusClass(task.status)
  ].join(' ');

  return (
    <div 
      className={cardClassName}
      data-testid="task-card"
    >
      {/* タスクタイトル */}
      <h3 
        className="task-card__title"
        data-testid="task-title"
      >
        {task.title}
      </h3>

      {/* タスク説明 */}
      {task.description && (
        <p 
          className="task-card__description"
          data-testid="task-description"
        >
          {task.description}
        </p>
      )}

      {/* ステータス表示 */}
      <div className="task-card__status">
        <span className={`status-badge status-badge--${task.status}`}>
          {task.status === 'pending' ? '未完了' : '完了'}
        </span>
      </div>

      {/* 優先度表示 */}
      <div className="task-card__priority">
        <span className={`priority-badge priority-badge--${task.priority}`}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </span>
      </div>

      {/* アクションボタン */}
      <div className="task-card__actions">
        <button 
          className="btn btn--toggle"
          data-testid="toggle-status-button"
          onClick={() => onToggleStatus(task)}
        >
          {task.status === 'pending' ? '完了にする' : '未完了にする'}
        </button>
        
        <button 
          className="btn btn--delete"
          data-testid="delete-button"
          onClick={() => onDelete(task)}
        >
          削除
        </button>
      </div>

      {/* 作成日時表示 */}
      <div className="task-card__meta">
        <small className="task-card__created-at">
          作成: {new Date(task.created_at).toLocaleDateString('ja-JP')}
        </small>
      </div>
    </div>
  );
};

export default TaskCard;