# HEADER-001: 全体ヘッダーレイアウト変更

## 概要
現在「タスク管理」ページに存在している`App-header`を全体のヘッダーに変更し、階層の最上位に配置して画面の左端から右端まで伸びるレイアウトに変更する。

## 要件詳細

### 1. 現在の構成
- **現在のApp-header位置**: `frontend/src/App.tsx:69-85`
- **現在のApp-header内容**:
  - ハンバーガーメニュー（モバイル用）
  - アプリケーションタイトル「タスク管理アプリ」
  - PointsDisplayコンポーネント
- **現在のレイアウト構造**:
  ```
  App
  ├── Sidebar
  ├── main-content
      ├── App-header
      └── main (ページコンテンツ)
  ```

### 2. 変更後の構成
- **新しいレイアウト構造**:
  ```
  App
  ├── App-header (全体ヘッダー - 画面全幅)
  └── content-wrapper
      ├── Sidebar
      └── main-content
          └── main (ページコンテンツ)
  ```

### 3. 技術仕様

#### 3.1 ヘッダーの変更
- **位置**: 階層の最上位に配置
- **表示幅**: 画面の左端から右端まで（100vw）
- **内容**: 現在のApp-headerと同等
  - ハンバーガーメニュー（モバイル用）
  - アプリケーションタイトル「タスク管理アプリ」
  - PointsDisplayコンポーネント

#### 3.2 サイドバーの変更
- **位置**: 全体ヘッダーの下に配置
- **表示**: 現在と同じ機能を維持

#### 3.3 メインコンテンツの変更
- **位置**: サイドバーの右側（現在と同じ）
- **各ページのpage-header削除**: 各ページ固有のヘッダーは削除

#### 3.4 対象ページ
- ダッシュボード（Dashboard.tsx）
- タスク管理（Tasks.tsx）
- 繰り返しタスク管理（RecurringTasks.tsx）
- 設定（Settings.tsx）

#### 3.5 レスポンシブ対応
- **モバイル表示**: 現在と同じ動作を維持
- **ハンバーガーメニュー**: 現在と同じ機能を維持
- **サイドバー**: 現在と同じ折りたたみ機能を維持

## 実装方針

### Phase 1: レイアウト構造の変更
1. App.tsxのレイアウト構造を変更
2. App-headerを最上位に移動
3. content-wrapperを新設してSidebarとmain-contentを配置

### Phase 2: スタイリングの調整
1. App.cssでヘッダーの全幅表示を実装
2. サイドバーとメインコンテンツの位置調整
3. レスポンシブ対応の確認

### Phase 3: 各ページの調整
1. 各ページのpage-headerを削除
2. 不要なヘッダー関連のスタイルを削除
3. 統一されたレイアウトの確認

## 影響範囲

### 変更対象ファイル
- `frontend/src/App.tsx` - レイアウト構造の変更
- `frontend/src/App.css` - スタイリングの調整
- `frontend/src/pages/Dashboard.tsx` - page-header削除
- `frontend/src/pages/Tasks.tsx` - page-header削除
- `frontend/src/pages/RecurringTasks.tsx` - page-header削除
- `frontend/src/pages/Settings.tsx` - page-header削除
- `frontend/src/pages/Pages.css` - 不要なスタイル削除

### 変更しないファイル
- `frontend/src/components/Sidebar.tsx` - 機能は維持
- `frontend/src/components/PointsDisplay.tsx` - 機能は維持
- その他のコンポーネント - 機能は維持

## 期待される効果
1. **一貫性のあるUI**: 全ページで統一されたヘッダー表示
2. **改善されたレイアウト**: ヘッダーが画面全幅で表示されることによる視覚的な改善
3. **保守性の向上**: 各ページ固有のヘッダー削除による重複コードの削減

## 注意事項
1. 既存の機能（ハンバーガーメニュー、ポイント表示など）は維持する
2. レスポンシブ対応は現在と同等レベルを維持する
3. 各ページのコンテンツ部分は影響を受けない

## 実装状況

### 完了済み
- [x] **Phase 1: レイアウト構造の変更**
  - App.tsxのレイアウト構造を変更完了
  - App-headerを最上位に移動完了
  - content-wrapperを新設してSidebarとmain-contentを配置完了
  
- [x] **Phase 2: スタイリングの調整**
  - App.cssでヘッダーの全幅表示を実装完了
  - サイドバーとメインコンテンツの位置調整完了
  - レスポンシブ対応の確認完了
  
- [x] **Phase 3: 各ページの調整**
  - 各ページのpage-headerを削除完了
  - 不要なヘッダー関連のスタイルを削除完了
  - 統一されたレイアウトの確認完了

### 実装詳細
- **ヘッダー実装**: `frontend/src/App.tsx:57-73`
  - 固定ヘッダー（`position: fixed`）で全幅表示
  - ハンバーガーメニュー、タイトル、ポイント表示を配置
  - z-index: 1100 でコンテンツ上に配置
  
- **レイアウト構造**: `frontend/src/App.tsx:75-100`
  - content-wrapperでサイドバーとメインコンテンツを包含
  - ヘッダーの高さ分のmargin-top調整済み
  - モバイル用オーバーレイ機能実装済み

- **スタイリング**: `frontend/src/App.css`
  - ヘッダーの全幅表示スタイル実装
  - レスポンシブ対応（768px、480px以下）
  - デスクトップ用のサイドバーマージン調整

### 各ページの対応状況
- **Dashboard.tsx**: page-header削除済み
- **Tasks.tsx**: page-header削除済み
- **RecurringTasks.tsx**: page-header削除済み
- **Settings.tsx**: page-header削除済み

## 承認事項
- [x] 要件仕様の確認
- [x] 技術仕様の確認
- [x] 実装方針の承認
- [x] 影響範囲の確認
- [x] 実装完了