/**
 * タスクAPI のテスト
 * 
 * 全てのタスク関連APIエンドポイントの動作をテストします
 */

const request = require('supertest');
const app = require('../../src/app');

// テストグループ: タスクAPI
describe('Tasks API', () => {
  
  // 各テスト実行前に実行される（初期データのリセットなど）
  beforeEach(() => {
    // 将来的にデータベースのクリーンアップ処理を追加予定
  });

  // テストグループ: GET /api/tasks (タスク一覧取得)
  describe('GET /api/tasks', () => {
    
    test('全てのタスクを正常に取得できること', async () => {
      // APIにリクエストを送信
      const response = await request(app)
        .get('/api/tasks')
        .expect(200); // HTTPステータス200を期待
      
      // レスポンスの構造をチェック
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      
      // データが配列であることをチェック
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // カウントが配列の長さと一致することをチェック
      expect(response.body.count).toBe(response.body.data.length);
      
      // 初期データが2件存在することをチェック
      expect(response.body.count).toBe(2);
    });

    test('各タスクが必要なプロパティを持っていること', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const tasks = response.body.data;
      
      // 最初のタスクの構造をチェック
      if (tasks.length > 0) {
        const task = tasks[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('created_at');
        expect(task).toHaveProperty('updated_at');
        
        // データ型のチェック
        expect(typeof task.id).toBe('number');
        expect(typeof task.title).toBe('string');
        expect(typeof task.status).toBe('string');
      }
    });
  });

  // テストグループ: GET /api/tasks/:id (特定タスク取得)
  describe('GET /api/tasks/:id', () => {
    
    test('存在するタスクIDで正常に取得できること', async () => {
      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('title');
    });

    test('存在しないタスクIDで404エラーが返ること', async () => {
      const response = await request(app)
        .get('/api/tasks/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    test('無効なID形式で404エラーが返ること', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  // テストグループ: POST /api/tasks (タスク作成)
  describe('POST /api/tasks', () => {
    
    test('有効なデータでタスクを正常に作成できること', async () => {
      const newTask = {
        title: 'テスト用タスク',
        description: 'これはテスト用のタスクです'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe(newTask.description);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('updated_at');
    });

    test('タイトルのみでタスクを作成できること', async () => {
      const newTask = {
        title: 'タイトルのみのタスク'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);
      
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe('');
    });

    test('タイトルが空の場合400エラーが返ること', async () => {
      const invalidTask = {
        description: '説明のみ'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Title is required');
    });

    test('タイトルが空文字の場合400エラーが返ること', async () => {
      const invalidTask = {
        title: '',
        description: 'テスト'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Title is required');
    });
  });

  // テストグループ: PUT /api/tasks/:id (タスク更新)
  describe('PUT /api/tasks/:id', () => {
    
    test('存在するタスクのタイトルを更新できること', async () => {
      const updateData = {
        title: '更新されたタイトル'
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.id).toBe(1);
    });

    test('存在するタスクのステータスを更新できること', async () => {
      const updateData = {
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body.data.status).toBe('completed');
    });

    test('複数のフィールドを同時に更新できること', async () => {
      const updateData = {
        title: '複数更新テスト',
        description: '複数のフィールドを更新',
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);
      
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
    });

    test('存在しないタスクの更新で404エラーが返ること', async () => {
      const updateData = {
        title: '存在しないタスク'
      };

      const response = await request(app)
        .put('/api/tasks/999')
        .send(updateData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    test('空のリクエストボディでも正常に処理されること', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({})
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // 元のデータが保持されていることを確認
      expect(response.body.data).toHaveProperty('id', 1);
    });
  });

  // テストグループ: DELETE /api/tasks/:id (タスク削除)
  describe('DELETE /api/tasks/:id', () => {
    
    test('存在するタスクを正常に削除できること', async () => {
      // まず新しいタスクを作成
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: '削除テスト用タスク' });
      
      const createdTaskId = createResponse.body.data.id;

      // 作成したタスクを削除
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .expect(200);
      
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(createdTaskId);
      expect(deleteResponse.body.message).toBe('Task deleted successfully');

      // 削除されたタスクが取得できないことを確認
      await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .expect(404);
    });

    test('存在しないタスクの削除で404エラーが返ること', async () => {
      const response = await request(app)
        .delete('/api/tasks/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  // テストグループ: エラーハンドリング
  describe('Error Handling', () => {
    
    test('存在しないエンドポイントで404が返ること', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body.error).toBe('Not Found');
    });

    test('不正なHTTPメソッドで405相当のエラーが返ること', async () => {
      // PATCHメソッドは実装していないため
      const response = await request(app)
        .patch('/api/tasks/1')
        .expect(404);
    });
  });
});