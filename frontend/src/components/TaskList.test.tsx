/**
 * TaskList コンポーネントのテスト
 * 
 * TDD: テストファーストで開発
 * まだコンポーネントは存在しませんが、先にテストを書きます
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from './TaskList';

// テスト用のサンプルデータ
const mockTasks = [
  {
    id: 1,
    title: 'テストタスク1',
    description: 'これはテスト用のタスクです',
    status: 'pending' as const,
    created_at: '2025-06-17T10:00:00.000Z',
    updated_at: '2025-06-17T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'テストタスク2',
    description: '完了済みのタスクです',
    status: 'completed' as const,
    created_at: '2025-06-17T09:00:00.000Z',
    updated_at: '2025-06-17T11:00:00.000Z'
  }
];

describe('TaskList コンポーネント', () => {

  test('空の状態で正常にレンダリングされること', () => {
    render(<TaskList tasks={[]} onEdit={jest.fn()} onDelete={jest.fn()} onToggleStatus={jest.fn()} />);
    
    const taskListElement = screen.getByTestId('task-list');
    expect(taskListElement).toBeInTheDocument();
    
    // 空の状態のメッセージが表示されること
    const emptyMessage = screen.getByText('タスクがありません');
    expect(emptyMessage).toBeInTheDocument();
  });

  test('タスクが渡されたときに正しく表示されること', () => {
    render(<TaskList tasks={mockTasks} onEdit={jest.fn()} onDelete={jest.fn()} onToggleStatus={jest.fn()} />);
    
    // 各タスクのタイトルが表示されること
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    
    // タスクの説明が表示されること
    expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument();
    expect(screen.getByText('完了済みのタスクです')).toBeInTheDocument();
  });

  test('各タスクに「編集」「削除」ボタンが表示されること', () => {
    render(<TaskList tasks={mockTasks} onEdit={jest.fn()} onDelete={jest.fn()} onToggleStatus={jest.fn()} />);
    
    // 編集ボタンがタスクの数だけ存在すること
    const editButtons = screen.getAllByText('編集');
    expect(editButtons).toHaveLength(mockTasks.length);
    
    // 削除ボタンがタスクの数だけ存在すること
    const deleteButtons = screen.getAllByText('削除');
    expect(deleteButtons).toHaveLength(mockTasks.length);
  });

  test('完了/未完了の状態が正しく表示されること', () => {
    render(<TaskList tasks={mockTasks} onEdit={jest.fn()} onDelete={jest.fn()} onToggleStatus={jest.fn()} />);
    
    // ステータス表示を確認
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });

  test('ボタンクリック時にコールバック関数が呼ばれること', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnToggleStatus = jest.fn();

    render(<TaskList 
      tasks={mockTasks} 
      onEdit={mockOnEdit} 
      onDelete={mockOnDelete} 
      onToggleStatus={mockOnToggleStatus} 
    />);
    
    // 最初のタスクの編集ボタンをクリック
    const editButtons = screen.getAllByText('編集');
    editButtons[0].click();
    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
    
    // 最初のタスクの削除ボタンをクリック
    const deleteButtons = screen.getAllByText('削除');
    deleteButtons[0].click();
    expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });
});