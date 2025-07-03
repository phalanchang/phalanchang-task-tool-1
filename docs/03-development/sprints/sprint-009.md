# Sprint 009: 日本時間デイリータスク自動更新機能

## 📋 Sprint概要

| 項目 | 内容 |
|---|---|
| Sprint ID | Sprint-009 |
| Sprint期間 | 2025年7月3日 |
| 関連Feature | TASK-005 |
| 担当者 | Claude Code Assistant |
| 優先度 | High |
| 緊急度 | High |
| 前提条件 | REPEAT-001の完了 |

## 🎯 Sprint目標

ユーザーから報告された重要な問題を解決する：
**日本時間00:00になってもデイリータスクが更新されない問題**

現在は手動またはページ読み込み時のみデイリータスクが生成されるため、真の意味での「自動更新」を実現する。日本時間（JST）の00:00に確実にデイリータスクが更新されるように、タイムゾーン対応とスケジューリング機能を実装する。

## 📝 実装対象

### Sprint Backlog

| Task ID | 作業内容 | 見積時間 | ステータス | 担当者 |
|---|---|---|---|---|
| TASK-005-01 | 現在のデイリータスク生成機能の分析 | 60分 | 📋 計画中 | Claude |
| TASK-005-02 | タイムゾーン設定の確認・調査 | 30分 | 📋 計画中 | Claude |
| TASK-005-03 | デイリータスク生成ロジックの日本時間対応 | 90分 | 📋 計画中 | Claude |
| TASK-005-04 | スケジューリング機能の実装・改善 | 90分 | 📋 計画中 | Claude |
| TASK-005-05 | 日本時間での自動更新テスト | 30分 | 📋 計画中 | Claude |

**総見積時間**: 5時間

## 🚨 緊急対応項目

### 問題: デイリータスクの自動更新停止
**現象**: 日本時間00:00になってもデイリータスクが更新されない
**影響度**: ユーザーの日次ルーティンに直接影響
**優先度**: 最高

### 技術的課題
1. **タイムゾーン問題**: サーバーがUTC基準で動作している可能性
2. **スケジューリング不備**: 自動実行機能が実装されていない
3. **日付判定ロジック**: 日本時間での日付変更を検知できていない

## 🏗️ 技術実装計画

### フェーズ1: 調査・分析（90分）

#### 1-1: 現在のシステム分析（60分）
**調査項目**:
1. デイリータスク生成機能（Task.generateTodayTasks）の詳細確認
2. 現在のタイムゾーン設定・動作確認
3. データベースの日時管理方式の確認
4. APIエンドポイントの実行タイミング調査

**確認対象ファイル**:
```javascript
// バックエンド
backend/src/models/Task.js - generateTodayTasks メソッド
backend/src/controllers/tasksController.js - generateTodayTasks エンドポイント

// フロントエンド
frontend/src/pages/Tasks.tsx - loadDailyTasks 関数
frontend/src/services/api.ts - generateTodayTasks API呼び出し
```

#### 1-2: タイムゾーン問題の特定（30分）
**確認項目**:
1. サーバーの現在時刻とタイムゾーン設定
2. `new Date()` の動作確認
3. データベースのタイムゾーン設定
4. 日本時間との時差の計算

### フェーズ2: タイムゾーン対応実装（90分）

#### 2-1: JST日付取得関数の実装（30分）
**新実装内容**:
```javascript
// utils/timezone.js
function getJSTDate() {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

function getJSTDateTime() {
  return new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo'
  });
}
```

#### 2-2: デイリータスク生成ロジックの修正（60分）
**修正対象**: `Task.generateTodayTasks`メソッド
```javascript
static async generateTodayTasks(userId = 'default_user') {
  const todayJST = getJSTDate(); // 日本時間での今日の日付
  
  // 日本時間基準での既存タスクチェック
  const [existingTasks] = await connection.execute(
    `SELECT COUNT(*) as count 
     FROM tasks 
     WHERE user_id = ? 
       AND source_task_id IS NOT NULL
       AND DATE(CONVERT_TZ(created_at, '+00:00', '+09:00')) = ?`,
    [userId, todayJST]
  );
  
  if (existingTasks[0].count > 0) {
    console.log(`JST ${todayJST}: デイリータスクは既に生成済みです`);
    return await this.getDailyTasks(userId);
  }
  
  // 新しい日のタスクを生成
  // ...
}
```

### フェーズ3: スケジューリング機能実装（90分）

#### 3-1: Cronジョブの実装（60分）
**新規ファイル**: `backend/src/scheduler.js`
```javascript
const cron = require('node-cron');
const Task = require('./models/Task');

class DailyTaskScheduler {
  static start() {
    // 日本時間の00:00に実行
    cron.schedule('0 0 * * *', async () => {
      const jstNow = new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});
      console.log(`JST ${jstNow}: デイリータスク自動生成を開始します`);
      
      try {
        await Task.generateTodayTasks();
        console.log('デイリータスク自動生成が完了しました');
      } catch (error) {
        console.error('デイリータスク自動生成エラー:', error);
      }
    }, {
      timezone: "Asia/Tokyo"
    });
    
    console.log('デイリータスク自動更新スケジューラが開始されました');
  }
  
  static stop() {
    cron.destroy();
    console.log('デイリータスク自動更新スケジューラが停止されました');
  }
}

module.exports = DailyTaskScheduler;
```

#### 3-2: アプリケーションへの統合（30分）
**修正対象**: `backend/src/app.js` または `backend/src/server.js`
```javascript
const DailyTaskScheduler = require('./scheduler');

// アプリケーション起動時にスケジューラを開始
if (process.env.NODE_ENV !== 'test') {
  DailyTaskScheduler.start();
}

// グレースフルシャットダウン時にスケジューラを停止
process.on('SIGTERM', () => {
  DailyTaskScheduler.stop();
  // 他のクリーンアップ処理...
});
```

### フェーズ4: テスト・検証（30分）

#### 4-1: 機能テスト（20分）
1. **手動テスト**: generateTodayTasks APIの直接呼び出し
2. **タイムゾーンテスト**: JST日付取得関数の動作確認
3. **スケジューラテスト**: 短期間隔での動作確認
4. **統合テスト**: 全体的な動作フローの確認

#### 4-2: ログ確認・最終調整（10分）
1. **ログ出力の確認**: 適切なタイミングでの実行ログ
2. **エラーハンドリング**: 例外発生時の処理確認
3. **パフォーマンス**: 処理時間とリソース使用量の確認

## ✅ 完了定義 (Definition of Done)

### 機能要件
- [ ] 日本時間00:00にデイリータスクが自動更新される
- [ ] タイムゾーンの変更に適切に対応する
- [ ] 手動更新機能も継続して動作する
- [ ] 既存のデイリータスク機能に影響がない

### 技術要件
- [ ] 全てのテストが通る
- [ ] TypeScriptビルドエラーがない
- [ ] ESLintエラーがない
- [ ] スケジューラが正常に動作する

### 品質要件
- [ ] 適切なログ出力がされている
- [ ] エラーハンドリングが実装されている
- [ ] パフォーマンスに問題がない
- [ ] コードレビューが完了している

## 🧪 テストシナリオ

### シナリオ1: 日本時間での自動更新
1. スケジューラが正常に起動することを確認
2. 日本時間00:00の実行ログを確認
3. デイリータスクが適切に生成されることを確認

### シナリオ2: タイムゾーン変換の確認
1. UTC時間とJST時間の差異を確認
2. `getJSTDate()`関数の正確性を確認
3. データベースクエリでの時刻変換を確認

### シナリオ3: 重複防止の確認
1. 同日に複数回実行された場合の動作確認
2. 既存タスクがある場合の処理確認
3. 異常終了時の処理確認

### シナリオ4: 既存機能との互換性
1. 手動でのデイリータスク生成が正常に動作することを確認
2. フロントエンドからのAPI呼び出しが正常に動作することを確認
3. 既存のタスク管理機能に影響がないことを確認

## 🚀 実装順序

### ステップ1: 現状調査・分析（90分）
1. 現在のデイリータスク生成ロジックの詳細確認
2. タイムゾーン関連の設定・動作確認
3. 問題の根本原因特定
4. 必要なパッケージの調査

### ステップ2: タイムゾーン対応（90分）
1. JST日付取得関数の実装
2. generateTodayTasksメソッドの修正
3. データベースクエリの修正
4. 単体テストの実行

### ステップ3: スケジューリング実装（90分）
1. node-cronパッケージの導入
2. スケジューラファイルの作成
3. アプリケーションへの統合
4. 動作テスト

### ステップ4: 総合テスト（30分）
1. 全機能の動作確認
2. ログ確認
3. パフォーマンステスト
4. ドキュメント更新

## 📊 進捗管理

### 進捗状況
- **開始**: 2025年7月3日（緊急対応）
- **現在の進捗**: 計画・設計フェーズ
- **完了予定**: 2025年7月3日

### マイルストーン
- [ ] 問題分析完了
- [ ] タイムゾーン対応実装完了
- [ ] スケジューリング機能実装完了
- [ ] テスト完了
- [ ] ユーザー確認完了

## 🔗 関連ドキュメント

- [TASK-005 機能仕様書](../../01-requirements/features/TASK-005_daily-task-timezone-jst-update.md)
- [REPEAT-001 繰り返しタスクの管理](../../01-requirements/features/REPEAT-001.md)
- [タスク管理API仕様書](../../02-design/api-specification.md)

## 📝 リスク・注意事項

### 技術リスク
- node-cronパッケージの導入によるシステム影響
- タイムゾーン変換処理の負荷
- 既存のタスク生成ロジックへの影響

### 対策
- 十分なテストによる影響確認
- 軽量な実装による負荷軽減
- 段階的な修正と検証

### 運用リスク
- スケジューラの停止・障害
- サーバー再起動時の自動復旧
- 重複実行の可能性

### 対策
- 適切なエラーハンドリング
- プロセス管理の改善
- 重複防止ロジックの実装

## 💡 実装ポイント

### タイムゾーン処理の安全性
- 環境に依存しないタイムゾーン処理
- 夏時間（DST）の考慮（日本では不要だが他地域対応時に重要）
- タイムゾーン変換の精度確保

### スケジューリングの信頼性
- サーバー再起動時の自動復旧
- エラー時の適切な通知
- パフォーマンスへの影響最小化

### 既存機能との互換性
- APIの仕様変更なし
- フロントエンドへの影響最小化
- データベーススキーマ変更なし

---

**作成日**: 2025年7月3日  
**作成者**: Claude Code Assistant  
**ブランチ**: feature/daily-task-timezone-jst-update  
**緊急度**: High  
**前提条件**: REPEAT-001の実装完了