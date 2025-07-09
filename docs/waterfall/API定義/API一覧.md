# API一覧

## ベースURL
```
http://localhost:3001/api
```

## APIエンドポイント一覧

| No. | メソッド | エンドポイント | 説明 | 実装状況 |
|-----|----------|---------------|------|----------|
| 1 | GET | `/tasks` | 全ての通常タスクを取得 | ✅ 実装済み |
| 2 | POST | `/tasks` | 新しいタスクを作成 | ✅ 実装済み |
| 3 | GET | `/tasks/:id` | 特定のタスクを取得 | ✅ 実装済み |
| 4 | PUT | `/tasks/:id` | タスクを更新 | ✅ 実装済み |
| 5 | DELETE | `/tasks/:id` | タスクを削除 | ✅ 実装済み |
| 6 | GET | `/tasks/daily` | 今日の繰り返しタスクインスタンスを取得 | ✅ 実装済み |
| 7 | POST | `/tasks/generate-today` | 今日分のタスクを生成 | ✅ 実装済み |
| 8 | GET | `/tasks/recurring` | 全ての繰り返しタスクテンプレートを取得 | ✅ 実装済み |
| 9 | POST | `/tasks/recurring` | 新しい繰り返しタスクを作成 | ✅ 実装済み |
| 10 | PUT | `/tasks/recurring/:id` | 繰り返しタスクを更新 | ✅ 実装済み |
| 11 | DELETE | `/tasks/recurring/:id` | 繰り返しタスクを削除 | ✅ 実装済み |
| 12 | GET | `/tasks/user-points` | ユーザーのポイント情報を取得 | ✅ 実装済み |
| 13 | POST | `/tasks/add-points` | ポイントを手動で加算 | ✅ 実装済み |
| 14 | GET | `/tasks/scheduler/status` | スケジューラーの状態を取得 | ✅ 実装済み |
| 15 | POST | `/tasks/scheduler/execute` | スケジューラーを手動実行 | ✅ 実装済み |
| 16 | GET | `/tasks/test` | API動作テスト用エンドポイント | ✅ 実装済み |
| 17 | GET | `/health` | ヘルスチェック | ✅ 実装済み |
| 18 | GET | `/points` | ユーザーポイント取得（廃止予定） | ⚠️ 廃止予定 |
| 19 | POST | `/points` | ポイント加算（廃止予定） | ⚠️ 廃止予定 |

---

## 1. タスク関連API

### 通常タスク
| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks` | 全ての通常タスクを取得 |
| POST | `/tasks` | 新しいタスクを作成 |
| GET | `/tasks/:id` | 特定のタスクを取得 |
| PUT | `/tasks/:id` | タスクを更新 |
| DELETE | `/tasks/:id` | タスクを削除 |

### 今日のタスク
| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks/daily` | 今日の繰り返しタスクインスタンスを取得 |
| POST | `/tasks/generate-today` | 今日分のタスクを生成 |

### 繰り返しタスク
| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks/recurring` | 全ての繰り返しタスクテンプレートを取得 |
| POST | `/tasks/recurring` | 新しい繰り返しタスクを作成 |
| PUT | `/tasks/recurring/:id` | 繰り返しタスクを更新 |
| DELETE | `/tasks/recurring/:id` | 繰り返しタスクを削除 |

## 2. ポイント関連API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks/user-points` | ユーザーのポイント情報を取得 |
| POST | `/tasks/add-points` | ポイントを手動で加算 |

## 3. スケジューラー関連API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks/scheduler/status` | スケジューラーの状態を取得 |
| POST | `/tasks/scheduler/execute` | スケジューラーを手動実行 |

## 4. その他API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/tasks/test` | API動作テスト用エンドポイント |
| GET | `/health` | ヘルスチェック |

## 5. 古いポイントAPI（廃止予定）

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/points` | ユーザーポイント取得（廃止予定） |
| POST | `/points` | ポイント加算（廃止予定） |

## API認証
- 現在は認証なし
- デフォルトユーザー: `default_user`

## エラーハンドリング
- 全てのAPIは統一された形式でエラーを返す
- 成功時: `{ success: true, data: ... }`
- 失敗時: `{ success: false, error: "error_type", message: "error_message" }`

## CORS設定
- 開発環境: `http://localhost:3000` からのアクセスを許可
- 本番環境: 適切なオリジン設定が必要