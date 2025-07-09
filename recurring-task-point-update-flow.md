# 繰り返しタスクのポイント更新フロー

## 1. フロントエンド: ユーザーがポイントを入力して「更新する」ボタンを押下

### ファイル: `frontend/src/components/RecurringTaskForm.tsx`

**処理の流れ:**

1. **ユーザー入力処理** (行 352)
```typescript
onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
```

2. **フォーム送信処理** (行 122-134)
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (validateForm()) {
    // サニタイズされたデータを送信
    const sanitizedData = {
      ...formData,
      title: sanitizeInput(formData.title),
      description: sanitizeInput(formData.description)
    };
    onSubmit(sanitizedData); // ← ここでフォームデータが親コンポーネントに送信される
  }
};
```

3. **フォームデータの内容**
```typescript
// formData には以下が含まれる:
{
  title: "朝活Noteを書く",
  description: "朝活Noteを書く", 
  priority: "medium",
  time: "09:00",
  display_order: 1,
  points: 250 // ← ユーザーが入力したポイント値
}
```

---

## 2. フロントエンド: 親コンポーネントでAPI呼び出し

### ファイル: `frontend/src/pages/RecurringTasks.tsx`

**IDの管理方法:**

1. **編集対象タスクの状態管理**
```typescript
const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
```

2. **編集ボタン押下時の処理**
```typescript
const handleEditTask = useCallback((task: RecurringTask) => {
  setEditingTask(task);  // ← タスク全体（IDを含む）を状態に保存
  setShowEditForm(true);
}, []);
```

3. **フォームコンポーネントへのprops渡し**
```typescript
<RecurringTaskForm
  onSubmit={handleUpdateTask}
  onCancel={handleCancelEditForm}
  loading={loading}
  mode="edit"
  editingTask={editingTask}  // ← IDを含むタスクオブジェクトを渡す
/>
```

4. **更新処理でのID利用**
```typescript
const handleUpdateTask = useCallback(async (formData: RecurringTaskFormData) => {
  if (!editingTask) return;  // 安全性チェック
  
  try {
    // editingTask.id からタスクIDを取得
    await taskAPI.updateRecurringTask(editingTask.id, taskData);
    //                               ↑
    //                          ここでIDをURL に含める
  } catch (err) {
    // エラーハンドリング
  }
}, [editingTask]);
```

### ファイル: `frontend/src/services/api.ts`

**API呼び出し処理:**
```typescript
async updateRecurringTask(id: number, taskData: CreateRecurringTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/recurring/${id}`, {
    //                                                                    ↑
    //                                                            IDをURLパスに含める
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      recurring_config: { time: taskData.time },
      points: taskData.points // ← ポイント値がリクエストボディに含まれる
    })
  });
}
```

---

## 3. バックエンド: ルーティング

### ファイル: `backend/src/routes/tasks.js`

**処理の流れ:**

1. **ルート定義** (行 21)
```javascript
router.put('/recurring/:id', tasksController.updateRecurringTask);
```

2. **リクエストマッチング**
- `PUT /api/tasks/recurring/1` → `updateRecurringTask` コントローラーに転送

---

## 4. バックエンド: コントローラー処理

### ファイル: `backend/src/controllers/tasksController.js`

**処理の流れ:**

1. **リクエスト受信** (行 433-438)
```javascript
console.log('PUT /api/tasks/recurring/' + id + ' - Received data:', req.body);

// リクエストボディから更新データを取得
const { title, description, priority, recurring_config, points } = req.body;

console.log('Points value:', points, 'Type:', typeof points);
```

2. **バリデーション処理** (行 440-471)
```javascript
// タイトル必須チェック
if (!title || !title.trim()) {
  return res.status(400).json({
    success: false,
    error: 'Title is required'
  });
}

// ポイントのバリデーション
if (points !== undefined) {
  const pointsValue = parseInt(points);
  if (isNaN(pointsValue) || pointsValue < 0 || pointsValue > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Points must be between 0 and 1000'
    });
  }
}
```

3. **更新データ構築** (行 474-487)
```javascript
const updateData = {
  title: title.trim(),
  description: description ? description.trim() : '',
  priority: priority || 'medium',
  recurring_config: JSON.stringify(recurring_config)
};

// ポイントが指定されている場合のみ追加
if (points !== undefined) {
  updateData.points = parseInt(points);
  console.log('Adding points to updateData:', updateData.points);
}
```

4. **Taskモデル呼び出し** (行 489)
```javascript
const updatedTask = await Task.update(id, updateData);
```

---

## 5. バックエンド: モデル処理

### ファイル: `backend/src/models/Task.js`

**処理の流れ:**

1. **updateメソッド開始** (行 206)
```javascript
static async update(id, updateData) {
  // IDのバリデーション
  this.validateId(id);
```

2. **データサニタイゼーション** (行 240)
```javascript
// データサニタイゼーション
const sanitizedData = this.sanitizeTaskData(updateData);
```

3. **sanitizeTaskDataメソッド** (行 64-94)
```javascript
static sanitizeTaskData(taskData) {
  const sanitized = {
    ...taskData
  };

  // タイトルの前後空白除去
  if (sanitized.title) {
    sanitized.title = sanitized.title.trim();
  }

  // ポイントのサニタイゼーション
  if (sanitized.points !== undefined) {
    sanitized.points = parseInt(sanitized.points) || 0;
  }

  return sanitized;
}
```

4. **更新クエリ構築** (行 257-294)
```javascript
// 更新クエリの構築
const updateFields = [];
const updateValues = [];

if (sanitizedData.title !== undefined) {
  updateFields.push('title = ?');
  updateValues.push(sanitizedData.title);
}

if (sanitizedData.description !== undefined) {
  updateFields.push('description = ?');
  updateValues.push(sanitizedData.description);
}

if (sanitizedData.status !== undefined) {
  updateFields.push('status = ?');
  updateValues.push(sanitizedData.status);
}

if (sanitizedData.priority !== undefined) {
  updateFields.push('priority = ?');
  updateValues.push(sanitizedData.priority);
}

if (sanitizedData.recurring_config !== undefined) {
  updateFields.push('recurring_config = ?');
  updateValues.push(sanitizedData.recurring_config);
}

if (sanitizedData.points !== undefined) {
  updateFields.push('points = ?');
  updateValues.push(sanitizedData.points);
}
```

5. **SQL実行** (行 295-300)
```javascript
// updated_at を現在時刻に設定
updateFields.push('updated_at = CURRENT_TIMESTAMP');
updateValues.push(parseInt(id));

// 更新実行
await connection.execute(
  `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
  updateValues
);
```

**実際のSQL文:**
```sql
UPDATE tasks SET title = ?, description = ?, priority = ?, recurring_config = ?, points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
```

**実際のvalues配列:**
```javascript
[
  "朝活Noteを書く",           // title
  "朝活Noteを書く",           // description  
  "medium",                   // priority
  "{\"time\":\"09:00\"}",     // recurring_config
  250,                        // points ← ここでポイント値がDBに保存される
  1                           // id
]
```

---

## 6. データベース更新

### テーブル: `tasks`

**更新される行:**
```sql
UPDATE tasks 
SET 
  title = '朝活Noteを書く',
  description = '朝活Noteを書く', 
  priority = 'medium',
  recurring_config = '{"time":"09:00"}',
  points = 250,
  updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

---

## 現在の問題点

**ログ解析結果:**
- リクエストでは `points: 250` が正常に受信されている
- コントローラーでバリデーション通過
- updateDataに `points` が含まれている
- しかし、レスポンスでは `points: 0` になっている

**推定される問題:**
1. **SQLクエリの実行エラー**: `points`フィールドの更新が失敗している可能性
2. **レスポンスデータの取得方法**: 更新後のデータ取得時に古いキャッシュが返されている可能性
3. **トランザクション問題**: データベースコミットが正常に行われていない可能性

**次の調査ポイント:**
- `Task.js`の`update`メソッドでSQL実行後のデータ再取得部分
- データベースの実際の更新確認
- エラーログの詳細確認