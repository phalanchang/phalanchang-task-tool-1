import React, { useState, useEffect } from 'react';
import './App.css';
import TaskList, { Task } from './components/TaskList';
import TaskForm from './components/TaskForm';
import { taskAPI, CreateTaskData, UpdateTaskData } from './services/api';

function App() {
  // ステート管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 初期表示時にタスク一覧を取得
  useEffect(() => {
    loadTasks();
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
   * 新しいタスクを作成
   */
  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      setError(null);
      await taskAPI.createTask(taskData);
      // 作成後に一覧を再取得
      await loadTasks();
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
      // 更新後に一覧を再取得
      await loadTasks();
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
      // 更新後に一覧を再取得
      await loadTasks();
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
      // 削除後に一覧を再取得
      await loadTasks();
    } catch (err) {
      console.error('タスク削除エラー:', err);
      setError('エラーが発生しました。タスクの削除に失敗しました。');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>タスク管理アプリ</h1>
      </header>
      <main>
        {/* エラーメッセージ表示 */}
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            margin: '10px 0', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}
        
        {/* ローディング表示 */}
        {loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            読み込み中...
          </div>
        )}
        
        {/* タスク作成フォーム */}
        <TaskForm onSubmit={handleCreateTask} />
        
        {/* タスク一覧 */}
        <TaskList 
          tasks={tasks} 
          onEdit={handleEditTask} 
          onDelete={handleDeleteTask} 
          onToggleStatus={handleToggleStatus} 
        />
      </main>
    </div>
  );
}

export default App;
