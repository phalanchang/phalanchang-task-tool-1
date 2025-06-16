/**
 * Jest テストセットアップファイル
 * 
 * 全てのテスト実行前に実行される設定ファイル
 */

// テスト環境の環境変数を設定
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // テスト用ポート

// コンソール出力を抑制（テスト結果が見やすくなる）
global.console = {
  ...console,
  // 重要なログは残し、一般的なログは抑制
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// このファイルが空のテストスイートとして認識されないようにするためのダミーテスト
describe('Setup', () => {
  test('should configure test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});