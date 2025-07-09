-- 既存のデイリータスクのポイントをマスタータスクから継承するSQL

UPDATE tasks AS daily_task
INNER JOIN tasks AS master_task ON daily_task.source_task_id = master_task.id
SET daily_task.points = master_task.points
WHERE daily_task.source_task_id IS NOT NULL
  AND master_task.is_recurring = 1
  AND daily_task.points != master_task.points;

-- 実行確認用クエリ
SELECT 
  daily.id as daily_id,
  daily.title,
  daily.points as daily_points,
  master.id as master_id,
  master.points as master_points,
  daily.scheduled_date
FROM tasks daily
INNER JOIN tasks master ON daily.source_task_id = master.id
WHERE daily.source_task_id IS NOT NULL
  AND master.is_recurring = 1
ORDER BY daily.scheduled_date DESC, daily.id;