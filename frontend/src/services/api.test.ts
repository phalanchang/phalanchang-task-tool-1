/**
 * API サービスのテスト
 * 
 * TDD: テストファーストでAPI通信を実装
 */

import { taskAPI } from './api';
import { Task } from '../components/TaskList';

// fetchをモック化
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Task API Service', () => {

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getAllTasks', () => {
    test('タスク一覧を正しく取得できること', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'テストタスク1',
          description: 'テスト用',
          status: 'pending',
          priority: 'medium',
          created_at: '2025-06-17T10:00:00.000Z',
          updated_at: '2025-06-17T10:00:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTasks,
          count: 1
        })
      } as Response);

      const result = await taskAPI.getAllTasks();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks');
      expect(result).toEqual(mockTasks);
    });

    test('APIエラー時に例外がスローされること', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(taskAPI.getAllTasks()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('createTask', () => {
    test('新しいタスクを正しく作成できること', async () => {
      const newTaskData = {
        title: '新しいタスク',
        description: '新しいタスクの説明',
        priority: 'medium' as const
      };

      const createdTask: Task = {
        id: 1,
        ...newTaskData,
        status: 'pending',
        priority: 'medium',
        created_at: '2025-06-17T10:00:00.000Z',
        updated_at: '2025-06-17T10:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: createdTask
        })
      } as Response);

      const result = await taskAPI.createTask(newTaskData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    test('タスクを正しく更新できること', async () => {
      const updatedTask: Task = {
        id: 1,
        title: '更新されたタスク',
        description: '更新された説明',
        status: 'completed',
        priority: 'high',
        created_at: '2025-06-17T10:00:00.000Z',
        updated_at: '2025-06-17T11:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedTask
        })
      } as Response);

      const updateData = { status: 'completed' as const };
      const result = await taskAPI.updateTask(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    test('タスクを正しく削除できること', async () => {
      const deletedTask: Task = {
        id: 1,
        title: '削除されたタスク',
        description: '削除されたタスクの説明',
        status: 'pending',
        priority: 'low',
        created_at: '2025-06-17T10:00:00.000Z',
        updated_at: '2025-06-17T10:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: deletedTask,
          message: 'Task deleted successfully'
        })
      } as Response);

      const result = await taskAPI.deleteTask(1);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        method: 'DELETE',
      });
      expect(result).toEqual(deletedTask);
    });
  });
});