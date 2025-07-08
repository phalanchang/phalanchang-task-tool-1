# 課題・エラー管理システム

## 📋 概要

このディレクトリは、プロジェクトで発生したエラー、課題、ブロッカーを追跡・管理するためのシステムです。

## 📂 ディレクトリ構造

```
docs/07-issues/
├── README.md                 # このファイル（マスター管理）
├── error-tracking/           # エラー追跡
│   ├── template.md          # エラー報告テンプレート
│   └── YYYY-MM-DD_error-*.md # 個別エラー記録
├── blockers/                 # ブロッカー管理
│   ├── template.md          # ブロッカー報告テンプレート
│   └── active/              # アクティブなブロッカー
└── resolved/                 # 解決済み課題
```

## 🚨 アクティブな課題・ブロッカー

| ID | タイトル | 重要度 | 発生日 | 担当者 | ステータス | 関連タスク |
|---|---|---|---|---|---|---|
| ERROR-2025-07-05-001 | Git push認証エラー | High | 2025-07-05 | Claude Code Assistant | Open | TASK-008 |

## 📊 課題統計

- **未解決**: 1件
- **解決済み**: 0件
- **平均解決時間**: N/A

## 🔧 使用方法

### エラー報告手順
1. `error-tracking/template.md` をコピー
2. `YYYY-MM-DD_error-001.md` 形式でファイル名変更
3. 内容を記入して保存
4. このREADMEのアクティブな課題表に追加

### ブロッカー報告手順
1. `blockers/template.md` をコピー
2. `active/` ディレクトリ内に配置
3. 内容を記入して保存
4. このREADMEのアクティブな課題表に追加

### 課題解決時
1. 該当ファイルを `resolved/` ディレクトリに移動
2. このREADMEの表を更新
3. 解決内容を記録

## 📝 課題詳細

### ERROR-2025-07-05-001: Git push認証エラー

**発生日時**: 2025-07-05  
**関連タスク**: TASK-008  
**重要度**: High  

**エラー内容**:
```
fatal: could not read Username for 'https://github.com': No such device or address
```

**影響範囲**:
- TASK-008の完了が阻害される
- developブランチへのコードpushができない

**対応状況**:
- ステータス: Open
- 担当者: Claude Code Assistant
- 対応予定日: 2025-07-05

**対応策**:
1. GitHub認証設定の確認・修正
2. SSH鍵またはPersonal Access Tokenの設定
3. 手動でのgit push実行

---

## 🔄 更新履歴

- 2025-07-05: 課題管理システム作成、ERROR-2025-07-05-001登録