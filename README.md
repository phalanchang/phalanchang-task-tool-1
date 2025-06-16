# phalanchang-task-management-app

タスク管理アプリケーション - React + Node.js + MySQL

## 概要

効率的なタスク管理を可能にするWebアプリケーションです。

### 技術スタック

- **フロントエンド**: React
- **バックエンド**: Node.js + Express
- **データベース**: MySQL
- **開発手法**: テスト駆動開発（TDD） + アジャイル開発

## プロジェクト構成

```
phalanchang-task-management-app/
├── backend/          # Node.js + Express API
├── frontend/         # React アプリケーション
├── docs/            # ドキュメント
├── tests/           # 統合テスト
├── scripts/         # 開発・デプロイスクリプト
├── 要件定義書.md     # プロジェクト要件定義
├── 作業指示書.md     # 開発方針・作業手順
└── 進捗管理表.md     # 進捗管理・タスク詳細
```

## セットアップ

### 前提条件

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0

### インストール

```bash
# 全体の依存関係をインストール
npm run install:all
```

### 開発サーバー起動

```bash
# フロントエンド・バックエンド同時起動
npm run dev
```

### テスト実行

```bash
# 全体テスト実行
npm test

# バックエンドのみ
npm run test:backend

# フロントエンドのみ
npm run test:frontend
```

### Lint実行

```bash
# 全体Lint実行
npm run lint

# バックエンドのみ
npm run lint:backend

# フロントエンドのみ
npm run lint:frontend
```

## Git ブランチ戦略

- **main**: 本番環境用（動作保証済み）
- **develop**: 開発統合用
- **feature/***: 機能開発用

## ドキュメント

- [要件定義書](./要件定義書.md) - プロジェクトの要件と仕様
- [作業指示書](./作業指示書.md) - 開発方針と作業手順
- [進捗管理表](./進捗管理表.md) - 進捗状況とタスク詳細

## 開発状況

現在MVP（最小機能）の開発中です。進捗詳細は[進捗管理表](./進捗管理表.md)をご確認ください。

## ライセンス

MIT License