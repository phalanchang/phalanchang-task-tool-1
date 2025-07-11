# 全体ヘッダー仕様書

## 概要
HEADER-001の実装に基づく全体ヘッダーの技術仕様書です。画面全幅にわたる固定ヘッダーとして実装されています。

## ヘッダー基本仕様

### 1. 配置・レイアウト
- **位置**: 画面最上位（z-index: 1100）
- **配置方式**: 固定配置（position: fixed）
- **表示領域**: 画面全幅（left: 0, right: 0）
- **高さ**: 
  - デスクトップ: 56px
  - モバイル（768px以下）: 48px
  - 小画面（480px以下）: 40px

### 2. 構成要素
```
[ハンバーガーメニュー] [タイトル] [ポイント表示]
```

#### 2.1 ハンバーガーメニュー
- **表示条件**: モバイル（768px以下）のみ
- **位置**: 左端から16px
- **サイズ**: 32px × 32px
- **機能**: サイドバーの開閉
- **アイコン**: 3本線（各線 20px × 2px）

#### 2.2 タイトル
- **表示**: 「タスク管理アプリ」
- **位置**: 中央配置
- **フォント**: 
  - デスクトップ: 1.5rem, font-weight: 600
  - モバイル: 1.3rem
  - 小画面: 1.1rem

#### 2.3 ポイント表示
- **位置**: 右端
- **コンポーネント**: PointsDisplay
- **機能**: 現在のポイント数を表示

### 3. デザイン仕様

#### 3.1 色・スタイル
- **背景**: グラデーション（#667eea → #764ba2）
- **文字色**: 白（#ffffff）
- **影**: box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
- **文字間隔**: letter-spacing: 0.5px

#### 3.2 インタラクション
- **ハンバーガーメニュー**: 
  - ホバー時: 半透明背景（rgba(255, 255, 255, 0.1)）
  - 角丸: 4px
  - トランジション: 0.2s ease

### 4. レスポンシブ対応

#### 4.1 ブレークポイント
- **デスクトップ**: 769px以上
- **タブレット**: 480px〜768px
- **モバイル**: 480px以下

#### 4.2 各画面での調整
```css
/* デスクトップ */
@media (min-width: 769px) {
  .App-header { height: 56px; padding: 12px 1rem; }
  .hamburger-menu { display: none; }
}

/* タブレット */
@media (max-width: 768px) {
  .App-header { height: 48px; padding: 8px 0; }
  .hamburger-menu { display: flex; }
}

/* モバイル */
@media (max-width: 480px) {
  .App-header { height: 40px; padding: 6px 0; }
}
```

## 実装詳細

### 1. HTML構造
```tsx
<header className="App-header">
  <button className="hamburger-menu" onClick={handleMenuClick}>
    <span className="hamburger-line"></span>
    <span className="hamburger-line"></span>
    <span className="hamburger-line"></span>
  </button>
  <h1>タスク管理アプリ</h1>
  <PointsDisplay />
</header>
```

### 2. CSS実装
```css
.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 1100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 3. JavaScript機能
```tsx
const handleMenuClick = () => {
  setSidebarOpen(!sidebarOpen);
};
```

## コンテンツ調整

### 1. コンテンツエリアの調整
- **margin-top**: ヘッダーの高さ分だけコンテンツエリアを下げる
- **計算式**: `calc(100vh - [ヘッダーの高さ])`

### 2. サイドバーとの連携
- **デスクトップ**: サイドバーはヘッダーの下から開始
- **モバイル**: オーバーレイ表示、ヘッダーは常に表示

## アクセシビリティ

### 1. キーボードナビゲーション
- **Tab順序**: ハンバーガーメニュー → その他要素
- **フォーカス**: 視覚的に識別可能

### 2. スクリーンリーダー対応
- **aria-label**: ハンバーガーメニューに「メニューを開く」
- **セマンティック**: header要素の使用

## 互換性・制約

### 1. ブラウザ対応
- **CSS Grid/Flexbox**: モダンブラウザ対応
- **固定位置**: position: fixed サポート必須

### 2. 制約事項
- **z-index**: 1100以上の要素は重なりに注意
- **高さ固定**: ヘッダーの高さ変更時はcontent-wrapperの調整が必要

## 保守・拡張

### 1. 変更時の影響範囲
- **ヘッダー高さ変更**: App.cssのmargin-top調整が必要
- **要素追加**: justify-content: space-betweenの調整が必要

### 2. 拡張ポイント
- **ナビゲーション**: 中央部分にナビゲーションメニュー追加可能
- **通知**: 右側エリアに通知アイコン追加可能
- **検索**: 検索ボックスの追加対応

## 関連ファイル
- **実装**: `frontend/src/App.tsx:57-73`
- **スタイル**: `frontend/src/App.css:58-124`
- **コンポーネント**: `frontend/src/components/PointsDisplay.tsx`
- **レイアウト**: `frontend/src/App.css:14-38`