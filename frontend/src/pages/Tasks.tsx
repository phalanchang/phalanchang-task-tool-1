import React, { useState, useEffect } from 'react';
import TaskList, { Task, CreateTaskData } from '../components/TaskList';
import TaskCreationModal from '../components/TaskCreationModal';
import NotificationBadge from '../components/NotificationBadge';
import { taskAPI, UpdateTaskData } from '../services/api';
import { useDailyTaskCount } from '../hooks/useDailyTaskCount';
import { useDailyTaskRefresh } from '../contexts/DailyTaskContext';

// タブの種類
type TabType = 'all' | 'daily';

const Tasks: React.FC = () => {
  // ステート管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  
  // Daily タスクの未完了数を取得
  const { count: dailyTaskCount } = useDailyTaskCount();
  
  // バッジ更新トリガー
  const { triggerRefresh } = useDailyTaskRefresh();

  // 初期表示時にタスク一覧を取得
  useEffect(() => {
    loadTasks();
    loadDailyTasks();
  }, []);

  /**
   * タスク一覧をAPIから取得
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskAPI.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('タスク取得エラー:', err);
      setError('エラーが発生しました。タスクの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  /**
   * デイリータスク一覧をAPIから取得（自動生成も実行）
   */
  const loadDailyTasks = async () => {
    try {
      setError(null);
      // まず今日分のタスクを自動生成
      await taskAPI.generateTodayTasks();
      // その後デイリータスクを取得
      const fetchedDailyTasks = await taskAPI.getDailyTasks();
      setDailyTasks(fetchedDailyTasks);
    } catch (err) {
      console.error('デイリータスク取得エラー:', err);
      setError('エラーが発生しました。デイリータスクの取得に失敗しました。');
    }
  };

  /**
   * 新しいタスクを作成
   */
  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      setError(null);
      await taskAPI.createTask(taskData);
      await loadTasks();
      setIsCreateModalOpen(false); // モーダルを閉じる
      // 通常タスク作成時はデイリータスク更新不要
    } catch (err) {
      console.error('タスク作成エラー:', err);
      setError('エラーが発生しました。タスクの作成に失敗しました。');
    }
  };

  /**
   * タスクのステータスを切り替え
   */
  const handleToggleStatus = async (task: Task) => {
    try {
      setError(null);
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await taskAPI.updateTask(task.id, { status: newStatus });
      
      // 更新されたタスクがデイリータスクかどうか確認
      const isDaily = task.source_task_id !== undefined && task.source_task_id !== null;
      
      await loadTasks();
      if (isDaily) {
        // デイリータスクの場合のみ再取得（生成は行わない）
        const fetchedDailyTasks = await taskAPI.getDailyTasks();
        setDailyTasks(fetchedDailyTasks);
      }
      
      // ポイント表示をリアルタイム更新（デイリー・通常タスク両方対応）
      triggerRefresh();
    } catch (err) {
      console.error('タスク更新エラー:', err);
      setError('エラーが発生しました。タスクの更新に失敗しました。');
    }
  };

  /**
   * タスクを編集
   */
  const handleEditTask = async (task: Task, updateData: UpdateTaskData) => {
    try {
      setError(null);
      await taskAPI.updateTask(task.id, updateData);
      
      // 更新されたタスクがデイリータスクかどうか確認
      const isDaily = task.source_task_id !== undefined && task.source_task_id !== null;
      
      await loadTasks();
      if (isDaily) {
        // デイリータスクの場合のみ再取得（生成は行わない）
        const fetchedDailyTasks = await taskAPI.getDailyTasks();
        setDailyTasks(fetchedDailyTasks);
      }
      
      // ポイント表示をリアルタイム更新（デイリー・通常タスク両方対応）
      triggerRefresh();
    } catch (err) {
      console.error('タスク編集エラー:', err);
      setError('エラーが発生しました。タスクの編集に失敗しました。');
    }
  };

  /**
   * タスクを削除
   */
  const handleDeleteTask = async (task: Task) => {
    try {
      setError(null);
      await taskAPI.deleteTask(task.id);
      
      // 削除されたタスクがデイリータスクかどうか確認
      const isDaily = task.source_task_id !== undefined && task.source_task_id !== null;
      
      await loadTasks();
      if (isDaily) {
        // デイリータスクの場合のみ再取得（生成は行わない）
        const fetchedDailyTasks = await taskAPI.getDailyTasks();
        setDailyTasks(fetchedDailyTasks);
        
        // バッジをリアルタイム更新
        triggerRefresh();
      }
    } catch (err) {
      console.error('タスク削除エラー:', err);
      setError('エラーが発生しました。タスクの削除に失敗しました。');
    }
  };

  /**
   * タブ切り替え処理
   */
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  /**
   * 完了タスクの表示/非表示切り替え
   */
  const handleToggleCompletedTasks = () => {
    setShowCompletedTasks(!showCompletedTasks);
  };

  /**
   * フィルタリングされたデイリータスクを取得（表示順番でソート）
   */
  const getFilteredDailyTasks = () => {
    let filteredTasks = showCompletedTasks 
      ? dailyTasks 
      : dailyTasks.filter(task => task.status !== 'completed');
    
    // 表示順番でソート（display_orderがある場合はそれを使用、ない場合はidを使用）
    return filteredTasks.sort((a, b) => {
      const orderA = ('display_order' in a && a.display_order !== undefined && a.display_order !== null) ? a.display_order : a.id;
      const orderB = ('display_order' in b && b.display_order !== undefined && b.display_order !== null) ? b.display_order : b.id;
      return Number(orderA || 0) - Number(orderB || 0);
    });
  };


  return (
    <div className="page-container">
      
      {/* タブナビゲーション */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          📑 すべてのタスク ({tasks.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => handleTabChange('daily')}
        >
          ☀️ デイリータスク ({dailyTasks.length})
          <NotificationBadge count={dailyTaskCount} />
        </button>
      </div>

      <div className="tasks-content">
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

        {/* タブ別のコンテンツ */}
        {activeTab === 'all' && (
          <>
            <div className="tab-content-header">
              <h3>📑 すべてのタスク</h3>
              <p>通常タスクと繰り返しタスクのすべてが表示されます</p>
              
              {/* タスク作成ボタン */}
              <div className="create-task-button-container">
                <button 
                  className="btn btn-primary create-task-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={loading}
                >
                  ✨ 新しいタスクを作成
                </button>
              </div>
            </div>
            
            {/* すべてのタスク一覧 */}
            <TaskList 
              tasks={tasks} 
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
              onToggleStatus={handleToggleStatus} 
            />
          </>
        )}

        {activeTab === 'daily' && (
          <>
            <div className="tab-content-header">
              <h3>☀️ 今日のデイリータスク</h3>
              <p>{new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })} のタスクです</p>
              
              {/* 完了タスク表示/非表示切り替えボタン */}
              <div className="daily-task-controls">
                <button 
                  className={`toggle-completed-btn ${showCompletedTasks ? 'active' : ''}`}
                  onClick={handleToggleCompletedTasks}
                >
                  {showCompletedTasks ? '✅ 完了タスクを表示中' : '❌ 完了タスクを非表示中'}
                </button>
              </div>
            </div>
            
            {/* デイリータスク一覧 */}
            <TaskList 
              tasks={getFilteredDailyTasks()} 
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
              onToggleStatus={handleToggleStatus} 
            />

            {getFilteredDailyTasks().length === 0 && dailyTasks.length > 0 && !loading && (
              <div className="empty-state">
                <p>🔍 条件に一致するタスクがありません</p>
                <p>完了タスクの表示設定を変更してみてください。</p>
              </div>
            )}

            {dailyTasks.length === 0 && !loading && (
              <div className="empty-state">
                <p>📅 今日のデイリータスクがありません</p>
                <p>繰り返しタスクを作成すると、自動的に毎日のタスクが生成されます。</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* タスク作成モーダル */}
      <TaskCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        loading={loading}
      />
    </div>
  );
};

export default Tasks;