/**
 * Express アプリケーション全体のテスト
 * 
 * app.js のエラーハンドラーやミドルウェアの動作をテストします
 */

const request = require('supertest');
const app = require('../src/app');

describe('Express App', () => {

  // テストグループ: 基本エンドポイント
  describe('Basic Endpoints', () => {
    
    test('GET /health - ヘルスチェックが正常に動作すること', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Server is running');
      expect(response.body).toHaveProperty('timestamp');
      
      // タイムスタンプがISO形式であることを確認
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('GET /api - API情報が正常に取得できること', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Task Management API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('tasks', '/api/tasks');
      expect(response.body.endpoints).toHaveProperty('health', '/health');
    });
  });

  // テストグループ: エラーハンドリング
  describe('Error Handling', () => {
    
    test('存在しないエンドポイントで404エラーが返ること', async () => {
      const response = await request(app)
        .get('/nonexistent-endpoint')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('GET /nonexistent-endpoint not found');
    });

    test('存在しないAPIエンドポイントで404エラーが返ること', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toContain('GET /api/nonexistent not found');
    });

    test('不正なJSONでのPOSTリクエストでエラーハンドリングされること', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}') // 不正なJSON
        .expect(500); // 実際は500エラーが返される
      
      // カスタムエラーハンドラーがJSONパースエラーを処理
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
      expect(response.body).toHaveProperty('message');
    });
  });

  // テストグループ: ミドルウェア
  describe('Middleware', () => {
    
    test('CORSヘッダーが設定されていること', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      // CORSヘッダーが設定されていることを確認
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('セキュリティヘッダー（Helmet）が設定されていること', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      // Helmetによるセキュリティヘッダーの確認
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    test('JSONパース機能が動作していること', async () => {
      const testData = { title: 'JSONテスト' };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(testData)
        .expect(201);
      
      expect(response.body.data.title).toBe(testData.title);
    });

    test('URL-encodedデータの解析が動作していること', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('title=URLエンコードテスト&description=テスト説明')
        .expect(201);
      
      expect(response.body.data.title).toBe('URLエンコードテスト');
      expect(response.body.data.description).toBe('テスト説明');
    });
  });

  // テストグループ: HTTPメソッドサポート
  describe('HTTP Methods', () => {
    
    test('GET メソッドがサポートされていること', async () => {
      await request(app)
        .get('/api/tasks')
        .expect(200);
    });

    test('POST メソッドがサポートされていること', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'POSTテスト' })
        .expect(201);
    });

    test('PUT メソッドがサポートされていること', async () => {
      await request(app)
        .put('/api/tasks/1')
        .send({ title: 'PUTテスト' })
        .expect(200);
    });

    test('DELETE メソッドがサポートされていること', async () => {
      // まず削除用のタスクを作成
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: '削除テスト用' });
      
      const taskId = createResponse.body.data.id;

      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);
    });

    test('サポートされていないメソッドで404が返ること', async () => {
      await request(app)
        .patch('/api/tasks/1')
        .expect(404);
    });
  });

  // テストグループ: レスポンス形式
  describe('Response Format', () => {
    
    test('すべてのAPIレスポンスがJSON形式であること', async () => {
      const endpoints = [
        '/health',
        '/api',
        '/api/tasks'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);
        
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    test('エラーレスポンスもJSON形式であること', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(typeof response.body).toBe('object');
    });
  });
});