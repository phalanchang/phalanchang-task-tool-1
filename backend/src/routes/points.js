const express = require('express');
const router = express.Router();
const { getUserPoints, addPoints } = require('../controllers/tasksController');

// ポイント関連ルート
router.get('/', getUserPoints);                     // ユーザーポイント取得
router.post('/', addPoints);                        // ポイント手動加算

module.exports = router;