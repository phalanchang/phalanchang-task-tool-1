import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './MemoPage.css';

interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const MemoPage: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchMemos();
  }, []);

  useEffect(() => {
    // Extract all unique tags from memos
    const tags = new Set<string>();
    memos.forEach(memo => {
      memo.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [memos]);

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

  const filteredMemos = memos.filter(memo => {
    const matchesSearch = memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memo.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => memo.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleMemoSelect = (memo: Memo) => {
    setSelectedMemo(memo);
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
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleFormSubmit = async (data: { title: string; content: string; tags: string[] }) => {
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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording (mock implementation)
      setIsRecording(false);
      
      // Mock transcription result
      const mockTranscription = "これは音声入力のテストです。実際の実装では、音声をLLMに送信して文字起こしします。";
      
      // Add transcribed text to form if form is open
      if (isFormOpen) {
        // This would be handled by the form component
        alert(`音声入力完了:\n${mockTranscription}`);
      } else {
        // Create new memo with transcribed content
        setEditingMemo({
          id: 0,
          title: '音声入力メモ',
          content: mockTranscription,
          tags: ['音声入力'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setIsFormOpen(true);
      }
    } else {
      // Start recording
      setIsRecording(true);
      
      // Mock recording for 3 seconds
      setTimeout(() => {
        handleVoiceRecord();
      }, 3000);
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="memo-page">
          <div className="memo-header">
            <h2>📝 メモ</h2>
          </div>
          <div className="loading-message">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="memo-page">
          <div className="memo-header">
            <h2>📝 メモ</h2>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="memo-page">
        {/* Header */}
        <div className="memo-header">
          <h2>📝 メモ</h2>
          <div className="memo-actions">
            <button 
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceRecord}
              title={isRecording ? '録音停止' : '音声入力'}
            >
              🎤 {isRecording ? '停止' : '音声入力'}
            </button>
            <button className="create-button" onClick={handleCreateMemo}>
              ➕ 新規メモ
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="memo-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="メモを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="tag-filters">
              <span className="filter-label">タグ:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTagFilter(tag)}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  className="clear-filters"
                  onClick={() => setSelectedTags([])}
                >
                  クリア
                </button>
              )}
            </div>
          )}
        </div>

        {/* Two-pane layout */}
        <div className="memo-content">
          {/* Left pane: Memo list */}
          <div className="memo-list-pane">
            {filteredMemos.length === 0 ? (
              <div className="empty-state">
                <p>メモがありません</p>
                <button className="create-button" onClick={handleCreateMemo}>
                  最初のメモを作成
                </button>
              </div>
            ) : (
              <div className="memo-list">
                {filteredMemos.map(memo => (
                  <div
                    key={memo.id}
                    className={`memo-item ${selectedMemo?.id === memo.id ? 'selected' : ''}`}
                    onClick={() => handleMemoSelect(memo)}
                  >
                    <div className="memo-item-header">
                      <h3 className="memo-item-title">{memo.title}</h3>
                      <div className="memo-item-actions">
                        <button
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMemo(memo);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMemo(memo.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {memo.tags && memo.tags.length > 0 && (
                      <div className="memo-item-tags">
                        {memo.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="memo-item-preview">
                      {memo.content.length > 100 
                        ? `${memo.content.substring(0, 100)}...` 
                        : memo.content}
                    </div>
                    
                    <div className="memo-item-date">
                      {new Date(memo.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right pane: Preview */}
          <div className="memo-preview-pane">
            {selectedMemo ? (
              <div className="memo-preview">
                <div className="memo-preview-header">
                  <h1 className="memo-preview-title">{selectedMemo.title}</h1>
                  <div className="memo-preview-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditMemo(selectedMemo)}
                    >
                      ✏️ 編集
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteMemo(selectedMemo.id)}
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
                
                {selectedMemo.tags && selectedMemo.tags.length > 0 && (
                  <div className="memo-preview-tags">
                    {selectedMemo.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="memo-preview-content">
                  {selectedMemo.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                
                <div className="memo-preview-meta">
                  <div>作成: {new Date(selectedMemo.created_at).toLocaleDateString('ja-JP')}</div>
                  {selectedMemo.updated_at !== selectedMemo.created_at && (
                    <div>更新: {new Date(selectedMemo.updated_at).toLocaleDateString('ja-JP')}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="memo-preview-empty">
                <p>メモを選択すると、ここに内容が表示されます</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <MemoForm
            memo={editingMemo}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingMemo(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Memo Form Component
interface MemoFormProps {
  memo: Memo | null;
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(memo?.title || '');
  const [content, setContent] = useState(memo?.content || '');
  const [tags, setTags] = useState<string[]>(memo?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim(), tags });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content memo-form">
        <h3>{memo ? 'メモを編集' : '新規メモ'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">タイトル *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="メモのタイトル"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">タグ</label>
            <div className="tag-input-container">
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="タグを入力してEnter"
              />
              <button type="button" onClick={addTag}>追加</button>
            </div>
            
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="content">内容 *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="メモの内容"
              rows={10}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel}>
              キャンセル
            </button>
            <button type="submit">
              {memo ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoPage;