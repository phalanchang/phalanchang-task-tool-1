# 受け入れ基準

**作成日**: 2025-06-18  
**最終更新**: 2025-06-18  

## 📋 概要

ユーザーストーリーに対する具体的な受け入れ基準を定義します。

---

## 🎭 Epic 1: サイドバーナビゲーション (SIDEBAR-001)

### ユーザーストーリー: SIDEBAR-001-01
**ストーリー**: タスク管理ユーザーとして、サイドバーから異なる画面へ素早く移動したい

#### 受け入れ基準

✅ **基準1: サイドバー表示**
- [ ] サイドバーが画面左側に固定で表示される
- [ ] サイドバーの幅は250px（デスクトップ）
- [ ] サイドバー背景色は Material Design に準拠

✅ **基準2: ナビゲーション項目**
- [ ] 「ダッシュボード」項目が表示される
- [ ] 「タスク管理」項目が表示される  
- [ ] 「設定」項目が表示される
- [ ] 各項目にアイコンが表示される

✅ **基準3: クリック動作**
- [ ] 「ダッシュボード」クリックで `/` に遷移
- [ ] 「タスク管理」クリックで `/tasks` に遷移
- [ ] 「設定」クリックで `/settings` に遷移
- [ ] クリック時のホバーエフェクトが適用される

✅ **基準4: アクティブ状態**
- [ ] 現在のページに対応する項目がハイライト表示
- [ ] アクティブ項目の背景色が変更される

### ユーザーストーリー: SIDEBAR-001-02
**ストーリー**: モバイルユーザーとして、スマートフォンでもサイドバーが使いやすい

#### 受け入れ基準

✅ **基準1: レスポンシブ表示**
- [ ] 画面幅768px以下でハンバーガーメニューに変換
- [ ] ハンバーガーアイコンがヘッダー左上に表示
- [ ] メニュークリックでサイドバーが左からスライドイン

✅ **基準2: モバイル操作性**
- [ ] タッチ操作でスムーズに動作
- [ ] サイドバー外タップで閉じる
- [ ] スワイプ操作で開閉可能

✅ **基準3: モバイル表示調整**
- [ ] モバイル時のサイドバー幅は画面幅の80%
- [ ] 文字サイズとタッチターゲットがモバイル最適化

---

## 🔄 Epic 2: 繰り返しタスク登録 (REPEAT-001)

### ユーザーストーリー: REPEAT-001-01
**ストーリー**: 定期業務を持つユーザーとして、毎日・毎週・毎月の繰り返しタスクを自動生成したい

#### 受け入れ基準

✅ **基準1: 繰り返しパターン設定**
- [ ] 「毎日」「毎週」「毎月」のパターン選択可能
- [ ] 毎日: 平日のみ/毎日/指定曜日のオプション
- [ ] 毎週: 複数曜日選択可能（チェックボックス）
- [ ] 毎月: 指定日付/月末/第N曜日の選択可能

✅ **基準2: マスタータスク作成**
- [ ] タスク名、説明、優先度を設定可能
- [ ] 開始日と終了日（無期限オプション）を設定
- [ ] 設定内容のプレビュー表示機能

✅ **基準3: データ保存**
- [ ] recurring_tasks テーブルに正しく保存
- [ ] JSON形式でpattern_configが保存
- [ ] バリデーションエラーの適切な表示

### ユーザーストーリー: REPEAT-001-02
**ストーリー**: タスク管理ユーザーとして、今日のデイリータスクのみを表示したい

#### 受け入れ基準

✅ **基準1: タブ切り替え機能**
- [ ] 「すべてのタスク」「デイリータスク」タブを表示
- [ ] タブクリックで表示内容が切り替わる
- [ ] アクティブタブのスタイル変更

✅ **基準2: デイリータスク表示**
- [ ] 当日の繰り返しタスクのみ表示
- [ ] 「今日のデイリータスク」セクションの表示
- [ ] 完了/未完了の進捗表示

✅ **基準3: フィルタリング**
- [ ] 当日分のタスクのみAPI経由で取得
- [ ] 日付が変わった際の自動更新

### ユーザーストーリー: REPEAT-001-03
**ストーリー**: アプリ利用者として、ページアクセス時に本日分タスクが自動チェックされる

#### 受け入れ基準

✅ **基準1: 自動チェック機能**
- [ ] どのページでも画面表示時にAPI呼び出し
- [ ] `/api/task-instances/check-today` エンドポイント実装
- [ ] 本日分のタスクが未生成の場合は自動作成

✅ **基準2: 生成ロジック**
- [ ] 本日の日付で該当する繰り返しタスクを検索
- [ ] 既存の同日タスクとの重複チェック
- [ ] task_instances テーブルへの正確な保存

✅ **基準3: エラーハンドリング**
- [ ] 生成失敗時のエラーログ出力
- [ ] ユーザーへの適切なエラー表示
- [ ] 部分的失敗でも他タスクの生成は継続

---

## 🎯 共通品質基準

### パフォーマンス
- [ ] 各ページのロード時間 < 2秒
- [ ] API応答時間 < 1秒
- [ ] サイドバー開閉アニメーション < 300ms

### アクセシビリティ
- [ ] キーボード操作でのナビゲーション対応
- [ ] スクリーンリーダー対応（aria-label等）
- [ ] カラーコントラスト比 4.5:1 以上

### ブラウザ対応
- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版
- [ ] Edge 最新版

### テスト
- [ ] ユニットテストカバレッジ > 80%
- [ ] 統合テストの全シナリオ通過
- [ ] E2Eテストの主要フロー通過

---

## 📊 Definition of Done (完了の定義)

各機能の完了判定基準：

✅ **開発完了**
- [ ] 全受け入れ基準をクリア
- [ ] ユニットテスト作成・通過
- [ ] 統合テスト通過
- [ ] コードレビュー完了

✅ **品質確認**
- [ ] 手動テスト実施
- [ ] アクセシビリティチェック
- [ ] パフォーマンステスト通過
- [ ] セキュリティチェック

✅ **ドキュメント**
- [ ] API ドキュメント更新
- [ ] 操作マニュアル更新
- [ ] 作業ログ記録

---

**関連ドキュメント**:
- [ユーザーストーリー](./user-stories.md)
- [機能要件 SIDEBAR-001](./features/SIDEBAR-001.md)
- [機能要件 REPEAT-001](./features/REPEAT-001.md)
- [利用シナリオ](../02-design/scenarios/)
- [テスト戦略](../03-development/testing-strategy.md)