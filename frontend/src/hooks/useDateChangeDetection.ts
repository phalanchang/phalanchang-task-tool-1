import { useEffect, useState } from 'react';

/**
 * 日付変更を検知するカスタムフック
 * 1分ごとに現在の日付をチェックし、日付が変わった際にコールバック関数を実行する
 * 
 * @param callback - 日付変更時に実行するコールバック関数
 * @returns 現在の日付文字列
 */
export const useDateChangeDetection = (callback: () => void) => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toDateString()
  );

  useEffect(() => {
    const checkDateChange = () => {
      const newDate = new Date().toDateString();
      
      if (newDate !== currentDate) {
        console.log(`日付変更検知: ${currentDate} → ${newDate}`);
        setCurrentDate(newDate);
        callback();
      }
    };

    // 1分ごとに日付をチェック（適切な更新頻度）
    const interval = setInterval(checkDateChange, 60000);
    
    // クリーンアップ関数
    return () => {
      clearInterval(interval);
    };
  }, [currentDate, callback]);

  return currentDate;
};