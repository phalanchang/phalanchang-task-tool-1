/**
 * タスク管理コントローラー
 * 
 * このファイルには、タスクに関するすべてのAPI処理が含まれています。
 * 現在はメモリ上の配列でデータを管理していますが、後でMySQLに置き換える予定です。
 */

// 仮のタスクデータ（後でMySQLに置き換える）
let tasks = [
  {
    id: 1,
    title: 'サンプルタスク1',
    description: 'これはサンプルタスクです',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'サンプルタスク2',
    description: '完了済みのサンプルタスクです',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * すべてのタスクを取得する
 * 
 * API: GET /api/tasks
 * 目的: データベース内のすべてのタスクを一覧で返す
 * 
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getAllTasks = (req, res) => {
  try {
    // すべてのタスクを取得して返す
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
      error: 'Failed to fetch tasks'
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
const getTaskById = (req, res) => {
  try {
    // URLパラメータからIDを取得し、数値に変換
    const id = parseInt(req.params.id);
    
    // 配列からIDが一致するタスクを検索
    const task = tasks.find(t => t.id === id);
    
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
      error: 'Failed to fetch task'
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
const createTask = (req, res) => {
  try {
    // リクエストボディからタイトルと説明を取得
    const { title, description } = req.body;
    
    // タイトルが入力されているかチェック（必須項目）
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    // 新しいタスクオブジェクトを作成
    const newTask = {
      // 新しいIDを生成（既存の最大ID + 1）
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title,                                    // タイトル
      description: description || '',           // 説明（空の場合は空文字）
      status: 'pending',                       // 初期状態は「未完了」
      created_at: new Date().toISOString(),    // 作成日時
      updated_at: new Date().toISOString()     // 更新日時
    };
    
    // 配列に新しいタスクを追加
    tasks.push(newTask);
    
    // 作成されたタスクを返す（ステータス201 = Created）
    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    // エラーが発生した場合の処理
    console.error('タスク作成エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
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
const updateTask = (req, res) => {
  try {
    // URLパラメータからIDを取得
    const id = parseInt(req.params.id);
    
    // リクエストボディから更新する値を取得
    const { title, description, status } = req.body;
    
    // 配列から更新対象のタスクのインデックスを検索
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    // タスクが見つからない場合
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // 既存のタスクに新しい値をマージして更新
    const updatedTask = {
      ...tasks[taskIndex],                     // 既存の値を展開
      ...(title && { title }),                 // タイトルが指定されていれば更新
      ...(description !== undefined && { description }), // 説明が指定されていれば更新
      ...(status && { status }),               // ステータスが指定されていれば更新
      updated_at: new Date().toISOString()     // 更新日時を現在時刻に設定
    };
    
    // 配列内のタスクを更新
    tasks[taskIndex] = updatedTask;
    
    // 更新されたタスクを返す
    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    // エラーが発生した場合の処理
    console.error('タスク更新エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
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
const deleteTask = (req, res) => {
  try {
    // URLパラメータからIDを取得
    const id = parseInt(req.params.id);
    
    // 配列から削除対象のタスクのインデックスを検索
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    // タスクが見つからない場合
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // 配列からタスクを削除し、削除されたタスクを取得
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    // 削除されたタスクの情報を返す
    res.status(200).json({
      success: true,
      data: deletedTask,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    // エラーが発生した場合の処理
    console.error('タスク削除エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
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