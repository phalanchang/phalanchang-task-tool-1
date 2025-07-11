-- Create memos table
CREATE TABLE IF NOT EXISTS memos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
INSERT INTO memos (user_id, title, content) VALUES
(1, 'サンプルメモ1', '# 最初のメモ\n\nこれはMarkdown形式で書かれたサンプルメモです。\n\n- リスト項目1\n- リスト項目2\n- リスト項目3'),
(1, 'プロジェクトのアイデア', '## 新機能のアイデア\n\n1. ダッシュボード機能\n2. 統計グラフの表示\n3. エクスポート機能\n\n**重要**: 優先度を検討する必要あり'),
(1, '会議メモ', '### 2025/07/11 定例会議\n\n- 参加者: 開発チーム全員\n- 議題: スプリント013の進捗確認\n\n#### 決定事項\n- メモ機能の実装を開始\n- 7日間で完成予定\n\n#### TODO\n- [ ] データベース設計\n- [ ] API実装\n- [ ] フロントエンド実装');