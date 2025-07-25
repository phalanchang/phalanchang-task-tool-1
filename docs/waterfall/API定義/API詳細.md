# API詳細仕様

## ベースURL
```
http://localhost:3001/api
```

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "success": true,
  "data": { ... },
  "message": "操作が成功しました"
}
```

### エラーレスポンス
```json
{
  "success": false,
  "error": "error_type",
  "message": "エラーメッセージ"
}
```

---

## 1. タスク関連API

### 1.1 通常タスク

#### GET /api/tasks
**説明**: 全ての通常タスクを取得

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "タスクタイトル",
      "description": "タスクの説明",
      "priority": "medium",
      "status": "pending",
      "points": 10,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "タスク一覧を取得しました"
}
```

#### POST /api/tasks
**説明**: 新しいタスクを作成

**リクエストボディ**:
```json
{
  "title": "タスクタイトル",
  "description": "タスクの説明",
  "priority": "medium",
  "points": 10
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "タスクタイトル",
    "description": "タスクの説明",
    "priority": "medium",
    "status": "pending",
    "points": 10,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "タスクを作成しました"
}
```

#### GET /api/tasks/:id
**説明**: 特定のタスクを取得

**パラメータ**:
- `id`: タスクID（数値）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "タスクタイトル",
    "description": "タスクの説明",
    "priority": "medium",
    "status": "pending",
    "points": 10,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "タスクを取得しました"
}
```

#### PUT /api/tasks/:id
**説明**: タスクを更新

**パラメータ**:
- `id`: タスクID（数値）

**リクエストボディ**:
```json
{
  "title": "更新されたタスクタイトル",
  "description": "更新された説明",
  "priority": "high",
  "status": "completed",
  "points": 20
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新されたタスクタイトル",
    "description": "更新された説明",
    "priority": "high",
    "status": "completed",
    "points": 20,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T01:00:00.000Z"
  },
  "message": "タスクを更新しました"
}
```

#### DELETE /api/tasks/:id
**説明**: タスクを削除

**パラメータ**:
- `id`: タスクID（数値）

**レスポンス**:
```json
{
  "success": true,
  "message": "タスクを削除しました"
}
```

### 1.2 今日のタスク

#### GET /api/tasks/daily
**説明**: 今日の繰り返しタスクインスタンスを取得

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "今日のタスク",
      "description": "説明",
      "priority": "medium",
      "status": "pending",
      "points": 10,
      "source_task_id": 1,
      "scheduled_date": "2025-01-01",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "今日のタスクを取得しました"
}
```

#### POST /api/tasks/generate-today
**説明**: 今日分のタスクを生成

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "generated_count": 3,
    "tasks": [...]
  },
  "message": "今日のタスクを生成しました"
}
```

### 1.3 繰り返しタスク

#### GET /api/tasks/recurring
**説明**: 全ての繰り返しタスクテンプレートを取得

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "繰り返しタスク",
      "description": "説明",
      "priority": "medium",
      "execution_time": "09:00",
      "points": 10,
      "display_order": 1,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "繰り返しタスク一覧を取得しました"
}
```

#### POST /api/tasks/recurring
**説明**: 新しい繰り返しタスクを作成

**リクエストボディ**:
```json
{
  "title": "繰り返しタスク",
  "description": "説明",
  "priority": "medium",
  "execution_time": "09:00",
  "points": 10,
  "display_order": 1
}
```

#### PUT /api/tasks/recurring/:id
**説明**: 繰り返しタスクを更新

#### DELETE /api/tasks/recurring/:id
**説明**: 繰り返しタスクを削除

---

## 2. メモ関連API

### 2.1 メモ一覧取得

#### GET /api/memos
**説明**: 全てのメモを取得

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "メモタイトル",
      "content": "# メモ内容\n\nこれはMarkdown形式のメモです。",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "メモ一覧を取得しました"
}
```

### 2.2 メモ作成

#### POST /api/memos
**説明**: 新しいメモを作成

**リクエストボディ**:
```json
{
  "title": "メモタイトル",
  "content": "# メモ内容\n\nこれはMarkdown形式のメモです。\n\n- リスト項目1\n- リスト項目2"
}
```

**バリデーション**:
- `title`: 必須、255文字以内
- `content`: 任意、10,000文字以内

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "メモタイトル",
    "content": "# メモ内容\n\nこれはMarkdown形式のメモです。",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "メモを作成しました"
}
```

### 2.3 メモ詳細取得

#### GET /api/memos/:id
**説明**: 特定のメモを取得

**パラメータ**:
- `id`: メモID（数値）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "メモタイトル",
    "content": "# メモ内容\n\nこれはMarkdown形式のメモです。",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "メモを取得しました"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "message": "メモが見つかりません"
}
```

### 2.4 メモ更新

#### PUT /api/memos/:id
**説明**: メモを更新

**パラメータ**:
- `id`: メモID（数値）

**リクエストボディ**:
```json
{
  "title": "更新されたメモタイトル",
  "content": "# 更新されたメモ内容\n\n更新されたMarkdown形式のメモです。"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新されたメモタイトル",
    "content": "# 更新されたメモ内容\n\n更新されたMarkdown形式のメモです。",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T01:00:00.000Z"
  },
  "message": "メモを更新しました"
}
```

### 2.5 メモ削除

#### DELETE /api/memos/:id
**説明**: メモを削除（論理削除）

**パラメータ**:
- `id`: メモID（数値）

**レスポンス**:
```json
{
  "success": true,
  "message": "メモを削除しました"
}
```

---

## 3. ポイント関連API

### 3.1 ユーザーポイント取得

#### GET /api/tasks/user-points
**説明**: ユーザーのポイント情報を取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "total_points": 150,
    "daily_points": 25,
    "last_updated": "2025-01-01T00:00:00.000Z"
  },
  "message": "ポイント情報を取得しました"
}
```

### 3.2 手動ポイント加算

#### POST /api/tasks/add-points
**説明**: ポイントを手動で加算

**リクエストボディ**:
```json
{
  "points": 10,
  "reason": "手動加算"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "total_points": 160,
    "daily_points": 35,
    "last_updated": "2025-01-01T00:00:00.000Z"
  },
  "message": "ポイントを加算しました"
}
```

---

## 4. スケジューラー関連API

### 4.1 スケジューラー状態確認

#### GET /api/tasks/scheduler/status
**説明**: スケジューラーの状態を取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "status": "running",
    "last_execution": "2025-01-01T00:00:00.000Z",
    "next_execution": "2025-01-02T00:00:00.000Z",
    "execution_count": 10
  },
  "message": "スケジューラー状態を取得しました"
}
```

### 4.2 スケジューラー手動実行

#### POST /api/tasks/scheduler/execute
**説明**: スケジューラーを手動実行

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "executed_at": "2025-01-01T12:00:00.000Z",
    "generated_tasks": 3
  },
  "message": "スケジューラーを実行しました"
}
```

---

## 5. その他API

### 5.1 ヘルスチェック

#### GET /health
**説明**: アプリケーションの健全性確認

**レスポンス**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 5.2 API情報取得

#### GET /api
**説明**: APIの基本情報を取得

**レスポンス**:
```json
{
  "message": "Task Management API",
  "version": "1.0.0",
  "endpoints": {
    "tasks": "/api/tasks",
    "memos": "/api/memos",
    "points": "/api/points",
    "health": "/health"
  }
}
```

---

## エラーコード一覧

| エラーコード | 説明 | HTTPステータス |
|-------------|------|---------------|
| `VALIDATION_ERROR` | バリデーションエラー | 400 |
| `NOT_FOUND` | リソースが見つかりません | 404 |
| `UNAUTHORIZED` | 認証エラー | 401 |
| `INTERNAL_ERROR` | 内部サーバーエラー | 500 |
| `DATABASE_ERROR` | データベースエラー | 500 |

---

## データ型定義

### タスク
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  points: number;
  source_task_id?: number;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
}
```

### メモ
```typescript
interface Memo {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

### ユーザーポイント
```typescript
interface UserPoints {
  user_id: number;
  total_points: number;
  daily_points: number;
  last_updated: string;
}
```