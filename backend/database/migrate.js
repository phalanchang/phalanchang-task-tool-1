/**
 * データベースマイグレーション実行スクリプト
 * 
 * 使用方法:
 * node database/migrate.js [up|down|reset|seed]
 */

const fs = require('fs').promises;
const path = require('path');
const { createConnection } = require('./config');

/**
 * マイグレーションファイルを読み込んで実行
 */
async function runMigrations() {
  let connection;
  
  try {
    console.log('=== データベースマイグレーション開始 ===');
    
    // データベース接続
    connection = await createConnection();
    
    // マイグレーションディレクトリのファイル一覧取得
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    console.log(`実行予定のマイグレーション: ${sqlFiles.length}件`);
    
    // 各マイグレーションファイルを実行
    for (const file of sqlFiles) {
      console.log(`\n--- ${file} を実行中 ---`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // SQLを実行
      const [results] = await connection.execute(sql);
      console.log(`✓ ${file} 実行完了`);
      
      // 結果があればメッセージを表示
      if (Array.isArray(results) && results.length > 0) {
        results.forEach(result => {
          if (result.message) {
            console.log(`  ${result.message}`);
          }
        });
      }
    }
    
    console.log('\n=== マイグレーション完了 ===');
    
  } catch (error) {
    console.error('マイグレーションエラー:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * シードデータを実行
 */
async function runSeeds() {
  let connection;
  
  try {
    console.log('=== シードデータ投入開始 ===');
    
    // データベース接続
    connection = await createConnection();
    
    // シードディレクトリのファイル一覧取得
    const seedsDir = path.join(__dirname, 'seeds');
    const files = await fs.readdir(seedsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    console.log(`実行予定のシード: ${sqlFiles.length}件`);
    
    // 各シードファイルを実行
    for (const file of sqlFiles) {
      console.log(`\n--- ${file} を実行中 ---`);
      
      const filePath = path.join(seedsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // SQLを実行
      const [results] = await connection.execute(sql);
      console.log(`✓ ${file} 実行完了`);
      
      // 結果があればメッセージを表示
      if (Array.isArray(results) && results.length > 0) {
        results.forEach(result => {
          if (result.message) {
            console.log(`  ${result.message}`);
          }
          if (result.total_tasks !== undefined) {
            console.log(`  総タスク数: ${result.total_tasks}`);
          }
          if (result.count !== undefined) {
            console.log(`  ${result.status}: ${result.count}件`);
          }
        });
      }
    }
    
    console.log('\n=== シードデータ投入完了 ===');
    
  } catch (error) {
    console.error('シードデータ投入エラー:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * データベースリセット（開発環境用）
 */
async function resetDatabase() {
  let connection;
  
  try {
    console.log('=== データベースリセット開始 ===');
    console.log('⚠️  警告: すべてのデータが削除されます');
    
    // データベース接続
    connection = await createConnection();
    
    // データベース削除・再作成
    await connection.execute('DROP DATABASE IF EXISTS task_management_app');
    console.log('既存データベースを削除しました');
    
    await connection.execute(`
      CREATE DATABASE task_management_app 
      DEFAULT CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('新しいデータベースを作成しました');
    
    console.log('=== データベースリセット完了 ===');
    
  } catch (error) {
    console.error('データベースリセットエラー:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * データベース状態確認
 */
async function checkStatus() {
  let connection;
  
  try {
    console.log('=== データベース状態確認 ===');
    
    connection = await createConnection();
    
    // データベース一覧確認
    const [databases] = await connection.execute('SHOW DATABASES LIKE "task_management_app"');
    
    if (databases.length === 0) {
      console.log('❌ task_management_app データベースが存在しません');
      return;
    }
    
    console.log('✓ task_management_app データベースが存在します');
    
    // テーブル確認
    await connection.execute('USE task_management_app');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('❌ テーブルが存在しません');
      return;
    }
    
    console.log('✓ テーブル一覧:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // データ確認
    const [taskCount] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
    console.log(`✓ タスクデータ: ${taskCount[0].count}件`);
    
    const [statusCount] = await connection.execute('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
    console.log('✓ ステータス別:');
    statusCount.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}件`);
    });
    
  } catch (error) {
    console.error('データベース状態確認エラー:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// コマンドライン引数処理
async function main() {
  const command = process.argv[2] || 'up';
  
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'seed':
      await runSeeds();
      break;
    case 'reset':
      await resetDatabase();
      break;
    case 'status':
      await checkStatus();
      break;
    case 'setup':
      await runMigrations();
      await runSeeds();
      break;
    default:
      console.log('使用方法: node database/migrate.js [up|seed|reset|status|setup]');
      console.log('  up     - マイグレーション実行');
      console.log('  seed   - シードデータ投入');
      console.log('  reset  - データベースリセット（危険）');
      console.log('  status - データベース状態確認');
      console.log('  setup  - マイグレーション + シードデータ（初回セットアップ）');
      process.exit(1);
  }
}

// 実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runMigrations,
  runSeeds,
  resetDatabase,
  checkStatus
};