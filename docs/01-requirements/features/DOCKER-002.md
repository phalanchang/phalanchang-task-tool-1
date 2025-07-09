# DOCKER-002: バックエンド Docker化

**作成日**: 2025-06-22  
**更新日**: 2025-06-22  
**ステータス**: 開発中  
**担当者**: 開発チーム  

---

## 📋 概要

Node.js Express APIサーバーをDockerコンテナで実行できるようにする機能。

## 🎯 ユーザーストーリー

```
As a 開発者
I want バックエンドAPIをDockerコンテナで実行したい
So that Node.js環境の統一を図り、開発環境のセットアップを簡素化できる
```

## 🔧 機能詳細

### バックエンド Dockerfile
- **Node.js環境最適化**: Alpine Linuxベース軽量イメージ
- **npm install キャッシュ最適化**: レイヤーキャッシュ活用
- **環境変数管理**: 設定の外部化対応

### 技術仕様
- **ベースイメージ**: node:18-alpine
- **ポート**: 3001
- **作業ディレクトリ**: /app
- **実行ユーザー**: node（非特権ユーザー）

## ✅ 受け入れ基準

### 必須要件
- [ ] Docker buildが成功する
- [ ] `docker run`でバックエンドが起動する
- [ ] http://localhost:3001 でAPI応答
- [ ] 環境変数が正しく読み込まれる

### 品質要件
- [ ] イメージサイズが300MB以下
- [ ] 起動時間が30秒以内
- [ ] メモリ使用量が512MB以下

### セキュリティ要件
- [ ] 非特権ユーザーで実行
- [ ] 不要なシステムパッケージなし
- [ ] セキュリティスキャン通過

## 🧪 テストケース

### ビルドテスト
1. **Dockerfileビルド**
   ```bash
   cd backend
   docker build -t task-app-backend .
   ```
   - 期待値: BUILD SUCCESS

### 起動テスト
2. **コンテナ起動**
   ```bash
   docker run -p 3001:3001 --env-file .env task-app-backend
   ```
   - 期待値: サーバーが3001ポートで起動

### API動作確認テスト
3. **ヘルスチェック**
   ```bash
   curl http://localhost:3001/api/health
   ```
   - 期待値: `{"status": "ok"}`応答

4. **主要APIエンドポイント**
   - GET /api/tasks/recurring - 繰り返しタスク一覧
   - POST /api/tasks/recurring - 繰り返しタスク作成
   - PUT /api/tasks/recurring/:id - 繰り返しタスク更新

### 環境変数テスト
5. **データベース接続設定**
   - DB_HOST, DB_PORT, DB_USER等の環境変数が正常読み込み
   - 接続エラーハンドリングが適切

## 📁 ファイル構成

```
backend/
├── Dockerfile
├── .dockerignore
├── .env.example        # 環境変数テンプレート
└── docker/
    ├── entrypoint.sh   # 起動スクリプト
    └── healthcheck.sh  # ヘルスチェック
```

## 🚧 制約・注意事項

### 技術的制約
- Node.js 18以上が必要
- MySQL接続が前提
- CORS設定でフロントエンドからのアクセス許可

### 環境変数要件
```bash
# 必須環境変数
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=task_management_app
NODE_ENV=development
PORT=3001
```

### セキュリティ考慮事項
- JWT_SECRETの適切な設定
- データベース認証情報の保護
- CORS設定の適切な制限

## 🔗 関連リソース

- [Sprint 004仕様書](../../03-development/sprints/sprint-004.md)
- [API仕様書](../../02-design/api-specification.md)
- [Node.js Docker化ベストプラクティス](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 📝 実装ノート

### パフォーマンス最適化
- package.jsonとpackage-lock.jsonを先にコピーしてキャッシュ活用
- 本番環境では`npm ci --only=production`使用
- 不要なdevDependenciesの除外

### ヘルスチェック実装
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

### データベース待機処理
- wait-for-it.shまたは類似ツールでMySQLコンテナ起動待ち
- 接続リトライ機能の実装

---

**関連Issue**: [GitHub Issue #XX]  
**Epic**: CI/CD & Docker化基盤構築  
**Sprint**: Sprint 004