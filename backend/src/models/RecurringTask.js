/**
 * RecurringTask モデル
 * 
 * recurring_tasks テーブル専用のモデルクラス
 * 繰り返しタスクのマスターデータを管理
 */

const { createConnection } = require('../../database/config');

class RecurringTask {
  /**
   * 繰り返しタスクデータのバリデーション
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

    // recurring_config のバリデーション
    if (taskData.recurring_config) {
      if (typeof taskData.recurring_config !== 'object') {
        throw new Error('recurring_config はオブジェクトである必要があります');
      }
      if (!taskData.recurring_config.time) {
        throw new Error('実行時刻は必須です');
      }
    }
  }

  /**
   * IDのバリデーション
   * @param {*} id - バリデーション対象ID
   * @throws {Error} バリデーションエラー
   */
  static validateId(id) {
    const numId = parseInt(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error('有効なIDを指定してください');
    }
  }

  /**
   * データサニタイゼーション
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

    // 説明の前後空白除去
    if (sanitized.description) {
      sanitized.description = sanitized.description.trim();
    }

    // デフォルト値設定
    if (!sanitized.priority) {
      sanitized.priority = 'medium';
    }

    if (!sanitized.recurring_pattern) {
      sanitized.recurring_pattern = 'daily';
    }

    // ポイントのサニタイゼーション
    if (sanitized.points !== undefined) {
      sanitized.points = parseInt(sanitized.points) || 0;
    }

    // is_active のデフォルト値
    if (sanitized.is_active === undefined) {
      sanitized.is_active = true;
    }

    return sanitized;
  }

  /**
   * 全ての繰り返しタスクを取得
   * @returns {Promise<Array>} 繰り返しタスクの配列
   */
  static async findAll() {
    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        `SELECT * FROM recurring_tasks 
         WHERE is_active = TRUE 
         ORDER BY COALESCE(display_order, 999) ASC, created_at ASC`
      );

      // recurring_config を JSON パース
      return rows.map(row => ({
        ...row,
        recurring_config: typeof row.recurring_config === 'string' 
          ? JSON.parse(row.recurring_config) 
          : row.recurring_config
      }));

    } catch (error) {
      console.error('繰り返しタスク取得エラー:', error);
      throw new Error(`繰り返しタスクの取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * IDで繰り返しタスクを取得
   * @param {number} id - タスクID
   * @returns {Promise<Object|null>} 繰り返しタスク
   */
  static async findById(id) {
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      const [rows] = await connection.execute(
        'SELECT * FROM recurring_tasks WHERE id = ? AND is_active = TRUE',
        [parseInt(id)]
      );

      if (rows.length === 0) {
        return null;
      }

      const task = rows[0];
      // recurring_config を JSON パース
      if (typeof task.recurring_config === 'string') {
        task.recurring_config = JSON.parse(task.recurring_config);
      }

      return task;

    } catch (error) {
      console.error('繰り返しタスク取得エラー:', error);
      throw new Error(`繰り返しタスクの取得に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 新しい繰り返しタスクを作成
   * @param {Object} taskData - 繰り返しタスクデータ
   * @returns {Promise<Object>} 作成された繰り返しタスク
   */
  static async create(taskData) {
    this.validateTaskData(taskData);
    const sanitizedData = this.sanitizeTaskData(taskData);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // recurring_config を JSON 文字列に変換
      const recurringConfigJson = JSON.stringify(sanitizedData.recurring_config);

      const [result] = await connection.execute(
        `INSERT INTO recurring_tasks 
         (title, description, priority, recurring_pattern, recurring_config, points, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitizedData.title,
          sanitizedData.description || null,
          sanitizedData.priority,
          sanitizedData.recurring_pattern,
          recurringConfigJson,
          sanitizedData.points || 0,
          sanitizedData.display_order || null,
          sanitizedData.is_active
        ]
      );

      // 作成されたタスクを取得して返す
      return await this.findById(result.insertId);

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
   * 繰り返しタスクを更新
   * @param {number} id - タスクID
   * @param {Object} updateData - 更新データ
   * @returns {Promise<Object|null>} 更新された繰り返しタスク
   */
  static async update(id, updateData) {
    this.validateId(id);

    // 更新データのバリデーション（部分的）
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim() === '') {
        throw new Error('タイトルは必須です');
      }
      if (updateData.title.length > 255) {
        throw new Error('タイトルは255文字以内で入力してください');
      }
    }

    if (updateData.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(updateData.priority)) {
        throw new Error('優先度は low, medium, high のいずれかである必要があります');
      }
    }

    if (updateData.points !== undefined) {
      const points = parseInt(updateData.points);
      if (isNaN(points) || points < 0 || points > 1000) {
        throw new Error('ポイントは0以上1000以下の整数である必要があります');
      }
    }

    const sanitizedData = this.sanitizeTaskData(updateData);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 更新対象の存在確認
      const [existingRows] = await connection.execute(
        'SELECT * FROM recurring_tasks WHERE id = ? AND is_active = TRUE',
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

      if (sanitizedData.priority !== undefined) {
        updateFields.push('priority = ?');
        updateValues.push(sanitizedData.priority);
      }

      if (sanitizedData.recurring_config !== undefined) {
        updateFields.push('recurring_config = ?');
        updateValues.push(JSON.stringify(sanitizedData.recurring_config));
      }

      if (sanitizedData.points !== undefined) {
        updateFields.push('points = ?');
        updateValues.push(sanitizedData.points);
      }

      if (sanitizedData.display_order !== undefined) {
        updateFields.push('display_order = ?');
        updateValues.push(sanitizedData.display_order);
      }

      if (updateFields.length === 0) {
        return existingRows[0];
      }

      // updated_at を現在時刻に設定
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(parseInt(id));

      // 更新実行
      await connection.execute(
        `UPDATE recurring_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // 更新されたタスクを取得して返す
      return await this.findById(id);

    } catch (error) {
      console.error('繰り返しタスク更新エラー:', error);
      throw new Error(`繰り返しタスクの更新に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 繰り返しタスクを削除（論理削除）
   * @param {number} id - タスクID
   * @returns {Promise<Object|null>} 削除された繰り返しタスク
   */
  static async delete(id) {
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.query('USE task_management_app');

      // 削除対象の存在確認
      const [existingRows] = await connection.execute(
        'SELECT * FROM recurring_tasks WHERE id = ? AND is_active = TRUE',
        [parseInt(id)]
      );

      if (existingRows.length === 0) {
        return null;
      }

      // 論理削除実行
      await connection.execute(
        'UPDATE recurring_tasks SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [parseInt(id)]
      );

      return existingRows[0];

    } catch (error) {
      console.error('繰り返しタスク削除エラー:', error);
      throw new Error(`繰り返しタスクの削除に失敗しました: ${error.message}`);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

module.exports = RecurringTask;