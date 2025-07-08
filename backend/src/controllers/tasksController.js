/**
 * タスク管理コントローラー
 * 
 * このファイルには、タスクに関するすべてのAPI処理が含まれています。
 * Taskモデルを使用してMySQLデータベースとやり取りします。
 */

const { Task, UserPoints } = require('../models/Task');
const RecurringTask = require('../models/RecurringTask');
const { getJSTDate, getJSTDateTime, getTimeDebugInfo } = require('../utils/timezone');
const DailyTaskScheduler = require('../scheduler');

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
    const { title, description, status, priority, points } = req.body;
    
    // Taskモデルを使用して新しいタスクを作成
    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      points: points || 0
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
    const { title, description, status, priority, points } = req.body;
    
    // デバッグログ追加
    console.log('PUT /api/tasks/' + id + ' - Received data:', {
      id,
      body: req.body,
      title,
      description,
      status,
      priority,
      points
    });
    
    // 更新前のタスク状態を取得
    const originalTask = await Task.findById(id);
    if (!originalTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    
    // Taskモデルを使用してタスクを更新
    const updatedTask = await Task.update(id, {
      title,
      description,
      status,
      priority,
      points
    });
    
    // タスクが見つからない場合
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // タスクが pending → completed に変更された場合のみポイントを加算
    let pointsUpdate = null;
    if (originalTask.status === 'pending' && status === 'completed') {
      try {
        pointsUpdate = await UserPoints.addPointsForTaskCompletion(id);
      } catch (pointsError) {
        // ポイント加算エラーはログに記録するがタスク更新は成功とする
        console.error('ポイント加算エラー:', pointsError);
      }
    }
    
    // 更新されたタスクを返す（ポイント情報も含める）
    res.status(200).json({
      success: true,
      data: updatedTask,
      points: pointsUpdate
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
    // 日本時間での今日の日付を取得
    const todayJST = getJSTDate();
    console.log('getDailyTasks - JST対象日:', todayJST);
    
    // 今日のデイリータスクを取得
    const dailyTasks = await Task.findDailyTasks(todayJST);
    
    res.status(200).json({
      success: true,
      data: dailyTasks,
      count: dailyTasks.length,
      date: todayJST,
      jstDateTime: getJSTDateTime()
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
    const { title, description, priority, recurring_config, points } = req.body;
    
    // 毎日タスクのマスタータスクを作成
    const newRecurringTask = await RecurringTask.create({
      title,
      description,
      priority,
      recurring_pattern: 'daily',
      recurring_config,
      points: points || 0
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
    console.log('generateTodayTasks開始 - 日本時間対応版');
    
    // 日本時間での今日の日付を取得
    const todayJST = getJSTDate();
    const currentTimeJST = getJSTDateTime();
    
    console.log('JST対象日:', todayJST);
    console.log('JST現在時刻:', currentTimeJST);
    
    // デバッグ用：時刻情報の詳細ログ
    const timeDebug = getTimeDebugInfo();
    console.log('時刻情報詳細:', timeDebug);
    
    // 今日分のタスク生成処理（日本時間基準）
    console.log('Task.generateTasksForDate呼び出し開始 (JST基準)');
    const result = await Task.generateTasksForDate(todayJST);
    console.log('Task.generateTasksForDate完了:', result);
    
    res.status(200).json({
      success: true,
      message: `Generated ${result.generated} new daily tasks for ${todayJST} (JST)`,
      data: {
        date: todayJST,
        jstDateTime: currentTimeJST,
        generated: result.generated,
        existing: result.existing,
        tasks: result.tasks,
        timeDebug: timeDebug
      }
    });
  } catch (error) {
    console.error('今日分タスク生成エラー詳細:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      error: 'Failed to generate today tasks',
      message: error.message,
      details: error.code || 'Unknown error'
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
    console.log('RecurringTask.findAll() 呼び出し開始');
    const recurringTasks = await RecurringTask.findAll();
    console.log('RecurringTask.findAll() 結果:', recurringTasks);
    
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
    console.log('PUT /api/tasks/recurring/' + id + ' - Request body keys:', Object.keys(req.body));
    
    // リクエストボディから更新データを取得
    const { title, description, priority, recurring_config, points } = req.body;
    
    console.log('Points value:', points, 'Type:', typeof points);
    
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
    
    // ポイントが指定されている場合のみ追加
    if (points !== undefined) {
      updateData.points = parseInt(points);
      console.log('Adding points to updateData:', updateData.points);
    }
    
    const updatedTask = await RecurringTask.update(id, updateData);
    
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

/**
 * 繰り返しタスク（マスタータスク）を削除する
 * 
 * API: DELETE /api/tasks/recurring/:id
 * 目的: 特定の繰り返しタスクとその関連するデイリータスクインスタンスを削除する
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const deleteRecurringTask = async (req, res) => {
  try {
    // URLパラメータからIDを取得
    const id = req.params.id;
    
    // RecurringTaskモデルを使用して繰り返しタスクを削除
    const deletedTask = await RecurringTask.delete(id);
    
    // タスクが見つからない場合
    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: 'Recurring task not found'
      });
    }
    
    // 削除されたタスクの情報を返す
    res.status(200).json({
      success: true,
      data: deletedTask,
      message: 'Recurring task and related daily tasks deleted successfully'
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
    console.error('繰り返しタスク削除エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete recurring task',
      message: error.message
    });
  }
};

/**
 * ユーザーのポイント情報を取得する
 * 
 * API: GET /api/tasks/points
 * 目的: 現在のユーザーの累計ポイントと本日のポイントを取得
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getUserPoints = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    console.log('*** getUserPoints APIコール開始 - userId:', userId, '***');
    
    const points = await UserPoints.getUserPoints(userId);
    console.log('*** getUserPoints結果:', points, '***');
    
    // 🆕 tasksテーブル直接参照による今日のポイント計算
    const todayPoints = await UserPoints.getTodayPointsFromTasks(userId);
    console.log('*** getTodayPointsFromTasks結果:', todayPoints, '***');
    
    const responseData = {
      success: true,
      data: {
        ...points,
        daily_points: todayPoints
      }
    };
    
    console.log('*** getUserPoints APIレスポンス:', JSON.stringify(responseData, null, 2), '***');
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('ポイント取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get points',
      message: error.message
    });
  }
};

/**
 * ポイントを手動で加算する（管理者用）
 * 
 * API: POST /api/tasks/points
 * 目的: 指定されたポイントを手動で加算
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const addPoints = async (req, res) => {
  try {
    const { points, userId = 'default_user' } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'ポイントは正の数である必要があります'
      });
    }
    
    const updatedPoints = await UserPoints.addPoints(points, userId);
    
    res.status(200).json({
      success: true,
      data: updatedPoints
    });
  } catch (error) {
    console.error('ポイント加算エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add points',
      message: error.message
    });
  }
};

/**
 * デイリータスクスケジューラーの状態を取得する
 * 
 * API: GET /api/tasks/scheduler/status
 * 目的: スケジューラーの現在の状態を確認
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getSchedulerStatus = async (req, res) => {
  try {
    const status = DailyTaskScheduler.getStatus();
    
    res.status(200).json({
      success: true,
      data: status,
      message: status.isRunning ? 'スケジューラーは正常に動作中です' : 'スケジューラーは停止中です'
    });
  } catch (error) {
    console.error('スケジューラー状態取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scheduler status',
      message: error.message
    });
  }
};

/**
 * デイリータスクスケジューラーを手動実行する（テスト用）
 * 
 * API: POST /api/tasks/scheduler/execute
 * 目的: スケジューラーのタスクを手動で実行してテスト
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const executeSchedulerManually = async (req, res) => {
  try {
    console.log('手動スケジューラー実行が要求されました');
    
    const result = await DailyTaskScheduler.executeManually();
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'スケジューラーが手動で実行されました'
    });
  } catch (error) {
    console.error('手動スケジューラー実行エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute scheduler manually',
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
  updateRecurringTask,
  deleteRecurringTask,
  // ポイント関連の新しいメソッド
  getUserPoints,
  addPoints,
  // スケジューラー関連の新しいメソッド
  getSchedulerStatus,
  executeSchedulerManually
};