/**
 * TaskList コンポーネント
 * 
 * TDD Green段階: テストを通すための最小実装
 */

import React from 'react';

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
    <div data-testid="task-list">
      {tasks.length === 0 ? (
        <p>タスクがありません</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <div key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>{task.status === 'pending' ? '未完了' : '完了済み'}</p>
              <button onClick={() => onToggleStatus(task)}>
                {task.status === 'pending' ? '完了にする' : '未完了にする'}
              </button>
              <button onClick={() => onDelete(task)}>削除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;