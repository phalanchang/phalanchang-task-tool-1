# HEADER-001 実装ドキュメント

## 実装概要
App-headerを全体ヘッダーに変更し、レイアウト構造を調整する実装です。

## 実装内容

### Phase 1: レイアウト構造の変更
- **対象ファイル**: `frontend/src/App.tsx`
- **変更内容**:
  - App-headerを最上位に移動（line 69-85 → 階層の最上位へ）
  - content-wrapperを新設してSidebarとmain-contentを配置
  - 既存の機能（ハンバーガーメニュー、ポイント表示）は維持

### Phase 2: スタイリングの調整
- **対象ファイル**: `frontend/src/App.css`
- **変更内容**:
  - ヘッダーの全幅表示を実装（100vw）
  - サイドバーとメインコンテンツの位置調整
  - レスポンシブ対応の維持

### Phase 3: 各ページの調整
- **対象ファイル**: 
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/Tasks.tsx`
  - `frontend/src/pages/RecurringTasks.tsx`
  - `frontend/src/pages/Settings.tsx`
  - `frontend/src/pages/Pages.css`
- **変更内容**:
  - 各ページのpage-headerを削除
  - 不要なヘッダー関連のスタイルを削除

## 変更前後のレイアウト構造

### 変更前
```
App
├── Sidebar
├── main-content
    ├── App-header
    └── main (ページコンテンツ)
```

### 変更後
```
App
├── App-header (全体ヘッダー - 画面全幅)
└── content-wrapper
    ├── Sidebar
    └── main-content
        └── main (ページコンテンツ)
```

## 実装ステータス
- [x] Phase 1: レイアウト構造の変更
- [x] Phase 2: スタイリングの調整
- [x] Phase 3: 各ページの調整
- [x] レイアウト順序の修正
- [x] ヘッダー高さの調整と固定表示
- [x] PointsDisplayコンポーネントの薄型化
- [ ] 動作確認

## 実装完了詳細

### Phase 1: 完了
- App.tsx:54-102 - レイアウト構造を変更し、App-headerを最上位に移動
- content-wrapperを新設してSidebarとmain-contentを配置

### Phase 2: 完了
- App.css:1-11 - Appコンテナをflex-directionでcolumnに変更
- App.css:13-26 - content-wrapperスタイルを追加
- App.css:49-58 - ヘッダーを全幅表示に調整
- App.css:108-111 - メインコンテンツのパディング調整
- レスポンシブ対応のスタイルを更新

### Phase 3: 完了
- Dashboard.tsx:5-6 - page-headerを削除
- Tasks.tsx:195-196 - page-headerを削除
- RecurringTasks.tsx:254-255 - page-headerを削除
- Settings.tsx:5-6 - page-headerを削除
- Pages.css:24-40 - page-headerスタイルを削除
- Pages.css:853,868 - レスポンシブ対応のpage-headerスタイルを削除

### レイアウト順序の修正: 完了
- App.css:69 - App-headerのz-indexを1100に変更
- Sidebar.css:27 - サイドバーのz-indexを900に変更
- Sidebar.css:37-41 - デスクトップでサイドバーをfixedに変更し、top: 88px設定
- Sidebar.css:49-50 - モバイルでサイドバーをtop: 64px設定
- App.css:31 - デスクトップでmain-contentに左マージン250px追加

### ヘッダー高さの調整と固定表示: 完了
- App.css:58-75 - ヘッダーをposition: fixedに変更、高さを56pxに調整
- App.css:79 - ヘッダーフォントサイズを1.5remに調整
- App.css:15-20 - content-wrapperにmargin-top: 56px追加
- App.css:159-160 - モバイルでヘッダー高さを48pxに調整
- App.css:189-190 - 480pxでヘッダー高さを40pxに調整
- Sidebar.css:38-39 - デスクトップでサイドバーをtop: 56pxに調整
- Sidebar.css:49-50 - モバイルでサイドバーをtop: 48pxに調整
- Sidebar.css:61-63 - 480pxでサイドバーをtop: 40pxに調整

### PointsDisplayコンポーネントの薄型化: 完了
- PointsDisplay.css:10-21 - points-containerのパディングを0.4rem 0.6remに調整
- PointsDisplay.css:35-37 - points-iconのフォントサイズを1remに調整
- PointsDisplay.css:40-45 - points-infoをflex-direction: rowに変更して横並びに
- PointsDisplay.css:47-57 - points-labelとpoints-valueのフォントサイズを調整
- PointsDisplay.css:142-169 - モバイル対応のスタイルを調整
- PointsDisplay.css:171-193 - 480px以下でのさらなる薄型化を追加

## 注意事項
- 既存の機能（ハンバーガーメニュー、ポイント表示など）は維持
- レスポンシブ対応は現在と同等レベルを維持
- 各ページのコンテンツ部分は影響を受けない

## レビュー観点
1. レイアウト構造の変更が適切に実装されているか
2. 既存機能が正常に動作するか
3. レスポンシブ対応が維持されているか
4. コードの可読性と保守性が保たれているか