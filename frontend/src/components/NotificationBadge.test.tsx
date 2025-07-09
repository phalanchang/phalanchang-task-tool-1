import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationBadge from './NotificationBadge';

describe('NotificationBadge', () => {
  it('正常に表示されること', () => {
    render(<NotificationBadge count={5} />);
    
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('notification-badge');
  });

  it('カウントが0の場合は表示されないこと', () => {
    render(<NotificationBadge count={0} />);
    
    const badge = screen.queryByRole('status');
    expect(badge).not.toBeInTheDocument();
  });

  it('visible=falseの場合は表示されないこと', () => {
    render(<NotificationBadge count={5} visible={false} />);
    
    const badge = screen.queryByRole('status');
    expect(badge).not.toBeInTheDocument();
  });

  it('99を超える場合は"99+"と表示されること', () => {
    render(<NotificationBadge count={100} />);
    
    const badge = screen.getByText('99+');
    expect(badge).toBeInTheDocument();
  });

  it('適切なaria-labelが設定されていること', () => {
    render(<NotificationBadge count={3} />);
    
    const badge = screen.getByLabelText('3件の未完了タスク');
    expect(badge).toBeInTheDocument();
  });

  it('カスタムクラス名が適用されること', () => {
    render(<NotificationBadge count={1} className="custom-class" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('notification-badge');
    expect(badge).toHaveClass('custom-class');
  });
});