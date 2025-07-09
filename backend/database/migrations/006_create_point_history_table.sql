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
  earned_date DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Date points were earned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the points were earned',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_task_id (task_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action_type (action_type),
  INDEX idx_daily_points (user_id, DATE(created_at)),
  INDEX idx_user_date (user_id, earned_date),
  INDEX idx_earned_date (earned_date),
  INDEX idx_user_task (user_id, task_id),
  
  -- Foreign key constraint
  CONSTRAINT fk_point_history_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Point history tracking table';

-- Add constraint to prevent duplicate point allocation for the same task completion
-- Using ALTER TABLE to handle cases where table already exists
ALTER TABLE point_history 
ADD CONSTRAINT IF NOT EXISTS uk_task_completion UNIQUE (task_id, action_type) 
COMMENT 'Prevent duplicate point allocation for same task completion';

SELECT 'Point history table migration completed successfully!' AS message;