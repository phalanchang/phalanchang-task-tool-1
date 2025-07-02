# 📋 タスク管理アプリケーション

**美しいカードベースUIで効率的なタスク管理を実現！**

## ⚡ 5分でスタート（新しいUbuntu環境）

**コピペで一発セットアップ！**
```bash
# 1. 基本ツールインストール
sudo apt update && sudo apt upgrade -y
sudo apt install -y git ca-certificates curl gnupg lsb-release

# 2. Docker インストール
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER && newgrp docker

# 3. プロジェクト起動
git clone https://github.com/phalanchang/phalanchang-task-tool-1.git
cd phalanchang-task-tool-1
git checkout develop
cp .env.example .env
docker compose up -d

# 4. マイグレーション実行
sleep 30
docker compose exec database mysql -u root -prootpass task_management_app -e "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS display_order INT NULL AFTER recurring_config; ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_display_order (display_order);"

# 5. ブラウザで http://localhost:3000 を開く
echo "🎉 セットアップ完了！ http://localhost:3000 でアクセスしてください"
```

## 🚀 今すぐ始める

### 🛠️ Ubuntu環境のセットアップ（初回のみ）

**📋 事前準備チェックリスト**
- [ ] Ubuntu 20.04 LTS以降
- [ ] インターネット接続
- [ ] sudo権限

#### 1️⃣ 必要なツールをインストール
```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Git インストール
sudo apt install -y git

# Docker インストール
sudo apt install -y ca-certificates curl gnupg lsb-release

# Docker公式GPGキー追加
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Dockerリポジトリ追加
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine インストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Dockerサービス開始
sudo systemctl start docker
sudo systemctl enable docker

# ユーザーをdockerグループに追加（sudo不要にする）
sudo usermod -aG docker $USER
newgrp docker

# インストール確認
docker --version
docker compose version
git --version
```

#### 2️⃣ プロジェクトのクローン
```bash
# プロジェクトを取得
git clone https://github.com/phalanchang/phalanchang-task-tool-1.git
cd phalanchang-task-tool-1

# 最新のdevelopブランチに切り替え
git checkout develop
git pull origin develop
```

#### 3️⃣ 初回セットアップ
```bash
# 環境設定ファイルをコピー
cp .env.example .env

# データベースの初期化（重要）
docker compose up database -d
sleep 30  # データベース起動を待機

# マイグレーション実行（display_orderフィールド追加）
docker compose exec database mysql -u root -prootpass task_management_app -e "
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS display_order INT NULL COMMENT 'Display order for daily tasks' AFTER recurring_config;
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_display_order (display_order);
UPDATE tasks SET display_order = id WHERE is_recurring = TRUE AND display_order IS NULL;
SELECT 'Migration completed successfully!' AS message;"
```

### 🐳 Docker Compose使用（推奨）
```bash
# 1. 環境設定（初回のみ）
cp .env.example .env

# 2. ワンコマンド起動
docker compose up -d

# 3. ブラウザでアクセス
# http://localhost:3000 -> フロントエンド
# http://localhost:3001 -> バックエンドAPI
```
**→ 60秒以内に全サービスが起動！**

### 📝 個別起動（開発用）

#### 1️⃣ バックエンド起動
```bash
cd backend
npm install
npm start
```
**→ http://localhost:3001 で起動**

#### 2️⃣ フロントエンド起動
```bash
cd frontend  
npm install
npm start
```
**→ http://localhost:3000 で起動**

#### 3️⃣ ブラウザでアクセス
**http://localhost:3000** を開く → タスク管理画面が表示される！

## 🎯 このアプリでできること

### ✅ **基本機能**
- **タスク作成** - 新しいタスクを追加
- **タスク表示** - カード形式で見やすく表示  
- **ステータス切り替え** - 「完了にする」ボタンでワンクリック
- **タスク削除** - 不要なタスクを削除

### 🎨 **デザイン機能**
- **カードレイアウト** - Material Design風の美しいカード
- **優先度色分け** - 高:赤、中:橙、低:緑で一目でわかる
- **ホバーエフェクト** - マウスを乗せると浮き上がる
- **レスポンシブ** - スマホ・タブレット対応

## 📊 プロジェクト状況

### ✅ **完成している機能**
- [x] タスクのCRUD操作（作成・表示・更新・削除）
- [x] カードベースUI
- [x] 優先度システム（high/medium/low）
- [x] ステータス管理（pending/completed）
- [x] レスポンシブデザイン
- [x] テスト40件（全て成功）

### 🚧 **今後追加できる機能**
- [ ] タスク編集（現在は削除→再作成）
- [ ] タスクフィルタリング（優先度別・ステータス別）
- [ ] タスク検索
- [ ] 期限日設定
- [ ] ドラッグ&ドロップ並び替え

## 🔧 技術構成

- **フロントエンド**: React + TypeScript + CSS Grid + Nginx
- **バックエンド**: Node.js + Express + MySQL
- **インフラ**: Docker + Docker Compose
- **開発手法**: テスト駆動開発（TDD）

## 📁 フォルダ構成

```
📦 phalanchang-task-tool-1
├── 📁 frontend/          # React アプリ
│   ├── 📁 src/components/   # UIコンポーネント（TaskCard, TaskList等）
│   └── 📁 src/services/     # API通信
├── 📁 backend/           # Node.js サーバー  
│   ├── 📁 src/controllers/  # API処理
│   └── 📁 database/         # DB設定・マイグレーション
└── 📁 docs/              # ドキュメント
    ├── 📄 API設計書.md      # API仕様詳細
    ├── 📄 引き継ぎ事項.md   # 開発引き継ぎ情報
    └── 📄 作業ログ.md       # 作業履歴
```

## 🐛 困ったときは

### 🔧 Ubuntu セットアップでのトラブル

#### Docker インストールエラー
```bash
# リポジトリ設定エラーの場合
sudo rm /etc/apt/sources.list.d/docker.list
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

#### Docker権限エラー
```bash
# "permission denied"エラーの場合
sudo usermod -aG docker $USER
newgrp docker
# または一度ログアウト・ログインする
```

#### Git接続エラー
```bash
# SSH設定がない場合はHTTPS使用
git clone https://github.com/phalanchang/phalanchang-task-tool-1.git
```

### 🐳 Docker Composeトラブル

#### サービス状態確認
```bash
# 全サービス状態確認
docker compose ps

# ログ確認
docker compose logs -f [service-name]

# 特定サービスのログ確認
docker compose logs frontend
docker compose logs backend  
docker compose logs database
```

#### データベース接続エラー
```bash
# データベースパスワード確認
cat .env | grep PASSWORD

# データベース接続テスト
docker compose exec database mysql -u root -prootpass task_management_app

# マイグレーション再実行
docker compose exec database mysql -u root -prootpass task_management_app -e "
SHOW COLUMNS FROM tasks LIKE 'display_order';"
```

#### 完全リセット
```bash
# 完全クリーンアップ
docker compose down -v --remove-orphans
docker system prune -f
docker volume prune -f

# 再起動
docker compose up -d
```

### 個別起動時のトラブル

#### バックエンドが起動しない
```bash
# ポート確認
lsof -i :3001

# データベース接続テスト  
cd backend
node test-connection.js
```

#### フロントエンドでエラー
- バックエンドが起動しているか確認
- http://localhost:3001/health でヘルスチェック
- ブラウザのF12でエラー確認

### 最新状態に戻したい
```bash
git checkout main
git pull origin main
```

## 🆘 詳細ヘルプ

- **📖 詳細マニュアル**: `docs/引き継ぎ事項_2025-06-18.md`
- **🔧 API仕様**: `docs/API設計書.md`  
- **📝 作業ログ**: `docs/作業ログ_2025-06-18.md`

## ⚡ 現在のバージョン

- **ブランチ**: `develop`
- **最終更新**: 2025-06-18
- **状態**: 🟢 安定動作
- **テスト**: 40件全て成功

## 🎯 次にやること（おすすめ）

1. **タスク編集機能** - その場で編集できるように
2. **フィルタリング** - 完了済み非表示、優先度別表示
3. **検索機能** - タイトルで検索

---

**🎉 完全に動作する美しいタスク管理アプリです！**