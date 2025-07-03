/**
 * Task モデル
 * 
 * TDD Green段階: テストを通すための実装
 * データベースとの CRUD 操作を提供
 */

const { createConnection } = require('../../database/config');

class Task {
  /**
   * タスクデータのバリデーション
   * @param {Object} taskData - バリデーション対象データ
   * @throws {Error} バリデーションエラー
   */
  static validateTaskData(taskData) {
    // タイトルの必須チェック
    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('タイトルは必須です');
    }

    // タイトル長さチェック
    if (taskData.title.length > 255) {
      throw new Error('タイトルは255文字以内で入力してください');
    }

    // ステータスのバリデーション
    const validStatuses = ['pending', 'completed'];
    if (taskData.status && !validStatuses.includes(taskData.status)) {
      throw new Error('ステータスは pending または completed である必要があります');
    }

    // 優先度のバリデーション
    const validPriorities = ['low', 'medium', 'high'];
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
      throw new Error('優先度は low, medium, high のいずれかである必要があります');
    }

    // ポイントのバリデーション
    if (taskData.points !== undefined) {
      const points = parseInt(taskData.points);
      if (isNaN(points) || points < 0 || points > 1000) {
        throw new Error('ポイントは0以上1000以下の整数である必要があります');
      }
    }
  }

  /**
   * IDのバリデーション
   * @param {*} id - バリデーション対象ID
   * @throws {Error} バリデーションエラー
   */
  static validateId(id) {
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      throw new Error('有効なIDを指定してください');
    }
  }

  /**
   * タスクデータのサニタイゼーション
   * @param {Object} taskData - サニタイゼーション対象データ
   * @returns {Object} サニタイズされたデータ
   */
  static sanitizeTaskData(taskData) {
    const sanitized = {
      ...taskData
    };

    // タイトルの前後空白除去
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim();
    }

    // デフォルト値設定
    if (!sanitized.status) {
      sanitized.status = 'pending';
    }

    if (!sanitized.priority) {
      sanitized.priority = 'medium';
    }

    // 空のdescriptionをnullに変換
    if (sanitized.description === '') {
      sanitized.description = null;
    }

    // ポイントのサニタイゼーション
    if (sanitized.points !== undefined) {
      sanitized.points = parseInt(sanitized.points) || 0;
    }

    return sanitized;
  }

  /**
   * 新しいタスクを作成
   * @param {Object} taskData - タスクデータ
   * @param {string} taskData.title - タスクタイトル
   * @param {string} taskData.description - タスク説明
   * @param {string} taskData.status - タスクステータス（pending/completed）
   * @param {string} taskData.priority - タスク優先度（low/medium/high）
   * @returns {Promise<Object>} 作成されたタスク
   */
  static async create(taskData) {
    // バリデーションとサニタイゼーション
    this.validateTaskData(taskData);
    const sanitizedData = this.sanitizeTaskData(taskData);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // データベースに挿入
      const [result] = await connection.execute(
        `INSERT INTO tasks (title, description, status, priority, points) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description,
          sanitizedData.status,
          sanitizedData.priority,
          sanitizedData.points || 0
        ]
      );

      // 作成されたタスクを取得
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [result.insertId]
      );

      return rows[0];

    } catch (error) {
      console.error('Task作成エラー:', error);
      throw new Error(`タスクの作成に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * すべてのタスクを取得（通常タスクのみ、繰り返しタスクとデイリータスクインスタンスは除外）
   * @returns {Promise<Array>} タスク一覧
   */
  static async findAll() {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        `SELECT * FROM tasks 
         WHERE is_recurring = FALSE 
           AND source_task_id IS NULL 
         ORDER BY created_at DESC`
      );

      return rows;

    } catch (error) {
      console.error('Task一覧取得エラー:', error);
      throw new Error(`タスク一覧の取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 指定されたIDのタスクを取得
   * @param {number} id - タスクID
   * @returns {Promise<Object|null>} タスク または null
   */
  static async findById(id) {
    // IDのバリデーション
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

      return rows.length > 0 ? rows[0] : null;

    } catch (error) {
      console.error('Task取得エラー:', error);
      throw new Error(`タスクの取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * タスクを更新
   * @param {number} id - タスクID
   * @param {Object} updateData - 更新データ
   * @returns {Promise<Object|null>} 更新されたタスク または null
   */
  static async update(id, updateData) {
    // IDのバリデーション
    this.validateId(id);

    // 更新データのバリデーション（部分的）
    // 存在するフィールドのみをバリデーション
    if (updateData.title !== undefined) {
      // タイトルの必須チェック
      if (!updateData.title || updateData.title.trim() === '') {
        throw new Error('タイトルは必須です');
      }
      // タイトル長さチェック
      if (updateData.title.length > 255) {
        throw new Error('タイトルは255文字以内で入力してください');
      }
    }
    
    // ステータスのバリデーション
    if (updateData.status !== undefined) {
      const validStatuses = ['pending', 'completed'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('ステータスは pending または completed である必要があります');
      }
    }

    // 優先度のバリデーション
    if (updateData.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(updateData.priority)) {
        throw new Error('優先度は low, medium, high のいずれかである必要があります');
      }
    }

    // データサニタイゼーション
    const sanitizedData = this.sanitizeTaskData(updateData);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 更新対象の存在確認
      const [existingRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

      if (existingRows.length === 0) {
        return null;
      }

      // 更新クエリの構築
      const updateFields = [];
      const updateValues = [];

      if (sanitizedData.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(sanitizedData.title);
      }
      
      if (sanitizedData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(sanitizedData.description);
      }
      
      if (sanitizedData.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(sanitizedData.status);
      }
      
      if (sanitizedData.priority !== undefined) {
        updateFields.push('priority = ?');
        updateValues.push(sanitizedData.priority);
      }

      if (sanitizedData.recurring_config !== undefined) {
        updateFields.push('recurring_config = ?');
        updateValues.push(sanitizedData.recurring_config);
      }

      if (sanitizedData.points !== undefined) {
        updateFields.push('points = ?');
        updateValues.push(sanitizedData.points);
      }

      if (updateFields.length === 0) {
        // 更新するフィールドがない場合は現在のデータを返す
        return existingRows[0];
      }

      // updated_at を現在時刻に設定
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(parseInt(id));

      // 更新実行
      console.log('SQL更新クエリ:', `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`);
      console.log('SQL更新値:', updateValues);
      
      await connection.execute(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // 更新されたタスクを取得
      const [updatedRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

      return updatedRows[0];

    } catch (error) {
      console.error('Task更新エラー:', error);
      throw new Error(`タスクの更新に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * タスクを削除（安全な削除処理）
   * @param {number} id - タスクID
   * @returns {Promise<Object|null>} 削除されたタスク または null
   */
  static async delete(id) {
    // IDのバリデーション
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 削除対象の存在確認
      const [existingRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

      if (existingRows.length === 0) {
        return null;
      }

      const taskToDelete = existingRows[0];

      // 繰り返しタスクのマスタータスクの場合は削除を拒否
      if (taskToDelete.is_recurring === 1) {
        throw new Error('繰り返しタスクのマスタータスクは削除できません。繰り返しタスク管理画面から削除してください。');
      }

      // デイリータスクインスタンスまたは通常タスクのみ削除
      await connection.execute(
        'DELETE FROM tasks WHERE id = ? AND is_recurring = FALSE',
        [parseInt(id)]
      );

      console.log(`タスク削除完了: ID=${id}, タイトル="${taskToDelete.title}", 種別=${taskToDelete.source_task_id ? 'デイリータスクインスタンス' : '通常タスク'}`);
      
      return taskToDelete;

    } catch (error) {
      console.error('Task削除エラー:', error);
      throw new Error(`タスクの削除に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 繰り返しタスク（マスタータスク）を削除
   * @param {number} id - 繰り返しタスクID
   * @returns {Promise<Object|null>} 削除された繰り返しタスク または null
   */
  static async deleteRecurringTask(id) {
    // IDのバリデーション
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // トランザクション開始
      await connection.query('START TRANSACTION');

      // 削除対象の存在確認（繰り返しタスクのみ）
      const [existingRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ? AND is_recurring = TRUE',
        [parseInt(id)]
      );

      if (existingRows.length === 0) {
        await connection.query('ROLLBACK');
        return null;
      }

      const recurringTaskToDelete = existingRows[0];

      // 関連するデイリータスクインスタンスを先に削除
      await connection.execute(
        'DELETE FROM tasks WHERE source_task_id = ? AND is_recurring = FALSE',
        [parseInt(id)]
      );

      // 繰り返しタスク本体を削除
      await connection.execute(
        'DELETE FROM tasks WHERE id = ? AND is_recurring = TRUE',
        [parseInt(id)]
      );

      // コミット
      await connection.query('COMMIT');

      console.log(`繰り返しタスク削除完了: ID=${id}, タイトル="${recurringTaskToDelete.title}"`);
      
      return recurringTaskToDelete;

    } catch (error) {
      // ロールバック
      if (connection) {
        try {
          await connection.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('ロールバックエラー:', rollbackError);
        }
      }
      
      console.error('繰り返しタスク削除エラー:', error);
      throw new Error(`繰り返しタスクの削除に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * デイリータスク（今日の繰り返しタスクインスタンス）を取得
   * @param {string} date - 日付（YYYY-MM-DD形式）
   * @returns {Promise<Array>} デイリータスク一覧
   */
  static async findDailyTasks(date) {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        `SELECT * FROM tasks 
         WHERE is_recurring = FALSE 
           AND source_task_id IS NOT NULL 
           AND scheduled_date = ?
         ORDER BY 
           display_order ASC,
           created_at DESC`,
        [date]
      );

      return rows;

    } catch (error) {
      console.error('デイリータスク取得エラー:', error);
      throw new Error(`デイリータスクの取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 繰り返しタスク（マスタータスク）を作成
   * @param {Object} taskData - 繰り返しタスクデータ
   * @returns {Promise<Object>} 作成された繰り返しタスク
   */
  static async createRecurring(taskData) {
    // 基本バリデーション
    this.validateTaskData(taskData);
    const sanitizedData = this.sanitizeTaskData(taskData);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 繰り返しタスクとして挿入
      const [result] = await connection.execute(
        `INSERT INTO tasks (title, description, status, priority, is_recurring, recurring_pattern, recurring_config, display_order, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description,
          sanitizedData.status,
          sanitizedData.priority,
          sanitizedData.is_recurring,
          sanitizedData.recurring_pattern,
          JSON.stringify(sanitizedData.recurring_config),
          sanitizedData.display_order || null,
          sanitizedData.points || 0
        ]
      );

      // 作成されたタスクを取得
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [result.insertId]
      );

      return rows[0];

    } catch (error) {
      console.error('繰り返しタスク作成エラー:', error);
      throw new Error(`繰り返しタスクの作成に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 繰り返しタスク（マスタータスク）一覧を取得
   * @returns {Promise<Array>} 繰り返しタスク一覧
   */
  static async findRecurring() {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        `SELECT * FROM tasks 
         WHERE is_recurring = TRUE 
         ORDER BY 
           FIELD(priority, 'high', 'medium', 'low'),
           created_at DESC`
      );

      return rows;

    } catch (error) {
      console.error('繰り返しタスク一覧取得エラー:', error);
      throw new Error(`繰り返しタスク一覧の取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 指定日のタスクインスタンスを生成（重複防止強化版）
   * @param {string} date - 日付（YYYY-MM-DD形式）
   * @returns {Promise<Object>} 生成結果
   */
  static async generateTasksForDate(date) {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // トランザクション開始（重複防止のため）
      await connection.query('START TRANSACTION');

      // 毎日タスクのマスタータスクを取得（recurring_tasks テーブルから）
      const [masterTasks] = await connection.execute(
        `SELECT * FROM recurring_tasks 
         WHERE is_active = TRUE 
           AND recurring_pattern = 'daily'`
      );

      let generatedCount = 0;
      let skippedCount = 0;

      // 各マスタータスクに対してインスタンス生成
      for (const masterTask of masterTasks) {
        // 重複チェック（より厳密に）
        const [existingCheck] = await connection.execute(
          `SELECT id FROM tasks 
           WHERE is_recurring = FALSE 
             AND source_task_id = ? 
             AND scheduled_date = ?
           LIMIT 1`,
          [masterTask.id, date]
        );

        if (existingCheck.length === 0) {
          // 重複がない場合のみ作成
          try {
            await connection.execute(
              `INSERT INTO tasks (title, description, status, priority, is_recurring, source_task_id, scheduled_date, display_order, points)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `${masterTask.title}`,  // 日付を削除してシンプルに
                masterTask.description,
                'pending',
                masterTask.priority,
                false,
                masterTask.id,
                date,
                masterTask.display_order || null,
                masterTask.points || 0  // マスタータスクのポイントを継承
              ]
            );
            generatedCount++;
          } catch (insertError) {
            // 万が一の重複エラー（UNIQUE制約違反など）をキャッチ
            if (insertError.code === 'ER_DUP_ENTRY') {
              console.log(`タスク重複スキップ: ${masterTask.title} for ${date}`);
              skippedCount++;
            } else {
              throw insertError;
            }
          }
        } else {
          skippedCount++;
        }
      }

      // コミット
      await connection.query('COMMIT');

      // 最終的な当日分タスク一覧を取得（当日のみ）
      const [allTodayTasks] = await connection.execute(
        `SELECT * FROM tasks 
         WHERE is_recurring = FALSE 
           AND source_task_id IS NOT NULL 
           AND scheduled_date = ?
         ORDER BY 
           display_order ASC,
           created_at ASC`,
        [date]
      );

      return {
        generated: generatedCount,
        existing: skippedCount,
        total: allTodayTasks.length,
        tasks: allTodayTasks
      };

    } catch (error) {
      // エラー時はロールバック（connectionが存在する場合のみ）
      if (connection) {
        try {
          await connection.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('ロールバックエラー:', rollbackError);
        }
      }
      
      console.error('タスク生成エラー:', error);
      throw new Error(`タスクの生成に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

/**
 * UserPoints モデル
 * 
 * ユーザーのポイント管理を担当
 */
class UserPoints {
  /**
   * ユーザーの現在のポイント情報を取得
   * @param {string} userId - ユーザーID（デフォルト: 'default_user'）
   * @returns {Promise<Object>} ポイント情報
   */
  static async getUserPoints(userId = 'default_user') {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        'SELECT * FROM user_points WHERE user_id = ?',
        [userId]
      );

      if (rows.length === 0) {
        // ユーザーが存在しない場合は新規作成
        await connection.execute(
          'INSERT INTO user_points (user_id, total_points, daily_points, last_updated) VALUES (?, 0, 0, CURRENT_DATE)',
          [userId]
        );
        return { user_id: userId, total_points: 0, daily_points: 0, last_updated: new Date() };
      }

      return rows[0];

    } catch (error) {
      console.error('ユーザーポイント取得エラー:', error);
      throw new Error(`ポイント情報の取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * ポイントを加算
   * @param {number} points - 加算するポイント
   * @param {string} userId - ユーザーID（デフォルト: 'default_user'）
   * @returns {Promise<Object>} 更新後のポイント情報
   */
  static async addPoints(points, userId = 'default_user') {
    if (!points || points <= 0) {
      throw new Error('有効なポイント数を指定してください');
    }

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 現在の日付（YYYY-MM-DD形式）
      const today = new Date().toISOString().slice(0, 10);

      // point_historyから今日の累計ポイントを計算（より正確）
      const [dailyTotalRows] = await connection.execute(
        `SELECT COALESCE(SUM(points_earned), 0) as daily_total
         FROM point_history 
         WHERE user_id = ? 
           AND DATE(created_at) = ?
           AND action_type = 'task_completion'`,
        [userId, today]
      );
      
      const currentDailyTotal = parseInt(dailyTotalRows[0].daily_total) || 0;
      const newDailyTotal = currentDailyTotal + points;


      // ユーザーポイント情報を取得または作成（total_pointsのため）
      const currentPoints = await this.getUserPoints(userId);

      // ポイントを更新
      await connection.execute(
        `UPDATE user_points 
         SET total_points = total_points + ?, 
             daily_points = ?, 
             last_updated = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [points, newDailyTotal, today, userId]
      );

      // 更新後の情報を取得
      return await this.getUserPoints(userId);

    } catch (error) {
      console.error('ポイント加算エラー:', error);
      throw new Error(`ポイントの加算に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * タスク完了履歴をチェック（重複ポイント加算防止）
   * @param {number} taskId - チェック対象のタスクID
   * @param {string} userId - ユーザーID（デフォルト: 'default_user'）
   * @returns {Promise<boolean>} 既に加算済みの場合true
   */
  static async hasTaskCompletionHistory(taskId, userId = 'default_user') {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        `SELECT id FROM point_history 
         WHERE task_id = ? AND user_id = ? AND action_type = 'task_completion'
         LIMIT 1`,
        [taskId, userId]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('ポイント履歴チェックエラー:', error);
      // エラー時は安全側に倒してtrueを返す（重複加算を防止）
      return true;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * タスク完了時のポイント加算（Taskモデルから呼び出される）
   * @param {number} taskId - 完了したタスクID
   * @param {string} userId - ユーザーID（デフォルト: 'default_user'）
   * @returns {Promise<Object>} 更新後のポイント情報
   */
  static async addPointsForTaskCompletion(taskId, userId = 'default_user') {
    // 1. 既にポイントが加算されているかチェック
    const hasHistory = await this.hasTaskCompletionHistory(taskId, userId);
    
    if (hasHistory) {
      console.log(`Task ${taskId} already has point allocation history. Skipping duplicate allocation.`);
      return await this.getUserPoints(userId);
    }

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // タスクの詳細情報とポイント数を取得
      const [taskRows] = await connection.execute(
        `SELECT 
           t.title,
           CASE 
             WHEN t.source_task_id IS NOT NULL THEN 
               (SELECT points FROM recurring_tasks WHERE id = t.source_task_id)
             ELSE t.points 
           END as task_points
         FROM tasks t
         WHERE t.id = ? AND t.status = 'completed'`,
        [taskId]
      );

      if (taskRows.length === 0) {
        throw new Error('完了タスクが見つかりません');
      }

      const taskPoints = taskRows[0].task_points || 0;
      const taskTitle = taskRows[0].title;
      
      if (taskPoints > 0) {
        // 2. ポイント加算処理
        const updatedPoints = await this.addPoints(taskPoints, userId);
        
        // 3. ポイント履歴に記録
        await connection.execute(
          `INSERT INTO point_history (user_id, task_id, points_earned, task_title, action_type, created_at)
           VALUES (?, ?, ?, ?, 'task_completion', CURRENT_TIMESTAMP)`,
          [userId, taskId, taskPoints, taskTitle]
        );
        
        console.log(`Task completion points added: Task ${taskId} (${taskTitle}) - ${taskPoints} points for user ${userId}`);
        return updatedPoints;
      }

      return await this.getUserPoints(userId);

    } catch (error) {
      console.error('タスク完了ポイント加算エラー:', error);
      throw new Error(`タスク完了時のポイント加算に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

module.exports = { Task, UserPoints };