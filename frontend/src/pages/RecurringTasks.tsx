import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { taskAPI } from '../services/api';
import { RecurringTask, RecurringTaskFormData, CreateRecurringTaskData } from '../components/TaskList';
import RecurringTaskForm from '../components/RecurringTaskForm';

type SortOption = 'priority' | 'created_date' | 'title';
type SortOrder = 'asc' | 'desc';

const RecurringTasks: React.FC = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 初期表示時に繰り返しタスク一覧を取得
  useEffect(() => {
    loadRecurringTasks();
  }, []);

  /**
   * 繰り返しタスク一覧をAPIから取得
   */
  const loadRecurringTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasks = await taskAPI.getRecurringTasks();
      setRecurringTasks(tasks as RecurringTask[]);
    } catch (err) {
      console.error('繰り返しタスク取得エラー:', err);
      setError('繰り返しタスクの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 繰り返しタスクを削除
   */
  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('この繰り返しタスクを削除しますか？\n関連する日次タスクもすべて削除されます。')) {
      return;
    }

    try {
      setError(null);
      await taskAPI.deleteTask(taskId);
      await loadRecurringTasks();
    } catch (err) {
      console.error('繰り返しタスク削除エラー:', err);
      setError('繰り返しタスクの削除に失敗しました。');
    }
  };

  /**
   * 繰り返しタスク作成処理
   */
  const handleCreateTask = useCallback(async (formData: RecurringTaskFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // APIリクエスト用のデータを準備
      const taskData: CreateRecurringTaskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        is_recurring: true,
        recurring_pattern: 'daily',
        recurring_config: {
          time: formData.time
        },
        display_order: formData.display_order || 1,
        points: formData.points || 0
      };

      await taskAPI.createRecurringTask(taskData);
      await loadRecurringTasks();
      setShowCreateForm(false);
    } catch (err) {
      console.error('繰り返しタスク作成エラー:', err);
      setError('繰り返しタスクの作成に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 作成フォームをキャンセル
   */
  const handleCancelCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  /**
   * 編集フォームをキャンセル
   */
  const handleCancelEditForm = useCallback(() => {
    setShowEditForm(false);
    setEditingTask(null);
  }, []);

  /**
   * 繰り返しタスク編集処理
   */
  const handleEditTask = useCallback((task: RecurringTask) => {
    setEditingTask(task);
    setShowEditForm(true);
  }, []);

  /**
   * 繰り返しタスク更新処理
   */
  const handleUpdateTask = useCallback(async (formData: RecurringTaskFormData) => {
    if (!editingTask) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // デバッグログ: フォームデータの内容確認
      console.log('handleUpdateTask - フォームデータ受信:', formData);
      console.log('handleUpdateTask - ポイント値:', formData.points, 'タイプ:', typeof formData.points);
      
      // APIリクエスト用のデータを準備
      const taskData: CreateRecurringTaskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        is_recurring: true,
        recurring_pattern: 'daily',
        recurring_config: {
          time: formData.time
        },
        display_order: formData.display_order || 1,
        points: formData.points || 0
      };
      
      // デバッグログ: APIリクエストデータの内容確認
      console.log('handleUpdateTask - APIリクエストデータ:', taskData);
      console.log('handleUpdateTask - 送信するポイント値:', taskData.points);

      await taskAPI.updateRecurringTask(editingTask.id, taskData);
      await loadRecurringTasks();
      setShowEditForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('繰り返しタスク更新エラー:', err);
      setError('繰り返しタスクの更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [editingTask]);

  /**
   * 設定されている時間を表示用に整形
   */
  const formatScheduledTime = (config: RecurringTask['recurring_config']): string => {
    if (config && config.time) {
      return config.time;
    }
    return '時間未設定';
  };

  /**
   * 優先度に応じた色を取得
   */
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  /**
   * 優先度ラベルを取得
   */
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high': return '高優先度';
      case 'medium': return '中優先度';
      case 'low': return '低優先度';
      default: return '未設定';
    }
  };

  /**
   * 優先度の数値を取得（ソート用）
   */
  const getPriorityValue = (priority: string): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  /**
   * タスクをソートする
   */
  const sortTasks = useCallback((tasks: RecurringTask[]): RecurringTask[] => {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
          break;
        case 'created_date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [sortBy, sortOrder]);

  /**
   * ソートされたタスク一覧を取得
   */
  const sortedTasks = useMemo(() => {
    return sortTasks(recurringTasks);
  }, [recurringTasks, sortTasks]);

  /**
   * ソート設定を変更
   */
  const handleSortChange = useCallback((newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      // 同じカラムを選択した場合は順序を反転
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 異なるカラムを選択した場合は新しいカラムで降順から開始
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  return (
    <div className="page-container">

      {/* アクションボタンとソート制御 */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ 新規作成
        </button>
        
        <div className="sort-controls">
          <span className="sort-label">並び順:</span>
          <button
            className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
            onClick={() => handleSortChange('priority')}
          >
            🎯 優先度
            {sortBy === 'priority' && (
              <span className="sort-icon">
                {sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </span>
            )}
          </button>
          <button
            className={`sort-btn ${sortBy === 'created_date' ? 'active' : ''}`}
            onClick={() => handleSortChange('created_date')}
          >
            📅 作成日
            {sortBy === 'created_date' && (
              <span className="sort-icon">
                {sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </span>
            )}
          </button>
          <button
            className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
            onClick={() => handleSortChange('title')}
          >
            📝 タイトル
            {sortBy === 'title' && (
              <span className="sort-icon">
                {sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="loading-message">
          読み込み中...
        </div>
      )}

      {/* 繰り返しタスク一覧 */}
      <div className="recurring-tasks-list">
        {recurringTasks.length === 0 && !loading ? (
          <div className="empty-state">
            <p>📅 繰り返しタスクがありません</p>
            <p>「新規作成」ボタンから毎日実行するタスクを作成してください。</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className="recurring-task-card">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-schedule">
                  🕐 毎日 {formatScheduledTime(task.recurring_config)}
                </div>
              </div>
              
              <div className="task-description">
                {task.description}
              </div>
              
              <div className="task-meta">
                <span 
                  className="priority-badge"
                  style={{ 
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  {getPriorityLabel(task.priority)}
                </span>
                <span className="status-badge">
                  {task.status === 'pending' ? '🟢 アクティブ' : '⚪ 非アクティブ'}
                </span>
              </div>
              
              <div className="task-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditTask(task)}
                  disabled={loading}
                >
                  ✏️ 編集
                </button>
                <button className="btn btn-secondary btn-sm">
                  👁️ プレビュー
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={loading}
                >
                  🗑️ 削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 作成フォーム */}
      {showCreateForm && (
        <div 
          className="modal-overlay" 
          onClick={handleCancelCreateForm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <RecurringTaskForm
              onSubmit={handleCreateTask}
              onCancel={handleCancelCreateForm}
              loading={loading}
              mode="create"
            />
          </div>
        </div>
      )}

      {/* 編集フォーム */}
      {showEditForm && editingTask && (
        <div 
          className="modal-overlay" 
          onClick={handleCancelEditForm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <RecurringTaskForm
              onSubmit={handleUpdateTask}
              onCancel={handleCancelEditForm}
              loading={loading}
              mode="edit"
              editingTask={editingTask}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTasks;