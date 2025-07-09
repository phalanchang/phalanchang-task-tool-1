-- シードデータ: 繰り返しタスクのサンプルデータ
-- 作成日: 2025-06-21
-- 説明: 毎日タスク機能のテスト用サンプルデータ

-- データベース使用宣言
USE task_management_app;

-- マスタータスク（繰り返しタスクの元となるタスク）の作成
INSERT INTO tasks (
  title, 
  description, 
  status, 
  priority, 
  is_recurring, 
  recurring_pattern, 
  recurring_config
) VALUES 
(
  '朝の運動', 
  '毎朝30分間のジョギングまたはストレッチ', 
  'pending', 
  'high',
  TRUE,
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '07:00',
    'description', '健康維持のための毎日の運動習慣'
  )
),
(
  'メール確認', 
  '受信メールの確認と重要メールへの返信', 
  'pending', 
  'medium',
  TRUE,
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '09:00',
    'description', '業務開始前のメールチェック'
  )
),
(
  '日報作成', 
  '今日の作業内容と明日の予定をまとめる', 
  'pending', 
  'medium',
  TRUE,
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '18:00',
    'description', '1日の振り返りと翌日の計画'
  )
),
(
  'デスク整理', 
  '作業デスクの片付けと明日の準備', 
  'pending', 
  'low',
  TRUE,
  'daily',
  JSON_OBJECT(
    'type', 'daily',
    'interval', 1,
    'time', '17:30',
    'description', '作業環境を整える習慣'
  )
);

-- 今日（2025-06-21）のタスクインスタンスを生成
-- マスタータスクのIDを取得して、今日の実行タスクとして生成
INSERT INTO tasks (
  title,
  description,
  status,
  priority,
  is_recurring,
  source_task_id,
  scheduled_date
)
SELECT 
  CONCAT(title, ' (', DATE_FORMAT(CURDATE(), '%Y-%m-%d'), ')'),
  description,
  'pending',
  priority,
  FALSE, -- インスタンスタスクはis_recurring=FALSE
  id,    -- マスタータスクのIDを参照
  CURDATE() -- 今日の日付
FROM tasks 
WHERE is_recurring = TRUE 
  AND recurring_pattern = 'daily';

-- サンプルデータ作成完了メッセージ
SELECT '繰り返しタスクのサンプルデータが正常に作成されました。' AS message;

-- 作成されたデータの確認
SELECT 
  '=== マスタータスク（繰り返しタスク定義） ===' AS section;
  
SELECT 
  id,
  title,
  priority,
  is_recurring,
  recurring_pattern,
  JSON_UNQUOTE(JSON_EXTRACT(recurring_config, '$.time')) AS scheduled_time
FROM tasks 
WHERE is_recurring = TRUE;

SELECT 
  '=== 今日のタスクインスタンス ===' AS section;
  
SELECT 
  id,
  title,
  priority,
  source_task_id,
  scheduled_date,
  status
FROM tasks 
WHERE is_recurring = FALSE 
  AND source_task_id IS NOT NULL 
  AND scheduled_date = CURDATE();