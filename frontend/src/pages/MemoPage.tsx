import React, { useState, useEffect } from 'react';
import MemoList from '../components/MemoList';
import MemoForm from '../components/MemoForm';
import { API_BASE_URL } from '../config/api';
import '../pages/Pages.css';

interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const MemoPage: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/memos`);
      if (!response.ok) {
        throw new Error('メモの取得に失敗しました');
      }
      const data = await response.json();
      setMemos(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemo = () => {
    setEditingMemo(null);
    setIsFormOpen(true);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setIsFormOpen(true);
  };

  const handleDeleteMemo = async (id: number) => {
    if (!window.confirm('このメモを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/memos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('メモの削除に失敗しました');
      }
      await fetchMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleFormSubmit = async (data: { title: string; content: string }) => {
    try {
      const url = editingMemo
        ? `${API_BASE_URL}/memos/${editingMemo.id}`
        : `${API_BASE_URL}/memos`;
      const method = editingMemo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('メモの保存に失敗しました');
      }

      setIsFormOpen(false);
      setEditingMemo(null);
      await fetchMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMemo(null);
  };

  if (loading) {
    return <div className="page-container">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">メモ</h2>
        <button className="primary-button" onClick={handleCreateMemo}>
          <span className="material-icons">add</span>
          新規メモ
        </button>
      </div>

      <MemoList
        memos={memos}
        onEdit={handleEditMemo}
        onDelete={handleDeleteMemo}
      />

      {isFormOpen && (
        <MemoForm
          memo={editingMemo}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default MemoPage;