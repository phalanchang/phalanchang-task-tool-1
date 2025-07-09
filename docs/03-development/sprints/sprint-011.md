# Sprint 011: 日付変更時ポイントリセット機能修正

## 📋 Sprint概要

| 項目 | 内容 |
|---|---|
| Sprint ID | Sprint-011 |
| Sprint期間 | 2025年7月4日 |
| 関連Feature | POINT-005 |
| 担当者 | Claude Code Assistant |
| 優先度 | High |
| 緊急度 | High |
| 前提条件 | 既存ポイント管理システムの正常動作 |

## 🎯 Sprint目標

**ユーザーから報告された重要なバグを修正する：**
**「日付が変わっても、ヘッダーに記載されている「今日」のポイントが0にリフレッシュされない」**

現在のポイント管理システムでは、日付が変更された際にdaily_pointsが自動的にリセットされないため、ユーザーが長時間ブラウザを開いていると前日のポイントが表示され続ける問題が発生している。この問題を根本的に解決し、正確な日次ポイント管理を実現する。

## 📝 実装対象

### Sprint Backlog

| Task ID | 作業内容 | 見積時間 | ステータス | 担当者 |
|---|---|---|---|---|
| POINT-005-01 | ポイント管理システムの問題分析 | 30分 | 📋 計画中 | Claude |
| POINT-005-02 | バックエンドdaily_pointsリセット機能実装 | 90分 | 📋 計画中 | Claude |
| POINT-005-03 | フロントエンド日付変更検知機能実装 | 60分 | 📋 計画中 | Claude |
| POINT-005-04 | point_historyテーブル整備とロジック修正 | 45分 | 📋 計画中 | Claude |
| POINT-005-05 | 統合テストと動作検証 | 30分 | 📋 計画中 | Claude |

**総見積時間**: 4.25時間

## 🚨 修正要求項目

### 重要度: Critical
**現象**: 日付変更時に「今日」のポイントが0にリセットされない
**影響度**: データ整合性、ユーザー体験
**優先度**: 最高

### 根本原因
1. **バックエンドでのdaily_pointsリセット不備**: 日付比較ロジックが不足
2. **フロントエンドでの日付変更検知機能欠如**: 自動更新機能がない
3. **point_historyテーブルのロジック問題**: 代替ロジックが不完全

## 🏗️ 技術実装計画

### フェーズ1: 問題分析・調査（30分）

#### 1-1: 現在のポイント管理システム分析（30分）
**調査項目**:
1. Task.jsのgetUserPointsメソッドの現在の実装確認
2. PointsDisplayコンポーネントの更新ロジック分析
3. point_historyテーブルの存在とデータ整合性確認
4. 日付変更時の動作フロー調査

**確認対象ファイル**:
```javascript
// バックエンド
backend/src/models/Task.js - getUserPointsメソッド
backend/src/routes/users.js - ポイント取得API

// フロントエンド
frontend/src/components/PointsDisplay.tsx - ポイント表示コンポーネント
frontend/src/hooks/useDailyTaskRefresh.ts - 既存更新ロジック
```

### フェーズ2: バックエンド修正（90分）

#### 2-1: getUserPointsメソッドの日付変更対応（60分）
**修正対象**: `backend/src/models/Task.js`

**現在の実装（推定）**:
```javascript
static async getUserPoints(userId = 'default_user') {
  const [existingPoints] = await connection.execute(
    'SELECT * FROM user_points WHERE user_id = ?',
    [userId]
  );
  return existingPoints[0] || { total_points: 0, daily_points: 0 };
}
```

**修正後の実装**:
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

#### 2-2: point_historyテーブルの整備（30分）
**実装内容**:
1. **テーブル存在確認とテーブル作成**:
```sql
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

2. **point_historyベースの日次ポイント計算メソッド**:
```javascript
static async getTodayPoints(userId = 'default_user') {
  const today = new Date().toISOString().split('T')[0];
  
  try {
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

### フェーズ3: フロントエンド修正（60分）

#### 3-1: 日付変更検知Hookの作成（30分）
**新規ファイル**: `frontend/src/hooks/useDateChangeDetection.ts`
```javascript
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

#### 3-2: PointsDisplayコンポーネントの修正（30分）
**修正対象**: `frontend/src/components/PointsDisplay.tsx`

**修正内容**:
```javascript
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

### フェーズ4: 統合テスト・検証（30分）

#### 4-1: 機能テスト（20分）
1. **日付変更時のリセット動作確認**
2. **ポイント計算の正確性検証**
3. **長時間使用時の動作確認**
4. **既存ポイント機能への影響確認**

#### 4-2: パフォーマンステスト（10分）
1. **定期的な更新処理の負荷確認**
2. **データベースクエリの効率性確認**
3. **フロントエンド描画パフォーマンス確認**

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

### ステップ1: 問題分析・調査（30分）
1. 現在のポイント管理システムの詳細分析
2. getUserPointsメソッドの実装確認
3. PointsDisplayコンポーネントの動作調査
4. point_historyテーブルの状態確認

### ステップ2: バックエンド修正（90分）
1. getUserPointsメソッドに日付比較ロジック追加
2. daily_pointsリセット機能の実装
3. point_historyテーブルの整備
4. 代替ロジックの実装

### ステップ3: フロントエンド修正（60分）
1. useDateChangeDetectionフックの作成
2. PointsDisplayコンポーネントの修正
3. 定期的な更新機能の実装
4. エラーハンドリングの改善

### ステップ4: 統合テスト・検証（30分）
1. 全機能の動作確認
2. 日付変更時の動作テスト
3. 長時間使用時のテスト
4. パフォーマンス確認

## 📊 進捗管理

### 進捗状況
- **開始**: 2025年7月4日
- **現在の進捗**: 計画・設計フェーズ
- **完了予定**: 2025年7月4日

### マイルストーン
- [ ] 問題分析完了
- [ ] バックエンド修正完了
- [ ] フロントエンド修正完了
- [ ] テスト完了
- [ ] ユーザー確認完了

## 🔗 関連ドキュメント

- [POINT-005 機能仕様書](../../01-requirements/features/POINT-005_daily-points-reset-fix.md)
- [POINT-001 タスク完了時ポイント加算機能](../../01-requirements/features/POINT-001_task-completion-point-system.md)
- [POINT-004 ポイント表示・反映不具合修正](../../01-requirements/features/POINT-004_fix-point-display-issues.md)
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
**緊急度**: High  
**前提条件**: 既存ポイント管理システムの正常動作