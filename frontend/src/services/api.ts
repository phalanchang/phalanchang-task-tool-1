/**
 * Task API サービス
 * 
 * バックエンドAPIとの通信を担当
 */

import { Task } from '../components/TaskList';

// API のベースURL
const API_BASE_URL = 'http://localhost:3001';

// タスク作成用のデータ型
export interface CreateTaskData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

// タスク更新用のデータ型
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

// API レスポンスの型定義
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * HTTP エラーをハンドリング
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: APIResponse<T> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
};

/**
 * Task API サービス
 */
export const taskAPI = {
  /**
   * 全てのタスクを取得
   */
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    return handleResponse<Task[]>(response);
  },

  /**
   * 新しいタスクを作成
   */
  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse<Task>(response);
  },

  /**
   * タスクを更新
   */
  async updateTask(id: number, updateData: UpdateTaskData): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse<Task>(response);
  },

  /**
   * タスクを削除
   */
  async deleteTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<Task>(response);
  },

  /**
   * 特定のタスクを取得
   */
  async getTaskById(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
    return handleResponse<Task>(response);
  },

  /**
   * デイリータスク（今日分の繰り返しタスクインスタンス）を取得
   */
  async getDailyTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/daily`);
    return handleResponse<Task[]>(response);
  },

  /**
   * 今日分のタスクインスタンスを生成
   */
  async generateTodayTasks(): Promise<{ generated: number; existing: number; tasks: Task[] }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/generate-today`, {
      method: 'POST',
    });
    return handleResponse<{ generated: number; existing: number; tasks: Task[] }>(response);
  },

  /**
   * 繰り返しタスク（マスタータスク）一覧を取得
   */
  async getRecurringTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/recurring`);
    return handleResponse<Task[]>(response);
  },

  /**
   * 新しい繰り返しタスク（マスタータスク）を作成
   */
  async createRecurringTask(taskData: CreateTaskData & { recurring_config: any }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/recurring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse<Task>(response);
  }
};