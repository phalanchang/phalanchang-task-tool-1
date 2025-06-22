/**
 * Task API サービス
 * 
 * バックエンドAPIとの通信を担当
 */

import { Task, CreateTaskData, CreateRecurringTaskData } from '../components/TaskList';

// API のベースURL
const API_BASE_URL = 'http://localhost:3001';

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

// エラーメッセージ定義
const ERROR_MESSAGES = {
  TITLE_REQUIRED: 'タスク名を入力してください',
  TITLE_TOO_LONG: 'タスク名は255文字以内で入力してください',
  DESCRIPTION_TOO_LONG: '説明は1000文字以内で入力してください',
  INVALID_TIME: '正しい時間形式（例：09:30）で入力してください',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください',
  SERVER_ERROR: 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください',
  NOT_FOUND: 'リソースが見つかりません',
  UNAUTHORIZED: '許可されていない操作です',
  FORBIDDEN: 'アクセスが禁止されています',
  VALIDATION_ERROR: '入力値にエラーがあります'
} as const;

/**
 * CSRFトークンを取得
 */
const getCSRFToken = (): string => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

/**
 * HTTP エラーをハンドリング（強化版）
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage: string;
    
    switch (response.status) {
      case 400:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        errorMessage = `HTTPエラー: ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }
  
  try {
    const data: APIResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('サーバーからの応答が正しくありません');
    }
    throw error;
  }
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
   * 新しいタスクを作成（CSRF対策含む）
   */
  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(taskData),
        credentials: 'same-origin'
      });
      return handleResponse<Task>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
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
   * 新しい繰り返しタスク（マスタータスク）を作成（CSRF対策含む）
   */
  async createRecurringTask(taskData: CreateRecurringTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(taskData),
        credentials: 'same-origin'
      });
      return handleResponse<Task>(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }
};