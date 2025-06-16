module.exports = {
  // テスト環境の設定
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // カバレッジ設定
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // サーバー起動ファイルは除外
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // カバレッジの閾値設定
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // モックファイルの場所
  clearMocks: true,
  restoreMocks: true
};