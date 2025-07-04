import React, { useState } from 'react';
import Modal from './common/Modal';
import './TaskCreationModal.css';

interface TaskCreationModalData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  points?: number;
}

interface TaskCreationModalErrors {
  title?: string;
  description?: string;
  priority?: string;
  points?: string;
}

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskCreationModalData) => void;
  loading?: boolean;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<TaskCreationModalData>({
    title: '',
    description: '',
    priority: 'medium',
    points: 0
  });

  const [errors, setErrors] = useState<TaskCreationModalErrors>({});

  // フォームリセット
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      points: 0
    });
    setErrors({});
  };

  // モーダルが閉じられた時の処理
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: TaskCreationModalErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    if (formData.points !== undefined && (formData.points < 0 || formData.points > 1000)) {
      newErrors.points = 'ポイントは0から1000の間で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // トリムした値で送信
    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    };

    onSubmit(submitData);
    resetForm();
  };

  // フィールド更新ヘルパー
  const updateField = (field: keyof TaskCreationModalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field as keyof TaskCreationModalErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="✨ 新しいタスクを作成"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="task-creation-form">
        
        {/* タイトル */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            📝 タイトル <span className="required">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="タスクのタイトルを入力してください"
            disabled={loading}
            autoFocus
          />
          {errors.title && (
            <div className="error-message">{errors.title}</div>
          )}
        </div>

        {/* 説明 */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-description">
            📄 説明
          </label>
          <textarea
            id="task-description"
            className="form-textarea"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="タスクの詳細な説明を入力してください（任意）"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* 優先度 */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-priority">
            🎯 優先度
          </label>
          <select
            id="task-priority"
            className="form-select"
            value={formData.priority}
            onChange={(e) => updateField('priority', e.target.value as 'low' | 'medium' | 'high')}
            disabled={loading}
          >
            <option value="low">🟢 低</option>
            <option value="medium">🟡 中</option>
            <option value="high">🔴 高</option>
          </select>
        </div>

        {/* ポイント */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-points">
            💎 ポイント
          </label>
          <input
            id="task-points"
            type="number"
            className={`form-input ${errors.points ? 'error' : ''}`}
            min="0"
            max="1000"
            value={formData.points}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseInt(value);
              updateField('points', numValue);
            }}
            placeholder="0"
            disabled={loading}
          />
          <div className="help-text">
            タスク完了時に獲得できるポイント（0から1000まで）
          </div>
          {errors.points && (
            <div className="error-message">{errors.points}</div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? '作成中...' : 'タスクを作成'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskCreationModal;