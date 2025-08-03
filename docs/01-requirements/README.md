# 機能要件管理マスターファイル

## 📋 概要

このファイルは、phalanchang-task-tool-1プロジェクトの機能要件管理マスターファイルです。
個別の機能要件は `features/` ディレクトリ配下に格納されており、このファイルから一覧管理を行っています。

## 📂 ディレクトリ構造

```
docs/01-requirements/
├── README.md                    # このファイル（機能要件管理マスター）
├── features/                    # 個別機能要件ファイル
│   ├── MEMO-001_...
│   ├── POINT-001_...
│   └── ...
├── project-overview.md          # プロジェクト概要
├── user-stories.md             # ユーザーストーリー
├── acceptance-criteria.md      # 受け入れ基準
└── sprint-004-backlog.md       # スプリントバックログ
```

## 🔗 関連ドキュメント

- **機能要件詳細**: `features/` ディレクトリ配下の各ファイル
- **プロジェクト概要**: [project-overview.md](./project-overview.md)
- **ユーザーストーリー**: [user-stories.md](./user-stories.md)
- **受け入れ基準**: [acceptance-criteria.md](./acceptance-criteria.md)
- **スプリントバックログ**: [sprint-004-backlog.md](./sprint-004-backlog.md)

## 📋 機能一覧

| ID | 作業内容 | ステータス | 実装日 | 担当者 |
|---|---|---|---|---|
| BADGE-001 | デイリータスク未完了数バッジ表示機能 | ✅ 完了 | 2025-07-02 | Claude Code Assistant |
| BADGE-002 | 通知バッジ機能の復旧対応 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| COMPOSE-001 | Docker Compose構成改善 | ✅ 完了 | - | - |
| DOCKER-001 | Docker環境セットアップ | ✅ 完了 | - | - |
| DOCKER-002 | Docker環境改善 | ✅ 完了 | - | - |
| DOCKER-003 | Docker環境最適化 | ✅ 完了 | - | - |
| REPEAT-001 | 繰り返しタスクの管理 | ✅ 完了 | - | - |
| SIDEBAR-001 | サイドバー機能 | ✅ 完了 | - | - |
| POINT-001 | タスク完了時ポイント加算機能 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| POINT-002 | 通常タスクのポイント機能拡張 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| POINT-003 | 重複ポイント加算防止機能 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| POINT-004 | ポイント表示・反映不具合修正 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| TASK-005 | 日本時間デイリータスク自動更新機能 | ✅ 完了 | 2025-07-03 | Claude Code Assistant |
| TASK-006 | すべてのタスク作成時モーダル化機能 | ✅ 完了 | 2025-07-04 | Claude Code Assistant |
| TASK-007 | データベースアクセス不具合修正 | ✅ 完了 | 2025-07-05 | Claude Code Assistant |
| TASK-008 | 繰り返しタスクAPI取得エラー修正 | ⚠️ 部分完了 | 2025-07-05 | Claude Code Assistant |
| TASK-009 | プロジェクト管理システム改善 | 🔄 進行中 | 2025-07-05 | Claude Code Assistant |
| POINT-005 | 日付変更時ポイントリセット機能修正 | ✅ 完了 | 2025-07-08 | Claude Code Assistant |
| POINT-006 | 今日のポイント計算方式をtasksテーブル直接参照に変更 | ✅ 完了 | 2025-07-08 | Claude Code Assistant |
| MEMO-001 | メモ管理システム機能 | ✅ 完了 | 2025-07-11 | PM (Claude Code Assistant) |
| MONITOR-001 | デイリータスクモニタリングダッシュボード機能 | 🔄 進行中 | 2025-08-03 | Claude Code Assistant |

## 📝 機能詳細

詳細な機能要件は以下のファイルで確認できます：

### 🎯 バッジ機能
- **[BADGE-001](./features/BADGE-001_daily-task-notification-badge.md)**: デイリータスク未完了数バッジ表示機能
- **[BADGE-002](./features/BADGE-002_notification-badge-restoration.md)**: 通知バッジ機能の復旧対応

### 🏆 ポイントシステム
- **[POINT-001](./features/POINT-001_task-completion-point-system.md)**: タスク完了時ポイント加算機能
- **[POINT-002](./features/POINT-002_regular-tasks-point-enhancement.md)**: 通常タスクのポイント機能拡張
- **[POINT-003](./features/POINT-003_prevent-duplicate-point-allocation.md)**: 重複ポイント加算防止機能
- **[POINT-004](./features/POINT-004_fix-point-display-issues.md)**: ポイント表示・反映不具合修正
- **[POINT-005](./features/POINT-005_daily-points-reset-fix.md)**: 日付変更時ポイントリセット機能修正
- **[POINT-006](./features/POINT-006_direct-task-points-calculation.md)**: 今日のポイント計算方式変更

### 📝 メモ機能
- **[MEMO-001](./features/MEMO-001_memo-management-system.md)**: メモ管理システム機能

### 📊 モニタリング機能
- **[MONITOR-001](./features/MONITOR-001_daily-task-monitoring-dashboard.md)**: デイリータスクモニタリングダッシュボード機能

### 🔄 タスク管理
- **[TASK-005](./features/TASK-005_daily-task-timezone-jst-update.md)**: 日本時間デイリータスク自動更新機能
- **[TASK-006](./features/TASK-006_task-creation-modal-interface.md)**: すべてのタスク作成時モーダル化機能
- **[TASK-007](./features/TASK-007_database-access-fix.md)**: データベースアクセス不具合修正
- **[TASK-008](./features/TASK-008_recurring-tasks-api-fix.md)**: 繰り返しタスクAPI取得エラー修正
- **[TASK-009](./features/TASK-009_project-management-improvements.md)**: プロジェクト管理システム改善

### 🐳 インフラ・環境
- **[COMPOSE-001](./features/COMPOSE-001.md)**: Docker Compose構成改善
- **[DOCKER-001](./features/DOCKER-001.md)**: Docker環境セットアップ
- **[DOCKER-002](./features/DOCKER-002.md)**: Docker環境改善
- **[DOCKER-003](./features/DOCKER-003.md)**: Docker環境最適化

### 🔧 その他機能
- **[REPEAT-001](./features/REPEAT-001.md)**: 繰り返しタスクの管理
- **[SIDEBAR-001](./features/SIDEBAR-001.md)**: サイドバー機能

## 🔄 更新履歴

- 2025-08-03: MONITOR-001追加（デイリータスクモニタリングダッシュボード機能）
- 2025-07-26: ドキュメント構造改善（README.mdを上位階層に移動）、MEMO-001完了ステータス更新
- 2025-07-11: MEMO-001追加（メモ管理システム機能）、POINT-006完了ステータス更新
- 2025-07-08: POINT-006追加（今日のポイント計算方式をtasksテーブル直接参照に変更）
- 2025-07-08: POINT-005追加（日付変更時ポイントリセット機能修正）
- 2025-07-05: TASK-009追加（プロジェクト管理システム改善）、TASK-008ステータス修正
- 2025-07-05: TASK-008追加（繰り返しタスクAPI取得エラー修正）
- 2025-07-05: TASK-007追加（データベースアクセス不具合修正）
- 2025-07-04: TASK-006完了ステータス更新（すべてのタスク作成時モーダル化機能実装完了）
- 2025-07-04: TASK-006追加（すべてのタスク作成時モーダル化機能）、TASK-005完了ステータス更新
- 2025-07-03: TASK-005追加（日本時間デイリータスク自動更新機能）
- 2025-07-03: POINT-004完了ステータス更新、実装内容詳細化
- 2025-07-03: POINT-004追加、POINT-003完了ステータス更新
- 2025-07-03: POINT-003追加、POINT-002完了ステータス更新
- 2025-07-03: マスターファイル作成、POINT-001追加、POINT-002追加
- 2025-07-03: BADGE-002追加
- 2025-07-02: BADGE-001追加