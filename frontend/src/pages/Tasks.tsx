import React, { useState, useEffect } from 'react';
import TaskList, { Task } from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { taskAPI, CreateTaskData, UpdateTaskData } from '../services/api';

// タブの種類
type TabType = 'all' | 'daily';

const Tasks: React.FC = () => {
  // ステート管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

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
      await loadDailyTasks(); // デイリータスクも更新
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
      await loadTasks();
      await loadDailyTasks(); // デイリータスクも更新
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
      await loadTasks();
      await loadDailyTasks(); // デイリータスクも更新
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
      await loadTasks();
      await loadDailyTasks(); // デイリータスクも更新
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
   * 表示するタスク一覧を取得
   */
  const getDisplayTasks = (): Task[] => {
    return activeTab === 'daily' ? dailyTasks : tasks;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>📋 タスク管理</h2>
        <p>タスクの作成・編集・管理を行います</p>
      </header>
      
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
            </div>
            
            {/* タスク作成フォーム */}
            <TaskForm onSubmit={handleCreateTask} />
            
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
            </div>
            
            {/* デイリータスク一覧 */}
            <TaskList 
              tasks={dailyTasks} 
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
              onToggleStatus={handleToggleStatus} 
            />

            {dailyTasks.length === 0 && !loading && (
              <div className="empty-state">
                <p>📅 今日のデイリータスクがありません</p>
                <p>繰り返しタスクを作成すると、自動的に毎日のタスクが生成されます。</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;