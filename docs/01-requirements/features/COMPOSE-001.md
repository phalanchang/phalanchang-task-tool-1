# COMPOSE-001: Docker Compose統合

**作成日**: 2025-06-22  
**更新日**: 2025-06-22  
**ステータス**: 開発中  
**担当者**: 開発チーム  

---

## 📋 概要

フロントエンド、バックエンド、データベースの3つのサービスをDocker Composeで統合し、単一コマンドで完全な開発環境を起動できるようにする機能。

## 🎯 ユーザーストーリー

```
As a 開発者
I want 単一コマンドで全サービスを起動したい
So that 効率的に開発作業を開始し、環境セットアップの時間を短縮できる
```

## 🔧 機能詳細

### Docker Compose設定
- **サービス間ネットワーク**: 独立したDockerネットワーク構築
- **依存関係管理**: サービス起動順序の制御
- **環境変数統一管理**: .envファイルによる設定外部化
- **ボリュームマウント**: データ永続化とホットリロード対応

### 技術仕様
- **Compose ファイル形式**: version '3.8'
- **ネットワーク**: task-network（bridge）
- **ボリューム**: mysql-data（永続化）

## ✅ 受け入れ基準

### 必須要件
- [ ] `docker compose up` で全サービス起動
- [ ] フロントエンド→バックエンド→データベース連携動作
- [ ] ログが適切に出力される
- [ ] `docker compose down` で適切に停止

### 連携動作要件
- [ ] フロントエンドからバックエンドAPI呼び出し成功
- [ ] バックエンドからデータベース接続成功
- [ ] データベース初期化が自動実行される
- [ ] サンプルデータが正常に表示される

### 運用要件
- [ ] 起動時間が60秒以内
- [ ] サービス間通信エラーなし
- [ ] 適切なヘルスチェック実装

## 🧪 テストケース

### 統合起動テスト
1. **Docker Compose起動**
   ```bash
   docker compose up -d
   ```
   - 期待値: 3つのサービスが全て起動

### サービス連携テスト
2. **フロントエンド動作確認**
   ```bash
   curl http://localhost:3000
   ```
   - 期待値: React アプリケーションのHTML応答

3. **バックエンドAPI確認**
   ```bash
   curl http://localhost:3001/api/health
   ```
   - 期待値: `{"status": "ok"}` 応答

4. **データベース接続確認**
   ```bash
   curl http://localhost:3001/api/tasks/recurring
   ```
   - 期待値: 繰り返しタスク一覧JSON応答

### E2E動作テスト
5. **ブラウザ動作確認**
   - http://localhost:3000 でフロントエンドアクセス
   - 繰り返しタスク一覧が表示される
   - 新規タスク作成フォームが動作する

### 停止・再起動テスト
6. **適切な停止**
   ```bash
   docker compose down
   ```
   - 期待値: 全サービスが正常停止

7. **データ永続化確認**
   - 再起動後もデータベースデータが保持される

## 🏗️ アーキテクチャ設計

### サービス構成
```yaml
services:
  frontend:    # React TypeScript アプリ
  backend:     # Node.js Express API
  database:    # MySQL データベース
```

### ネットワーク設計
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │───▶│   Backend   │───▶│  Database   │
│   :3000     │    │    :3001    │    │    :3306    │
└─────────────┘    └─────────────┘    └─────────────┘
      │                    │                    │
      └──────────────── task-network ───────────┘
```

### 依存関係設定
```yaml
depends_on:
  backend:
    condition: service_healthy
  database:
    condition: service_healthy
```

## 📁 ファイル構成

```
project-root/
├── docker-compose.yml
├── .env                    # 環境変数設定
├── .env.example           # 環境変数テンプレート
├── frontend/
│   └── Dockerfile
├── backend/
│   └── Dockerfile
└── database/
    ├── Dockerfile
    └── init/
        ├── 01-create-tables.sql
        └── 02-insert-sample-data.sql
```

## ⚙️ 環境変数設定

### .env ファイル
```bash
# Database
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=task_management_app
DB_HOST=database
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpass
DB_NAME=task_management_app

# Backend
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-jwt-secret-key
SESSION_SECRET=dev-session-secret

# Frontend
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

## 🚦 ヘルスチェック設定

### Backend ヘルスチェック
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
```

### Database ヘルスチェック
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1
```

## 🚧 制約・注意事項

### システム要件
- Docker Desktop 4.0以上
- Docker Compose V2対応
- 最低メモリ: 4GB
- 最低ディスク容量: 2GB

### ポート使用状況
- 3000: フロントエンド（React）
- 3001: バックエンド（Express API）
- 3306: データベース（MySQL）

### 開発環境制限
- プロダクション用設定は含まない
- SSL/TLS設定は未実装
- 本格的なログ集約は未対応

## 🔗 関連リソース

- [Sprint 004仕様書](../../03-development/sprints/sprint-004.md)
- [DOCKER-001: フロントエンド Docker化](./DOCKER-001.md)
- [DOCKER-002: バックエンド Docker化](./DOCKER-002.md)
- [DOCKER-003: データベース Docker化](./DOCKER-003.md)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)

## 📝 実装ノート

### 起動順序制御
1. Database サービス起動
2. Database ヘルスチェック完了待ち
3. Backend サービス起動
4. Backend ヘルスチェック完了待ち
5. Frontend サービス起動

### パフォーマンス最適化
- 並列ビルド設定
- イメージレイヤーキャッシュ活用
- 不要なサービス再起動の抑制

### トラブルシューティング
```bash
# ログ確認
docker compose logs -f [service-name]

# サービス状態確認
docker compose ps

# 個別サービス再起動
docker compose restart [service-name]
```

## 🎯 成功指標

### 起動時間目標
- 初回起動: 60秒以内
- 2回目以降: 30秒以内（キャッシュ活用）

### 安定性目標
- サービス間通信成功率: 99%以上
- コンテナ異常終了率: 1%以下

---

**関連Issue**: [GitHub Issue #XX]  
**Epic**: CI/CD & Docker化基盤構築  
**Sprint**: Sprint 004