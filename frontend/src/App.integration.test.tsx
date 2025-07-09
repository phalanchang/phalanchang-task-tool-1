/**
 * App コンポーネントの統合テスト
 * 
 * TDD: API連携を含む実際の動作をテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { taskAPI } from './services/api';

// API をモック化
jest.mock('./services/api');
const mockTaskAPI = taskAPI as jest.Mocked<typeof taskAPI>;

describe('App コンポーネント統合テスト', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期表示時にタスク一覧をAPIから取得すること', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'APIから取得したタスク',
        description: 'API連携テスト',
        status: 'pending' as const,
        priority: 'medium' as const,
        created_at: '2025-06-17T10:00:00.000Z',
        updated_at: '2025-06-17T10:00:00.000Z'
      }
    ];

    mockTaskAPI.getAllTasks.mockResolvedValue(mockTasks);

    render(<App />);

    // APIが呼ばれることを確認
    expect(mockTaskAPI.getAllTasks).toHaveBeenCalledTimes(1);

    // タスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('APIから取得したタスク')).toBeInTheDocument();
    });
  });

  test('新しいタスクを作成して一覧に追加されること', async () => {
    // 初期は空のタスク一覧
    mockTaskAPI.getAllTasks.mockResolvedValue([]);
    
    const newTask = {
      id: 1,
      title: '新規作成タスク',
      description: '統合テスト用',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2025-06-17T10:00:00.000Z',
      updated_at: '2025-06-17T10:00:00.000Z'
    };

    mockTaskAPI.createTask.mockResolvedValue(newTask);
    mockTaskAPI.getAllTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([newTask]);

    const user = userEvent.setup();
    render(<App />);

    // フォームに入力
    const titleInput = screen.getByLabelText('タイトル');
    const descriptionInput = screen.getByLabelText('説明');
    const submitButton = screen.getByRole('button', { name: 'タスクを追加' });

    await user.type(titleInput, '新規作成タスク');
    await user.type(descriptionInput, '統合テスト用');

    // フォーム送信
    fireEvent.click(submitButton);

    // API が呼ばれることを確認
    await waitFor(() => {
      expect(mockTaskAPI.createTask).toHaveBeenCalledWith({
        title: '新規作成タスク',
        description: '統合テスト用',
        priority: 'medium'
      });
    });

    // 再度一覧取得が呼ばれることを確認
    await waitFor(() => {
      expect(mockTaskAPI.getAllTasks).toHaveBeenCalledTimes(2);
    });
  });

  test('タスクのステータスを更新できること', async () => {
    const originalTask = {
      id: 1,
      title: 'ステータス更新テスト',
      description: 'テスト用',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2025-06-17T10:00:00.000Z',
      updated_at: '2025-06-17T10:00:00.000Z'
    };

    const updatedTask = {
      ...originalTask,
      status: 'completed' as const,
      updated_at: '2025-06-17T11:00:00.000Z'
    };

    mockTaskAPI.getAllTasks.mockResolvedValueOnce([originalTask]).mockResolvedValueOnce([updatedTask]);
    mockTaskAPI.updateTask.mockResolvedValue(updatedTask);

    render(<App />);

    // 最初のタスクが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('ステータス更新テスト')).toBeInTheDocument();
    });

    // ステータス切り替えボタンをクリック（実装されたら）
    // 注意: この時点ではボタンがまだ実装されていないため、テストは失敗する予定
  });

  test('タスクを削除できること', async () => {
    const taskToDelete = {
      id: 1,
      title: '削除対象タスク',
      description: '削除テスト用',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2025-06-17T10:00:00.000Z',
      updated_at: '2025-06-17T10:00:00.000Z'
    };

    mockTaskAPI.getAllTasks.mockResolvedValueOnce([taskToDelete]).mockResolvedValueOnce([]);
    mockTaskAPI.deleteTask.mockResolvedValue(taskToDelete);

    render(<App />);

    // タスクが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('削除対象タスク')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // API が呼ばれることを確認
    await waitFor(() => {
      expect(mockTaskAPI.deleteTask).toHaveBeenCalledWith(1);
    });

    // 再度一覧取得が呼ばれることを確認
    await waitFor(() => {
      expect(mockTaskAPI.getAllTasks).toHaveBeenCalledTimes(2);
    });
  });

  test('API エラー時にエラーメッセージが表示されること', async () => {
    mockTaskAPI.getAllTasks.mockRejectedValue(new Error('サーバーエラー'));

    render(<App />);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    });
  });
});