const express = require('express');
const router = express.Router();
const {
  getAllMemos,
  getMemoById,
  createMemo,
  updateMemo,
  deleteMemo,
  getAllTags
} = require('../controllers/memosController');

/**
 * @route GET /api/memos
 * @desc Get all memos with optional search and filtering
 * @query search - Search term for title/content
 * @query tags - Comma-separated list of tags to filter by
 * @query limit - Maximum number of memos to return
 */
router.get('/', getAllMemos);

/**
 * @route GET /api/memos/tags
 * @desc Get all unique tags
 */
router.get('/tags', getAllTags);

/**
 * @route GET /api/memos/:id
 * @desc Get memo by ID
 */
router.get('/:id', getMemoById);

/**
 * @route POST /api/memos
 * @desc Create new memo
 * @body { title: string, content: string, tags?: string[] }
 */
router.post('/', createMemo);

/**
 * @route PUT /api/memos/:id
 * @desc Update memo by ID
 * @body { title?: string, content?: string, tags?: string[] }
 */
router.put('/:id', updateMemo);

/**
 * @route DELETE /api/memos/:id
 * @desc Delete memo by ID
 */
router.delete('/:id', deleteMemo);

module.exports = router;