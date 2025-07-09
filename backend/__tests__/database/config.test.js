/**
 * データベース設定のテスト
 * 
 * TDD: データベース接続機能をテストファーストで開発
 */

const { dbConfig, createConnection, testConnection } = require('../../database/config');

// テスト用のモック設定
const originalEnv = process.env;

describe('データベース設定テスト', () => {

  // テスト前後の環境変数リセット
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('設定値テスト', () => {
    test('デフォルト設定値が正しく設定されること', () => {
      // 環境変数をクリア
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;

      // デフォルト値を確認
      expect(dbConfig.host).toBe('localhost');
      expect(dbConfig.port).toBe(3306);
      expect(dbConfig.user).toBe('root');
      expect(dbConfig.password).toBe('');
      expect(dbConfig.database).toBe('task_management_app');
      expect(dbConfig.charset).toBe('utf8mb4');
    });

    test('環境変数が設定されている場合は環境変数の値が使用されること', () => {
      // 環境変数を設定
      process.env.DB_HOST = 'testhost';
      process.env.DB_PORT = '3307';
      process.env.DB_USER = 'testuser';
      process.env.DB_PASSWORD = 'testpass';
      process.env.DB_NAME = 'testdb';

      // 動的にモジュールを再読み込み
      const { dbConfig: newConfig } = require('../../database/config');

      expect(newConfig.host).toBe('testhost');
      expect(newConfig.port).toBe('3307');
      expect(newConfig.user).toBe('testuser');
      expect(newConfig.password).toBe('testpass');
      expect(newConfig.database).toBe('testdb');
    });

    test('本番環境ではSSL設定が有効になること', () => {
      process.env.NODE_ENV = 'production';
      
      const { dbConfig: prodConfig } = require('../../database/config');
      
      expect(prodConfig.ssl).toEqual({
        rejectUnauthorized: false
      });
    });

    test('開発環境ではSSL設定が無効になること', () => {
      process.env.NODE_ENV = 'development';
      
      const { dbConfig: devConfig } = require('../../database/config');
      
      expect(devConfig.ssl).toBe(false);
    });
  });

  describe('接続機能テスト', () => {
    test('createConnection 関数が存在すること', () => {
      expect(typeof createConnection).toBe('function');
    });

    test('testConnection 関数が存在すること', () => {
      expect(typeof testConnection).toBe('function');
    });

    // 注意: 実際のデータベース接続テストは統合テストで実施
    // ここではMySQLサーバーが起動していない可能性があるため、
    // 関数の存在確認のみ行う
  });

  describe('設定値の妥当性チェック', () => {
    test('必須設定項目が存在すること', () => {
      expect(dbConfig.host).toBeDefined();
      expect(dbConfig.port).toBeDefined();
      expect(dbConfig.user).toBeDefined();
      expect(dbConfig.database).toBeDefined();
      expect(dbConfig.charset).toBe('utf8mb4');
    });

    test('接続プール設定が適切であること', () => {
      expect(dbConfig.connectionLimit).toBe(10);
      expect(dbConfig.acquireTimeout).toBe(60000);
      expect(dbConfig.timeout).toBe(60000);
    });

    test('タイムゾーン設定が日本標準時であること', () => {
      expect(dbConfig.timezone).toBe('+09:00');
    });
  });
});