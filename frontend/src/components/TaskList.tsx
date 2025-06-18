/**
 * TaskList コンポーネント
 * 
 * カードベースデザイン実装版
 */

import React from 'react';
import TaskCard from './TaskCard';
import './TaskList.css';

// タスクの型定義
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
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