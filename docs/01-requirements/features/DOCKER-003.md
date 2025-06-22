# DOCKER-003: データベース Docker化

**作成日**: 2025-06-22  
**更新日**: 2025-06-22  
**ステータス**: 開発中  
**担当者**: 開発チーム  

---

## 📋 概要

MySQL データベースをDockerコンテナで実行し、初期化とサンプルデータ投入を自動化する機能。

## 🎯 ユーザーストーリー

```
As a 開発者
I want データベースをDockerコンテナで実行したい
So that ローカル環境のMySQLインストールを不要にし、一貫したデータベース環境を構築できる
```

## 🔧 機能詳細

### データベース設定
- **MySQL公式イメージ**: 安定性とセキュリティの確保
- **初期化SQLスクリプト**: テーブル作成とサンプルデータ自動投入
- **データ永続化**: ホストマシンへのボリュームマウント
- **文字セット**: utf8mb4（日本語対応）

### 技術仕様
- **ベースイメージ**: mysql:8.0
- **ポート**: 3306
- **データベース名**: task_management_app
- **文字セット**: utf8mb4
- **照合順序**: utf8mb4_unicode_ci

## ✅ 受け入れ基準

### 必須要件
- [ ] MySQL コンテナが起動する
- [ ] テーブルが自動作成される
- [ ] サンプルデータが投入される
- [ ] バックエンドから接続可能

### データ永続化要件
- [ ] コンテナ停止後もデータが保持される
- [ ] 再起動時にデータが復元される
- [ ] ボリュームマウントが正常動作

### セキュリティ要件
- [ ] ルートパスワードが適切に設定される
- [ ] 不要なユーザーアカウントが削除される
- [ ] 外部からの不正アクセス防止

## 🧪 テストケース

### コンテナ起動テスト
1. **MySQL コンテナ起動**
   ```bash
   docker run -d -p 3306:3306 --name mysql-db \
     -e MYSQL_ROOT_PASSWORD=rootpass \
     -e MYSQL_DATABASE=task_management_app \
     task-app-mysql
   ```
   - 期待値: コンテナが正常起動

### データベース接続テスト
2. **接続確認**
   ```bash
   docker exec mysql-db mysql -u root -p -e "SHOW DATABASES;"
   ```
   - 期待値: task_management_app データベースが表示

### テーブル作成確認テスト
3. **テーブル存在確認**
   ```sql
   USE task_management_app;
   SHOW TABLES;
   ```
   - 期待値: tasks, recurring_tasks テーブルが存在

### サンプルデータ確認テスト
4. **サンプルデータ確認**
   ```sql
   SELECT COUNT(*) FROM recurring_tasks;
   ```
   - 期待値: 3件以上のサンプルデータ

### 永続化テスト
5. **データ永続化確認**
   - コンテナ停止→再起動後もデータが保持されることを確認

## 📁 ファイル構成

```
database/
├── Dockerfile
├── my.cnf               # MySQL設定ファイル
├── init/
│   ├── 01-create-tables.sql     # テーブル作成
│   ├── 02-insert-sample-data.sql # サンプルデータ投入
│   └── 99-setup-permissions.sql # 権限設定
└── docker-entrypoint-initdb.d/ # 初期化スクリプト配置先
```

## 🗄️ データベーススキーマ

### tasksテーブル
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(50),
  recurring_config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### recurring_tasksテーブル
```sql
CREATE TABLE recurring_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  recurring_pattern VARCHAR(50) NOT NULL DEFAULT 'daily',
  recurring_config JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔒 セキュリティ設定

### ユーザー権限設定
```sql
-- アプリケーション用ユーザー作成
CREATE USER 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON task_management_app.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

### 接続制限
- 特定ネットワークからのアクセスのみ許可
- 不要なデフォルトアカウントの削除
- パスワードポリシーの適用

## 🚧 制約・注意事項

### 技術的制約
- MySQL 8.0以上が必要
- utf8mb4文字セット必須（日本語対応）
- InnoDB ストレージエンジン使用

### 容量要件
- 初期データ容量: 約10MB
- 推奨ディスク空間: 最低1GB以上
- メモリ要件: 最低512MB

### バックアップ考慮事項
- 開発環境のためバックアップは簡易的
- プロダクション環境では別途バックアップ戦略が必要

## 🔗 関連リソース

- [Sprint 004仕様書](../../03-development/sprints/sprint-004.md)
- [データベース設計書](../../データベース設計書.md)
- [MySQL公式ドキュメント](https://dev.mysql.com/doc/)

## 📝 実装ノート

### 初期化スクリプト実行順序
1. 01-create-tables.sql: テーブル作成
2. 02-insert-sample-data.sql: サンプルデータ投入
3. 99-setup-permissions.sql: ユーザー権限設定

### パフォーマンス設定
```ini
[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
innodb_buffer_pool_size=256M
max_connections=100
```

### 開発用サンプルデータ
- 朝の運動（毎日7:00）
- 読書時間（毎日20:00）
- 週報作成（毎週金曜15:00）

---

**関連Issue**: [GitHub Issue #XX]  
**Epic**: CI/CD & Docker化基盤構築  
**Sprint**: Sprint 004