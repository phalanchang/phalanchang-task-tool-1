-- Migration 006: Create point_history table
-- This table is referenced in the Task.js model but was missing from the schema

-- Create point_history table for tracking point transactions
CREATE TABLE IF NOT EXISTS point_history (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Point history record ID',
  user_id VARCHAR(50) NOT NULL DEFAULT 'default_user' COMMENT 'User identifier',
  task_id INT NULL COMMENT 'Task ID that earned the points',
  points_earned INT NOT NULL COMMENT 'Points earned in this transaction',
  task_title VARCHAR(255) NULL COMMENT 'Title of the task that earned points',
  action_type VARCHAR(50) NOT NULL DEFAULT 'task_completion' COMMENT 'Type of action that earned points',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the points were earned',
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_task_id (task_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action_type (action_type),
  INDEX idx_daily_points (user_id, DATE(created_at)),
  
  -- Foreign key constraint
  CONSTRAINT fk_point_history_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_point_history_user FOREIGN KEY (user_id) REFERENCES user_points(user_id) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Point history tracking table';

SELECT 'Point history table migration completed successfully!' AS message;