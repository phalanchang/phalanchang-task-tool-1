# TASK-005: 日本時間デイリータスク自動更新機能

## 📋 作業概要

| ID | 作業内容 | ステータス | 優先度 | 担当者 |
|---|---|---|---|---|
| TASK-005-01 | 現在のデイリータスク生成機能の分析 | 📋 計画中 | High | Claude Code Assistant |
| TASK-005-02 | タイムゾーン設定の確認・調査 | 📋 計画中 | High | Claude Code Assistant |
| TASK-005-03 | デイリータスク生成ロジックの日本時間対応 | 📋 計画中 | High | Claude Code Assistant |
| TASK-005-04 | スケジューリング機能の実装・改善 | 📋 計画中 | High | Claude Code Assistant |
| TASK-005-05 | 日本時間での自動更新テスト | 📋 計画中 | Medium | Claude Code Assistant |

---

## 🎯 問題概要

### 報告された問題

**現象**: 日本時間00:00になってもデイリータスクが更新されない

**期待される動作**: 日本時間の00:00（JST）になったタイミングで、自動的にデイリータスクが更新・生成される

### 原因分析の仮説

#### 仮説1: タイムゾーン設定の問題
- サーバーまたはアプリケーションがUTCで動作している可能性
- 日本時間（JST）との9時間の時差が考慮されていない可能性

#### 仮説2: スケジューリング機能の不備
- 定期実行機能が実装されていない可能性
- 実装されていてもタイムゾーンが考慮されていない可能性

#### 仮説3: デイリータスク生成ロジックの問題
- 日付判定ロジックがローカルタイムゾーンを考慮していない可能性
- 手動実行時のみ動作し、自動実行が機能していない可能性

## 🏗️ 技術仕様

### 現在のデイリータスク管理システム

#### API構造
```javascript
// tasksController.js
// デイリータスク生成API
exports.generateTodayTasks = async (req, res) => {
  try {
    const tasks = await Task.generateTodayTasks(userId);
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### 現在の生成ロジック
```javascript
// Task.js
static async generateTodayTasks(userId = 'default_user') {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  // 今日分が既に生成されているかチェック
  const [existingTasks] = await connection.execute(
    'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND DATE(created_at) = ?',
    [userId, today]
  );
  
  if (existingTasks[0].count > 0) {
    // 既存タスクを返す
    return await this.getDailyTasks(userId);
  }
  
  // 新しい日のタスクを生成
  // ...
}
```

### 問題の詳細分析

#### 問題1: タイムゾーン未対応
**現在の問題**:
```javascript
const today = new Date().toISOString().slice(0, 10); // UTC時間ベース
```
これは常にUTC時間で日付を判定するため、日本時間の00:00とは異なるタイミングで実行される。

#### 問題2: 自動実行機能の不備
現在はフロントエンドからのAPI呼び出し時のみ実行されるため、真の意味での「自動更新」ではない。

### 解決策の設計

#### 1. タイムゾーン対応の実装

##### 日本時間での日付取得
```javascript
// 日本時間（JST）での日付取得
function getJSTDate() {
  const now = new Date();
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return jstTime.toISOString().slice(0, 10);
}

// または、よりロバストな実装
function getJSTDate() {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}
```

##### デイリータスク生成ロジックの改善
```javascript
static async generateTodayTasks(userId = 'default_user') {
  const todayJST = getJSTDate(); // 日本時間での今日の日付
  
  // 日本時間基準での既存タスクチェック
  const [existingTasks] = await connection.execute(
    `SELECT COUNT(*) as count 
     FROM tasks 
     WHERE user_id = ? 
       AND DATE(CONVERT_TZ(created_at, '+00:00', '+09:00')) = ?`,
    [userId, todayJST]
  );
  
  // ...
}
```

#### 2. スケジューリング機能の実装

##### Node.js Cron ジョブの実装
```javascript
// scheduler.js
const cron = require('node-cron');
const Task = require('./models/Task');

// 日本時間の00:00に実行（UTC 15:00）
cron.schedule('0 15 * * *', async () => {
  console.log('デイリータスク自動生成を開始します');
  try {
    await Task.generateTodayTasks();
    console.log('デイリータスク自動生成が完了しました');
  } catch (error) {
    console.error('デイリータスク自動生成エラー:', error);
  }
});
```

##### または、より柔軟なアプローチ
```javascript
// 日本時間の00:00に実行（タイムゾーン指定）
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
```

#### 3. バックエンド統合

##### app.jsまたはserver.jsでの初期化
```javascript
// app.js
const scheduler = require('./scheduler');

// アプリケーション起動時にスケジューラを開始
if (process.env.NODE_ENV === 'production') {
  scheduler.start();
  console.log('デイリータスク自動更新スケジューラが開始されました');
}
```

### 実装計画

#### Phase 1: 調査・分析（60分）
1. **現在のシステム分析**
   - デイリータスク生成機能の詳細調査
   - タイムゾーン関連の設定確認
   - データベースのタイムゾーン設定確認

2. **問題の再現**
   - 現在の動作を詳細に観察
   - タイムゾーンの問題を特定
   - ログの確認

#### Phase 2: タイムゾーン対応実装（90分）
1. **日本時間対応の実装**
   - JST日付取得関数の作成
   - デイリータスク生成ロジックの修正
   - データベースクエリのタイムゾーン対応

2. **テスト実装**
   - 時刻変更によるテスト
   - JST基準での動作確認

#### Phase 3: スケジューリング機能実装（90分）
1. **Cronジョブの実装**
   - node-cronパッケージの導入
   - 日本時間00:00でのスケジュール設定
   - エラーハンドリングの実装

2. **統合・テスト**
   - スケジューラの起動確認
   - ログ出力の確認
   - 動作テスト

#### Phase 4: 最終テスト・検証（30分）
1. **総合テスト**
   - 手動実行での動作確認
   - スケジューラでの自動実行確認
   - タイムゾーン変換の検証

2. **ドキュメント更新**
   - 実装内容の記録
   - 運用手順の作成

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

### シナリオ1: 日本時間での日付変更
1. 日本時間の23:59に待機
2. 00:00になった瞬間を確認
3. デイリータスクが自動生成されることを確認

### シナリオ2: タイムゾーン変換の確認
1. UTC時間とJST時間の差異を確認
2. サーバーの時刻設定を確認
3. 正しいタイムゾーン変換が行われることを確認

### シナリオ3: スケジューラの動作確認
1. スケジューラが正常に起動することを確認
2. 指定時刻に実行されることを確認
3. エラー発生時の処理を確認

### シナリオ4: 既存機能との互換性
1. 手動でのデイリータスク生成が正常に動作することを確認
2. 既存のタスク管理機能に影響がないことを確認
3. ポイント機能との連携が正常に動作することを確認

## 🚀 実装順序

### ステップ1: 現状調査（60分）
1. 現在のデイリータスク生成ロジックの詳細確認
2. タイムゾーン関連の設定・動作確認
3. 問題の根本原因特定

### ステップ2: タイムゾーン対応（90分）
1. JST日付取得関数の実装
2. generateTodayTasksメソッドの修正
3. データベースクエリの修正
4. テスト実行

### ステップ3: スケジューリング実装（90分）
1. node-cronパッケージの導入
2. スケジューラファイルの作成
3. アプリケーションへの統合
4. 動作テスト

### ステップ4: 総合テスト（30分）
1. 全機能の動作確認
2. パフォーマンステスト
3. ログ確認
4. ドキュメント更新

## 📊 進捗管理

### 進捗状況
- **開始**: 2025年7月3日（緊急対応）
- **現在の進捗**: 要件定義フェーズ
- **完了予定**: 2025年7月3日

### マイルストーン
- [ ] 問題分析完了
- [ ] タイムゾーン対応実装完了
- [ ] スケジューリング機能実装完了
- [ ] テスト完了
- [ ] ユーザー確認完了

## 🔗 関連ドキュメント

- [REPEAT-001 繰り返しタスクの管理](REPEAT-001.md)
- [タスク管理API仕様書](../../02-design/api-specification.md)
- [デイリータスク関連の既存実装](../../../backend/src/models/Task.js)

## 📝 リスク・注意事項

### 技術リスク
- サーバーのタイムゾーン設定への依存
- Cronジョブの実行環境の確保
- 既存システムへの影響

### 対策
- 環境に依存しないタイムゾーン処理の実装
- 適切なエラーハンドリング
- 十分なテストによる影響確認

### 運用リスク
- スケジューラの停止・障害
- 重複実行の可能性
- リソース消費の増加

### 対策
- 監視・アラート機能の実装
- 重複防止ロジックの実装
- 軽量な実装による負荷軽減

## 💡 実装ポイント

### タイムゾーン処理
- JavaScriptのIntl APIまたはmoment-timezoneの活用
- サーバー環境に依存しない実装
- 夏時間（DST）の考慮（日本では不要）

### スケジューリング
- node-cronによる信頼性の高いスケジューリング
- プロセス再起動時の自動復旧
- 適切なログ出力による監視

### 既存機能との互換性
- 既存APIの仕様維持
- フロントエンドへの影響最小化
- 段階的な移行による安全性確保

---

**作成日**: 2025年7月3日  
**作成者**: Claude Code Assistant  
**ブランチ**: feature/daily-task-timezone-jst-update  
**関連Issues**: デイリータスク日本時間自動更新  
**前提条件**: REPEAT-001の実装完了