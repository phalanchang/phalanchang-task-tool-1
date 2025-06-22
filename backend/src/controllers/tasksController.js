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

/**
 * 毎日タスク（デイリータスク）を取得する
 * 
 * API: GET /api/tasks/daily
 * 目的: 当日分の繰り返しタスクインスタンスのみを取得
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getDailyTasks = async (req, res) => {
  try {
    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // 今日のデイリータスクを取得
    const dailyTasks = await Task.findDailyTasks(today);
    
    res.status(200).json({
      success: true,
      data: dailyTasks,
      count: dailyTasks.length,
      date: today
    });
  } catch (error) {
    console.error('デイリータスク取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily tasks',
      message: error.message
    });
  }
};

/**
 * 繰り返しタスク（マスタータスク）を作成する
 * 
 * API: POST /api/tasks/recurring
 * 目的: 毎日タスクのマスタータスクを作成
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const createRecurringTask = async (req, res) => {
  try {
    const { title, description, priority, recurring_config } = req.body;
    
    // 毎日タスクのマスタータスクを作成
    const newRecurringTask = await Task.createRecurring({
      title,
      description,
      priority,
      is_recurring: true,
      recurring_pattern: 'daily',
      recurring_config
    });
    
    res.status(201).json({
      success: true,
      data: newRecurringTask
    });
  } catch (error) {
    if (error.message.includes('必須') || error.message.includes('文字以内')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    console.error('繰り返しタスク作成エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create recurring task',
      message: error.message
    });
  }
};

/**
 * 今日分のタスクインスタンスを生成する
 * 
 * API: POST /api/tasks/generate-today
 * 目的: ページアクセス時に今日分のタスクが生成されているかチェックし、未生成の場合は作成
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const generateTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 今日分のタスク生成処理
    const result = await Task.generateTasksForDate(today);
    
    res.status(200).json({
      success: true,
      message: `Generated ${result.generated} new daily tasks for ${today}`,
      data: {
        date: today,
        generated: result.generated,
        existing: result.existing,
        tasks: result.tasks
      }
    });
  } catch (error) {
    console.error('今日分タスク生成エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate today tasks',
      message: error.message
    });
  }
};

/**
 * 繰り返しタスク（マスタータスク）一覧を取得する
 * 
 * API: GET /api/tasks/recurring
 * 目的: 登録されている繰り返しタスクのマスタータスク一覧を取得
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getRecurringTasks = async (req, res) => {
  try {
    const recurringTasks = await Task.findRecurring();
    
    res.status(200).json({
      success: true,
      data: recurringTasks,
      count: recurringTasks.length
    });
  } catch (error) {
    console.error('繰り返しタスク一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recurring tasks',
      message: error.message
    });
  }
};

/**
 * 繰り返しタスク（マスタータスク）を更新する
 * 
 * API: PUT /api/tasks/recurring/:id
 * 目的: 特定の繰り返しタスクの設定を更新する
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const updateRecurringTask = async (req, res) => {
  const id = req.params.id;
  
  try {
    console.log('PUT /api/tasks/recurring/' + id + ' - Received data:', req.body);
    
    // リクエストボディから更新データを取得
    const { title, description, priority, recurring_config } = req.body;
    
    // 入力バリデーション
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    if (!recurring_config || !recurring_config.time) {
      return res.status(400).json({
        success: false,
        error: 'Recurring configuration with time is required'
      });
    }
    
    // 時刻形式のバリデーション
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(recurring_config.time)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Please use HH:MM format'
      });
    }
    
    // 繰り返しタスクを更新
    const updateData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      recurring_config: JSON.stringify(recurring_config)
    };
    
    const updatedTask = await Task.update(id, updateData);
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Recurring task not found'
      });
    }
    
    // レスポンスデータの準備
    const responseTask = {
      ...updatedTask,
      recurring_config: recurring_config // 元のオブジェクト形式で返す
    };
    
    console.log('繰り返しタスク更新成功:', responseTask);
    
    res.status(200).json({
      success: true,
      data: responseTask,
      message: 'Recurring task updated successfully'
    });
    
  } catch (error) {
    console.error('updateRecurringTask エラー詳細:', {
      message: error.message,
      stack: error.stack,
      requestId: id,
      requestBody: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to update recurring task',
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
  deleteTask,
  // 毎日タスク関連の新しいメソッド
  getDailyTasks,
  createRecurringTask,
  generateTodayTasks,
  getRecurringTasks,
  updateRecurringTask
};