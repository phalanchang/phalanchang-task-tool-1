/**
 * TaskForm コンポーネント
 * 
 * TDD Green段階: テストを通すための最小実装
 */

import React, { useState } from 'react';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskFormProps {
  onSubmit: (formData: TaskFormData) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 必須項目チェック
    if (!title.trim()) {
      return;
    }

    // コールバック呼び出し
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority: priority
    });

    // フォームリセット
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <form data-testid="task-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="priority">優先度</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>
      
      <button type="submit">タスクを追加</button>
    </form>
  );
};

export default TaskForm;