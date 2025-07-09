# POINT-005: 日付変更時ポイントリセット機能修正

## 📋 作業概要

| ID | 作業内容 | ステータス | 優先度 | 担当者 |
|---|---|---|---|---|
| POINT-005-01 | ポイント管理システムの問題分析 | 📋 計画中 | High | Claude Code Assistant |
| POINT-005-02 | バックエンドdaily_pointsリセット機能実装 | 📋 計画中 | High | Claude Code Assistant |
| POINT-005-03 | フロントエンド日付変更検知機能実装 | 📋 計画中 | High | Claude Code Assistant |
| POINT-005-04 | point_historyテーブル整備とロジック修正 | 📋 計画中 | Medium | Claude Code Assistant |
| POINT-005-05 | 統合テストと動作検証 | 📋 計画中 | Medium | Claude Code Assistant |

---

## 🎯 問題概要

### 報告された問題

**現象**: 日付が変わっても、ヘッダーに記載されている「今日」のポイントが0にリフレッシュされない

**期待される動作**: 
- 日付が変わった時（00:00）に「今日」のポイントが自動的に0にリセットされる
- 新しい日のポイント獲得が正確に反映される
- ブラウザを長時間開いていても正しい日次ポイントが表示される

### 根本原因分析

#### 原因1: バックエンドでのdaily_pointsリセット不備
- `user_points`テーブルの`daily_points`カラムが日付変更時に自動リセットされない
- `getUserPoints`メソッドで日付比較ロジックが不足
- 前日の値がそのまま残り続ける

#### 原因2: フロントエンドでの日付変更検知機能欠如
- `PointsDisplay`コンポーネントに日付変更を検知する機能がない
- `useEffect`が`refreshTrigger`の変更時のみ実行される
- ブラウザが長時間開いていると古いデータが表示される

#### 原因3: point_historyテーブルのロジック問題
- `point_history`テーブルの存在確認が不十分
- 代替ロジックが実装されていない
- 日付ベースのポイント計算が不正確

## 🏗️ 技術仕様

### 現在のポイント管理システム

#### バックエンドAPI構造
```javascript
// backend/src/models/Task.js
static async getUserPoints(userId = 'default_user') {
  // 現在の実装：日付チェックなし
  const [existingPoints] = await connection.execute(
    'SELECT * FROM user_points WHERE user_id = ?',
    [userId]
  );
  return existingPoints[0] || { total_points: 0, daily_points: 0 };
}
```

#### フロントエンド更新ロジック
```javascript
// frontend/src/components/PointsDisplay.tsx
useEffect(() => {
  fetchPoints();
}, [refreshTrigger]); // 日付変更時の更新なし
```

### 解決策の設計

#### 1. バックエンドでの日付変更時リセット機能

##### 改善されたgetUserPointsメソッド
```javascript
static async getUserPoints(userId = 'default_user') {
  const today = new Date().toISOString().split('T')[0];
  
  const [existingPoints] = await connection.execute(
    'SELECT * FROM user_points WHERE user_id = ?',
    [userId]
  );
  
  if (existingPoints[0]) {
    const lastUpdated = existingPoints[0].last_updated;
    const lastUpdatedDate = new Date(lastUpdated).toISOString().split('T')[0];
    
    // 日付が変わっている場合はdaily_pointsをリセット
    if (lastUpdatedDate !== today) {
      await connection.execute(
        'UPDATE user_points SET daily_points = 0, last_updated = NOW() WHERE user_id = ?',
        [userId]
      );
      return {
        ...existingPoints[0],
        daily_points: 0,
        last_updated: new Date()
      };
    }
    
    return existingPoints[0];
  }
  
  // 新規ユーザーの場合
  return { total_points: 0, daily_points: 0 };
}
```

#### 2. フロントエンドでの日付変更検知機能

##### 日付変更検知Hook
```javascript
// frontend/src/hooks/useDateChangeDetection.ts
import { useEffect, useState } from 'react';

export const useDateChangeDetection = (callback: () => void) => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toDateString()
  );

  useEffect(() => {
    const checkDateChange = () => {
      const newDate = new Date().toDateString();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        callback();
      }
    };

    // 1分ごとに日付をチェック
    const interval = setInterval(checkDateChange, 60000);
    
    return () => clearInterval(interval);
  }, [currentDate, callback]);
};
```

##### 改善されたPointsDisplayコンポーネント
```javascript
// frontend/src/components/PointsDisplay.tsx
import { useDateChangeDetection } from '../hooks/useDateChangeDetection';

const PointsDisplay = () => {
  const [points, setPoints] = useState({ total: 0, daily: 0 });
  const { refreshTrigger } = useDailyTaskRefresh();
  
  const fetchPoints = useCallback(async () => {
    try {
      const response = await fetch('/api/users/points');
      const data = await response.json();
      setPoints({
        total: data.total_points || 0,
        daily: data.daily_points || 0
      });
    } catch (error) {
      console.error('ポイント取得エラー:', error);
    }
  }, []);

  // 日付変更検知
  useDateChangeDetection(fetchPoints);
  
  // 通常の更新トリガー
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints, refreshTrigger]);

  return (
    <div className="points-display">
      <span>今日: {points.daily}pt</span>
      <span>累計: {points.total}pt</span>
    </div>
  );
};
```

#### 3. point_historyテーブルの整備

##### テーブル作成SQL
```sql
-- point_historyテーブル作成（存在しない場合）
CREATE TABLE IF NOT EXISTS point_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  task_id INT,
  points INT NOT NULL,
  earned_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, earned_date),
  INDEX idx_task (task_id)
);
```

##### point_historyを使用した正確な日次ポイント計算
```javascript
static async getTodayPoints(userId = 'default_user') {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // point_historyテーブルから今日のポイントを計算
    const [todayPoints] = await connection.execute(
      'SELECT COALESCE(SUM(points), 0) as daily_total FROM point_history WHERE user_id = ? AND earned_date = ?',
      [userId, today]
    );
    
    return todayPoints[0].daily_total;
  } catch (error) {
    console.error('point_historyテーブルが存在しない可能性があります:', error);
    
    // 代替ロジック：user_pointsのdaily_pointsを使用
    const [userPoints] = await connection.execute(
      'SELECT daily_points FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    return userPoints[0]?.daily_points || 0;
  }
}
```

### 実装計画

#### Phase 1: バックエンド修正（90分）
1. **getUserPointsメソッドの修正**
   - 日付比較ロジックの追加
   - daily_pointsリセット機能の実装
   - エラーハンドリングの改善

2. **point_historyテーブルの整備**
   - テーブル存在確認と作成
   - 適切なインデックスの設定
   - データ整合性の確保

#### Phase 2: フロントエンド修正（60分）
1. **日付変更検知機能の実装**
   - useDateChangeDetectionフックの作成
   - PointsDisplayコンポーネントの修正
   - 定期的な更新機能の追加

2. **パフォーマンス最適化**
   - 不要なAPI呼び出しの削減
   - キャッシュ機能の実装
   - エラーハンドリングの改善

#### Phase 3: テスト・検証（30分）
1. **機能テスト**
   - 日付変更時のリセット動作確認
   - ポイント計算の正確性検証
   - 長時間使用時の動作確認

2. **統合テスト**
   - バックエンド・フロントエンド連携確認
   - エラー処理の動作確認
   - パフォーマンステスト

## ✅ 完了定義 (Definition of Done)

### 機能要件
- [ ] 日付変更時（00:00）に「今日」のポイントが自動的に0にリセットされる
- [ ] ブラウザを長時間開いていても正確な日次ポイントが表示される
- [ ] 新しい日のポイント獲得が正確に反映される
- [ ] 既存のポイント機能に影響がない

### 技術要件
- [ ] 全てのテストが通る
- [ ] TypeScriptビルドエラーがない
- [ ] ESLintエラーがない
- [ ] データベース整合性が保たれる

### 品質要件
- [ ] 適切なエラーハンドリング
- [ ] パフォーマンスに問題がない
- [ ] 代替ロジックが実装されている
- [ ] コードレビューが完了している

## 🧪 テストシナリオ

### シナリオ1: 日付変更時のリセット動作
1. 23:59に「今日」のポイントが表示されていることを確認
2. 00:00になるまで待機
3. 1-2分後に「今日」のポイントが0にリセットされることを確認
4. 新しいタスクを完了してポイントが正常に加算されることを確認

### シナリオ2: 長時間使用時の動作
1. ブラウザを24時間以上開いたまま維持
2. 日付変更後にポイント表示が正しく更新されることを確認
3. ページをリロードしなくても正確な値が表示されることを確認

### シナリオ3: point_historyテーブル不在時の動作
1. point_historyテーブルを一時的に削除
2. ポイント取得APIが正常に動作することを確認
3. 代替ロジックでポイントが計算されることを確認
4. エラーログが適切に出力されることを確認

### シナリオ4: 既存機能への影響確認
1. タスク完了時のポイント加算が正常に動作することを確認
2. 累計ポイントが正しく計算されることを確認
3. ポイント履歴が正確に記録されることを確認

## 🚀 実装順序

### ステップ1: バックエンド修正（90分）
1. Task.jsのgetUserPointsメソッド修正
2. point_historyテーブルの整備
3. 日付変更時リセットロジックの実装
4. エラーハンドリングの改善

### ステップ2: フロントエンド修正（60分）
1. useDateChangeDetectionフックの作成
2. PointsDisplayコンポーネントの修正
3. 定期的な更新機能の実装
4. パフォーマンス最適化

### ステップ3: 統合テスト（30分）
1. 全機能の動作確認
2. 日付変更時の動作テスト
3. 長時間使用時のテスト
4. エラー処理の確認

## 📊 進捗管理

### 進捗状況
- **開始**: 2025年7月4日
- **現在の進捗**: 要件定義フェーズ
- **完了予定**: 2025年7月4日

### マイルストーン
- [ ] 問題分析完了
- [ ] バックエンド修正完了
- [ ] フロントエンド修正完了
- [ ] テスト完了
- [ ] ユーザー確認完了

## 🔗 関連ドキュメント

- [POINT-001 タスク完了時ポイント加算機能](POINT-001_task-completion-point-system.md)
- [POINT-004 ポイント表示・反映不具合修正](POINT-004_fix-point-display-issues.md)
- [ポイント管理システム設計書](../../02-design/point-system-design.md)

## 📝 リスク・注意事項

### 技術リスク
- point_historyテーブルが存在しない環境での動作
- 日付変更検知機能のパフォーマンス影響
- 既存ポイント機能への影響

### 対策
- 代替ロジックの実装
- 効率的な更新間隔の設定
- 十分なテストによる影響確認

### 運用リスク
- ユーザーのブラウザ環境による動作差異
- タイムゾーンの考慮
- データベース負荷増加

### 対策
- クロスブラウザテストの実施
- サーバー時間ベースの処理
- インデックス最適化

## 💡 実装ポイント

### パフォーマンス
- 1分間隔での日付チェック（適切な更新頻度）
- point_historyテーブルのインデックス活用
- 不要なAPI呼び出しの削減

### 保守性
- 代替ロジックの実装
- 適切なエラーハンドリング
- 明確なコメントとドキュメント

### 拡張性
- 他のタイムゾーンへの対応準備
- ポイントシステムの機能拡張への対応
- 複数ユーザーでの動作確認

---

**作成日**: 2025年7月4日  
**作成者**: Claude Code Assistant  
**ブランチ**: feature/daily-points-reset-fix  
**関連Issues**: 日付変更時ポイントリセット不具合  
**前提条件**: 既存ポイント管理システムの正常動作