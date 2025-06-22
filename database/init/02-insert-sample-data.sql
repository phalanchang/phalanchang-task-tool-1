-- Sample data for task management application
-- This script inserts sample recurring tasks for development and testing

USE task_management_app;

-- Insert sample data into dedicated recurring_tasks table
INSERT INTO recurring_tasks (
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
),
(
  'メール確認', 
  '受信メールの確認と重要メールへの返信', 
  'medium',
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '09:00',
    'description', '業務開始前のメールチェック'
  )
),
(
  'デスク整理', 
  '作業デスクの片付けと明日の準備', 
  'low',
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '17:30',
    'description', '作業環境を整える習慣'
  )
);

-- Insert some sample regular (non-recurring) tasks
INSERT INTO tasks (
  title,
  description,
  status,
  priority,
  is_recurring,
  due_date
) VALUES
(
  'プロジェクト企画書作成',
  '新プロジェクトの企画書を作成し、関係者にレビューを依頼する',
  'pending',
  'high',
  FALSE,
  DATE_ADD(CURDATE(), INTERVAL 3 DAY)
),
(
  'システムバックアップ',
  '月次システムバックアップの実行と確認',
  'pending',
  'medium',
  FALSE,
  DATE_ADD(CURDATE(), INTERVAL 1 DAY)
),
(
  'チーム会議準備',
  '来週のチーム会議の議題整理と資料準備',
  'in_progress',
  'medium',
  FALSE,
  DATE_ADD(CURDATE(), INTERVAL 2 DAY)
);

-- Note: Daily task instances will be created by the application logic
-- This is just sample static data for development

SELECT 'Sample data inserted successfully!' AS message;

-- Display summary of inserted data
SELECT 'Recurring tasks:' AS info;
SELECT 
  id,
  title,
  priority,
  JSON_UNQUOTE(JSON_EXTRACT(recurring_config, '$.time')) AS scheduled_time
FROM recurring_tasks
ORDER BY JSON_UNQUOTE(JSON_EXTRACT(recurring_config, '$.time'));

SELECT 'Regular tasks:' AS info;
SELECT 
  id,
  title,
  priority,
  status,
  due_date
FROM tasks 
WHERE is_recurring = FALSE
ORDER BY due_date;