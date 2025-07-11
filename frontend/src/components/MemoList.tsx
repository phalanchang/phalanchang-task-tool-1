import React from 'react';
import MemoCard from './MemoCard';
import './MemoList.css';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MemoListProps {
  memos: Memo[];
  onEdit: (memo: Memo) => void;
  onDelete: (id: number) => void;
}

const MemoList: React.FC<MemoListProps> = ({ memos, onEdit, onDelete }) => {
  if (memos.length === 0) {
    return (
      <div className="memo-list-empty">
        <span className="material-icons">note</span>
        <p>メモがありません</p>
        <p className="memo-list-empty-hint">「新規メモ」ボタンから作成してください</p>
      </div>
    );
  }

  return (
    <div className="memo-list">
      {memos.map((memo) => (
        <MemoCard
          key={memo.id}
          memo={memo}
          onEdit={() => onEdit(memo)}
          onDelete={() => onDelete(memo.id)}
        />
      ))}
    </div>
  );
};

export default MemoList;