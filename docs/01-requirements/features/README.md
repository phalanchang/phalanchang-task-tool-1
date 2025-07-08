# 機能要件管理マスターファイル

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
| POINT-005 | 日付変更時ポイントリセット機能修正 | 🔄 実装中 | 2025-07-08 | Claude Code Assistant |

## 📝 機能詳細

### BADGE-001: デイリータスク未完了数バッジ表示機能
- **概要**: サイドバーとタスクページにデイリータスクの未完了数をバッジで表示
- **実装内容**: NotificationBadge、useDailyTaskCount、DailyTaskContext
- **ファイル**: `BADGE-001_daily-task-notification-badge.md`

### BADGE-002: 通知バッジ機能の復旧対応
- **概要**: Docker環境でのバッジ機能復旧作業
- **実装内容**: フロントエンドコンテナ再ビルドによる機能復旧
- **ファイル**: `BADGE-002_notification-badge-restoration.md`

### COMPOSE-001: Docker Compose構成改善
- **概要**: Docker Compose設定の最適化
- **ファイル**: `COMPOSE-001.md`

### DOCKER-001: Docker環境セットアップ
- **概要**: 初期Docker環境構築
- **ファイル**: `DOCKER-001.md`

### DOCKER-002: Docker環境改善
- **概要**: Docker環境の改善作業
- **ファイル**: `DOCKER-002.md`

### DOCKER-003: Docker環境最適化
- **概要**: Docker環境の最適化作業
- **ファイル**: `DOCKER-003.md`

### REPEAT-001: 繰り返しタスクの管理
- **概要**: 繰り返しタスク機能の実装
- **ファイル**: `REPEAT-001.md`, `要件定義書_REPEAT-001_繰り返しタスクの管理.md`

### SIDEBAR-001: サイドバー機能
- **概要**: サイドバーナビゲーション機能
- **ファイル**: `SIDEBAR-001.md`

### POINT-001: タスク完了時ポイント加算機能
- **概要**: デイリータスク完了時にユーザーポイントを加算する機能
- **ステータス**: ✅ 完了（2025-07-03実装）
- **実装内容**: 
  - タスク完了時のポイント加算ロジック
  - ユーザーポイント管理システム
  - フロントエンドでのポイント表示更新
- **ファイル**: `POINT-001_task-completion-point-system.md`

### POINT-002: 通常タスクのポイント機能拡張
- **概要**: 通常タスクでもポイント設定・編集・加算機能を利用可能にする
- **ステータス**: ✅ 完了（2025-07-03実装）
- **実装内容**:
  - TaskFormでのポイント入力フィールド追加
  - バックエンドでのタスク作成・編集時のポイント保存処理
  - 通常タスク完了時のポイント加算機能
  - TaskCardでのポイント表示改善
- **ファイル**: `POINT-002_regular-tasks-point-enhancement.md`

### POINT-003: 重複ポイント加算防止機能
- **概要**: 一度完了したタスクを再度完了してもポイントが重複加算されないようにする
- **ステータス**: ✅ 完了（2025-07-03実装）
- **実装内容**:
  - point_historyテーブルを使った重複チェック機能
  - タスク完了時の重複ポイント加算防止ロジック
  - 既存ポイント加算機能の改善
- **ファイル**: `POINT-003_prevent-duplicate-point-allocation.md`

### POINT-004: ポイント表示・反映不具合修正
- **概要**: ヘッダーのポイント表示とすべてのタスク完了時のポイント反映に関する不具合修正
- **ステータス**: ✅ 完了（2025-07-03実装）
- **実装内容**:
  - ヘッダーの「今日」ポイント表示を累計値に修正
  - 「すべてのタスク」完了時のポイント反映機能修正
  - ポイント計算ロジックの改善
  - point_historyテーブルベースの正確な累計計算
  - フロントエンドでのリアルタイム更新機能修正
- **ファイル**: `POINT-004_fix-point-display-issues.md`

### TASK-005: 日本時間デイリータスク自動更新機能
- **概要**: デイリータスクが日本時間00:00に自動更新されるように修正
- **ステータス**: ✅ 完了（2025-07-03実装）
- **実装内容**:
  - タイムゾーン設定の確認・修正
  - デイリータスク生成ロジックの日本時間対応
  - スケジューリング機能の実装・改善
  - タイムゾーン変換処理の追加
- **ファイル**: `TASK-005_daily-task-timezone-jst-update.md`

### TASK-006: すべてのタスク作成時モーダル化機能
- **概要**: 「すべてのタスク」での新しいタスク作成時に、「繰り返しタスク」同様のモーダル形式を採用
- **ステータス**: ✅ 完了（2025-07-04実装）
- **実装内容**:
  - インライン作成方式からモーダル形式への変更
  - 共通Modalコンポーネントの作成
  - TaskCreationModalコンポーネントの実装
  - アクセシビリティ対応（ESC、外側クリック、ARIA）
  - TypeScript型安全性とバリデーション機能
  - レスポンシブデザインと統一されたUI/UX
- **ファイル**: `TASK-006_task-creation-modal-interface.md`

### POINT-005: 日付変更時ポイントリセット機能修正
- **概要**: 日付が変わっても「今日」のポイントが0にリセットされない問題を修正
- **ステータス**: 🔄 実装中（2025-07-08開始）
- **実装内容**:
  - バックエンドでのdaily_pointsリセット機能実装
  - フロントエンドでの日付変更検知機能実装
  - point_historyテーブル整備とロジック修正
  - 統合テストと動作検証
- **ファイル**: `POINT-005_daily-points-reset-fix.md`

---

## 📂 ファイル構造

```
docs/01-requirements/features/
├── README.md                                    # このファイル（マスター管理）
├── BADGE-001_daily-task-notification-badge.md  # バッジ表示機能
├── BADGE-002_notification-badge-restoration.md # バッジ復旧対応
├── POINT-001_task-completion-point-system.md   # ポイント加算機能
├── POINT-002_regular-tasks-point-enhancement.md # 通常タスクポイント機能
├── POINT-003_prevent-duplicate-point-allocation.md # 重複ポイント加算防止機能
├── POINT-004_fix-point-display-issues.md        # ポイント表示・反映不具合修正
├── POINT-005_daily-points-reset-fix.md         # 日付変更時ポイントリセット機能修正
├── TASK-005_daily-task-timezone-jst-update.md  # 日本時間デイリータスク自動更新機能
├── TASK-006_task-creation-modal-interface.md   # すべてのタスク作成時モーダル化機能
├── COMPOSE-001.md                               # Docker Compose改善
├── DOCKER-001.md                                # Docker環境構築
├── DOCKER-002.md                                # Docker環境改善
├── DOCKER-003.md                                # Docker環境最適化
├── REPEAT-001.md                                # 繰り返しタスク機能
├── SIDEBAR-001.md                               # サイドバー機能
├── template.md                                  # テンプレート
└── 要件定義書_REPEAT-001_繰り返しタスクの管理.md # 繰り返しタスク詳細
```

## 🔄 更新履歴

- 2025-07-08: POINT-005追加（日付変更時ポイントリセット機能修正）
- 2025-07-04: TASK-006完了ステータス更新（すべてのタスク作成時モーダル化機能実装完了）
- 2025-07-04: TASK-006追加（すべてのタスク作成時モーダル化機能）、TASK-005完了ステータス更新
- 2025-07-03: TASK-005追加（日本時間デイリータスク自動更新機能）
- 2025-07-03: POINT-004完了ステータス更新、実装内容詳細化
- 2025-07-03: POINT-004追加、POINT-003完了ステータス更新
- 2025-07-03: POINT-003追加、POINT-002完了ステータス更新
- 2025-07-03: マスターファイル作成、POINT-001追加、POINT-002追加
- 2025-07-03: BADGE-002追加
- 2025-07-02: BADGE-001追加