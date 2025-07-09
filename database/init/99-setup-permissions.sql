-- Database user setup and permissions
-- This script creates application users and sets up proper permissions

USE task_management_app;

-- Create application user for backend API
CREATE USER IF NOT EXISTS 'taskapp_user'@'%' IDENTIFIED BY 'TaskApp2025!';

-- Grant necessary privileges to taskapp_user
GRANT SELECT, INSERT, UPDATE, DELETE ON task_management_app.* TO 'taskapp_user'@'%';
GRANT CREATE, ALTER, INDEX, DROP ON task_management_app.* TO 'taskapp_user'@'%';

-- Allow taskapp_user to use the recurring_tasks table and views
GRANT SELECT, INSERT, UPDATE, DELETE ON task_management_app.recurring_tasks TO 'taskapp_user'@'%';
GRANT SELECT ON task_management_app.recurring_tasks_view TO 'taskapp_user'@'%';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Create read-only user for reporting/analytics (optional)
CREATE USER IF NOT EXISTS 'readonly_user'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON task_management_app.* TO 'readonly_user'@'%';

FLUSH PRIVILEGES;

-- Display created users
SELECT 'Database users created successfully!' AS message;
SELECT 
  User as username,
  Host as allowed_host,
  authentication_string IS NOT NULL as has_password
FROM mysql.user 
WHERE User IN ('taskapp_user', 'readonly_user', 'root')
ORDER BY User;

-- Display user privileges
SELECT 'User privileges:' AS info;
SHOW GRANTS FOR 'taskapp_user'@'%';
SHOW GRANTS FOR 'readonly_user'@'%';