/**
 * Task モデルのバリデーションテスト
 * 
 * データベース接続を必要としないバリデーション機能のテスト
 */

const Task = require('../../src/models/Task');

// データベース接続をモック化
jest.mock('../../database/config', () => ({
  createConnection: jest.fn()
}));

describe('Task モデル バリデーション', () => {
  
  describe('入力値検証', () => {
    test('validateTaskData() - 有効なデータの場合はエラーが発生しないこと', () => {
      const validData = {
        title: 'テストタスク',
        description: 'テスト用のタスクです',
        status: 'pending',
        priority: 'medium'
      };

      expect(() => Task.validateTaskData(validData)).not.toThrow();
    });

    test('validateTaskData() - タイトルが空の場合はエラーが発生すること', () => {
      const invalidData = {
        title: '',
        description: 'テスト用',
        status: 'pending'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('タイトルは必須です');
    });

    test('validateTaskData() - タイトルがnullの場合はエラーが発生すること', () => {
      const invalidData = {
        title: null,
        description: 'テスト用',
        status: 'pending'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('タイトルは必須です');
    });

    test('validateTaskData() - タイトルが未定義の場合はエラーが発生すること', () => {
      const invalidData = {
        description: 'テスト用',
        status: 'pending'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('タイトルは必須です');
    });

    test('validateTaskData() - タイトルが255文字を超える場合はエラーが発生すること', () => {
      const longTitle = 'a'.repeat(256);
      const invalidData = {
        title: longTitle,
        description: 'テスト用',
        status: 'pending'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('タイトルは255文字以内で入力してください');
    });

    test('validateTaskData() - 不正なステータスの場合はエラーが発生すること', () => {
      const invalidData = {
        title: 'テストタスク',
        description: 'テスト用',
        status: 'invalid_status'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('ステータスは pending または completed である必要があります');
    });

    test('validateTaskData() - 不正な優先度の場合はエラーが発生すること', () => {
      const invalidData = {
        title: 'テストタスク',
        description: 'テスト用',
        status: 'pending',
        priority: 'invalid_priority'
      };

      expect(() => Task.validateTaskData(invalidData)).toThrow('優先度は low, medium, high のいずれかである必要があります');
    });

    test('validateTaskData() - ステータスが未指定の場合はエラーが発生しないこと', () => {
      const validData = {
        title: 'テストタスク',
        description: 'テスト用'
      };

      expect(() => Task.validateTaskData(validData)).not.toThrow();
    });

    test('validateTaskData() - 優先度が未指定の場合はエラーが発生しないこと', () => {
      const validData = {
        title: 'テストタスク',
        description: 'テスト用',
        status: 'pending'
      };

      expect(() => Task.validateTaskData(validData)).not.toThrow();
    });
  });

  describe('ID検証', () => {
    test('validateId() - 有効な数値IDの場合はエラーが発生しないこと', () => {
      expect(() => Task.validateId(1)).not.toThrow();
      expect(() => Task.validateId(999)).not.toThrow();
      expect(() => Task.validateId('123')).not.toThrow();
    });

    test('validateId() - 無効なIDの場合はエラーが発生すること', () => {
      expect(() => Task.validateId(null)).toThrow('有効なIDを指定してください');
      expect(() => Task.validateId(undefined)).toThrow('有効なIDを指定してください');
      expect(() => Task.validateId('')).toThrow('有効なIDを指定してください');
      expect(() => Task.validateId('invalid')).toThrow('有効なIDを指定してください');
      expect(() => Task.validateId(0)).toThrow('有効なIDを指定してください');
      expect(() => Task.validateId(-1)).toThrow('有効なIDを指定してください');
    });
  });

  describe('データサニタイゼーション', () => {
    test('sanitizeTaskData() - タイトルの前後空白が除去されること', () => {
      const data = {
        title: '  テストタスク  ',
        description: 'テスト用'
      };

      const sanitized = Task.sanitizeTaskData(data);
      expect(sanitized.title).toBe('テストタスク');
    });

    test('sanitizeTaskData() - デフォルト値が設定されること', () => {
      const data = {
        title: 'テストタスク',
        description: 'テスト用'
      };

      const sanitized = Task.sanitizeTaskData(data);
      expect(sanitized.status).toBe('pending');
      expect(sanitized.priority).toBe('medium');
    });

    test('sanitizeTaskData() - 明示的に指定された値が優先されること', () => {
      const data = {
        title: 'テストタスク',
        description: 'テスト用',
        status: 'completed',
        priority: 'high'
      };

      const sanitized = Task.sanitizeTaskData(data);
      expect(sanitized.status).toBe('completed');
      expect(sanitized.priority).toBe('high');
    });

    test('sanitizeTaskData() - 空のdescriptionはnullに変換されること', () => {
      const data = {
        title: 'テストタスク',
        description: ''
      };

      const sanitized = Task.sanitizeTaskData(data);
      expect(sanitized.description).toBeNull();
    });
  });
});