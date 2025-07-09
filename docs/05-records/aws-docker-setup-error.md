# AWS EC2 Docker Setup Error 対応記録

## 障害概要
**発生日時**: 2025-06-29  
**環境**: AWS EC2 Ubuntu  
**障害内容**: Docker リポジトリ設定ファイルの構文エラー  
**エラーメッセージ**: `E: Malformed entry 1 in list file /etc/apt/sources.list.d/docker.list (Component)`

## 🚨 緊急対応手順（実行してください）

### 1. 破損したdocker.listファイルの確認・削除
```bash
# 現在のdocker.listの内容確認
sudo cat /etc/apt/sources.list.d/docker.list

# 破損したファイルを削除
sudo rm /etc/apt/sources.list.d/docker.list

# 削除確認
ls -la /etc/apt/sources.list.d/
```

### 2. apt updateの動作確認
```bash
# 正常に動作するか確認
sudo apt update
```

### 3. Docker公式リポジトリの再設定
```bash
# GPGキーフォルダを作成
sudo mkdir -m 0755 -p /etc/apt/keyrings

# Docker公式GPGキーをダウンロード
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 正しいリポジトリ設定を追加
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 設定内容確認
cat /etc/apt/sources.list.d/docker.list
```

### 4. 再度apt updateを実行
```bash
sudo apt update
```

## ❌ 問題の原因

**推定原因**:
1. 前回のDocker設定時にファイルが不完全に書き込まれた
2. ネットワーク切断等によりリポジトリ設定ファイルが破損
3. 手動編集時の構文エラー

**docker.listファイルの正しい形式**:
```
deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable
```

## ✅ 対応完了後の手順

上記対応が完了したら、以下のDockerインストール手順を続行してください：

```bash
# Docker Engine、CLI、containerd、Docker Composeをインストール
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Dockerサービスを開始
sudo systemctl start docker
sudo systemctl enable docker

# 動作確認
docker --version
sudo docker run hello-world
```

## 🔄 今後の予防策

1. **設定前のバックアップ**: 重要な設定ファイル変更前はバックアップを取る
2. **段階的確認**: 各ステップ後にapt updateで動作確認
3. **ネットワーク安定確認**: curl実行時のネットワーク接続確認

---

**⚠️ 重要**: この手順を実行後、正常にapt updateが動作することを確認してからDockerインストールを継続してください。