-- マイグレーション: tasksテーブルに繰り返しタスク機能追加
-- 作成日: 2025-06-21
-- 説明: 毎日タスク機能に必要なフィールドを既存のtasksテーブルに追加

-- データベース使用宣言
USE task_management_app;

-- tasksテーブルに繰り返しタスク関連フィールドを追加
ALTER TABLE tasks 
  -- 繰り返しタスクかどうかの判定フラグ
  ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT FALSE COMMENT '繰り返しタスクフラグ',
  
  -- 繰り返しパターン（今回は'daily'のみ）
  ADD COLUMN recurring_pattern VARCHAR(50) NULL COMMENT '繰り返しパターン（daily等）',
  
  -- 繰り返し設定の詳細（JSON形式）
  ADD COLUMN recurring_config JSON NULL COMMENT '繰り返し設定詳細（JSON）',
  
  -- マスタータスクID（どのタスクから生成されたか）
  ADD COLUMN source_task_id INT NULL COMMENT 'マスタータスクID',
  
  -- 実行予定日（繰り返しタスクの実行日）
  ADD COLUMN scheduled_date DATE NULL COMMENT '実行予定日',
  
  -- 外部キー制約の追加
  ADD CONSTRAINT fk_source_task FOREIGN KEY (source_task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- インデックスの追加（パフォーマンス向上のため）
ALTER TABLE tasks
  ADD INDEX idx_is_recurring (is_recurring),
  ADD INDEX idx_recurring_pattern (recurring_pattern),
  ADD INDEX idx_source_task_id (source_task_id),
  ADD INDEX idx_scheduled_date (scheduled_date),
  -- 複合インデックス（デイリータスク検索用）
  ADD INDEX idx_daily_tasks (is_recurring, scheduled_date, status);

-- テーブル構造確認用クエリ
SELECT 'tasksテーブルに繰り返しタスク機能が正常に追加されました。' AS message;

-- 新しいテーブル構造の確認
DESCRIBE tasks;