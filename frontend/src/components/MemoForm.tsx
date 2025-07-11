import React, { useState, useEffect } from 'react';
import './MemoForm.css';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MemoFormProps {
  memo: Memo | null;
  onSubmit: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [memo]);

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (title.length > 255) {
      newErrors.title = 'タイトルは255文字以内で入力してください';
    }
    
    if (content.length > 10000) {
      newErrors.content = '内容は10,000文字以内で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{memo ? 'メモを編集' : '新規メモ'}</h2>
          <button
            className="icon-button"
            onClick={onCancel}
            aria-label="閉じる"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="memo-form">
          <div className="form-group">
            <label htmlFor="memo-title">タイトル *</label>
            <input
              type="text"
              id="memo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="メモのタイトルを入力"
              autoFocus
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="memo-content">
              内容
              <span className="label-hint">（Markdown形式で記述できます）</span>
            </label>
            <textarea
              id="memo-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={errors.content ? 'error' : ''}
              placeholder="メモの内容を入力&#10;&#10;# 見出し&#10;- リスト項目&#10;**太字**、*斜体*"
              rows={10}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
            <div className="character-count">
              {content.length} / 10,000 文字
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="primary-button"
            >
              {memo ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoForm;