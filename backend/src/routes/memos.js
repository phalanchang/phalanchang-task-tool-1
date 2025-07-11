const express = require('express');
const router = express.Router();
const memosController = require('../controllers/memosController');

// メモ一覧取得
router.get('/', memosController.getAllMemos);

// 特定のメモ取得
router.get('/:id', memosController.getMemoById);

// メモ作成
router.post('/', memosController.createMemo);

// メモ更新
router.put('/:id', memosController.updateMemo);

// メモ削除（論理削除）
router.delete('/:id', memosController.deleteMemo);

module.exports = router;