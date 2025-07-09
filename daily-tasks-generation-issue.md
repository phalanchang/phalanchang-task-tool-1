# デイリータスク生成エラー - 障害調査・対応ドキュメント

## 問題管理テーブル

| ID | 課題内容 | ステータス | 担当者 | 最終更新 |
|----|----------|------------|--------|----------|
| 002 | POST /api/tasks/generate-today で 500 Internal Server Error | ✅解決 | Claude | 2025-07-03 |
| 003 | 本日のデイリータスクが存在しない | ✅解決 | Claude | 2025-07-03 |

---

## 問題詳細

### 002: POST /api/tasks/generate-today で 500 Internal Server Error

**現象**
- フロントエンドのタスク管理画面で「POST http://localhost:3001/api/tasks/generate-today 500 (Internal Server Error)」
- デイリータスク取得エラー: 「サーバーエラーが発生しました。しばらく時間をおいて再度お試しください」
- Tasks.tsx:57 の generateTodayTasks で発生

**影響範囲**
- デイリータスクの自動生成機能が停止
- タスク管理画面の初期表示で毎回エラー
- 新しい日のタスクが作成できない

### 003: 本日のデイリータスクが存在しない

**現象**
- データ移行時に既存のデイリータスクインスタンスは保持されたが、2025-07-03分が未生成
- recurring_tasksからの新規タスク生成が必要

**影響範囲**
- 今日のタスク管理ができない
- ユーザビリティの低下

---

## 調査計画

### 調査002: generate-today API エラー原因特定
1. バックエンドログ確認
2. generateTodayTasks コントローラーの動作確認  
3. Task.generateTasksForDate メソッドの動作確認
4. recurring_tasks テーブルからの取得処理確認

### 調査003: 既存デイリータスク状況確認
1. tasks テーブルの今日分データ確認
2. source_task_id の整合性確認
3. 最新の scheduled_date 確認

---

## 調査結果

### バックエンドログ確認
**実行コマンド**: `docker logs task-app-backend --tail=20`
**結果**: [調査後記載]

### API直接テスト
**実行コマンド**: `curl -X POST "http://localhost:3001/api/tasks/generate-today"`  
**結果**: [調査後記載]

### データベース状況確認
**実行コマンド**: 
```sql
-- 今日のデイリータスク確認
SELECT COUNT(*) FROM tasks WHERE scheduled_date = '2025-07-03';

-- recurring_tasks 数確認  
SELECT COUNT(*) FROM recurring_tasks WHERE is_active = 1;

-- 最新のデイリータスク確認
SELECT scheduled_date, COUNT(*) FROM tasks 
WHERE source_task_id IS NOT NULL 
GROUP BY scheduled_date 
ORDER BY scheduled_date DESC LIMIT 3;
```
**結果**: [調査後記載]

---

## 対応内容

### 対応002-1: 00:13 - 外部キー制約エラー修正
**問題**: `tasks` テーブルの `source_task_id` 外部キー制約が `tasks(id)` を参照していたが、新構成では `recurring_tasks(id)` を参照する必要があった
**エラー内容**: `Cannot add or update a child row: a foreign key constraint fails (fk_source_task FOREIGN KEY (source_task_id) REFERENCES tasks(id))`
**修正内容**: 
1. 既存の外部キー制約 `fk_source_task` を削除
2. 新しい外部キー制約 `fk_source_recurring_task` を追加（`recurring_tasks(id)` を参照）
```sql
ALTER TABLE tasks DROP FOREIGN KEY fk_source_task;
ALTER TABLE tasks ADD CONSTRAINT fk_source_recurring_task 
FOREIGN KEY (source_task_id) REFERENCES recurring_tasks(id) ON DELETE CASCADE;
```

**テスト結果**: 
- ✅ API `/api/tasks/generate-today` が正常動作
- ✅ 12個のデイリータスクが生成
- ✅ ポイントが正しく継承（朝活Noteを書く: 300ポイント）
- ✅ フロントエンドでエラーが解消

**ステータス**: ✅完了

### 対応003-1: 00:13 - 今日分デイリータスク生成
**問題**: データ移行時に2025-07-02分のデイリータスクが削除され、新規生成が必要だった
**修正内容**: 
- 外部キー制約修正後、`generate-today` APIで自動生成

**テスト結果**: 
- ✅ 12個の今日分デイリータスクが生成
- ✅ `recurring_tasks` からのポイント継承が正常動作
- ✅ `source_task_id` が正しく `recurring_tasks.id` を参照

**ステータス**: ✅完了

---

## 最終確認

### 動作テスト
- [x] API `/api/tasks/generate-today` が正常動作
- [x] 今日分のデイリータスクが生成される（12個）
- [x] フロントエンドでエラーが発生しない
- [x] 生成されたタスクにポイントが正しく設定される

### 回帰テスト  
- [x] 繰り返しタスク機能に影響なし
- [x] 既存のデイリータスクに影響なし
- [x] ポイントシステムに影響なし

### 解決サマリー
**根本原因**: 外部キー制約が古い構成（`tasks` → `tasks`）のまま残っていた
**解決方法**: 外部キー制約を新構成（`tasks` → `recurring_tasks`）に更新
**影響範囲**: デイリータスク生成機能が完全復旧、ポイント継承も正常動作
**所要時間**: 約15分

### 重要な学習事項
- データベーススキーマ変更時は関連する制約も同時に更新が必要
- 外部キー制約エラーは新しいテーブル構成との整合性不一致が原因
- `recurring_tasks` テーブル構成への移行が完全に完了

---

## 備考

**関連ファイル**:
- `backend/src/controllers/tasksController.js` (generateTodayTasks)
- `backend/src/models/Task.js` (generateTasksForDate)
- `frontend/src/pages/Tasks.tsx`
- `frontend/src/services/api.ts`

**エラー発生箇所**:
- `api.ts:189` - generateTodayTasks API呼び出し
- `Tasks.tsx:57` - デイリータスク生成処理
- `Tasks.tsx:62` - エラーハンドリング

**推定原因**:
- Task.generateTasksForDate メソッドが recurring_tasks テーブルに対応していない可能性
- SQL構文エラーまたはテーブル参照エラー
- データ移行による整合性問題