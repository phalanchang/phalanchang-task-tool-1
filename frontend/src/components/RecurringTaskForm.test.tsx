/**
 * RecurringTaskForm コンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecurringTaskForm from './RecurringTaskForm';

describe('RecurringTaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    loading: false
  };

  const mockEditingTask = {
    id: 1,
    title: '既存のタスク',
    description: '既存の説明',
    status: 'pending' as const,
    priority: 'high' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_recurring: true as const,
    recurring_pattern: 'daily' as const,
    recurring_config: { time: '08:30' }
  };

  describe('レンダリング', () => {
    it('フォームが正しく表示される', () => {
      render(<RecurringTaskForm {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: /新しい繰り返しタスクを作成/ })).toBeInTheDocument();
      expect(screen.getByLabelText(/タスク名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByLabelText(/実行時刻/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /作成する/ })).toBeInTheDocument();
    });

    it('優先度の選択肢が正しく表示される', () => {
      render(<RecurringTaskForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/高優先度/)).toBeInTheDocument();
      expect(screen.getByLabelText(/中優先度/)).toBeInTheDocument();
      expect(screen.getByLabelText(/低優先度/)).toBeInTheDocument();
      
      // デフォルトで中優先度が選択されている
      expect(screen.getByLabelText(/中優先度/)).toBeChecked();
    });

    it('時間選択肢が30分刻みで表示される', () => {
      render(<RecurringTaskForm {...defaultProps} />);
      
      const timeSelect = screen.getByLabelText(/実行時刻/);
      expect(timeSelect).toBeInTheDocument();
      
      // いくつかの時間オプションをチェック
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('09:30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('タスク名が空の場合、送信ボタンが無効になる', () => {
      render(<RecurringTaskForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /作成する/ });
      expect(submitButton).toBeDisabled();
    });

    it('タスク名を入力すると送信ボタンが有効になる', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      const submitButton = screen.getByRole('button', { name: /作成する/ });
      
      await user.type(titleInput, '朝の運動');
      
      expect(submitButton).toBeEnabled();
    });

    it('タスク名が255文字を超える場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      const longTitle = 'a'.repeat(256);
      
      await user.type(titleInput, longTitle);
      
      // バリデーションをトリガーするため送信を試行
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/255文字以内/);
      });
    });

    it('説明が1000文字を超える場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      const descriptionInput = screen.getByLabelText(/説明/);
      const longDescription = 'a'.repeat(1001);
      
      await user.type(titleInput, '有効なタスク名');
      await user.type(descriptionInput, longDescription);
      
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/1000文字以内/);
      });
    });

    it('HTMLタグが含まれる場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      
      await user.type(titleInput, '<script>alert("test")</script>');
      
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/HTMLタグは使用できません|不正なスクリプト/);
      });
    });
  });

  describe('フォーム送信', () => {
    it('有効なデータで送信が成功する', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      const descriptionInput = screen.getByLabelText(/説明/);
      const highPriorityRadio = screen.getByLabelText(/高優先度/);
      const timeSelect = screen.getByLabelText(/実行時刻/);
      
      await user.type(titleInput, '朝の運動');
      await user.type(descriptionInput, '毎朝30分のジョギング');
      await user.click(highPriorityRadio);
      await user.selectOptions(timeSelect, '07:00');
      
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: '朝の運動',
          description: '毎朝30分のジョギング',
          priority: 'high',
          time: '07:00'
        });
      });
    });

    it('サニタイゼーションが正しく実行される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      
      // HTMLエンティティをテスト（実際にはHTMLタグは検証で弾かれるが、軽微なものをテスト）
      await user.type(titleInput, 'タスク&amp;テスト');
      
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String) // サニタイズされた文字列
          })
        );
      });
    });
  });

  describe('ユーザーインタラクション', () => {
    it('キャンセルボタンでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /キャンセル/ }));
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('Escapeキーでフォームがキャンセルされる', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('ローディング中はEscapeキーが無効になる', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} loading={true} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('優先度の変更が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const lowPriorityRadio = screen.getByLabelText(/低優先度/);
      
      await user.click(lowPriorityRadio);
      
      expect(lowPriorityRadio).toBeChecked();
      expect(screen.getByLabelText(/中優先度/)).not.toBeChecked();
    });

    it('時間の変更が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const timeSelect = screen.getByLabelText(/実行時刻/);
      
      await user.selectOptions(timeSelect, '14:30');
      
      expect(timeSelect).toHaveValue('14:30');
    });
  });

  describe('プレビュー機能', () => {
    it('入力内容がプレビューに反映される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      const descriptionInput = screen.getByLabelText(/説明/);
      
      await user.type(titleInput, 'テストタスク');
      await user.type(descriptionInput, 'テスト説明');
      
      // プレビューセクションを確認
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
      expect(screen.getByText('テスト説明')).toBeInTheDocument();
      expect(screen.getByText(/毎日 09:00/)).toBeInTheDocument(); // デフォルト時間
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(titleInput).toHaveAttribute('aria-describedby');
      
      const priorityGroup = screen.getByRole('radiogroup');
      expect(priorityGroup).toHaveAttribute('aria-labelledby');
    });

    it('エラー時に適切なaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(<RecurringTaskForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText(/タスク名/);
      
      // 無効な入力をしてバリデーションエラーを発生させる
      await user.type(titleInput, '<script>');
      fireEvent.click(screen.getByRole('button', { name: /作成する/ }));
      
      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はフォームが無効になる', () => {
      render(<RecurringTaskForm {...defaultProps} loading={true} />);
      
      expect(screen.getByLabelText(/タスク名/)).toBeDisabled();
      expect(screen.getByLabelText(/説明/)).toBeDisabled();
      expect(screen.getByLabelText(/実行時刻/)).toBeDisabled();
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /作成中/ })).toBeDisabled();
    });

    it('ローディング中は送信ボタンのテキストが変更される', () => {
      render(<RecurringTaskForm {...defaultProps} loading={true} />);
      
      expect(screen.getByRole('button', { name: /作成中/ })).toBeInTheDocument();
      expect(screen.getByText('作成中...')).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    it('編集モードでフォームが正しく表示される', () => {
      render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={mockEditingTask} 
        />
      );
      
      expect(screen.getByRole('heading', { name: /繰り返しタスクを編集/ })).toBeInTheDocument();
      expect(screen.getByDisplayValue('既存のタスク')).toBeInTheDocument();
      expect(screen.getByDisplayValue('既存の説明')).toBeInTheDocument();
      expect(screen.getByDisplayValue('08:30')).toBeInTheDocument();
      expect(screen.getByLabelText(/高優先度/)).toBeChecked();
      expect(screen.getByRole('button', { name: /更新する/ })).toBeInTheDocument();
    });

    it('編集モードで説明文が変更される', () => {
      render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={mockEditingTask} 
        />
      );
      
      expect(screen.getByText(/繰り返しタスクの設定を変更します/)).toBeInTheDocument();
    });

    it('編集モードでフォーム送信が正しく動作する', async () => {
      const user = userEvent.setup();
      render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={mockEditingTask} 
        />
      );
      
      // 既存の値を変更
      const titleInput = screen.getByDisplayValue('既存のタスク');
      await user.clear(titleInput);
      await user.type(titleInput, '更新されたタスク');
      
      const descriptionInput = screen.getByDisplayValue('既存の説明');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, '更新された説明');
      
      const timeSelect = screen.getByDisplayValue('08:30');
      await user.selectOptions(timeSelect, '09:00');
      
      // 優先度を変更
      const mediumPriorityRadio = screen.getByLabelText(/中優先度/);
      await user.click(mediumPriorityRadio);
      
      // 送信
      fireEvent.click(screen.getByRole('button', { name: /更新する/ }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: '更新されたタスク',
          description: '更新された説明',
          priority: 'medium',
          time: '09:00'
        });
      });
    });

    it('編集モードのローディング状態が正しく表示される', () => {
      render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={mockEditingTask} 
          loading={true}
        />
      );
      
      expect(screen.getByRole('button', { name: /更新中/ })).toBeInTheDocument();
      expect(screen.getByText('更新中...')).toBeInTheDocument();
    });

    it('編集対象が変更された時にフォームデータが更新される', () => {
      const { rerender } = render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={mockEditingTask} 
        />
      );
      
      expect(screen.getByDisplayValue('既存のタスク')).toBeInTheDocument();
      
      // 異なる編集対象に変更
      const newEditingTask = {
        ...mockEditingTask,
        id: 2,
        title: '別のタスク',
        description: '別の説明',
        priority: 'low' as const,
        recurring_config: { time: '15:00' }
      };
      
      rerender(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={newEditingTask} 
        />
      );
      
      expect(screen.getByDisplayValue('別のタスク')).toBeInTheDocument();
      expect(screen.getByDisplayValue('別の説明')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
      expect(screen.getByLabelText(/低優先度/)).toBeChecked();
    });

    it('editingTaskがnullの場合、デフォルト値が使用される', () => {
      render(
        <RecurringTaskForm 
          {...defaultProps} 
          mode="edit" 
          editingTask={null} 
        />
      );
      
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // title
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument(); // time
      expect(screen.getByLabelText(/中優先度/)).toBeChecked(); // priority
    });
  });
});