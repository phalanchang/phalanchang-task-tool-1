# DOCKER-001: フロントエンド Docker化

**作成日**: 2025-06-22  
**更新日**: 2025-06-22  
**ステータス**: 開発中  
**担当者**: 開発チーム  

---

## 📋 概要

React TypeScriptで構築されたフロントエンドアプリケーションをDockerコンテナで実行できるようにする機能。

## 🎯 ユーザーストーリー

```
As a 開発者
I want フロントエンドアプリケーションをDockerコンテナで実行したい
So that 環境依存の問題を解消し、統一された開発環境を構築できる
```

## 🔧 機能詳細

### フロントエンド Dockerfile
- **マルチステージビルド**: 効率的なイメージサイズ最適化
- **Nginx配信**: プロダクション対応の静的ファイル配信
- **セキュリティ対応**: 最小権限での実行環境

### 技術仕様
- **ベースイメージ**: node:18-alpine（ビルド）+ nginx:alpine（配信）
- **ポート**: 3000（コンテナ内80番ポートをマッピング）
- **ボリューム**: 開発時のホットリロード対応

## ✅ 受け入れ基準

### 必須要件
- [ ] Docker buildが成功する
- [ ] `docker run`でフロントエンドが起動する
- [ ] http://localhost:3000 でアクセス可能
- [ ] 静的ファイル（CSS、JS、画像）が正しく配信される

### 品質要件
- [ ] イメージサイズが500MB以下
- [ ] セキュリティスキャンで重大な脆弱性なし
- [ ] ビルド時間が5分以内

### 機能要件
- [ ] 既存のReact機能が全て動作
- [ ] Material-UI コンポーネントが正常表示
- [ ] API通信が正常動作（開発環境）

## 🧪 テストケース

### ビルドテスト
1. **Dockerfileビルド**
   ```bash
   cd frontend
   docker build -t task-app-frontend .
   ```
   - 期待値: BUILD SUCCESS

### 起動テスト
2. **コンテナ起動**
   ```bash
   docker run -p 3000:80 task-app-frontend
   ```
   - 期待値: コンテナが正常起動

### 動作確認テスト
3. **アプリケーションアクセス**
   - URL: http://localhost:3000
   - 期待値: React アプリケーションが表示される

4. **主要機能確認**
   - タスク一覧表示
   - 繰り返しタスク作成フォーム
   - サイドバーナビゲーション

## 📁 ファイル構成

```
frontend/
├── Dockerfile
├── .dockerignore
├── nginx.conf          # Nginx設定
└── docker/
    └── entrypoint.sh   # 起動スクリプト
```

## 🚧 制約・注意事項

### 技術的制約
- Node.js 18以上が必要
- npm 8以上対応
- Alpine Linuxベース推奨

### 運用制約
- 開発環境のみサポート（プロダクション設定は別途）
- ホットリロードはDocker Compose使用時のみ

## 🔗 関連リソース

- [Sprint 004仕様書](../../03-development/sprints/sprint-004.md)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [React Docker化ベストプラクティス](https://create-react-app.dev/docs/deployment/)

## 📝 実装ノート

### パフォーマンス最適化
- multi-stage buildによるイメージサイズ削減
- .dockerignoreによる不要ファイル除外
- Nginxキャッシュ設定

### セキュリティ考慮事項
- 非特権ユーザーでの実行
- 不要なパッケージの除外
- セキュリティアップデート適用

---

**関連Issue**: [GitHub Issue #XX]  
**Epic**: CI/CD & Docker化基盤構築  
**Sprint**: Sprint 004