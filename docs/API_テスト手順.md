# API テスト手順

## 前提条件
- バックエンドサーバーが起動している（`npm run dev`）
- サーバーURL: http://localhost:3001

## 1. ヘルスチェック

**ブラウザ:**
```
http://localhost:3001/health
```

**curl:**
```bash
curl http://localhost:3001/health
```

**期待結果:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-06-17T..."
}
```

## 2. API情報取得

**ブラウザ:**
```
http://localhost:3001/api
```

**curl:**
```bash
curl http://localhost:3001/api
```

## 3. タスク一覧取得

**ブラウザ:**
```
http://localhost:3001/api/tasks
```

**curl:**
```bash
curl http://localhost:3001/api/tasks
```

**期待結果:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "サンプルタスク1",
      "description": "これはサンプルタスクです",
      "status": "pending",
      ...
    }
  ],
  "count": 2
}
```

## 4. 特定タスク取得

**curl:**
```bash
curl http://localhost:3001/api/tasks/1
```

## 5. 新しいタスク作成

**curl:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "新しいタスク", "description": "テスト用のタスクです"}'
```

## 6. タスク更新

**curl:**
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## 7. タスク削除

**curl:**
```bash
curl -X DELETE http://localhost:3001/api/tasks/1
```

## Windowsでのcurlコマンド実行方法

### PowerShellの場合:
```powershell
# GET リクエスト
Invoke-RestMethod -Uri "http://localhost:3001/api/tasks" -Method Get

# POST リクエスト
$body = @{
    title = "新しいタスク"
    description = "PowerShellからのテスト"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/tasks" -Method Post -Body $body -ContentType "application/json"
```

### コマンドプロンプトの場合:
```cmd
curl http://localhost:3001/api/tasks
```

## デバッグ方法

### 1. サーバーログを確認
サーバーを起動しているターミナルで、リクエストが来ているかログを確認

### 2. ネットワーク確認
```bash
# ポート3001が使用されているか確認
netstat -an | findstr :3001
```

### 3. JSON形式確認
レスポンスが正しいJSON形式で返ってくるかブラウザの開発者ツールで確認

## トラブルシューティング

### サーバーが起動しない場合:
1. ポート3001が他のプロセスで使用されていないか確認
2. Node.jsがインストールされているか確認
3. backend ディレクトリで `npm install` を実行

### APIが応答しない場合:
1. サーバーのログを確認
2. URLが正しいか確認
3. Content-Typeヘッダーが正しく設定されているか確認（POST/PUT時）