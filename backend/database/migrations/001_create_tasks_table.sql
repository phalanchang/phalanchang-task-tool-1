-- マイグレーション: tasksテーブル作成
-- 作成日: 2025-06-17
-- 説明: タスク管理アプリケーションのメインテーブルを作成

-- データベース作成（存在しない場合のみ）
CREATE DATABASE IF NOT EXISTS task_management_app
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- データベース使用宣言
USE task_management_app;

-- tasksテーブル作成
CREATE TABLE IF NOT EXISTS tasks (
  -- 主キー：自動採番されるタスクID
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'タスクID（主キー）',
  
  -- 基本情報
  title VARCHAR(255) NOT NULL COMMENT 'タスクタイトル',
  description TEXT COMMENT 'タスクの詳細説明',
  
  -- ステータス管理
  status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'タスクステータス',
  
  -- 優先度管理（将来の拡張用）
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'タスク優先度',
  
  -- 期限管理（将来の拡張用）
  due_date DATE COMMENT '期限日',
  
  -- タイムスタンプ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  -- インデックス定義
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_due_date (due_date)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='タスク管理テーブル';

-- テーブル作成完了メッセージ
SELECT 'tasksテーブルが正常に作成されました。' AS message;