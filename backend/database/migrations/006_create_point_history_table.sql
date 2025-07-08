-- Create point_history table for detailed point tracking
-- Migration 006: Point History System Implementation

-- Create point_history table for tracking all point allocation history
CREATE TABLE IF NOT EXISTS point_history (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Point history record ID',
  user_id VARCHAR(50) NOT NULL DEFAULT 'default_user' COMMENT 'User identifier',
  task_id INT NULL COMMENT 'Related task ID (null for manual additions)',
  points_earned INT NOT NULL COMMENT 'Points earned in this transaction',
  task_title VARCHAR(255) NULL COMMENT 'Task title for reference',
  action_type ENUM('task_completion', 'manual_addition', 'bonus') NOT NULL DEFAULT 'task_completion' COMMENT 'Type of point allocation',
  earned_date DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Date points were earned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_user_date (user_id, earned_date),
  INDEX idx_task_id (task_id),
  INDEX idx_action_type (action_type),
  INDEX idx_earned_date (earned_date),
  INDEX idx_created_at (created_at),
  
  -- Composite indexes for common queries
  INDEX idx_user_task (user_id, task_id),
  INDEX idx_daily_points (user_id, earned_date, action_type),
  
  -- Foreign key constraint for task_id (allows NULL)
  CONSTRAINT fk_point_history_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Point allocation history tracking table';

-- Add constraint to prevent duplicate point allocation for the same task completion
ALTER TABLE point_history 
ADD CONSTRAINT uk_task_completion UNIQUE (task_id, action_type) 
COMMENT 'Prevent duplicate point allocation for same task completion';

SELECT 'Point history table created successfully!' AS message;