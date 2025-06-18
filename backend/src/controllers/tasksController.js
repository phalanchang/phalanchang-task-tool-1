/**
 * タスク管理コントローラー
 * 
 * このファイルには、タスクに関するすべてのAPI処理が含まれています。
 * Taskモデルを使用してMySQLデータベースとやり取りします。
 */

const Task = require('../models/Task');

/**
 * すべてのタスクを取得する
 * 
 * API: GET /api/tasks
 * 目的: データベース内のすべてのタスクを一覧で返す
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getAllTasks = async (req, res) => {
  try {
    // Taskモデルを使用してすべてのタスクを取得
    const tasks = await Task.findAll();
    
    res.status(200).json({
      success: true,        // 処理が成功したことを示す
      data: tasks,          // タスクの配列
      count: tasks.length   // タスクの総数
    });
  } catch (error) {
    // エラーが発生した場合の処理
    console.error('タスク一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
};

/**
 * 特定のIDのタスクを取得する
 * 
 * API: GET /api/tasks/:id
 * 目的: 指定されたIDのタスクを1件取得する
 * 
 * @param {Object} req - リクエストオブジェクト（req.params.idにタスクIDが入る）
 * @param {Object} res - レスポンスオブジェクト
 */
const getTaskById = async (req, res) => {
  try {
    // URLパラメータからIDを取得
    const id = req.params.id;
    
    // Taskモデルを使用してIDでタスクを検索
    const task = await Task.findById(id);
    
    // タスクが見つからない場合
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // タスクが見つかった場合、そのタスクを返す
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    // エラーが発生した場合の処理
    console.error('タスク取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
};

/**
 * 新しいタスクを作成する
 * 
 * API: POST /api/tasks
 * 目的: リクエストボディの内容で新しいタスクを作成する
 * 
 * @param {Object} req - リクエストオブジェクト（req.bodyにタスク情報が入る）
 * @param {Object} res - レスポンスオブジェクト
 */
const createTask = async (req, res) => {
  try {
    // リクエストボディからタスク情報を取得
    const { title, description, status, priority } = req.body;
    
    // Taskモデルを使用して新しいタスクを作成
    const newTask = await Task.create({
      title,
      description,
      status,
      priority
    });
    
    // 作成されたタスクを返す（ステータス201 = Created）
    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    // バリデーションエラーの場合は400を返す
    if (error.message.includes('必須') || error.message.includes('文字以内') || error.message.includes('である必要があります')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    // その他のエラーは500を返す
    console.error('タスク作成エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
};

/**
 * 既存のタスクを更新する
 * 
 * API: PUT /api/tasks/:id
 * 目的: 指定されたIDのタスクの内容を更新する
 * 
 * @param {Object} req - リクエストオブジェクト（req.params.idとreq.bodyが使用される）
 * @param {Object} res - レスポンスオブジェクト
 */
const updateTask = async (req, res) => {
  // URLパラメータからIDを取得（try外で定義）
  const id = req.params.id;
  
  try {
    // リクエストボディから更新する値を取得
    const { title, description, status, priority } = req.body;
    
    // デバッグログ追加
    console.log('PUT /api/tasks/' + id + ' - Received data:', {
      id,
      body: req.body,
      title,
      description,
      status,
      priority
    });
    
    // Taskモデルを使用してタスクを更新
    const updatedTask = await Task.update(id, {
      title,
      description,
      status,
      priority
    });
    
    // タスクが見つからない場合
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // 更新されたタスクを返す
    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    // エラー詳細をログ出力
    console.error('updateTask エラー詳細:', {
      message: error.message,
      stack: error.stack,
      requestId: id,
      requestBody: req.body
    });
    
    // バリデーションエラーの場合は400を返す
    if (error.message.includes('必須') || error.message.includes('文字以内') || error.message.includes('である必要があります') || error.message.includes('有効なID')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    // その他のエラーは500を返す
    console.error('タスク更新エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
};

/**
 * タスクを削除する
 * 
 * API: DELETE /api/tasks/:id
 * 目的: 指定されたIDのタスクを削除する
 * 
 * @param {Object} req - リクエストオブジェクト（req.params.idにタスクIDが入る）
 * @param {Object} res - レスポンスオブジェクト
 */
const deleteTask = async (req, res) => {
  try {
    // URLパラメータからIDを取得
    const id = req.params.id;
    
    // Taskモデルを使用してタスクを削除
    const deletedTask = await Task.delete(id);
    
    // タスクが見つからない場合
    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // 削除されたタスクの情報を返す
    res.status(200).json({
      success: true,
      data: deletedTask,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    // バリデーションエラーの場合は400を返す
    if (error.message.includes('有効なID')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    // その他のエラーは500を返す
    console.error('タスク削除エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
};

// 他のファイルから使用できるようにエクスポート
module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};