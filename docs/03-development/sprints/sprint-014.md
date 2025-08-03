# Sprint 014: デイリータスクモニタリングダッシュボード実装

## 期間
2025-08-03

## 要件ID
MONITOR-001

## 目標
ダッシュボード画面にデイリータスクの実行状況をモニタリングする機能を追加し、ユーザーが習慣化の進捗を視覚的に把握できるようにする。

## 作業内容

### 1. バックエンド実装
- [ ] デイリータスク統計取得用APIエンドポイントの作成
  - `GET /api/daily-task-stats` エンドポイントを実装
  - 当日、今週、先週の統計情報を取得
  - タスク別の詳細統計を含む

### 2. フロントエンド実装
- [ ] 統計データ取得用カスタムフックの作成
  - `useDailyTaskStats` フックを実装
  - データのキャッシュ機能
  - リアルタイム更新対応

- [ ] ダッシュボードUIコンポーネントの更新
  - 当日の実行状況カード
  - 今週の実行状況カード（グラフ付き）
  - 先週比較表示
  - タスク別成功率一覧

### 3. スタイリング
- [ ] レスポンシブデザイン対応
- [ ] グラフ表示のスタイル調整
- [ ] ローディング・エラー状態のUI

## 技術仕様

### APIレスポンス構造
```typescript
interface DailyTaskStats {
  today: {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    completionRate: number;
    earnedPoints: number;
  };
  thisWeek: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    dailyBreakdown: Array<{
      date: string;
      completed: number;
      total: number;
    }>;
    earnedPoints: number;
  };
  lastWeek: {
    completionRate: number;
    earnedPoints: number;
  };
  taskBreakdown: Array<{
    taskId: number;
    title: string;
    successRate: number;
    streak: number;
    lastSevenDays: boolean[];
  }>;
}
```

### 使用技術
- Backend: Express.js, TypeScript
- Frontend: React, TypeScript, Chart.js/Recharts
- Database: MySQL（既存のtasksテーブルを活用）

## 実装手順

1. **APIエンドポイント作成**
   - 統計情報を計算するSQLクエリを作成
   - エンドポイントハンドラーを実装
   - エラーハンドリングを追加

2. **フロントエンドフック作成**
   - API呼び出しロジックを実装
   - データ整形とキャッシュ機能を追加
   - エラー処理を実装

3. **UIコンポーネント更新**
   - 統計カードコンポーネントを作成
   - グラフコンポーネントを実装
   - 既存のダッシュボードに統合

4. **テストとデバッグ**
   - APIエンドポイントのテスト
   - UIの動作確認
   - パフォーマンス最適化

## 成功基準
- デイリータスクの統計情報が正確に表示される
- グラフが見やすく、直感的に理解できる
- モバイルデバイスでも適切に表示される
- ページ読み込みが1秒以内に完了する

## 注意事項
- 既存のデータベース構造を変更しない
- パフォーマンスを考慮し、必要に応じてクエリを最適化
- タイムゾーンはJST（日本時間）で統一