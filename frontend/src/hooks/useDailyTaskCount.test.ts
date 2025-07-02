import { renderHook, waitFor, act } from '@testing-library/react';
import { useDailyTaskCount } from './useDailyTaskCount';
import { taskAPI } from '../services/api';

// taskAPIをモック
jest.mock('../services/api');
const mockedTaskAPI = taskAPI as jest.Mocked<typeof taskAPI>;

describe('useDailyTaskCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態が正しく設定されること', () => {
    mockedTaskAPI.getDailyTasks.mockResolvedValue([]);
    
    const { result } = renderHook(() => useDailyTaskCount());
    
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('Daily タスクが正しくカウントされること', async () => {
    const mockTasks = [
      { id: 1, status: 'pending', title: 'Task 1' },
      { id: 2, status: 'completed', title: 'Task 2' },
      { id: 3, status: 'pending', title: 'Task 3' }
    ];
    
    mockedTaskAPI.getDailyTasks.mockResolvedValue(mockTasks as any);
    
    const { result } = renderHook(() => useDailyTaskCount());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.count).toBe(2); // pending タスクが2件
    expect(result.current.error).toBeNull();
  });

  it('APIエラーが正しく処理されること', async () => {
    const errorMessage = 'API エラー';
    mockedTaskAPI.getDailyTasks.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useDailyTaskCount());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.count).toBe(0);
    expect(result.current.error).toBe(errorMessage);
  });

  it('refetch機能が正しく動作すること', async () => {
    const mockTasks = [
      { id: 1, status: 'pending', title: 'Task 1' }
    ];
    
    mockedTaskAPI.getDailyTasks.mockResolvedValue(mockTasks as any);
    
    const { result } = renderHook(() => useDailyTaskCount());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.count).toBe(1);
    
    // 新しいデータでrefetch
    const newMockTasks = [
      { id: 1, status: 'pending', title: 'Task 1' },
      { id: 2, status: 'pending', title: 'Task 2' }
    ];
    
    mockedTaskAPI.getDailyTasks.mockResolvedValue(newMockTasks as any);
    
    await act(async () => {
      await result.current.refetch();
    });
    
    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });
  });
});