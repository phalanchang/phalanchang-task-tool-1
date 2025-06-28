const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

// テスト用シンプルエンドポイント
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'API is working', timestamp: new Date().toISOString() });
});

// 毎日タスク（デイリータスク）関連ルート（具体的なルートを先に定義）
router.get('/daily', tasksController.getDailyTasks);                   // デイリータスク一覧取得
router.post('/generate-today', tasksController.generateTodayTasks);    // 今日分タスク生成
router.get('/recurring', tasksController.getRecurringTasks);           // 繰り返しタスク一覧取得
router.post('/recurring', tasksController.createRecurringTask);        // 繰り返しタスク作成
router.put('/recurring/:id', tasksController.updateRecurringTask);     // 繰り返しタスク更新
router.delete('/recurring/:id', tasksController.deleteRecurringTask);  // 繰り返しタスク削除

// 既存のタスク関連ルート（一般的なルートを後に定義）
router.get('/', tasksController.getAllTasks);
router.post('/', tasksController.createTask);
router.get('/:id', tasksController.getTaskById);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;