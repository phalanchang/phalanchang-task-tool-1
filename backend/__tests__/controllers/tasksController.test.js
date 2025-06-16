/**
 * タスクコントローラー の単体テスト
 * 
 * コントローラー関数の個別動作をテストします
 */

const tasksController = require('../../src/controllers/tasksController');

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

describe('TasksController', () => {

  // テストグループ: getAllTasks
  describe('getAllTasks', () => {
    
    test('タスク一覧を正常に返すこと', () => {
      const req = mockRequest();
      const res = mockResponse();

      tasksController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          count: expect.any(Number)
        })
      );
    });

    test('countが配列の長さと一致すること', () => {
      const req = mockRequest();
      const res = mockResponse();

      tasksController.getAllTasks(req, res);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.count).toBe(callArgs.data.length);
    });
  });

  // テストグループ: getTaskById
  describe('getTaskById', () => {
    
    test('存在するIDでタスクを返すこと', () => {
      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1
          })
        })
      );
    });

    test('存在しないIDで404エラーを返すこと', () => {
      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('不正なID形式で404エラーを返すこと', () => {
      const req = mockRequest({ id: 'invalid' });
      const res = mockResponse();

      tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });
  });

  // テストグループ: createTask
  describe('createTask', () => {
    
    test('有効なデータでタスクを作成できること', () => {
      const req = mockRequest({}, {
        title: 'テストタスク',
        description: 'テスト用の説明'
      });
      const res = mockResponse();

      tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: 'テストタスク',
            description: 'テスト用の説明',
            status: 'pending',
            id: expect.any(Number),
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        })
      );
    });

    test('titleのみでタスクを作成できること', () => {
      const req = mockRequest({}, { title: 'タイトルのみ' });
      const res = mockResponse();

      tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data.title).toBe('タイトルのみ');
      expect(callArgs.data.description).toBe('');
    });

    test('titleが未指定で400エラーを返すこと', () => {
      const req = mockRequest({}, { description: '説明のみ' });
      const res = mockResponse();

      tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title is required'
      });
    });

    test('空のtitleで400エラーを返すこと', () => {
      const req = mockRequest({}, { title: '', description: 'テスト' });
      const res = mockResponse();

      tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title is required'
      });
    });

    test('新しいタスクのIDが既存の最大ID+1であること', () => {
      const req = mockRequest({}, { title: 'ID確認テスト' });
      const res = mockResponse();

      tasksController.createTask(req, res);

      const callArgs = res.json.mock.calls[0][0];
      // 初期データが2件（ID: 1, 2）なので、新しいIDは3以上になる
      expect(callArgs.data.id).toBeGreaterThanOrEqual(3);
    });
  });

  // テストグループ: updateTask
  describe('updateTask', () => {
    
    test('存在するタスクを更新できること', () => {
      const req = mockRequest({ id: '1' }, {
        title: '更新されたタイトル',
        status: 'completed'
      });
      const res = mockResponse();

      tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            title: '更新されたタイトル',
            status: 'completed'
          })
        })
      );
    });

    test('存在しないタスクの更新で404エラーを返すこと', () => {
      const req = mockRequest({ id: '999' }, { title: '存在しない' });
      const res = mockResponse();

      tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('空のボディでも正常に処理されること', () => {
      const req = mockRequest({ id: '1' }, {});
      const res = mockResponse();

      tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1
          })
        })
      );
    });

    test('updated_atが更新されること', () => {
      const req = mockRequest({ id: '1' }, { title: '更新テスト' });
      const res = mockResponse();

      tasksController.updateTask(req, res);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data.updated_at).toBeDefined();
      expect(typeof callArgs.data.updated_at).toBe('string');
    });
  });

  // テストグループ: deleteTask
  describe('deleteTask', () => {
    
    test('存在するタスクを削除できること', () => {
      // まず新しいタスクを作成
      const createReq = mockRequest({}, { title: '削除テスト' });
      const createRes = mockResponse();
      tasksController.createTask(createReq, createRes);
      
      const createdTaskId = createRes.json.mock.calls[0][0].data.id;

      // 作成したタスクを削除
      const deleteReq = mockRequest({ id: createdTaskId.toString() });
      const deleteRes = mockResponse();

      tasksController.deleteTask(deleteReq, deleteRes);

      expect(deleteRes.status).toHaveBeenCalledWith(200);
      expect(deleteRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: createdTaskId,
            title: '削除テスト'
          }),
          message: 'Task deleted successfully'
        })
      );
    });

    test('存在しないタスクの削除で404エラーを返すこと', () => {
      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      tasksController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });
  });
});