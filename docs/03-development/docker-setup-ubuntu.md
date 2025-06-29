# Ubuntu環境でのDocker Compose セットアップ手順

## 概要
このドキュメントは、Ubuntu環境（ローカル開発環境・AWS EC2等）でDocker Composeを使用できるようにするための手順書です。

## 前提条件
- Ubuntu 20.04 LTS以降
- sudoコマンドが使用可能
- インターネット接続が利用可能

## セットアップ手順

### 1. システムの更新
```bash
# パッケージリストを更新
sudo apt update

# システムパッケージを最新化
sudo apt upgrade -y
```

### 2. 必要な依存パッケージのインストール
```bash
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 3. Docker公式GPGキーの追加
```bash
# GPGキーフォルダを作成
sudo mkdir -m 0755 -p /etc/apt/keyrings

# Docker公式GPGキーをダウンロード
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

### 4. Dockerリポジトリの追加
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5. Docker Engineのインストール
```bash
# パッケージリストを再更新
sudo apt update

# Docker Engine、CLI、containerd、Docker Composeをインストール
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 6. Dockerサービスの起動と有効化
```bash
# Dockerサービスを開始
sudo systemctl start docker

# システム起動時の自動開始を有効化
sudo systemctl enable docker

# サービス状態を確認
sudo systemctl status docker
```

### 7. ユーザーをdockerグループに追加（推奨）
```bash
# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# グループ変更を反映（新しいシェルセッションを開始）
newgrp docker

# または、ログアウト・ログインして反映
```

### 8. インストール確認
```bash
# Docker バージョン確認
docker --version

# Docker Compose バージョン確認
docker compose version

# Hello World コンテナで動作確認
docker run hello-world
```

## トラブルシューティング

### 権限エラーが発生する場合
```bash
# dockerグループ所属を確認
groups $USER

# dockerが表示されない場合は手順7を再実行
sudo usermod -aG docker $USER
newgrp docker
```

### Dockerサービスが起動しない場合
```bash
# サービスログを確認
sudo journalctl -u docker.service

# サービスを再起動
sudo systemctl restart docker
```

### podmanとの競合がある場合
```bash
# podmanを一時的に停止
sudo systemctl stop podman
sudo systemctl disable podman

# Dockerを再起動
sudo systemctl restart docker
```

## プロジェクト固有の設定

### 1. プロジェクトディレクトリに移動
```bash
cd ~/phalanchang-task-tool-1
```

### 2. 環境変数ファイルの確認
```bash
# .envファイルが存在することを確認
ls -la .env

# .env.exampleからコピー（必要に応じて）
cp .env.example .env
```

### 3. Docker Composeの実行
```bash
# コンテナをビルド・起動
docker compose up -d

# サービス状態確認
docker compose ps

# ログ確認
docker compose logs

# 停止
docker compose down
```

## セキュリティ注意事項

1. **本番環境**: dockerグループ追加はroot権限と同等のため、本番環境では慎重に検討
2. **ファイアウォール**: 必要に応じてDocker用ポートの設定
3. **定期更新**: Dockerとコンテナイメージの定期的な更新

## 参考リンク
- [Docker公式インストールガイド](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Composeドキュメント](https://docs.docker.com/compose/)
- [プロジェクトREADME](../../README.md)