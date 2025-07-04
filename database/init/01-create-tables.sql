-- Database initialization for Docker container
-- This script creates the task_management_app database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS task_management_app
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE task_management_app;

-- Create tasks table with recurring task support
CREATE TABLE IF NOT EXISTS tasks (
  -- Primary key
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Task ID (Primary Key)',
  
  -- Basic information
  title VARCHAR(255) NOT NULL COMMENT 'Task title',
  description TEXT COMMENT 'Task description',
  
  -- Status management
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'Task status',
  
  -- Priority management
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Task priority',
  
  -- Due date management
  due_date DATE COMMENT 'Due date',
  
  -- Recurring task fields
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Recurring task flag',
  recurring_pattern VARCHAR(50) NULL COMMENT 'Recurring pattern (daily, weekly, etc.)',
  recurring_config JSON NULL COMMENT 'Recurring configuration details (JSON)',
  source_task_id INT NULL COMMENT 'Master task ID',
  scheduled_date DATE NULL COMMENT 'Scheduled execution date',
  
  -- Timestamps
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

-- Create dedicated recurring_tasks table
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

-- Create view for backward compatibility (MySQL 8.0 compatible)
DROP VIEW IF EXISTS recurring_tasks_view;
CREATE VIEW recurring_tasks_view AS
SELECT 
  id,
  title,
  description,
  priority,
  recurring_pattern,
  recurring_config,
  created_at,
  updated_at
FROM tasks 
WHERE is_recurring = TRUE;

-- Add points column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 COMMENT 'Points awarded for completing this task',
ADD COLUMN IF NOT EXISTS display_order INT NULL COMMENT 'Display order for daily tasks' AFTER recurring_config;

-- Add points and display_order columns to recurring_tasks table
ALTER TABLE recurring_tasks 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 COMMENT 'Points awarded for completing this recurring task',
ADD COLUMN IF NOT EXISTS display_order INT NULL COMMENT 'Display order for recurring tasks';

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
  INDEX idx_daily_points (user_id, DATE(created_at))
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Point history tracking table';

-- Insert default user record
INSERT INTO user_points (user_id, total_points, daily_points, last_updated) 
VALUES ('default_user', 0, 0, CURRENT_DATE)
ON DUPLICATE KEY UPDATE
  last_updated = CURRENT_DATE;

-- Add indexes to tasks table for points-related queries
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_points (points);
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_display_order (display_order);
ALTER TABLE recurring_tasks ADD INDEX IF NOT EXISTS idx_points (points);
ALTER TABLE recurring_tasks ADD INDEX IF NOT EXISTS idx_display_order (display_order);

SELECT 'Database tables created successfully!' AS message;