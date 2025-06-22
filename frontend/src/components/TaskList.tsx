/**
 * TaskList コンポーネント
 * 
 * カードベースデザイン実装版
 */

import React from 'react';
import TaskCard from './TaskCard';
import './TaskList.css';

// 繰り返しタスク設定の型定義
export interface RecurringConfig {
  time: string;
}

// タスクの型定義
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  is_recurring?: boolean;
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  recurring_config?: RecurringConfig;
  source_task_id?: number;
  scheduled_date?: string;
}

// 繰り返しタスクの型定義
export interface RecurringTask extends Task {
  is_recurring: true;
  recurring_pattern: 'daily' | 'weekly' | 'monthly';
  recurring_config: RecurringConfig;
}

// タスク作成用の型定義
export interface CreateTaskData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// 繰り返しタスク作成用の型定義
export interface CreateRecurringTaskData extends CreateTaskData {
  is_recurring: true;
  recurring_pattern: 'daily' | 'weekly' | 'monthly';
  recurring_config: RecurringConfig;
}

// フォームデータの型定義
export interface RecurringTaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  time: string;
}

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task, updateData: any) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="task-list" data-testid="task-list">
      {tasks.length === 0 ? (
        <div className="task-list__empty">
          <p>タスクがありません</p>
        </div>
      ) : (
        <div className="task-list__grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;