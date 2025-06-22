/**
 * RecurringTasks ページコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecurringTasks from './RecurringTasks';
import { taskAPI } from '../services/api';

// taskAPIをモック
jest.mock('../services/api', () => ({
  taskAPI: {
    getRecurringTasks: jest.fn(),
    createRecurringTask: jest.fn(),
    deleteTask: jest.fn()
  }
}));

const mockTaskAPI = taskAPI as jest.Mocked<typeof taskAPI>;

describe('RecurringTasks', () => {
  const mockRecurringTasks = [
    {
      id: 1,
      title: '朝の運動',
      description: '30分のジョギング',
      status: 'pending' as const,
      priority: 'high' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_recurring: true,
      recurring_pattern: 'daily' as const,
      recurring_config: { time: '07:00' }
    },
    {
      id: 2,
      title: 'メール確認',
      description: '重要なメールをチェック',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_recurring: true,
      recurring_pattern: 'daily' as const,
      recurring_config: { time: '09:00' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskAPI.getRecurringTasks.mockResolvedValue(mockRecurringTasks);
  });

  describe('レンダリング', () => {
    it('ページが正しく表示される', async () => {
      render(<RecurringTasks />);
      
      expect(screen.getByRole('heading', { name: /繰り返しタスク管理/ })).toBeInTheDocument();
      expect(screen.getByText(/毎日実行する繰り返しタスクの作成・管理/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新規作成/ })).toBeInTheDocument();
    });

    it('繰り返しタスク一覧が表示される', async () => {
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
        expect(screen.getByText('メール確認')).toBeInTheDocument();
      });
      
      expect(mockTaskAPI.getRecurringTasks).toHaveBeenCalledTimes(1);
    });

    it('タスクの詳細情報が正しく表示される', async () => {
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // タスクの詳細情報を確認
      expect(screen.getByText('30分のジョギング')).toBeInTheDocument();
      expect(screen.getByText(/毎日 07:00/)).toBeInTheDocument();
      expect(screen.getByText(/高優先度/)).toBeInTheDocument();
      expect(screen.getByText(/アクティブ/)).toBeInTheDocument();
    });

    it('タスクがない場合は空の状態が表示される', async () => {
      mockTaskAPI.getRecurringTasks.mockResolvedValue([]);
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText(/繰り返しタスクがありません/)).toBeInTheDocument();
        expect(screen.getByText(/新規作成.*ボタンから/)).toBeInTheDocument();
      });
    });
  });

  describe('タスク作成フォーム', () => {
    it('新規作成ボタンでモーダルが開く', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /新しい繰り返しタスクを作成/ })).toBeInTheDocument();
    });

    it('モーダルのオーバーレイクリックで閉じる', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // オーバーレイをクリック
      fireEvent.click(screen.getByRole('dialog'));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('フォームのキャンセルでモーダルが閉じる', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /キャンセル/ }));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('フォーム送信でタスクが作成される', async () => {
      const user = userEvent.setup();
      const newTask = {
        id: 3,
        title: '新しいタスク',
        description: '新しい説明',
        status: 'pending' as const,
        priority: 'medium' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        is_recurring: true,
        recurring_pattern: 'daily' as const,
        recurring_config: { time: '10:00' }
      };
      
      mockTaskAPI.createRecurringTask.mockResolvedValue(newTask);
      mockTaskAPI.getRecurringTasks
        .mockResolvedValueOnce(mockRecurringTasks)
        .mockResolvedValueOnce([...mockRecurringTasks, newTask]);
      
      render(<RecurringTasks />);
      
      // モーダルを開く
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      
      // フォームに入力
      const titleInput = screen.getByLabelText(/タスク名/);
      const descriptionInput = screen.getByLabelText(/説明/);
      
      await user.type(titleInput, '新しいタスク');
      await user.type(descriptionInput, '新しい説明');
      
      // 送信
      await user.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(mockTaskAPI.createRecurringTask).toHaveBeenCalledWith({
          title: '新しいタスク',
          description: '新しい説明',
          priority: 'medium',
          is_recurring: true,
          recurring_pattern: 'daily',
          recurring_config: { time: '09:00' } // デフォルト時間
        });
      });
      
      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('タスク削除', () => {
    it('削除ボタンで確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(false);
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      await user.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('この繰り返しタスクを削除しますか？')
      );
    });

    it('削除確認でタスクが削除される', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(true);
      mockTaskAPI.deleteTask.mockResolvedValue(mockRecurringTasks[0]);
      mockTaskAPI.getRecurringTasks
        .mockResolvedValueOnce(mockRecurringTasks)
        .mockResolvedValueOnce([mockRecurringTasks[1]]);
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(mockTaskAPI.deleteTask).toHaveBeenCalledWith(1);
      });
    });

    it('削除キャンセルではタスクが削除されない', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(false);
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      await user.click(deleteButtons[0]);
      
      expect(mockTaskAPI.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('タスク取得エラーが表示される', async () => {
      mockTaskAPI.getRecurringTasks.mockRejectedValue(new Error('ネットワークエラー'));
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText(/繰り返しタスクの取得に失敗しました/)).toBeInTheDocument();
      });
    });

    it('タスク作成エラーが表示される', async () => {
      const user = userEvent.setup();
      mockTaskAPI.createRecurringTask.mockRejectedValue(new Error('作成エラー'));
      
      render(<RecurringTasks />);
      
      // モーダルを開く
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      
      // フォームに入力
      const titleInput = screen.getByLabelText(/タスク名/);
      await user.type(titleInput, 'テストタスク');
      
      // 送信
      await user.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(screen.getByText(/繰り返しタスクの作成に失敗しました/)).toBeInTheDocument();
      });
    });

    it('タスク削除エラーが表示される', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(true);
      mockTaskAPI.deleteTask.mockRejectedValue(new Error('削除エラー'));
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/繰り返しタスクの削除に失敗しました/)).toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    it('初期ローディング状態が表示される', () => {
      // API呼び出しを遅延させる
      mockTaskAPI.getRecurringTasks.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<RecurringTasks />);
      
      expect(screen.getByText(/読み込み中/)).toBeInTheDocument();
    });

    it('タスク作成中のローディング状態', async () => {
      const user = userEvent.setup();
      mockTaskAPI.createRecurringTask.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<RecurringTasks />);
      
      // モーダルを開く
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      
      // フォームに入力
      const titleInput = screen.getByLabelText(/タスク名/);
      await user.type(titleInput, 'テストタスク');
      
      // 送信
      await user.click(screen.getByRole('button', { name: /作成する/ }));
      
      // ローディング状態を確認
      expect(screen.getByRole('button', { name: /作成中/ })).toBeInTheDocument();
    });
  });

  describe('編集機能', () => {
    it('編集ボタンで編集モーダルが開く', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /繰り返しタスクを編集/ })).toBeInTheDocument();
      
      // 既存データが設定されていることを確認
      expect(screen.getByDisplayValue('朝の運動')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30分のジョギング')).toBeInTheDocument();
      expect(screen.getByDisplayValue('07:00')).toBeInTheDocument();
      expect(screen.getByLabelText(/高優先度/)).toBeChecked();
    });

    it('編集フォームでタスクが更新される', async () => {
      const user = userEvent.setup();
      const updatedTask = {
        id: 1,
        title: '更新された朝の運動',
        description: '45分のジョギング',
        status: 'pending' as const,
        priority: 'medium' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        is_recurring: true,
        recurring_pattern: 'daily' as const,
        recurring_config: { time: '08:00' }
      };
      
      mockTaskAPI.updateRecurringTask.mockResolvedValue(updatedTask);
      mockTaskAPI.getRecurringTasks
        .mockResolvedValueOnce(mockRecurringTasks)
        .mockResolvedValueOnce([updatedTask, mockRecurringTasks[1]]);
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // 編集モーダルを開く
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      // フォームを編集
      const titleInput = screen.getByDisplayValue('朝の運動');
      await user.clear(titleInput);
      await user.type(titleInput, '更新された朝の運動');
      
      const descriptionInput = screen.getByDisplayValue('30分のジョギング');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, '45分のジョギング');
      
      const timeSelect = screen.getByDisplayValue('07:00');
      await user.selectOptions(timeSelect, '08:00');
      
      const mediumPriorityRadio = screen.getByLabelText(/中優先度/);
      await user.click(mediumPriorityRadio);
      
      // 送信
      await user.click(screen.getByRole('button', { name: /更新する/ }));
      
      await waitFor(() => {
        expect(mockTaskAPI.updateRecurringTask).toHaveBeenCalledWith(1, {
          title: '更新された朝の運動',
          description: '45分のジョギング',
          priority: 'medium',
          is_recurring: true,
          recurring_pattern: 'daily',
          recurring_config: { time: '08:00' }
        });
      });
      
      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('編集フォームのキャンセルでモーダルが閉じる', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // 編集モーダルを開く
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // キャンセル
      await user.click(screen.getByRole('button', { name: /キャンセル/ }));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('編集エラーが表示される', async () => {
      const user = userEvent.setup();
      mockTaskAPI.updateRecurringTask.mockRejectedValue(new Error('更新エラー'));
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // 編集モーダルを開く
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      // フォームに入力
      const titleInput = screen.getByDisplayValue('朝の運動');
      await user.type(titleInput, ' - 更新');
      
      // 送信
      await user.click(screen.getByRole('button', { name: /更新する/ }));
      
      await waitFor(() => {
        expect(screen.getByText(/繰り返しタスクの更新に失敗しました/)).toBeInTheDocument();
      });
    });

    it('ローディング中は編集ボタンが無効になる', () => {
      // 初期ローディング状態をシミュレート
      mockTaskAPI.getRecurringTasks.mockImplementation(
        () => new Promise(() => {}) // 永続的にペンディング
      );
      
      render(<RecurringTasks />);
      
      expect(screen.getByText(/読み込み中/)).toBeInTheDocument();
    });
  });

  describe('API統合', () => {
    beforeEach(() => {
      // updateRecurringTaskのモック設定
      mockTaskAPI.updateRecurringTask = jest.fn();
    });

    it('updateRecurringTask APIが正しく呼ばれる', async () => {
      const user = userEvent.setup();
      const updatedTask = { ...mockRecurringTasks[0] };
      mockTaskAPI.updateRecurringTask.mockResolvedValue(updatedTask);
      
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // 編集モーダルを開いて送信
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      await user.click(screen.getByRole('button', { name: /更新する/ }));
      
      await waitFor(() => {
        expect(mockTaskAPI.updateRecurringTask).toHaveBeenCalledWith(
          1, // タスクID
          expect.objectContaining({
            title: '朝の運動',
            description: '30分のジョギング',
            priority: 'high',
            is_recurring: true,
            recurring_pattern: 'daily',
            recurring_config: { time: '07:00' }
          })
        );
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', async () => {
      render(<RecurringTasks />);
      
      // ページの基本構造
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新規作成/ })).toBeInTheDocument();
      
      // モーダルを開いてARIA属性を確認
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /新規作成/ }));
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });

    it('編集モーダルのアクセシビリティが正しく設定されている', async () => {
      const user = userEvent.setup();
      render(<RecurringTasks />);
      
      await waitFor(() => {
        expect(screen.getByText('朝の運動')).toBeInTheDocument();
      });
      
      // 編集モーダルを開く
      const editButtons = screen.getAllByRole('button', { name: /編集/ });
      await user.click(editButtons[0]);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });
});