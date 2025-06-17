/**
 * TaskForm コンポーネント
 * 
 * TDD Green段階: テストを通すための最小実装
 */

import React, { useState } from 'react';

interface TaskFormData {
  title: string;
  description: string;
}

interface TaskFormProps {
  onSubmit: (formData: TaskFormData) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 必須項目チェック
    if (!title.trim()) {
      return;
    }

    // コールバック呼び出し
    onSubmit({
      title: title.trim(),
      description: description.trim()
    });

    // フォームリセット
    setTitle('');
    setDescription('');
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
      
      <button type="submit">タスクを追加</button>
    </form>
  );
};

export default TaskForm;