-- Migration 007: Add display_order column to recurring_tasks table
-- This column is required by RecurringTask.findAll() method

-- Add display_order column to recurring_tasks table
ALTER TABLE recurring_tasks 
ADD COLUMN display_order INT NULL COMMENT 'Display order for recurring tasks';

-- Add index for performance
ALTER TABLE recurring_tasks ADD INDEX idx_display_order (display_order);

SELECT 'Display order column added to recurring_tasks table successfully!' AS message;