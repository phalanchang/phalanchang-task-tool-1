/**
 * タスクコントローラー の単体テスト（更新版）
 * 
 * Taskモデルと統合したコントローラー関数をテストします
 */

const tasksController = require('../../src/controllers/tasksController');

// Task モデルをモック化
jest.mock('../../src/models/Task');
const Task = require('../../src/models/Task');

// モックのreq, resオブジェクトを作成するヘルパー関数
const mockRequest = (params = {}, body = {}) => ({
  params,
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('TasksController（更新版）', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テストグループ: getAllTasks
  describe('getAllTasks', () => {
    
    test('タスク一覧を正常に返すこと', async () => {
      const mockTasks = [
        { id: 1, title: 'テストタスク1', description: 'テスト', status: 'pending' },
        { id: 2, title: 'テストタスク2', description: 'テスト', status: 'completed' }
      ];

      Task.findAll.mockResolvedValue(mockTasks);

      const req = mockRequest();
      const res = mockResponse();

      await tasksController.getAllTasks(req, res);

      expect(Task.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTasks,
        count: mockTasks.length
      });
    });

    test('エラー時に500ステータスを返すこと', async () => {
      Task.findAll.mockRejectedValue(new Error('データベースエラー'));

      const req = mockRequest();
      const res = mockResponse();

      await tasksController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch tasks',
        message: 'データベースエラー'
      });
    });
  });

  // テストグループ: getTaskById
  describe('getTaskById', () => {
    
    test('存在するIDでタスクを返すこと', async () => {
      const mockTask = { id: 1, title: 'テストタスク', description: 'テスト', status: 'pending' };
      Task.findById.mockResolvedValue(mockTask);

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await tasksController.getTaskById(req, res);

      expect(Task.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask
      });
    });

    test('存在しないIDで404エラーを返すこと', async () => {
      Task.findById.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await tasksController.getTaskById(req, res);

      expect(Task.findById).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('バリデーションエラーで500ステータスを返すこと', async () => {
      Task.findById.mockRejectedValue(new Error('有効なIDを指定してください'));

      const req = mockRequest({ id: 'invalid' });
      const res = mockResponse();

      await tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch task',
        message: '有効なIDを指定してください'
      });
    });
  });

  // テストグループ: createTask
  describe('createTask', () => {
    
    test('有効なデータでタスクを作成できること', async () => {
      const mockTask = {
        id: 1,
        title: 'テストタスク',
        description: 'テスト用の説明',
        status: 'pending',
        priority: 'medium'
      };
      Task.create.mockResolvedValue(mockTask);

      const req = mockRequest({}, {
        title: 'テストタスク',
        description: 'テスト用の説明'
      });
      const res = mockResponse();

      await tasksController.createTask(req, res);

      expect(Task.create).toHaveBeenCalledWith({
        title: 'テストタスク',
        description: 'テスト用の説明'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask
      });
    });

    test('バリデーションエラーで400ステータスを返すこと', async () => {
      Task.create.mockRejectedValue(new Error('タイトルは必須です'));

      const req = mockRequest({}, {});
      const res = mockResponse();

      await tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
        message: 'タイトルは必須です'
      });
    });

    test('サーバーエラーで500ステータスを返すこと', async () => {
      Task.create.mockRejectedValue(new Error('データベース接続エラー'));

      const req = mockRequest({}, { title: 'テストタスク' });
      const res = mockResponse();

      await tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create task',
        message: 'データベース接続エラー'
      });
    });
  });

  // テストグループ: updateTask
  describe('updateTask', () => {
    
    test('存在するタスクを更新できること', async () => {
      const mockUpdatedTask = {
        id: 1,
        title: '更新されたタイトル',
        description: '更新された説明',
        status: 'completed',
        priority: 'high'
      };
      Task.update.mockResolvedValue(mockUpdatedTask);

      const req = mockRequest({ id: '1' }, {
        title: '更新されたタイトル',
        status: 'completed'
      });
      const res = mockResponse();

      await tasksController.updateTask(req, res);

      expect(Task.update).toHaveBeenCalledWith('1', {
        title: '更新されたタイトル',
        status: 'completed'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTask
      });
    });

    test('存在しないタスクの更新で404エラーを返すこと', async () => {
      Task.update.mockResolvedValue(null);

      const req = mockRequest({ id: '999' }, { title: '存在しないタスク' });
      const res = mockResponse();

      await tasksController.updateTask(req, res);

      expect(Task.update).toHaveBeenCalledWith('999', { title: '存在しないタスク' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('バリデーションエラーで400ステータスを返すこと', async () => {
      Task.update.mockRejectedValue(new Error('有効なIDを指定してください'));

      const req = mockRequest({ id: 'invalid' }, { title: 'テスト' });
      const res = mockResponse();

      await tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
        message: '有効なIDを指定してください'
      });
    });
  });

  // テストグループ: deleteTask
  describe('deleteTask', () => {
    
    test('存在するタスクを削除できること', async () => {
      const mockDeletedTask = {
        id: 1,
        title: '削除されたタスク',
        description: '削除テスト',
        status: 'pending'
      };
      Task.delete.mockResolvedValue(mockDeletedTask);

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await tasksController.deleteTask(req, res);

      expect(Task.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeletedTask,
        message: 'Task deleted successfully'
      });
    });

    test('存在しないタスクの削除で404エラーを返すこと', async () => {
      Task.delete.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await tasksController.deleteTask(req, res);

      expect(Task.delete).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('バリデーションエラーで400ステータスを返すこと', async () => {
      Task.delete.mockRejectedValue(new Error('有効なIDを指定してください'));

      const req = mockRequest({ id: 'invalid' });
      const res = mockResponse();

      await tasksController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
        message: '有効なIDを指定してください'
      });
    });
  });
});