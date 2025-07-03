const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

// テスト用シンプルエンドポイント
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'API is working', timestamp: new Date().toISOString() });
});

// ポイント関連ルート（別の名前で）
router.get('/user-points', tasksController.getUserPoints);             // ユーザーポイント取得
router.post('/add-points', tasksController.addPoints);                 // ポイント手動加算

// 毎日タスク（デイリータスク）関連ルート（具体的なルートを先に定義）
router.get('/daily', tasksController.getDailyTasks);                   // デイリータスク一覧取得
router.post('/generate-today', tasksController.generateTodayTasks);    // 今日分タスク生成

// 繰り返しタスク関連ルート
router.get('/recurring', tasksController.getRecurringTasks);           // 繰り返しタスク一覧取得
router.post('/recurring', tasksController.createRecurringTask);        // 繰り返しタスク作成
router.put('/recurring/:id', tasksController.updateRecurringTask);     // 繰り返しタスク更新
router.delete('/recurring/:id', tasksController.deleteRecurringTask);  // 繰り返しタスク削除

// スケジューラー関連ルート
router.get('/scheduler/status', tasksController.getSchedulerStatus);        // スケジューラー状態取得
router.post('/scheduler/execute', tasksController.executeSchedulerManually); // スケジューラー手動実行

// 既存のタスク関連ルート（一般的なルートを最後に定義）
router.get('/', tasksController.getAllTasks);
router.post('/', tasksController.createTask);
router.get('/:id', tasksController.getTaskById);  // IDパターン
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;