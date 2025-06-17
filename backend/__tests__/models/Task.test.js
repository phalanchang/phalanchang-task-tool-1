/**
 * Task モデルのテスト
 * 
 * TDD Red段階: まずテストを作成してから実装
 */

const Task = require('../../src/models/Task');
const { createConnection } = require('../../database/config');

describe('Task モデル', () => {
  let connection;

  // テスト前の準備
  beforeAll(async () => {
    // テスト用データベース接続
    connection = await createConnection();
    
    // テスト用データベース選択
    await connection.execute('USE task_management_app');
    
    // テストデータクリーンアップ
    await connection.execute('DELETE FROM tasks WHERE title LIKE "%テスト%"');
  });

  // テスト後のクリーンアップ
  afterAll(async () => {
    if (connection) {
      // テストデータクリーンアップ
      await connection.execute('DELETE FROM tasks WHERE title LIKE "%テスト%"');
      await connection.end();
    }
  });

  // 各テスト前のクリーンアップ
  beforeEach(async () => {
    await connection.execute('DELETE FROM tasks WHERE title LIKE "%テスト%"');
  });

  describe('create() メソッド', () => {
    test('新しいタスクを作成できること', async () => {
      const taskData = {
        title: 'テストタスク1',
        description: 'テスト用のタスクです',
        status: 'pending'
      };

      const createdTask = await Task.create(taskData);

      // 作成されたタスクの検証
      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.status).toBe(taskData.status);
      expect(createdTask.created_at).toBeDefined();
      expect(createdTask.updated_at).toBeDefined();
    });

    test('必須フィールドが不足している場合はエラーになること', async () => {
      const invalidTaskData = {
        description: 'タイトルがないタスク'
        // title が欠けている
      };

      await expect(Task.create(invalidTaskData)).rejects.toThrow();
    });

    test('不正なステータスの場合はエラーになること', async () => {
      const invalidTaskData = {
        title: 'テストタスク',
        description: 'テスト用',
        status: 'invalid_status' // 不正なステータス
      };

      await expect(Task.create(invalidTaskData)).rejects.toThrow();
    });
  });

  describe('findAll() メソッド', () => {
    test('すべてのタスクを取得できること', async () => {
      // テストデータを複数作成
      await Task.create({
        title: 'テストタスク1',
        description: 'テスト1',
        status: 'pending'
      });

      await Task.create({
        title: 'テストタスク2',
        description: 'テスト2',
        status: 'completed'
      });

      const tasks = await Task.findAll();

      // 結果の検証
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      
      // 最新の2つのタスクを確認
      const testTasks = tasks.filter(task => task.title.includes('テストタスク'));
      expect(testTasks.length).toBe(2);
    });

    test('タスクが存在しない場合は空配列を返すこと', async () => {
      // すべてのテストデータを削除
      await connection.execute('DELETE FROM tasks');

      const tasks = await Task.findAll();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });
  });

  describe('findById() メソッド', () => {
    test('指定されたIDのタスクを取得できること', async () => {
      // テストタスクを作成
      const createdTask = await Task.create({
        title: 'テストタスク検索',
        description: 'ID検索用',
        status: 'pending'
      });

      const foundTask = await Task.findById(createdTask.id);

      // 結果の検証
      expect(foundTask).toBeDefined();
      expect(foundTask.id).toBe(createdTask.id);
      expect(foundTask.title).toBe('テストタスク検索');
    });

    test('存在しないIDの場合はnullを返すこと', async () => {
      const nonExistentId = 999999;
      const foundTask = await Task.findById(nonExistentId);

      expect(foundTask).toBeNull();
    });

    test('不正なIDの場合はエラーになること', async () => {
      await expect(Task.findById('invalid')).rejects.toThrow();
      await expect(Task.findById(null)).rejects.toThrow();
      await expect(Task.findById(undefined)).rejects.toThrow();
    });
  });

  describe('update() メソッド', () => {
    test('タスクを更新できること', async () => {
      // テストタスクを作成
      const createdTask = await Task.create({
        title: 'テストタスク更新前',
        description: '更新前の説明',
        status: 'pending'
      });

      const updateData = {
        title: 'テストタスク更新後',
        description: '更新後の説明',
        status: 'completed'
      };

      const updatedTask = await Task.update(createdTask.id, updateData);

      // 結果の検証
      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(createdTask.id);
      expect(updatedTask.title).toBe(updateData.title);
      expect(updatedTask.description).toBe(updateData.description);
      expect(updatedTask.status).toBe(updateData.status);
      expect(updatedTask.updated_at).not.toBe(createdTask.updated_at);
    });

    test('部分的な更新ができること', async () => {
      // テストタスクを作成
      const createdTask = await Task.create({
        title: 'テストタスク部分更新',
        description: '部分更新テスト',
        status: 'pending'
      });

      // ステータスのみ更新
      const updateData = {
        status: 'completed'
      };

      const updatedTask = await Task.update(createdTask.id, updateData);

      // 結果の検証
      expect(updatedTask.title).toBe(createdTask.title); // 変更されていない
      expect(updatedTask.description).toBe(createdTask.description); // 変更されていない
      expect(updatedTask.status).toBe('completed'); // 更新されている
    });

    test('存在しないIDの場合はnullを返すこと', async () => {
      const nonExistentId = 999999;
      const updateData = { title: '存在しないタスク' };

      const result = await Task.update(nonExistentId, updateData);

      expect(result).toBeNull();
    });

    test('不正なデータの場合はエラーになること', async () => {
      const createdTask = await Task.create({
        title: 'テストタスク',
        description: 'テスト',
        status: 'pending'
      });

      const invalidUpdateData = {
        status: 'invalid_status' // 不正なステータス
      };

      await expect(Task.update(createdTask.id, invalidUpdateData)).rejects.toThrow();
    });
  });

  describe('delete() メソッド', () => {
    test('タスクを削除できること', async () => {
      // テストタスクを作成
      const createdTask = await Task.create({
        title: 'テストタスク削除対象',
        description: '削除テスト用',
        status: 'pending'
      });

      const deletedTask = await Task.delete(createdTask.id);

      // 削除結果の検証
      expect(deletedTask).toBeDefined();
      expect(deletedTask.id).toBe(createdTask.id);

      // 削除されたことを確認
      const foundTask = await Task.findById(createdTask.id);
      expect(foundTask).toBeNull();
    });

    test('存在しないIDの場合はnullを返すこと', async () => {
      const nonExistentId = 999999;
      const result = await Task.delete(nonExistentId);

      expect(result).toBeNull();
    });

    test('不正なIDの場合はエラーになること', async () => {
      await expect(Task.delete('invalid')).rejects.toThrow();
      await expect(Task.delete(null)).rejects.toThrow();
      await expect(Task.delete(undefined)).rejects.toThrow();
    });
  });

  describe('バリデーション', () => {
    test('タイトルが空文字列の場合はエラーになること', async () => {
      const invalidTaskData = {
        title: '', // 空文字列
        description: 'テスト',
        status: 'pending'
      };

      await expect(Task.create(invalidTaskData)).rejects.toThrow();
    });

    test('タイトルが255文字を超える場合はエラーになること', async () => {
      const longTitle = 'a'.repeat(256); // 256文字
      const invalidTaskData = {
        title: longTitle,
        description: 'テスト',
        status: 'pending'
      };

      await expect(Task.create(invalidTaskData)).rejects.toThrow();
    });

    test('優先度が指定された場合は正しく保存されること', async () => {
      const taskWithPriority = {
        title: 'テスト優先度タスク',
        description: '優先度テスト',
        status: 'pending',
        priority: 'high'
      };

      const createdTask = await Task.create(taskWithPriority);

      expect(createdTask.priority).toBe('high');
    });
  });
});