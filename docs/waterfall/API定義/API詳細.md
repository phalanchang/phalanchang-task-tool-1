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
- `points`: 0-1000の整数

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
  "description": "更新された説明",
  "status": "completed",
  "priority": "high",
  "points": 150
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新されたタイトル",
    "description": "更新された説明",
    "status": "completed",
    "priority": "high",
    "points": 150,
    "created_at": "2025-07-08T00:00:00.000Z",
    "updated_at": "2025-07-08T01:00:00.000Z"
  },
  "points": {
    "total_points": 1500,
    "daily_points": 150
  }
}
```

**特別な処理**
- ステータスが pending → completed に変更された場合、自動的にポイントが加算される

### DELETE /api/tasks/:id
タスクを削除

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "削除されたタスク",
    "status": "pending"
  },
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
      "id": 10,
      "title": "朝の運動",
      "description": "毎日の運動ルーティン",
      "status": "pending",
      "priority": "high",
      "points": 50,
      "source_task_id": 5,
      "scheduled_date": "2025-07-08",
      "display_order": 1,
      "created_at": "2025-07-08T00:00:00.000Z"
    }
  ],
  "count": 1,
  "date": "2025-07-08",
  "jstDateTime": "2025-07-08T09:00:00+09:00"
}
```

### POST /api/tasks/generate-today
今日分のタスクを生成

**レスポンス**
```json
{
  "success": true,
  "message": "Generated 3 new daily tasks for 2025-07-08 (JST)",
  "data": {
    "date": "2025-07-08",
    "jstDateTime": "2025-07-08T09:00:00+09:00",
    "generated": 3,
    "existing": 2,
    "tasks": [...]
  }
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
      "title": "朝の運動",
      "description": "毎日の運動ルーティン",
      "priority": "high",
      "recurring_pattern": "daily",
      "recurring_config": {
        "time": "06:00"
      },
      "points": 50,
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-07-08T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/tasks/recurring
新しい繰り返しタスクを作成

**リクエスト**
```json
{
  "title": "夜の読書",
  "description": "毎日30分の読書",
  "priority": "medium",
  "recurring_config": {
    "time": "22:00"
  },
  "points": 30
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "夜の読書",
    "description": "毎日30分の読書",
    "priority": "medium",
    "recurring_pattern": "daily",
    "recurring_config": {
      "time": "22:00"
    },
    "points": 30,
    "is_active": true,
    "created_at": "2025-07-08T00:00:00.000Z"
  }
}
```

---

## 4. ポイントAPI

### GET /api/tasks/user-points
ユーザーのポイント情報を取得

**パラメータ**
- `userId` (optional): ユーザーID（デフォルト: default_user）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "default_user",
    "total_points": 1500,
    "daily_points": 150,
    "last_updated": "2025-07-08",
    "created_at": "2025-07-02T09:13:51.000Z",
    "updated_at": "2025-07-08T08:30:48.000Z"
  }
}
```

### POST /api/tasks/add-points
ポイントを手動で加算

**リクエスト**
```json
{
  "points": 100,
  "userId": "default_user"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "default_user",
    "total_points": 1600,
    "daily_points": 250,
    "last_updated": "2025-07-08",
    "updated_at": "2025-07-08T09:00:00.000Z"
  }
}
```

---

## 5. エラーレスポンス例

### バリデーションエラー
```json
{
  "success": false,
  "error": "Validation error",
  "message": "タイトルは必須です"
}
```

### 404エラー
```json
{
  "success": false,
  "error": "Task not found"
}
```

### 500エラー
```json
{
  "success": false,
  "error": "Failed to create task",
  "message": "Database connection error"
}
```

---

## 6. 日本時間対応

- 全ての日付関連処理は日本時間（JST）で実行
- 日付変更は日本時間の00:00で判定
- スケジューラーも日本時間基準で動作