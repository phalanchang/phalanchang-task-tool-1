const Memo = require('../models/Memo');

/**
 * Get all memos
 */
const getAllMemos = async (req, res) => {
  try {
    const { search, tags, limit } = req.query;
    let memos;
    
    if (search || tags) {
      const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
      memos = await Memo.search(search || '', tagArray);
    } else {
      const options = {};
      if (limit) {
        options.limit = parseInt(limit);
      }
      memos = await Memo.findAll(options);
    }
    
    res.json({
      success: true,
      data: memos,
      message: 'Memos retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting memos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve memos',
      error: error.message
    });
  }
};

/**
 * Get memo by ID
 */
const getMemoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memo ID'
      });
    }
    
    const memo = await Memo.findById(parseInt(id));
    
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'Memo not found'
      });
    }
    
    res.json({
      success: true,
      data: memo.toJSON(),
      message: 'Memo retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting memo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve memo',
      error: error.message
    });
  }
};

/**
 * Create new memo
 */
const createMemo = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const memo = new Memo({
      title: title?.trim(),
      content: content?.trim(),
      tags: tags || []
    });
    
    // Validate memo data
    const validationErrors = memo.validate();
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const savedMemo = await memo.save();
    
    res.status(201).json({
      success: true,
      data: savedMemo.toJSON(),
      message: 'Memo created successfully'
    });
  } catch (error) {
    console.error('Error creating memo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create memo',
      error: error.message
    });
  }
};

/**
 * Update memo
 */
const updateMemo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memo ID'
      });
    }
    
    const existingMemo = await Memo.findById(parseInt(id));
    if (!existingMemo) {
      return res.status(404).json({
        success: false,
        message: 'Memo not found'
      });
    }
    
    // Update memo properties
    existingMemo.title = title?.trim() || existingMemo.title;
    existingMemo.content = content?.trim() || existingMemo.content;
    existingMemo.tags = tags !== undefined ? tags : existingMemo.tags;
    
    // Validate updated data
    const validationErrors = existingMemo.validate();
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const updatedMemo = await existingMemo.save();
    
    res.json({
      success: true,
      data: updatedMemo.toJSON(),
      message: 'Memo updated successfully'
    });
  } catch (error) {
    console.error('Error updating memo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update memo',
      error: error.message
    });
  }
};

/**
 * Delete memo
 */
const deleteMemo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memo ID'
      });
    }
    
    const deleted = await Memo.deleteById(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Memo not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Memo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting memo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete memo',
      error: error.message
    });
  }
};

/**
 * Get all tags
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Memo.getAllTags();
    
    res.json({
      success: true,
      data: tags,
      message: 'Tags retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tags',
      error: error.message
    });
  }
};

module.exports = {
  getAllMemos,
  getMemoById,
  createMemo,
  updateMemo,
  deleteMemo,
  getAllTags
};