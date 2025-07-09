-- データベースとテーブルの初期化スクリプト
-- 実行方法: mysql -h 192.168.0.4 -u taskapp_user -p < scripts/setup-database.sql

-- データベース選択
USE task_management_app;

-- tasksテーブル作成
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Task ID (Primary Key)',
  title VARCHAR(255) NOT NULL COMMENT 'Task title',
  description TEXT COMMENT 'Task description',
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'Task status',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Task priority',
  due_date DATE COMMENT 'Due date',
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Recurring task flag',
  recurring_pattern VARCHAR(50) NULL COMMENT 'Recurring pattern (daily, weekly, etc.)',
  recurring_config JSON NULL COMMENT 'Recurring configuration details (JSON)',
  source_task_id INT NULL COMMENT 'Master task ID',
  scheduled_date DATE NULL COMMENT 'Scheduled execution date',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
  
  -- Indexes for performance
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_due_date (due_date),
  INDEX idx_is_recurring (is_recurring),
  INDEX idx_recurring_pattern (recurring_pattern),
  INDEX idx_source_task_id (source_task_id),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_daily_tasks (is_recurring, scheduled_date, status),
  
  -- Unique constraint to prevent duplicate daily task instances
  CONSTRAINT uk_daily_task_instance UNIQUE (source_task_id, scheduled_date),
  
  -- Foreign key constraint
  CONSTRAINT fk_source_task FOREIGN KEY (source_task_id) REFERENCES tasks(id) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Task management table';

-- recurring_tasksテーブル作成
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Recurring task ID',
  title VARCHAR(255) NOT NULL COMMENT 'Recurring task title',
  description TEXT COMMENT 'Recurring task description',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Task priority',
  recurring_pattern VARCHAR(50) NOT NULL DEFAULT 'daily' COMMENT 'Recurring pattern',
  recurring_config JSON NOT NULL COMMENT 'Recurring configuration details (JSON)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
  
  -- Indexes for performance
  INDEX idx_recurring_pattern (recurring_pattern),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recurring tasks management table';

-- サンプルデータ挿入
INSERT IGNORE INTO recurring_tasks (
  title, 
  description, 
  priority, 
  recurring_pattern, 
  recurring_config
) VALUES 
(
  '朝の運動', 
  '毎朝30分間のジョギングまたはストレッチで健康維持', 
  'high',
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '07:00',
    'description', '健康維持のための毎日の運動習慣'
  )
),
(
  '読書時間', 
  '毎日30分の読書で知識を蓄積する', 
  'medium',
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '20:00',
    'description', '継続的な学習習慣の確立'
  )
),
(
  '日報作成', 
  '今日の作業内容と明日の予定をまとめる', 
  'medium',
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '18:00',
    'description', '1日の振り返りと翌日の計画'
  )
);

SELECT 'Database setup completed successfully!' AS message;
SELECT 'Tables created:' AS info;
SHOW TABLES;
SELECT 'Sample recurring tasks:' AS info;
SELECT COUNT(*) as recurring_task_count FROM recurring_tasks;