const { createConnection } = require('../../database/config');

class Memo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || 1;
    this.title = data.title || '';
    this.content = data.content || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    this.is_deleted = data.is_deleted || false;
  }

  static async findAll(userId = 1) {
    const connection = await createConnection();
    try {
      await connection.query('USE task_management_app');
      const [rows] = await connection.execute(
      `SELECT id, user_id, title, content, created_at, updated_at 
       FROM memos 
       WHERE user_id = ? AND is_deleted = false 
       ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map(row => new Memo(row));
    } finally {
      await connection.end();
    }
  }

  static async findById(id, userId = 1) {
    const connection = await createConnection();
    try {
      await connection.query('USE task_management_app');
      const [rows] = await connection.execute(
      `SELECT id, user_id, title, content, created_at, updated_at 
       FROM memos 
       WHERE id = ? AND user_id = ? AND is_deleted = false`,
        [id, userId]
      );
      return rows.length > 0 ? new Memo(rows[0]) : null;
    } finally {
      await connection.end();
    }
  }

  async save() {
    const connection = await createConnection();
    try {
      await connection.query('USE task_management_app');
    
      if (this.id) {
        // Update existing memo
        const [result] = await connection.execute(
        `UPDATE memos 
         SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND user_id = ?`,
        [this.title, this.content, this.id, this.user_id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Memo not found or unauthorized');
      }
      
      // Fetch updated data
      const updated = await Memo.findById(this.id, this.user_id);
      Object.assign(this, updated);
      } else {
        // Create new memo
        const [result] = await connection.execute(
        `INSERT INTO memos (user_id, title, content) 
         VALUES (?, ?, ?)`,
        [this.user_id, this.title, this.content]
      );
      
      this.id = result.insertId;
      
      // Fetch created data
      const created = await Memo.findById(this.id, this.user_id);
      Object.assign(this, created);
      }
      
      return this;
    } finally {
      await connection.end();
    }
  }

  async delete() {
    const connection = await createConnection();
    try {
      await connection.query('USE task_management_app');
      const [result] = await connection.execute(
      `UPDATE memos 
       SET is_deleted = true, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [this.id, this.user_id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Memo not found or unauthorized');
    }
    
      this.is_deleted = true;
      return this;
    } finally {
      await connection.end();
    }
  }

  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('タイトルは必須です');
    }
    
    if (this.title && this.title.length > 255) {
      errors.push('タイトルは255文字以内で入力してください');
    }
    
    if (this.content && this.content.length > 10000) {
      errors.push('内容は10,000文字以内で入力してください');
    }
    
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      content: this.content,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Memo;