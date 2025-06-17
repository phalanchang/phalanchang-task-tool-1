/**
 * App コンポーネントのテスト
 * 
 * TDD: テストファーストで開発
 * これらのテストを最初に書いて、実装は後で行う
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App コンポーネント', () => {
  
  test('正常にレンダリングされること', () => {
    render(<App />);
    // アプリケーションがクラッシュしないことを確認
    expect(document.body).toBeInTheDocument();
  });

  test('タイトル「タスク管理アプリ」が表示されること', () => {
    render(<App />);
    const titleElement = screen.getByText('タスク管理アプリ');
    expect(titleElement).toBeInTheDocument();
  });

  test('TaskList コンポーネントが含まれていること', () => {
    render(<App />);
    // TaskListコンポーネントの特徴的な要素を探す
    const taskListElement = screen.getByTestId('task-list');
    expect(taskListElement).toBeInTheDocument();
  });

  test('TaskForm コンポーネントが含まれていること', () => {
    render(<App />);
    // TaskFormコンポーネントの特徴的な要素を探す
    const taskFormElement = screen.getByTestId('task-form');
    expect(taskFormElement).toBeInTheDocument();
  });
});
