/**
 * データベース接続設定
 * 
 * 環境変数を使用してデータベース接続情報を管理
 */

const mysql = require('mysql2/promise');

// データベース接続設定
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_management_app',
  charset: 'utf8mb4',
  timezone: '+09:00', // JST
  
  // 接続プール設定
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  
  // SSL設定（本番環境用）
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

/**
 * データベース接続プールを作成
 */
const createPool = () => {
  return mysql.createPool(dbConfig);
};

/**
 * 単一接続を作成（マイグレーション用）
 */
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: dbConfig.charset,
      timezone: dbConfig.timezone,
      multipleStatements: true // マイグレーション実行用
    });
    
    console.log('データベース接続が確立されました');
    return connection;
  } catch (error) {
    console.error('データベース接続エラー:', error);
    throw error;
  }
};

/**
 * データベース接続テスト
 */
const testConnection = async () => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('データベース接続テスト成功');
    return true;
  } catch (error) {
    console.error('データベース接続テスト失敗:', error);
    return false;
  }
};

module.exports = {
  dbConfig,
  createPool,
  createConnection,
  testConnection
};