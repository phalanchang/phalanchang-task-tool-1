-- Add points system to tasks and create user_points table
-- Migration 005: Points System Implementation

-- Add points column to tasks table
ALTER TABLE tasks 
ADD COLUMN points INT DEFAULT 0 COMMENT 'Points awarded for completing this task';

-- Add points column to recurring_tasks table
ALTER TABLE recurring_tasks 
ADD COLUMN points INT DEFAULT 0 COMMENT 'Points awarded for completing this recurring task';

-- Create user_points table for tracking cumulative points
CREATE TABLE IF NOT EXISTS user_points (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'User points record ID',
  user_id VARCHAR(50) NOT NULL DEFAULT 'default_user' COMMENT 'User identifier (future expansion)',
  total_points INT NOT NULL DEFAULT 0 COMMENT 'Total accumulated points',
  daily_points INT NOT NULL DEFAULT 0 COMMENT 'Points earned today',
  last_updated DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Last update date',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_last_updated (last_updated),
  
  -- Unique constraint to ensure one record per user
  UNIQUE KEY uk_user_points (user_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User points tracking table';

-- Insert default user record
INSERT INTO user_points (user_id, total_points, daily_points, last_updated) 
VALUES ('default_user', 0, 0, CURRENT_DATE)
ON DUPLICATE KEY UPDATE
  last_updated = CURRENT_DATE;

-- Add indexes to tasks table for points-related queries
ALTER TABLE tasks ADD INDEX idx_points (points);
ALTER TABLE recurring_tasks ADD INDEX idx_points (points);

SELECT 'Points system migration completed successfully!' AS message;