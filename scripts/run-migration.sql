-- Execute migration 004_add_display_order.sql
-- Run this script to add display_order field to tasks table

USE task_management_app;

-- Add display_order field to tasks table
ALTER TABLE tasks ADD COLUMN display_order INT NULL COMMENT 'Display order for daily tasks' AFTER recurring_config;

-- Add index for performance
ALTER TABLE tasks ADD INDEX idx_display_order (display_order);

-- Update existing recurring tasks to have default display order based on creation order
UPDATE tasks 
SET display_order = id 
WHERE is_recurring = TRUE AND display_order IS NULL;

SELECT 'Display order field added successfully!' AS message;