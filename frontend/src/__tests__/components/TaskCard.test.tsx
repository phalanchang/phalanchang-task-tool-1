/**
 * TaskCard コンポーネントのテスト（TDD Red Phase）
 * 
 * カードベースデザインの期待動作をテストします
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../../components/TaskCard';
import { Task } from '../../components/TaskList';

// テスト用のモックタスクデータ
const mockTask: Task = {
  id: 1,
  title: 'テストタスク',
  description: 'テスト用の説明',
  status: 'pending',
  priority: 'medium',
  created_at: '2025-06-17T00:00:00.000Z',
  updated_at: '2025-06-17T00:00:00.000Z'
};

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggleStatus: jest.fn()
};

describe('TaskCard コンポーネント（TDD）', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テストグループ: 基本レンダリング
  describe('基本レンダリング', () => {
    
    test('TaskCardコンポーネントが正常にレンダリングされること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      // カード要素が存在することを確認
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toBeInTheDocument();
    });

    test('タスクのタイトルが表示されること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });

    test('タスクの説明が表示されること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      expect(screen.getByText('テスト用の説明')).toBeInTheDocument();
    });
  });

  // テストグループ: 優先度別スタイリング
  describe('優先度別スタイリング', () => {
    
    test('高優先度タスクに適切なクラスが適用されること', () => {
      const highPriorityTask = { ...mockTask, priority: 'high' };
      
      render(
        <TaskCard 
          task={highPriorityTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card--high');
    });

    test('中優先度タスクに適切なクラスが適用されること', () => {
      const mediumPriorityTask = { ...mockTask, priority: 'medium' };
      
      render(
        <TaskCard 
          task={mediumPriorityTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card--medium');
    });

    test('低優先度タスクに適切なクラスが適用されること', () => {
      const lowPriorityTask = { ...mockTask, priority: 'low' };
      
      render(
        <TaskCard 
          task={lowPriorityTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card--low');
    });
  });

  // テストグループ: ステータス表示
  describe('ステータス表示', () => {
    
    test('pending状態のタスクに適切なクラスが適用されること', () => {
      const pendingTask = { ...mockTask, status: 'pending' };
      
      render(
        <TaskCard 
          task={pendingTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card--pending');
    });

    test('completed状態のタスクに適切なクラスが適用されること', () => {
      const completedTask = { ...mockTask, status: 'completed' };
      
      render(
        <TaskCard 
          task={completedTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card--completed');
    });
  });

  // テストグループ: インタラクション
  describe('インタラクション', () => {
    
    test('ステータス切り替えボタンがクリックできること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const toggleButton = screen.getByTestId('toggle-status-button');
      fireEvent.click(toggleButton);
      
      expect(mockHandlers.onToggleStatus).toHaveBeenCalledWith(mockTask);
    });

    test('削除ボタンがクリックできること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);
      
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask);
    });
  });

  // テストグループ: カードスタイル
  describe('カードスタイル', () => {
    
    test('基本的なカードクラスが適用されること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const cardElement = screen.getByTestId('task-card');
      expect(cardElement).toHaveClass('task-card');
    });

    test('タスクタイトル要素に適切なクラスが適用されること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const titleElement = screen.getByTestId('task-title');
      expect(titleElement).toHaveClass('task-card__title');
    });

    test('タスク説明要素に適切なクラスが適用されること', () => {
      render(
        <TaskCard 
          task={mockTask} 
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onToggleStatus={mockHandlers.onToggleStatus}
        />
      );
      
      const descriptionElement = screen.getByTestId('task-description');
      expect(descriptionElement).toHaveClass('task-card__description');
    });
  });
});