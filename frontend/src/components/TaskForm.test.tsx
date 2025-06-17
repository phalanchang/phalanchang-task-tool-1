/**
 * TaskForm コンポーネントのテスト
 * 
 * TDD: テストファーストで開発
 * まだコンポーネントは存在しませんが、先にテストを書きます
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';

describe('TaskForm コンポーネント', () => {

  test('フォームが正常にレンダリングされること', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    
    const formElement = screen.getByTestId('task-form');
    expect(formElement).toBeInTheDocument();
  });

  test('タイトル入力フィールドが存在すること', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    
    const titleInput = screen.getByLabelText('タイトル');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('type', 'text');
    expect(titleInput).toBeRequired();
  });

  test('説明入力フィールドが存在すること', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    
    const descriptionInput = screen.getByLabelText('説明');
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput.tagName).toBe('TEXTAREA');
  });

  test('送信ボタンが存在すること', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: 'タスクを追加' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('入力フィールドに値を入力できること', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={jest.fn()} />);
    
    const titleInput = screen.getByLabelText('タイトル');
    const descriptionInput = screen.getByLabelText('説明');
    
    await user.type(titleInput, 'テストタスク');
    await user.type(descriptionInput, 'テストの説明');
    
    expect(titleInput).toHaveValue('テストタスク');
    expect(descriptionInput).toHaveValue('テストの説明');
  });

  test('必須項目バリデーションが動作すること', async () => {
    const mockOnSubmit = jest.fn();
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'タスクを追加' });
    
    // タイトルを空のままで送信
    fireEvent.click(submitButton);
    
    // HTML5バリデーションまたはカスタムバリデーションが動作することを確認
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('有効な値でフォーム送信時にコールバック関数が呼ばれること', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText('タイトル');
    const descriptionInput = screen.getByLabelText('説明');
    const submitButton = screen.getByRole('button', { name: 'タスクを追加' });
    
    // フォームに入力
    await user.type(titleInput, 'テストタスク');
    await user.type(descriptionInput, 'テストの説明');
    
    // フォーム送信
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'テストタスク',
        description: 'テストの説明',
        priority: 'medium'
      });
    });
  });

  test('送信後にフォームがリセットされること', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText('タイトル');
    const descriptionInput = screen.getByLabelText('説明');
    const submitButton = screen.getByRole('button', { name: 'タスクを追加' });
    
    // フォームに入力
    await user.type(titleInput, 'テストタスク');
    await user.type(descriptionInput, 'テストの説明');
    
    // フォーム送信
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });
});