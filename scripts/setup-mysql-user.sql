-- MySQL専用ユーザー作成スクリプト
-- 実行方法: mysql -u root -p < scripts/setup-mysql-user.sql

-- アプリケーション専用ユーザー作成
CREATE USER IF NOT EXISTS 'taskapp_user'@'localhost' IDENTIFIED BY 'TaskApp2025!';

-- データベース作成（存在しない場合）
CREATE DATABASE IF NOT EXISTS task_management_app 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 必要最小限の権限を付与
GRANT SELECT, INSERT, UPDATE, DELETE ON task_management_app.* TO 'taskapp_user'@'localhost';

-- DDL権限（テーブル作成・変更用）
GRANT CREATE, ALTER, INDEX, DROP ON task_management_app.* TO 'taskapp_user'@'localhost';

-- 権限の反映
FLUSH PRIVILEGES;

-- 確認
SELECT CONCAT('✅ ユーザー作成完了: ', User, '@', Host) AS result 
FROM mysql.user 
WHERE User = 'taskapp_user';

-- 権限確認
SELECT '権限確認:' AS info;
SHOW GRANTS FOR 'taskapp_user'@'localhost';