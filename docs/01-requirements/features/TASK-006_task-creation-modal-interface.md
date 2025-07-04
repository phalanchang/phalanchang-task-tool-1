# TASK-006: すべてのタスク作成時モーダル化機能

## 📋 作業概要

| ID | 作業内容 | ステータス | 優先度 | 担当者 |
|---|---|---|---|---|
| TASK-006-01 | 現在のタスク作成UI分析 | 📋 計画中 | High | Claude Code Assistant |
| TASK-006-02 | 繰り返しタスクのモーダル実装調査 | 📋 計画中 | High | Claude Code Assistant |
| TASK-006-03 | すべてのタスク用のモーダルコンポーネント作成 | 📋 計画中 | High | Claude Code Assistant |
| TASK-006-04 | 既存のインライン作成機能の置換 | 📋 計画中 | High | Claude Code Assistant |
| TASK-006-05 | UIの一貫性確保とスタイル調整 | 📋 計画中 | Medium | Claude Code Assistant |
| TASK-006-06 | モーダル機能のテスト・検証 | 📋 計画中 | Medium | Claude Code Assistant |

---

## 🎯 問題概要

### 報告された問題

**現象**: 「すべてのタスク」での新しいタスク作成時に、「繰り返しタスク」同様のモーダル形式を採用したい

**期待される動作**: 
- 「すべてのタスク」画面でタスク作成時にモーダルが開く
- 「繰り返しタスク」と同じような一貫したUI/UX体験
- より洗練されたタスク作成インターフェース

### 現在の実装状況

#### 繰り返しタスクの作成
- モーダルベースの作成インターフェース
- 統一されたフォーム体験
- 直感的なUI/UX

#### すべてのタスクの作成
- 現在はインライン作成方式
- 入力フィールドが直接表示される
- 一貫性に欠ける可能性

### 解決すべき課題

1. **UI/UXの一貫性**: 繰り返しタスクとすべてのタスクでの作成体験を統一
2. **ユーザビリティ**: モーダル形式による入力しやすさの向上
3. **拡張性**: 将来的な機能追加への対応

## 🏗️ 技術仕様

### 現在のタスク作成システム分析

#### 繰り返しタスクの実装
```javascript
// 繰り返しタスクのモーダル（参考として）
// components/RecurringTaskModal.tsx または類似コンポーネント
const RecurringTaskModal = ({ isOpen, onClose, onSubmit }) => {
  // モーダルベースの実装
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="タスク名" />
        <select>繰り返し設定</select>
        <button type="submit">作成</button>
      </form>
    </Modal>
  );
};
```

#### すべてのタスクの現在の実装
```javascript
// pages/Tasks.tsx または類似コンポーネント
const Tasks = () => {
  const [newTaskName, setNewTaskName] = useState('');
  
  return (
    <div>
      {/* 現在のインライン作成フォーム */}
      <input 
        type="text" 
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        placeholder="新しいタスクを追加"
      />
      <button onClick={createTask}>追加</button>
    </div>
  );
};
```

### 解決策の設計

#### 1. モーダルコンポーネントの設計

##### 新しいタスク作成モーダル
```javascript
// components/TaskCreationModal.tsx
interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => void;
  title?: string;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "新しいタスクを作成"
}) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPoints, setTaskPoints] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: taskName,
      description: taskDescription,
      priority: taskPriority,
      dueDate: taskDueDate,
      points: taskPoints
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>タスク名</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="タスク名を入力"
            required
          />
        </div>
        <div className="form-group">
          <label>説明</label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="タスクの詳細説明"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>優先度</label>
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div className="form-group">
          <label>期限</label>
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ポイント</label>
          <input
            type="number"
            value={taskPoints}
            onChange={(e) => setTaskPoints(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>キャンセル</button>
          <button type="submit">作成</button>
        </div>
      </form>
    </Modal>
  );
};
```

#### 2. 既存タスクページの修正

##### Tasks.tsx の修正
```javascript
// pages/Tasks.tsx
const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleCreateTask = (taskData) => {
    // タスク作成API呼び出し
    createTask(taskData).then(() => {
      // タスクリストの更新
      refreshTasks();
      setIsCreateModalOpen(false);
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>すべてのタスク</h1>
        <button 
          className="create-task-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          新しいタスクを作成
        </button>
      </div>
      
      {/* タスクリスト */}
      <div className="task-list">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* タスク作成モーダル */}
      <TaskCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
```

#### 3. 共通モーダルコンポーネントの活用

##### Modal.tsx の共通化
```javascript
// components/common/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'medium' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
```

### 実装計画

#### Phase 1: 現状分析・調査（60分）
1. **現在のタスク作成機能の分析**
   - すべてのタスク作成の現在実装確認
   - 繰り返しタスクのモーダル実装調査
   - UIコンポーネントの構造分析

2. **既存コードの調査**
   - フロントエンドのコンポーネント構造確認
   - API エンドポイントの確認
   - スタイルシートの分析

#### Phase 2: モーダルコンポーネント実装（90分）
1. **共通モーダルコンポーネントの改善**
   - 既存モーダルコンポーネントの調査
   - 再利用可能なモーダルベースの作成
   - スタイルの統一

2. **タスク作成モーダルの実装**
   - TaskCreationModal コンポーネントの作成
   - フォーム機能の実装
   - バリデーション機能の追加

#### Phase 3: 既存機能の置換（60分）
1. **すべてのタスクページの修正**
   - インライン作成機能の除去
   - モーダルベース作成への変更
   - 状態管理の調整

2. **API統合**
   - タスク作成API呼び出しの統合
   - エラーハンドリングの実装
   - 成功時の処理実装

#### Phase 4: スタイル調整・テスト（30分）
1. **UI/UXの調整**
   - デザインの統一性確保
   - レスポンシブデザインの調整
   - アクセシビリティの確保

2. **機能テスト**
   - モーダルの動作確認
   - タスク作成機能の検証
   - 既存機能への影響確認

## ✅ 完了定義 (Definition of Done)

### 機能要件
- [ ] 「すべてのタスク」でのタスク作成がモーダル形式で動作する
- [ ] 繰り返しタスクと同様のUI/UX体験を提供する
- [ ] 既存のタスク作成機能が正常に動作する
- [ ] 他の機能に影響を与えない

### 技術要件
- [ ] 全てのテストが通る
- [ ] TypeScriptビルドエラーがない
- [ ] ESLintエラーがない
- [ ] レスポンシブデザインが正しく動作する

### 品質要件
- [ ] 直感的で使いやすいUI
- [ ] 適切なエラーハンドリング
- [ ] アクセシビリティ対応
- [ ] パフォーマンスに問題がない

## 🧪 テストシナリオ

### シナリオ1: モーダルベースのタスク作成
1. 「すべてのタスク」ページにアクセス
2. 「新しいタスクを作成」ボタンをクリック
3. モーダルが開くことを確認
4. 必要な情報を入力してタスクを作成
5. タスクが正常に作成されることを確認

### シナリオ2: モーダルのキャンセル機能
1. タスク作成モーダルを開く
2. 情報を入力後、キャンセルボタンをクリック
3. モーダルが閉じることを確認
4. 入力内容が保存されないことを確認

### シナリオ3: バリデーション機能
1. タスク作成モーダルを開く
2. 必須フィールドを空のまま作成を試行
3. 適切なエラーメッセージが表示されることを確認
4. 正しい入力後に作成が成功することを確認

### シナリオ4: 既存機能との互換性
1. 他のタスク管理機能が正常に動作することを確認
2. 繰り返しタスクの作成機能に影響がないことを確認
3. ポイント機能が正常に動作することを確認

## 🚀 実装順序

### ステップ1: 現状分析（60分）
1. 現在のタスク作成機能の詳細調査
2. 繰り返しタスクのモーダル実装調査
3. UIコンポーネントの構造分析
4. 必要な変更箇所の特定

### ステップ2: モーダルコンポーネント実装（90分）
1. 共通モーダルコンポーネントの確認・改善
2. TaskCreationModal コンポーネントの作成
3. フォーム機能とバリデーションの実装
4. スタイルの適用

### ステップ3: 既存機能の置換（60分）
1. すべてのタスクページの修正
2. インライン作成機能の除去
3. モーダルベース作成への変更
4. API統合とエラーハンドリング

### ステップ4: 最終調整・テスト（30分）
1. UI/UXの最終調整
2. 全機能の動作確認
3. パフォーマンステスト
4. 既存機能への影響確認

## 📊 進捗管理

### 進捗状況
- **開始**: 2025年7月4日
- **現在の進捗**: 要件定義フェーズ
- **完了予定**: 2025年7月4日

### マイルストーン
- [ ] 現状分析完了
- [ ] モーダルコンポーネント実装完了
- [ ] 既存機能置換完了
- [ ] テスト完了
- [ ] ユーザー確認完了

## 🔗 関連ドキュメント

- [REPEAT-001 繰り返しタスクの管理](REPEAT-001.md)
- [TASK-005 日本時間デイリータスク自動更新機能](TASK-005_daily-task-timezone-jst-update.md)
- [タスク管理API仕様書](../../02-design/api-specification.md)

## 📝 リスク・注意事項

### 技術リスク
- 既存のタスク作成機能への影響
- モーダルコンポーネントの競合
- UIの一貫性確保の難易度

### 対策
- 段階的な実装とテスト
- 既存機能との互換性確保
- 十分なテストによる品質確保

### ユーザビリティリスク
- UI変更によるユーザーの混乱
- モーダルの使いやすさ
- 既存ワークフローへの影響

### 対策
- 直感的なUI設計
- 適切なフィードバック提供
- 段階的な変更実装

## 💡 実装ポイント

### UI/UXの一貫性
- 繰り返しタスクのモーダルとの統一感
- 既存のデザインシステムとの整合性
- 直感的な操作性の確保

### パフォーマンス
- モーダルのレンダリング最適化
- 不要な再レンダリングの防止
- 軽量な実装

### 拡張性
- 将来的な機能追加への対応
- 再利用可能なコンポーネント設計
- 保守性の高いコード構造

---

**作成日**: 2025年7月4日  
**作成者**: Claude Code Assistant  
**ブランチ**: feature/task-creation-modal-interface  
**関連Issues**: すべてのタスク作成時モーダル化  
**前提条件**: 現在のタスク管理機能の正常動作