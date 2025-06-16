# タスク管理API 設計書

## 概要

タスク管理アプリケーション用のRESTful APIです。

### ベースURL
- 開発環境: `http://localhost:3001`
- API プレフィックス: `/api`

### レスポンス形式
すべてのAPIレスポンスは以下の共通形式を使用します：

```json
{
  "success": boolean,
  "data": object | array,
  "error": string,
  "message": string,
  "count": number
}
```

## エンドポイント一覧

### 1. ヘルスチェック

**目的**: サーバーの稼働状況を確認

```
GET /health
```

**レスポンス例:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-06-17T10:30:00.000Z"
}
```

### 2. API情報取得

**目的**: API の基本情報とエンドポイント一覧を取得

```
GET /api
```

**レスポンス例:**
```json
{
  "message": "Task Management API",
  "version": "1.0.0",
  "endpoints": {
    "tasks": "/api/tasks",
    "health": "/health"
  }
}
```

## タスク関連API

### 3. タスク一覧取得

**目的**: 全てのタスクを取得する

```
GET /api/tasks
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "買い物に行く",
      "description": "牛乳とパンを買う",
      "status": "pending",
      "created_at": "2025-06-17T10:00:00.000Z",
      "updated_at": "2025-06-17T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "レポート作成",
      "description": "月次売上レポートを作成する",
      "status": "completed",
      "created_at": "2025-06-17T09:00:00.000Z",
      "updated_at": "2025-06-17T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

### 4. 特定タスク取得

**目的**: 指定されたIDのタスクを取得する

```
GET /api/tasks/:id
```

**パラメータ:**
- `id` (必須): タスクのID（数値）

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "買い物に行く",
    "description": "牛乳とパンを買う",
    "status": "pending",
    "created_at": "2025-06-17T10:00:00.000Z",
    "updated_at": "2025-06-17T10:00:00.000Z"
  }
}
```

**エラーレスポンス（タスクが見つからない場合）:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

### 5. タスク作成

**目的**: 新しいタスクを作成する

```
POST /api/tasks
```

**リクエストボディ:**
```json
{
  "title": "新しいタスク",
  "description": "タスクの説明（任意）"
}
```

**必須フィールド:**
- `title`: タスクのタイトル（文字列、必須）

**任意フィールド:**
- `description`: タスクの説明（文字列、省略可能）

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "新しいタスク",
    "description": "タスクの説明",
    "status": "pending",
    "created_at": "2025-06-17T12:00:00.000Z",
    "updated_at": "2025-06-17T12:00:00.000Z"
  }
}
```

**エラーレスポンス（タイトルが未入力の場合）:**
```json
{
  "success": false,
  "error": "Title is required"
}
```

### 6. タスク更新

**目的**: 既存のタスクを更新する

```
PUT /api/tasks/:id
```

**パラメータ:**
- `id` (必須): 更新するタスクのID（数値）

**リクエストボディ:**
```json
{
  "title": "更新されたタスク",
  "description": "更新された説明",
  "status": "completed"
}
```

**更新可能フィールド（すべて任意）:**
- `title`: タスクのタイトル（文字列）
- `description`: タスクの説明（文字列）
- `status`: タスクの状態（"pending" または "completed"）

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新されたタスク",
    "description": "更新された説明",
    "status": "completed",
    "created_at": "2025-06-17T10:00:00.000Z",
    "updated_at": "2025-06-17T13:00:00.000Z"
  }
}
```

**エラーレスポンス（タスクが見つからない場合）:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

### 7. タスク削除

**目的**: 指定されたIDのタスクを削除する

```
DELETE /api/tasks/:id
```

**パラメータ:**
- `id` (必須): 削除するタスクのID（数値）

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "削除されたタスク",
    "description": "削除されたタスクの説明",
    "status": "pending",
    "created_at": "2025-06-17T10:00:00.000Z",
    "updated_at": "2025-06-17T10:00:00.000Z"
  },
  "message": "Task deleted successfully"
}
```

**エラーレスポンス（タスクが見つからない場合）:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

## データモデル

### Task（タスク）

| フィールド名 | 型 | 必須 | 説明 |
|-------------|----|----- |------|
| id | number | ○ | タスクの一意識別子（自動生成） |
| title | string | ○ | タスクのタイトル |
| description | string | × | タスクの詳細説明 |
| status | string | ○ | タスクの状態（"pending" または "completed"） |
| created_at | string | ○ | 作成日時（ISO 8601形式） |
| updated_at | string | ○ | 最終更新日時（ISO 8601形式） |

### ステータス値

- `"pending"`: 未完了（デフォルト値）
- `"completed"`: 完了

## HTTPステータスコード

| ステータスコード | 意味 | 使用場面 |
|-----------------|------|----------|
| 200 | OK | 正常な取得・更新・削除 |
| 201 | Created | 正常な作成 |
| 400 | Bad Request | 不正なリクエスト（必須フィールド未入力など） |
| 404 | Not Found | 指定されたリソースが見つからない |
| 500 | Internal Server Error | サーバー内部エラー |

## エラーハンドリング

すべてのエラーレスポンスは以下の形式で返されます：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

## 使用例

### タスクを作成して更新する流れ

1. **新しいタスクを作成**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "資料作成", "description": "会議用の資料を作成する"}'
```

2. **作成されたタスクを確認**
```bash
curl http://localhost:3001/api/tasks/3
```

3. **タスクを完了状態に更新**
```bash
curl -X PUT http://localhost:3001/api/tasks/3 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

4. **タスクを削除**
```bash
curl -X DELETE http://localhost:3001/api/tasks/3
```