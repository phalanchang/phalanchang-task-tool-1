# API詳細仕様

## 1. 通常タスクAPI

### GET /api/tasks
全ての通常タスクを取得

**リクエスト**
- メソッド: GET
- パラメータ: なし

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "タスクタイトル",
      "description": "タスク説明",
      "status": "pending",
      "priority": "medium",
      "points": 100,
      "due_date": null,
      "created_at": "2025-07-08T00:00:00.000Z",
      "updated_at": "2025-07-08T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/tasks
新しいタスクを作成

**リクエスト**
```json
{
  "title": "タスクタイトル",
  "description": "タスク説明",
  "status": "pending",
  "priority": "medium",
  "points": 100
}
```

**バリデーション**
- `title`: 必須、255文字以内
- `status`: pending または completed
- `priority`: low, medium, high
- `points`: 0以上1000以下の整数

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "タスクタイトル",
    "description": "タスク説明",
    "status": "pending",
    "priority": "medium",
    "points": 100,
    "created_at": "2025-07-08T00:00:00.000Z",
    "updated_at": "2025-07-08T00:00:00.000Z"
  }
}
```

### PUT /api/tasks/:id
タスクを更新

**リクエスト**
```json
{
  "title": "更新されたタイトル",
  "status": "completed",
  "priority": "high"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新されたタイトル",
    "status": "completed",
    "priority": "high",
    "points": 100,
    "updated_at": "2025-07-08T01:00:00.000Z"
  }
}
```

### DELETE /api/tasks/:id
タスクを削除

**レスポンス**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 2. 今日のタスクAPI

### GET /api/tasks/daily
今日の繰り返しタスクインスタンスを取得

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "朝の散歩",
      "status": "pending",
      "priority": "medium",
      "points": 50,
      "source_task_id": 1,
      "scheduled_date": "2025-08-03",
      "created_at": "2025-08-03T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/tasks/generate-today
今日分のタスクを生成

**レスポンス**
```json
{
  "success": true,
  "message": "Today's tasks generated successfully",
  "generated_count": 3
}
```

---

## 3. 繰り返しタスクAPI

### GET /api/tasks/recurring
全ての繰り返しタスクテンプレートを取得

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "朝の散歩",
      "description": "30分間の散歩",
      "priority": "medium",
      "points": 50,
      "recurring_config": "daily",
      "is_active": true,
      "display_order": 1,
      "created_at": "2025-07-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/tasks/recurring
新しい繰り返しタスクを作成

**リクエスト**
```json
{
  "title": "朝の散歩",
  "description": "30分間の散歩",
  "priority": "medium",
  "points": 50,
  "recurring_config": "daily"
}
```

---

## 4. ポイント関連API

### GET /api/tasks/user-points
ユーザーのポイント情報を取得

**レスポンス**
```json
{
  "success": true,
  "data": {
    "userId": "default_user",
    "totalPoints": 2550,
    "dailyPoints": 150,
    "lastPointDate": "2025-08-03"
  }
}
```

### POST /api/tasks/add-points
ポイントを手動で加算

**リクエスト**
```json
{
  "points": 100,
  "reason": "手動加算"
}
```

---

## 5. 統計・モニタリングAPI

### GET /api/daily-task-stats
デイリータスク統計情報を取得

**レスポンス**
```json
{
  "today": {
    "totalTasks": 5,
    "completedTasks": 3,
    "incompleteTasks": 2,
    "completionRate": 60,
    "earnedPoints": 150
  },
  "thisWeek": {
    "totalTasks": 35,
    "completedTasks": 28,
    "completionRate": 80,
    "dailyBreakdown": [
      {"date": "2025-07-28", "completed": 4, "total": 5},
      {"date": "2025-07-29", "completed": 5, "total": 5},
      {"date": "2025-07-30", "completed": 3, "total": 5},
      {"date": "2025-07-31", "completed": 5, "total": 5},
      {"date": "2025-08-01", "completed": 4, "total": 5},
      {"date": "2025-08-02", "completed": 4, "total": 5},
      {"date": "2025-08-03", "completed": 3, "total": 5}
    ],
    "earnedPoints": 1400
  },
  "lastWeek": {
    "completionRate": 75,
    "earnedPoints": 1200
  },
  "taskBreakdown": [
    {
      "taskId": 1,
      "title": "朝の散歩",
      "successRate": 86,
      "streak": 3,
      "lastSevenDays": [true, true, false, true, true, true, true]
    },
    {
      "taskId": 2,
      "title": "読書",
      "successRate": 71,
      "streak": 2,
      "lastSevenDays": [false, true, true, false, true, true, true]
    }
  ]
}
```

**フィールド説明**
- `today`: 当日の統計情報
  - `totalTasks`: 本日の総タスク数
  - `completedTasks`: 完了済みタスク数
  - `incompleteTasks`: 未完了タスク数
  - `completionRate`: 完了率（%）
  - `earnedPoints`: 獲得ポイント

- `thisWeek`: 今週の統計情報
  - `totalTasks`: 今週の総タスク数（延べ）
  - `completedTasks`: 完了済みタスク数
  - `completionRate`: 完了率（%）
  - `dailyBreakdown`: 日別の実行データ配列
  - `earnedPoints`: 週間獲得ポイント

- `lastWeek`: 先週の統計情報
  - `completionRate`: 先週の完了率（%）
  - `earnedPoints`: 先週の獲得ポイント

- `taskBreakdown`: タスク別の詳細統計
  - `taskId`: 繰り返しタスクID
  - `title`: タスクタイトル
  - `successRate`: 成功率（%）
  - `streak`: 連続実行日数
  - `lastSevenDays`: 過去7日間の実行履歴（boolean配列）

**エラーレスポンス**
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch daily task statistics"
}
```

---

## 6. スケジューラー関連API

### GET /api/tasks/scheduler/status
スケジューラーの状態を取得

**レスポンス**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "lastExecution": "2025-08-03T00:00:00.000Z",
    "nextExecution": "2025-08-04T00:00:00.000Z"
  }
}
```

### POST /api/tasks/scheduler/execute
スケジューラーを手動実行

**レスポンス**
```json
{
  "success": true,
  "message": "Scheduler executed successfully",
  "generated_tasks": 5
}
```

---

## 7. その他API

### GET /api/tasks/test
API動作テスト用エンドポイント

**レスポンス**
```json
{
  "success": true,
  "message": "API is working",
  "timestamp": "2025-08-03T08:00:00.000Z"
}
```

### GET /health
ヘルスチェック

**レスポンス**
```json
{
  "status": "OK",
  "timestamp": "2025-08-03T08:00:00.000Z",
  "uptime": 3600
}
```

---

## 共通エラーレスポンス

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Requested resource not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": [
    "Title is required",
    "Priority must be low, medium, or high"
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## API認証
- 現在は認証なし
- デフォルトユーザー: `default_user`
- 将来的にJWT認証を予定

## 制限事項
- レート制限: 1分間に100リクエスト
- ファイルアップロード: 現在未対応
- リアルタイム通知: WebSocket未実装

## バージョニング
- 現在のバージョン: v1
- 破壊的変更時は新バージョンでの実装を予定