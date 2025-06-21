import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentPath: '/tasks'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Red Phase: このテストは最初失敗する（Sidebarコンポーネントが存在しないため）
  it('should render sidebar with correct role', () => {
    render(<Sidebar {...mockProps} />);
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
  });

  it('should display three navigation items', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('タスク管理')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(<Sidebar {...mockProps} currentPath="/tasks" />);
    
    const activeItem = screen.getByText('タスク管理').closest('button');
    expect(activeItem).toHaveClass('active');
  });

  it('should call onClose when close button is clicked on mobile', () => {
    render(<Sidebar {...mockProps} />);
    
    // モバイル用の閉じるボタンをクリック
    const closeButton = screen.getByLabelText('サイドバーを閉じる');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should apply open class when isOpen is true', () => {
    render(<Sidebar {...mockProps} isOpen={true} />);
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('open');
  });

  it('should not apply open class when isOpen is false', () => {
    render(<Sidebar {...mockProps} isOpen={false} />);
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).not.toHaveClass('open');
  });
});