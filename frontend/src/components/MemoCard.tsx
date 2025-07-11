import React from 'react';
import { marked } from 'marked';
import './MemoCard.css';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MemoCardProps {
  memo: Memo;
  onEdit: () => void;
  onDelete: () => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    const html = marked(memo.content || '', {
      breaks: true,
      gfm: true,
    });
    return { __html: html as string };
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="memo-card">
      <div className="memo-card-header">
        <h3 className="memo-card-title">{memo.title}</h3>
        <div className="memo-card-actions">
          <button
            className="icon-button"
            onClick={onEdit}
            aria-label="メモを編集"
            title="編集"
          >
            <span className="material-icons">edit</span>
          </button>
          <button
            className="icon-button delete"
            onClick={onDelete}
            aria-label="メモを削除"
            title="削除"
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      </div>
      
      <div className="memo-card-content">
        <div 
          className="memo-preview"
          dangerouslySetInnerHTML={renderContent()}
        />
      </div>
      
      <div className="memo-card-footer">
        <span className="memo-date">作成: {formatDate(memo.created_at)}</span>
        {memo.updated_at !== memo.created_at && (
          <span className="memo-date">更新: {formatDate(memo.updated_at)}</span>
        )}
      </div>
    </div>
  );
};

export default MemoCard;