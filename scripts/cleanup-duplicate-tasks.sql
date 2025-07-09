-- 重複デイリータスクのクリーンアップスクリプト
-- 実行前に必ずバックアップを取ってください

USE task_management_app;

-- 重複タスクの確認
SELECT 
    source_task_id,
    scheduled_date,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(id ORDER BY id) as task_ids
FROM tasks 
WHERE is_recurring = FALSE 
  AND source_task_id IS NOT NULL 
  AND scheduled_date IS NOT NULL
GROUP BY source_task_id, scheduled_date
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 重複データの削除（最新のものを残し、古いものを削除）
DELETE t1 FROM tasks t1
INNER JOIN tasks t2 
WHERE t1.source_task_id = t2.source_task_id 
  AND t1.scheduled_date = t2.scheduled_date
  AND t1.is_recurring = FALSE
  AND t2.is_recurring = FALSE
  AND t1.source_task_id IS NOT NULL
  AND t2.source_task_id IS NOT NULL
  AND t1.id < t2.id;

-- 削除後の確認
SELECT 
    '重複削除後のデイリータスク数:' as info,
    COUNT(*) as count
FROM tasks 
WHERE is_recurring = FALSE 
  AND source_task_id IS NOT NULL;

-- 今日のデイリータスク確認
SELECT 
    t.id,
    t.title,
    t.priority,
    t.status,
    t.source_task_id,
    t.scheduled_date
FROM tasks t
WHERE t.is_recurring = FALSE 
  AND t.source_task_id IS NOT NULL 
  AND t.scheduled_date = CURDATE()
ORDER BY t.priority DESC, t.created_at ASC;