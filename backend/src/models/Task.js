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
        `INSERT INTO tasks (title, description, status, priority) 
         VALUES (?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description,
          sanitizedData.status,
          sanitizedData.priority
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

      if (updateFields.length === 0) {
        // 更新するフィールドがない場合は現在のデータを返す
        return existingRows[0];
      }

      // updated_at を現在時刻に設定
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(parseInt(id));

      // 更新実行
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
           FIELD(priority, 'high', 'medium', 'low'),
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
        `INSERT INTO tasks (title, description, status, priority, is_recurring, recurring_pattern, recurring_config) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description,
          sanitizedData.status,
          sanitizedData.priority,
          sanitizedData.is_recurring,
          sanitizedData.recurring_pattern,
          JSON.stringify(sanitizedData.recurring_config)
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

      // 毎日タスクのマスタータスクを取得
      const [masterTasks] = await connection.execute(
        `SELECT * FROM tasks 
         WHERE is_recurring = TRUE 
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
              `INSERT INTO tasks (title, description, status, priority, is_recurring, source_task_id, scheduled_date)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                `${masterTask.title}`,  // 日付を削除してシンプルに
                masterTask.description,
                'pending',
                masterTask.priority,
                false,
                masterTask.id,
                date
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
           FIELD(priority, 'high', 'medium', 'low'),
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

module.exports = Task;