const mysql = require('mysql2/promise');
const { getDbConfig } = require('../../database/config');

class Memo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.content = data.content || '';
    this.tags = data.tags || [];
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Get database connection
   */
  static async getConnection() {
    const config = getDbConfig();
    return await mysql.createConnection(config);
  }

  /**
   * Get all memos with optional filtering
   */
  static async findAll(options = {}) {
    const connection = await this.getConnection();
    
    try {
      let query = `
        SELECT id, title, content, tags, created_at, updated_at
        FROM memos
        ORDER BY created_at DESC
      `;
      
      if (options.limit) {
        query += ` LIMIT ${parseInt(options.limit)}`;
      }
      
      const [rows] = await connection.execute(query);
      
      // Parse JSON tags
      const memos = rows.map(row => {
        return {
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : []
        };
      });
      
      return memos;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find memo by ID
   */
  static async findById(id) {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT id, title, content, tags, created_at, updated_at FROM memos WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const memo = rows[0];
      memo.tags = memo.tags ? JSON.parse(memo.tags) : [];
      
      return new Memo(memo);
    } finally {
      await connection.end();
    }
  }

  /**
   * Search memos by title or content
   */
  static async search(searchTerm, tags = []) {
    const connection = await this.getConnection();
    
    try {
      let query = `
        SELECT id, title, content, tags, created_at, updated_at
        FROM memos
        WHERE (title LIKE ? OR content LIKE ?)
      `;
      const params = [`%${searchTerm}%`, `%${searchTerm}%`];
      
      if (tags.length > 0) {
        const tagConditions = tags.map(() => 'JSON_CONTAINS(tags, ?)').join(' OR ');
        query += ` AND (${tagConditions})`;
        tags.forEach(tag => params.push(`"${tag}"`));
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.execute(query, params);
      
      const memos = rows.map(row => {
        return {
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : []
        };
      });
      
      return memos;
    } finally {
      await connection.end();
    }
  }

  /**
   * Create new memo
   */
  async save() {
    const connection = await this.constructor.getConnection();
    
    try {
      if (this.id) {
        // Update existing memo
        const [result] = await connection.execute(
          `UPDATE memos 
           SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [this.title, this.content, JSON.stringify(this.tags), this.id]
        );
        
        if (result.affectedRows === 0) {
          throw new Error('Memo not found');
        }
        
        return this;
      } else {
        // Create new memo
        const [result] = await connection.execute(
          `INSERT INTO memos (title, content, tags)
           VALUES (?, ?, ?)`,
          [this.title, this.content, JSON.stringify(this.tags)]
        );
        
        this.id = result.insertId;
        
        // Get the created memo with timestamps
        const [rows] = await connection.execute(
          'SELECT created_at, updated_at FROM memos WHERE id = ?',
          [this.id]
        );
        
        if (rows.length > 0) {
          this.created_at = rows[0].created_at;
          this.updated_at = rows[0].updated_at;
        }
        
        return this;
      }
    } finally {
      await connection.end();
    }
  }

  /**
   * Delete memo
   */
  static async deleteById(id) {
    const connection = await this.getConnection();
    
    try {
      const [result] = await connection.execute(
        'DELETE FROM memos WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get all unique tags
   */
  static async getAllTags() {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT DISTINCT tags FROM memos WHERE tags IS NOT NULL AND tags != "[]"'
      );
      
      const allTags = new Set();
      rows.forEach(row => {
        if (row.tags) {
          const tags = JSON.parse(row.tags);
          tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags).sort();
    } finally {
      await connection.end();
    }
  }

  /**
   * Validate memo data
   */
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (this.title && this.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
    
    if (!this.content || this.content.trim().length === 0) {
      errors.push('Content is required');
    }
    
    if (this.tags && !Array.isArray(this.tags)) {
      errors.push('Tags must be an array');
    }
    
    return errors;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      tags: this.tags,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Memo;