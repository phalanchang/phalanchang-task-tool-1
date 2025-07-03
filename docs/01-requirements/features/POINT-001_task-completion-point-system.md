# POINT-001: タスク完了時ポイント加算機能

## 📋 作業概要

| ID | 作業内容 | ステータス | 優先度 | 担当者 |
|---|---|---|---|---|
| POINT-001-01 | ユーザーポイント管理テーブルの確認・作成 | 📋 計画中 | High | Claude Code Assistant |
| POINT-001-02 | タスク完了時ポイント加算API実装 | 📋 計画中 | High | Claude Code Assistant |
| POINT-001-03 | フロントエンドでのポイント表示更新 | 📋 計画中 | High | Claude Code Assistant |
| POINT-001-04 | ポイント加算ロジックのテスト実装 | 📋 計画中 | Medium | Claude Code Assistant |
| POINT-001-05 | エラーハンドリングの実装 | 📋 計画中 | Medium | Claude Code Assistant |

---

## 🎯 機能概要

### 目的
デイリータスクを完了した際に、設定されたポイントをユーザーに加算する機能を実装する。

### 現在の問題
- デイリータスクにポイントが設定されている
- タスク完了時にポイントが加算されない
- データベースでユーザーポイントが増加していない

### 期待される動作
1. ユーザーがデイリータスクを完了マークにする
2. そのタスクに設定されたポイントがユーザーの総ポイントに加算される
3. フロントエンドでポイント表示が即座に更新される
4. ポイント加算履歴が記録される

## 🏗️ 技術仕様

### データベース設計

#### 1. ユーザーポイント管理テーブル（確認・作成）
```sql
-- user_points テーブル（存在確認後、必要に応じて作成）
CREATE TABLE IF NOT EXISTS user_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT 1, -- 単一ユーザー想定
    total_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初期データ挿入
INSERT IGNORE INTO user_points (user_id, total_points) VALUES (1, 0);
```

#### 2. ポイント履歴テーブル（新規作成）
```sql
-- point_history テーブル
CREATE TABLE IF NOT EXISTS point_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT 1,
    task_id INT NOT NULL,
    points_earned INT NOT NULL,
    task_title VARCHAR(255),
    action_type ENUM('task_completion', 'manual_adjustment') DEFAULT 'task_completion',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### API実装

#### 1. ポイント取得API
```
GET /api/points
Response: { "total_points": 1250 }
```

#### 2. タスク完了API拡張
```
PUT /api/tasks/:id
- 既存のタスク更新処理に加えて
- status が 'pending' → 'completed' の場合
- タスクのポイントをユーザーポイントに加算
- ポイント履歴を記録
```

#### 3. ポイント履歴API
```
GET /api/points/history
Response: [ { "task_title": "朝活Noteを書く", "points": 100, "date": "2025-07-03" } ]
```

### フロントエンド実装

#### 1. ポイント表示の更新
- タスク完了時に即座にポイント表示を更新
- アニメーション効果でポイント増加を視覚化

#### 2. ポイント履歴表示
- 設定ページまたはダッシュボードでポイント履歴表示

## 🔧 実装タスク詳細

### POINT-001-01: ユーザーポイント管理テーブルの確認・作成
**概要**: データベースにユーザーポイント管理テーブルが存在するか確認し、必要に応じて作成

**詳細**:
1. 現在のデータベーススキーマを確認
2. `user_points` テーブルの存在確認
3. 存在しない場合、テーブル作成
4. 初期ユーザーデータの挿入
5. `point_history` テーブルの作成

**成功条件**:
- `user_points` テーブルが存在し、初期データが投入されている
- `point_history` テーブルが作成されている

### POINT-001-02: タスク完了時ポイント加算API実装
**概要**: タスク更新API（PUT /api/tasks/:id）にポイント加算ロジックを追加

**詳細**:
1. `tasksController.js` の `updateTask` 関数を修正
2. ステータス変更検知ロジック（pending → completed）
3. ポイント加算処理の実装
4. ポイント履歴記録処理
5. エラーハンドリングの実装

**成功条件**:
- タスク完了時にユーザーポイントが正しく加算される
- ポイント履歴が正しく記録される
- エラー時に適切なレスポンスが返される

### POINT-001-03: フロントエンドでのポイント表示更新
**概要**: タスク完了時にフロントエンドのポイント表示をリアルタイム更新

**詳細**:
1. `PointsDisplay` コンポーネントの確認・修正
2. タスク完了時のポイント更新処理
3. アニメーション効果の実装
4. API呼び出しとエラーハンドリング

**成功条件**:
- タスク完了時にポイント表示が即座に更新される
- ポイント増加時の視覚効果が動作する
- エラー時に適切なメッセージが表示される

### POINT-001-04: ポイント加算ロジックのテスト実装
**概要**: ポイント加算機能のテストケース作成

**詳細**:
1. バックエンドAPIテストの作成
2. フロントエンドコンポーネントテストの作成
3. 統合テストの実装

**成功条件**:
- 全てのテストが通ること
- カバレッジが適切であること

### POINT-001-05: エラーハンドリングの実装
**概要**: ポイント加算時のエラーケースに対する適切な処理

**詳細**:
1. データベースエラー時の処理
2. 重複加算防止処理
3. ネットワークエラー時の処理
4. ユーザーフィードバック機能

**成功条件**:
- 各種エラーケースで適切な処理が行われる
- ユーザーに分かりやすいエラーメッセージが表示される

## 🧪 テスト仕様

### 単体テスト
- ポイント加算ロジックのテスト
- ポイント履歴記録のテスト
- エラーハンドリングのテスト

### 統合テスト
- タスク完了からポイント加算までの一連の流れ
- フロントエンドとバックエンドの連携テスト

### ユーザーテスト
- デイリータスク完了時のポイント加算動作確認
- ポイント表示の更新確認
- 複数タスク完了時の動作確認

## 🚀 実装スケジュール

| タスク | 予想時間 | 依存関係 |
|---|---|---|
| POINT-001-01 | 30分 | なし |
| POINT-001-02 | 60分 | POINT-001-01 |
| POINT-001-03 | 45分 | POINT-001-02 |
| POINT-001-04 | 30分 | POINT-001-02, POINT-001-03 |
| POINT-001-05 | 15分 | POINT-001-02, POINT-001-03 |

**総予想時間**: 約3時間

## 📝 備考

### 技術的考慮事項
- 単一ユーザー環境を想定（マルチユーザー対応は将来課題）
- ポイント重複加算の防止
- データベーストランザクションの活用
- フロントエンドでの楽観的更新の実装

### 拡張可能性
- ポイントレベルシステム
- ポイント消費機能
- ポイント履歴の詳細表示
- ポイント獲得時の通知機能

---

**作成日**: 2025年7月3日  
**作成者**: Claude Code Assistant  
**ブランチ**: feature/point-system-completion  
**関連Issues**: なし