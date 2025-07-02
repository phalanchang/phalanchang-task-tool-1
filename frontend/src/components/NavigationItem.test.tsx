import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationItem from './NavigationItem';

describe('NavigationItem Component', () => {
  const mockProps = {
    path: '/tasks',
    label: 'タスク管理',
    icon: 'assignment',
    isActive: false,
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation item with correct label', () => {
    render(<NavigationItem {...mockProps} />);
    expect(screen.getByText('タスク管理')).toBeInTheDocument();
  });

  it('should display icon', () => {
    render(<NavigationItem {...mockProps} />);
    const iconElement = screen.getByText('assignment'); // Material Icon text
    expect(iconElement).toBeInTheDocument();
  });

  it('should call onClick with correct path when clicked', () => {
    render(<NavigationItem {...mockProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    expect(mockProps.onClick).toHaveBeenCalledWith('/tasks');
  });

  it('should apply active class when isActive is true', () => {
    render(<NavigationItem {...mockProps} isActive={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('nav-item', 'active');
  });

  it('should not apply active class when isActive is false', () => {
    render(<NavigationItem {...mockProps} isActive={false} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('nav-item');
    expect(button).not.toHaveClass('active');
  });

  it('should have proper accessibility attributes', () => {
    render(<NavigationItem {...mockProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'タスク管理へ移動');
  });

  it('should have correct tabindex for keyboard navigation', () => {
    render(<NavigationItem {...mockProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('should render badge when provided', () => {
    const badge = <span data-testid="test-badge">3</span>;
    render(<NavigationItem {...mockProps} badge={badge} />);
    
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not render badge when not provided', () => {
    render(<NavigationItem {...mockProps} />);
    
    expect(screen.queryByTestId('test-badge')).not.toBeInTheDocument();
  });
});