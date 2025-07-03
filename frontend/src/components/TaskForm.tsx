/**
 * TaskForm コンポーネント
 * 
 * TDD Green段階: テストを通すための最小実装
 */

import React, { useState } from 'react';
import './TaskForm.css';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  points?: number;
}

interface TaskFormProps {
  onSubmit: (formData: TaskFormData) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [points, setPoints] = useState<number>(0);

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
      priority: priority,
      points: points
    });

    // フォームリセット
    setTitle('');
    setDescription('');
    setPriority('medium');
    setPoints(0);
  };

  return (
    <form className="task-form" data-testid="task-form" onSubmit={handleSubmit}>
      <div className="task-form__header">
        <h3 className="task-form__title">
          ✨ 新しいタスクを追加
        </h3>
        <p className="task-form__subtitle">タスクの詳細を入力してください</p>
      </div>
      
      <div className="task-form__field">
        <label className="task-form__label" htmlFor="title">
          📝 タイトル *
        </label>
        <input
          className="task-form__input"
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスクのタイトルを入力してください"
          required
        />
      </div>
      
      <div className="task-form__field">
        <label className="task-form__label" htmlFor="description">
          📄 説明
        </label>
        <textarea
          className="task-form__textarea"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="タスクの詳細な説明を入力してください（任意）"
        />
      </div>

      <div className="task-form__field task-form__priority-select">
        <label className="task-form__label" htmlFor="priority">
          🎯 優先度
        </label>
        <select
          className="task-form__select"
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        >
          <option value="low">🟢 低</option>
          <option value="medium">🟡 中</option>
          <option value="high">🔴 高</option>
        </select>
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="points">
          💎 ポイント
        </label>
        <input
          className="task-form__input"
          id="points"
          type="number"
          min="0"
          max="1000"
          value={points}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 0 : parseInt(value);
            setPoints(numValue);
          }}
          placeholder="0"
        />
        <div className="task-form__help-text">
          タスク完了時に獲得できるポイント（0から1000まで）
        </div>
      </div>
      
      <button className="task-form__button" type="submit">
        ➕ タスクを追加
      </button>
    </form>
  );
};

export default TaskForm;