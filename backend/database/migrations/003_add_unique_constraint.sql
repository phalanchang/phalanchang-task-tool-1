-- マイグレーション: デイリータスク重複防止のためのUNIQUE制約追加
-- 作成日: 2025-06-25
-- 説明: source_task_id + scheduled_dateの組み合わせをUNIQUEにして重複防止

-- データベース使用宣言
USE task_management_app;

-- 既存の重複データをクリーンアップ（もしあれば）
-- 同じsource_task_id + scheduled_dateの組み合わせで複数ある場合、最新のもの以外を削除
DELETE t1 FROM tasks t1
INNER JOIN tasks t2 
WHERE t1.source_task_id = t2.source_task_id 
  AND t1.scheduled_date = t2.scheduled_date
  AND t1.is_recurring = FALSE
  AND t2.is_recurring = FALSE
  AND t1.source_task_id IS NOT NULL
  AND t2.source_task_id IS NOT NULL
  AND t1.id < t2.id;

-- UNIQUE制約を追加（デイリータスクインスタンスの重複防止）
ALTER TABLE tasks 
ADD CONSTRAINT uk_daily_task_instance 
UNIQUE (source_task_id, scheduled_date);

-- インデックス追加完了メッセージ
SELECT 'デイリータスク重複防止のUNIQUE制約が正常に追加されました。' AS message;

-- 制約の確認
SHOW INDEX FROM tasks WHERE Key_name = 'uk_daily_task_instance';