const Memo = require('../models/Memo');

const memosController = {
  // メモ一覧取得
  async getAllMemos(req, res, next) {
    try {
      const userId = 1; // 現在は固定ユーザー
      const memos = await Memo.findAll(userId);
      
      res.json({
        success: true,
        data: memos,
        message: 'メモ一覧を取得しました'
      });
    } catch (error) {
      console.error('Error fetching memos:', error);
      next(error);
    }
  },

  // 特定のメモ取得
  async getMemoById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = 1;
      
      const memo = await Memo.findById(id, userId);
      
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }
      
      res.json({
        success: true,
        data: memo,
        message: 'メモを取得しました'
      });
    } catch (error) {
      console.error('Error fetching memo:', error);
      next(error);
    }
  },

  // メモ作成
  async createMemo(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = 1;
      
      const memo = new Memo({
        user_id: userId,
        title,
        content
      });
      
      // バリデーション
      const errors = memo.validate();
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'バリデーションエラー',
          errors
        });
      }
      
      await memo.save();
      
      res.status(201).json({
        success: true,
        data: memo,
        message: 'メモを作成しました'
      });
    } catch (error) {
      console.error('Error creating memo:', error);
      next(error);
    }
  },

  // メモ更新
  async updateMemo(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = 1;
      
      const memo = await Memo.findById(id, userId);
      
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }
      
      // 更新データを設定
      if (title !== undefined) memo.title = title;
      if (content !== undefined) memo.content = content;
      
      // バリデーション
      const errors = memo.validate();
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'バリデーションエラー',
          errors
        });
      }
      
      await memo.save();
      
      res.json({
        success: true,
        data: memo,
        message: 'メモを更新しました'
      });
    } catch (error) {
      console.error('Error updating memo:', error);
      next(error);
    }
  },

  // メモ削除（論理削除）
  async deleteMemo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = 1;
      
      const memo = await Memo.findById(id, userId);
      
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }
      
      await memo.delete();
      
      res.json({
        success: true,
        message: 'メモを削除しました'
      });
    } catch (error) {
      console.error('Error deleting memo:', error);
      next(error);
    }
  }
};

module.exports = memosController;