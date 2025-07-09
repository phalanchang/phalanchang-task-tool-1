import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import { useDailyTaskRefresh } from '../contexts/DailyTaskContext';

/**
 * Daily タスクの未完了数を取得するカスタムフック
 */
export const useDailyTaskCount = () => {
  const { refreshTrigger } = useDailyTaskRefresh();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyTaskCount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dailyTasks = await taskAPI.getDailyTasks();
      const pendingTasks = dailyTasks.filter(task => task.status === 'pending');
      setCount(pendingTasks.length);
    } catch (err) {
      console.error('Daily task count fetch error:', err);
      setError(err instanceof Error ? err.message : 'タスク数の取得に失敗しました');
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyTaskCount();
  }, [fetchDailyTaskCount, refreshTrigger]);

  return {
    count,
    isLoading,
    error,
    refetch: fetchDailyTaskCount
  };
};