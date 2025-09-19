import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface DailyTaskStats {
  today: {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    completionRate: number;
    earnedPoints: number;
  };
  thisWeek: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    dailyBreakdown: Array<{
      date: string;
      completed: number;
      total: number;
    }>;
    earnedPoints: number;
  };
  lastWeek: {
    completionRate: number;
    earnedPoints: number;
  };
  taskBreakdown: Array<{
    taskId: number;
    title: string;
    totalAttempts: number;
    completedAttempts: number;
    successRate: number;
    streak: number;
    lastSevenDays: boolean[];
  }>;
}

interface UseDailyTaskStatsReturn {
  stats: DailyTaskStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_KEY = 'dailyTaskStats';
const CACHE_DURATION = 5 * 60 * 1000; // 5分間のキャッシュ

interface CachedData {
  data: DailyTaskStats;
  timestamp: number;
}

export const useDailyTaskStats = (): UseDailyTaskStatsReturn => {
  const [stats, setStats] = useState<DailyTaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (useCache = true) => {
    try {
      // キャッシュをチェック
      if (useCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp }: CachedData = JSON.parse(cached);
          const now = Date.now();
          
          // キャッシュが有効期限内であれば使用
          if (now - timestamp < CACHE_DURATION) {
            setStats(data);
            setLoading(false);
            return;
          }
        }
      }

      setLoading(true);
      setError(null);

      const response = await axios.get<DailyTaskStats>('/api/daily-task-stats');
      const data = response.data;

      // データをキャッシュに保存
      const cacheData: CachedData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching daily task stats:', err);
      setError('統計情報の取得に失敗しました');
      
      // エラー時でもキャッシュがあれば表示
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data }: CachedData = JSON.parse(cached);
        setStats(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 手動リフレッシュ用の関数
  const refetch = useCallback(() => {
    fetchStats(false); // キャッシュを使わずに取得
  }, [fetchStats]);

  // 初回ロード
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // タスク完了時などのイベントでキャッシュをクリア
  useEffect(() => {
    const handleTaskUpdate = () => {
      localStorage.removeItem(CACHE_KEY);
      refetch();
    };

    // カスタムイベントをリッスン
    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('taskCompleted', handleTaskUpdate);

    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('taskCompleted', handleTaskUpdate);
    };
  }, [refetch]);

  // 日付変更検知でリフレッシュ
  useEffect(() => {
    const checkDateChange = () => {
      const lastDate = localStorage.getItem('lastCheckedDate');
      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        localStorage.setItem('lastCheckedDate', today);
        localStorage.removeItem(CACHE_KEY);
        refetch();
      }
    };

    // 1分ごとに日付変更をチェック
    const interval = setInterval(checkDateChange, 60000);
    checkDateChange(); // 初回チェック

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};