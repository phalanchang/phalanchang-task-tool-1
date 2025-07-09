import { useEffect } from 'react';

/**
 * ページタイトルを管理するカスタムフック
 */
export const usePageTitle = (title: string, badgeCount?: number) => {
  useEffect(() => {
    let newTitle = title;
    
    if (badgeCount && badgeCount > 0) {
      newTitle = `(${badgeCount}) ${title}`;
    }
    
    document.title = newTitle;
    
    // クリーンアップ関数でデフォルトタイトルに戻す
    return () => {
      document.title = 'Task Management App';
    };
  }, [title, badgeCount]);
};