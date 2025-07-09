# recurring_tasks テーブル構成への移行計画

## 現在の構成
- **繰り返しタスクマスター**: `tasks` テーブルで `is_recurring = 1`
- **デイリータスクインスタンス**: `tasks` テーブルで `source_task_id` に親タスクIDを設定

## 変更後の構成
- **繰り返しタスクマスター**: `recurring_tasks` テーブル
- **デイリータスクインスタンス**: `tasks` テーブルで `source_task_id` に `recurring_tasks.id` を設定

## 必要な変更項目

### 1. データベース変更

#### 1-1. 既存データの移行
```sql
-- 現在の繰り返しタスクを recurring_tasks テーブルに移行
INSERT INTO recurring_tasks (
  id, title, description, priority, recurring_pattern, 
  recurring_config, points, created_at, updated_at
)
SELECT 
  id, title, description, priority, recurring_pattern,
  recurring_config, points, created_at, updated_at
FROM tasks 
WHERE is_recurring = 1;

-- 既存デイリータスクの source_task_id は維持（recurring_tasks の id と一致）

-- 移行後、tasks テーブルから繰り返しタスクマスターを削除
DELETE FROM tasks WHERE is_recurring = 1;
```

#### 1-2. テーブル構造調整（必要に応じて）
```sql
-- tasks テーブルから不要なカラムを削除（オプション）
ALTER TABLE tasks DROP COLUMN is_recurring;
ALTER TABLE tasks DROP COLUMN recurring_pattern; 
ALTER TABLE tasks DROP COLUMN recurring_config;
```

### 2. バックエンド Model 変更

#### 2-1. RecurringTask モデル作成
**ファイル**: `backend/src/models/RecurringTask.js`
- `recurring_tasks` テーブル専用のモデルクラス作成
- CRUD 操作メソッド実装

#### 2-2. Task モデル変更
**ファイル**: `backend/src/models/Task.js`
- `findRecurring()` → `RecurringTask.findAll()` に変更
- `createRecurring()` → `RecurringTask.create()` に変更
- `generateTasksForDate()` → `recurring_tasks` からマスター取得に変更
- 繰り返しタスク関連メソッドを削除

### 3. コントローラー変更

#### 3-1. tasksController.js
**ファイル**: `backend/src/controllers/tasksController.js`
- `getRecurringTasks()` → `RecurringTask` モデル使用に変更
- `createRecurringTask()` → `RecurringTask` モデル使用に変更
- `updateRecurringTask()` → `RecurringTask` モデル使用に変更
- `deleteRecurringTask()` → `RecurringTask` モデル使用に変更
- `generateTodayTasks()` → `RecurringTask` からマスター取得に変更

### 4. ルーティング変更

#### 4-1. routes/tasks.js
**ファイル**: `backend/src/routes/tasks.js`
- 既存のルーティングは維持
- コントローラーの実装変更により自動対応

### 5. フロントエンド型定義変更

#### 5-1. TypeScript インターフェース
**ファイル**: `frontend/src/components/TaskList.tsx` など
```typescript
// 新しい RecurringTask インターフェース
export interface RecurringTask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  recurring_pattern: string;
  recurring_config: {
    time: string;
  };
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Task インターフェースから繰り返し関連フィールドを削除
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  display_order?: number;
  source_task_id?: number;  // recurring_tasks.id を参照
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  points: number;
  // 削除するフィールド:
  // is_recurring, recurring_pattern, recurring_config
}
```

### 6. API サービス変更

#### 6-1. api.ts
**ファイル**: `frontend/src/services/api.ts`
- `RecurringTask` 型の import 追加
- メソッドの型定義を `RecurringTask` に変更

### 7. コンポーネント変更

#### 7-1. RecurringTaskForm.tsx
**ファイル**: `frontend/src/components/RecurringTaskForm.tsx`
- `editingTask` の型を `RecurringTask` に変更
- 不要なフィールド（`is_recurring` など）の参照を削除

#### 7-2. RecurringTasks.tsx
**ファイル**: `frontend/src/pages/RecurringTasks.tsx`  
- `RecurringTask` 型の使用
- API レスポンスの型調整

## 実装順序

### Phase 1: バックエンド Model 層
1. `RecurringTask.js` モデル作成
2. `Task.js` モデルの繰り返しタスク関連メソッド移行

### Phase 2: バックエンド Controller/API 層  
3. `tasksController.js` の更新
4. 動作テスト（API レベル）

### Phase 3: データ移行
5. データベースマイグレーションスクリプト実行
6. データ整合性確認

### Phase 4: フロントエンド
7. TypeScript 型定義更新
8. コンポーネント更新
9. 動作テスト（UI レベル）

### Phase 5: クリーンアップ
10. 不要なコード削除
11. テストケース更新

## リスク要因

### データ整合性
- 既存のデイリータスクの `source_task_id` が `recurring_tasks.id` と一致することを確認
- マイグレーション前後でデータ損失がないことを確認

### API 互換性
- フロントエンドが期待するレスポンス形式を維持
- エラーハンドリングの一貫性

### 段階的移行
- バックエンドとフロントエンドの更新タイミング調整
- ダウンタイム最小化

## 成功基準

1. **データ移行完了**: 全ての繰り返しタスクが `recurring_tasks` テーブルに移行
2. **機能維持**: 既存の繰り返しタスク機能がすべて動作
3. **ポイント機能**: ポイント設定・更新・表示が正常動作
4. **新規タスク生成**: デイリータスクが `recurring_tasks` から正常生成
5. **UI 一貫性**: フロントエンドの表示・操作に変化なし