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

SELECT 'Database tables created successfully!' AS message;