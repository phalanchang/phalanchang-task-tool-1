import { renderHook } from '@testing-library/react';
import { usePageTitle } from './usePageTitle';

// document.titleをモック
const originalTitle = document.title;

describe('usePageTitle', () => {
  beforeEach(() => {
    document.title = originalTitle;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('基本タイトルが設定されること', () => {
    renderHook(() => usePageTitle('Test Title'));
    
    expect(document.title).toBe('Test Title');
  });

  it('バッジカウントが0の場合は基本タイトルのみ表示されること', () => {
    renderHook(() => usePageTitle('Test Title', 0));
    
    expect(document.title).toBe('Test Title');
  });

  it('バッジカウントがある場合は括弧付きで表示されること', () => {
    renderHook(() => usePageTitle('Test Title', 3));
    
    expect(document.title).toBe('(3) Test Title');
  });

  it('undefinedのバッジカウントの場合は基本タイトルのみ表示されること', () => {
    renderHook(() => usePageTitle('Test Title', undefined));
    
    expect(document.title).toBe('Test Title');
  });

  it('コンポーネントがアンマウントされたときにデフォルトタイトルに戻ること', () => {
    const { unmount } = renderHook(() => usePageTitle('Test Title', 5));
    
    expect(document.title).toBe('(5) Test Title');
    
    unmount();
    
    expect(document.title).toBe('Task Management App');
  });

  it('タイトルが変更されたときに更新されること', () => {
    const { rerender } = renderHook(
      ({ title, count }) => usePageTitle(title, count),
      { initialProps: { title: 'Initial Title', count: 1 } }
    );
    
    expect(document.title).toBe('(1) Initial Title');
    
    rerender({ title: 'Updated Title', count: 2 });
    
    expect(document.title).toBe('(2) Updated Title');
  });
});