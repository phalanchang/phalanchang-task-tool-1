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
      await connection.execute('USE task_management_app');

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
   * すべてのタスクを取得
   * @returns {Promise<Array>} タスク一覧
   */
  static async findAll() {
    let connection;
    try {
      connection = await createConnection();
      await connection.execute('USE task_management_app');

      const [rows] = await connection.execute(
        'SELECT * FROM tasks ORDER BY created_at DESC'
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
      await connection.execute('USE task_management_app');

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
    if (updateData.title !== undefined || updateData.status !== undefined || updateData.priority !== undefined) {
      // 一時的なデータを作成してバリデーション
      const tempData = { title: 'temp', ...updateData };
      this.validateTaskData(tempData);
    }

    // データサニタイゼーション
    const sanitizedData = this.sanitizeTaskData(updateData);

    let connection;
    try {
      connection = await createConnection();
      await connection.execute('USE task_management_app');

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
   * タスクを削除
   * @param {number} id - タスクID
   * @returns {Promise<Object|null>} 削除されたタスク または null
   */
  static async delete(id) {
    // IDのバリデーション
    this.validateId(id);

    let connection;
    try {
      connection = await createConnection();
      await connection.execute('USE task_management_app');

      // 削除対象の存在確認
      const [existingRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

      if (existingRows.length === 0) {
        return null;
      }

      const taskToDelete = existingRows[0];

      // 削除実行
      await connection.execute(
        'DELETE FROM tasks WHERE id = ?',
        [parseInt(id)]
      );

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
}

module.exports = Task;