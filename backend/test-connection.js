/**
 * MySQL接続テスト用スクリプト
 */

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('MySQL接続テスト開始...');
    
    // 環境変数から接続情報を取得
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'taskapp_user',
      password: process.env.DB_PASSWORD || 'TaskApp2025!',
      database: process.env.DB_NAME || 'task_management_app',
      insecureAuth: true,
      ssl: false
    });

    console.log('✅ MySQL接続成功');
    
    // データベース一覧を取得
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('利用可能なデータベース:', databases.map(db => db.Database));
    
    // task_management_appデータベースの存在確認
    const dbExists = databases.some(db => db.Database === 'task_management_app');
    if (dbExists) {
      console.log('✅ task_management_appデータベースが存在します');
    } else {
      console.log('❌ task_management_appデータベースが存在しません');
      console.log('以下のSQLを実行してください: CREATE DATABASE task_management_app;');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ MySQL接続エラー:', error.message);
    console.error('エラーコード:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 修正方法:');
      console.log('MySQLコンソールで以下を実行してください:');
      console.log('ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'\';');
      console.log('FLUSH PRIVILEGES;');
    }
  }
}

testConnection();