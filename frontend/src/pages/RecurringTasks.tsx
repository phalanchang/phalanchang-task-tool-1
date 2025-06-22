import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import { RecurringTask, RecurringTaskFormData, CreateRecurringTaskData } from '../components/TaskList';
import RecurringTaskForm from '../components/RecurringTaskForm';

const RecurringTasks: React.FC = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

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
        }
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
   * フォームをキャンセル
   */
  const handleCancelForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

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

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>🔄 繰り返しタスク管理</h2>
        <p>毎日実行する繰り返しタスクの作成・管理を行います</p>
      </header>

      {/* アクションボタン */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ 新規作成
        </button>
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
          recurringTasks.map(task => (
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
                <button className="btn btn-secondary btn-sm">
                  ✏️ 編集
                </button>
                <button className="btn btn-secondary btn-sm">
                  👁️ プレビュー
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteTask(task.id)}
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
          onClick={handleCancelForm}
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
              onCancel={handleCancelForm}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTasks;