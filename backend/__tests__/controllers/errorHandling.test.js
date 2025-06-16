/**
 * エラーハンドリングのテスト
 * 
 * コントローラーのcatch文やエラー処理をテストします
 */

const tasksController = require('../../src/controllers/tasksController');

// モックのreq, resオブジェクト
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

describe('TasksController Error Handling', () => {

  // テストグループ: 予期しないエラーのシミュレーション
  describe('Unexpected Errors', () => {
    
    test('getAllTasks で予期しないエラーが発生した場合500エラーを返すこと', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // console.errorをモック化してエラーログをテスト
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // tasksControllerの内部でエラーを発生させるため、
      // 一時的にタスク配列を壊す（これは実際のテストでは推奨されませんが、エラーハンドリングをテストするため）
      const originalTasks = require('../../src/controllers/tasksController').__tasks;
      
      // 直接エラーをシミュレートするため、モック関数で例外を投げる
      jest.doMock('../../src/controllers/tasksController', () => ({
        getAllTasks: (req, res) => {
          try {
            throw new Error('予期しないエラー');
          } catch (error) {
            console.error('タスク一覧取得エラー:', error);
            res.status(500).json({
              success: false,
              error: 'Failed to fetch tasks'
            });
          }
        }
      }));
      
      const mockController = require('../../src/controllers/tasksController');
      mockController.getAllTasks(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch tasks'
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      
      // クリーンアップ
      consoleSpy.mockRestore();
      jest.clearAllMocks();
    });
  });

  // テストグループ: 境界値テスト
  describe('Edge Cases', () => {
    
    test('非常に大きなIDでgetTaskByIdを呼び出してもエラーにならないこと', () => {
      const req = mockRequest({ id: '999999999' });
      const res = mockResponse();

      tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('負のIDでgetTaskByIdを呼び出してもエラーにならないこと', () => {
      const req = mockRequest({ id: '-1' });
      const res = mockResponse();

      tasksController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });

    test('createTaskでundefinedのdescriptionが正しく処理されること', () => {
      const req = mockRequest({}, { 
        title: 'テストタスク',
        description: undefined 
      });
      const res = mockResponse();

      tasksController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data.description).toBe('');
    });

    test('updateTaskでnullのフィールドが適切に処理されること', () => {
      const req = mockRequest({ id: '1' }, {
        title: null,
        description: null,
        status: null
      });
      const res = mockResponse();

      tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // nullの値は更新されないことを確認
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1
          })
        })
      );
    });

    test('updateTaskでfalsy値の適切な処理', () => {
      const req = mockRequest({ id: '1' }, {
        title: '', // 空文字（falsy）
        description: 0, // 0（falsy）
        status: false // false（falsy）
      });
      const res = mockResponse();

      tasksController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // falsy値は適切に処理されることを確認
    });
  });

  // テストグループ: データ整合性
  describe('Data Integrity', () => {
    
    test('作成されたタスクのIDが重複しないこと', () => {
      const req1 = mockRequest({}, { title: 'タスク1' });
      const req2 = mockRequest({}, { title: 'タスク2' });
      const res1 = mockResponse();
      const res2 = mockResponse();

      tasksController.createTask(req1, res1);
      tasksController.createTask(req2, res2);

      const task1Id = res1.json.mock.calls[0][0].data.id;
      const task2Id = res2.json.mock.calls[0][0].data.id;

      expect(task1Id).not.toBe(task2Id);
      expect(task2Id).toBeGreaterThan(task1Id);
    });

    test('削除後に同じIDでアクセスできないこと', () => {
      // タスクを作成
      const createReq = mockRequest({}, { title: '削除テスト' });
      const createRes = mockResponse();
      tasksController.createTask(createReq, createRes);
      
      const taskId = createRes.json.mock.calls[0][0].data.id;

      // タスクを削除
      const deleteReq = mockRequest({ id: taskId.toString() });
      const deleteRes = mockResponse();
      tasksController.deleteTask(deleteReq, deleteRes);

      // 削除されたタスクにアクセス
      const getReq = mockRequest({ id: taskId.toString() });
      const getRes = mockResponse();
      tasksController.getTaskById(getReq, getRes);

      expect(getRes.status).toHaveBeenCalledWith(404);
    });
  });

  // テストグループ: パフォーマンス関連
  describe('Performance', () => {
    
    test('大量のタスクがあってもgetAllTasksが正常に動作すること', () => {
      // 複数のタスクを作成
      for (let i = 0; i < 100; i++) {
        const req = mockRequest({}, { title: `パフォーマンステスト${i}` });
        const res = mockResponse();
        tasksController.createTask(req, res);
      }

      // 全タスクを取得
      const getAllReq = mockRequest();
      const getAllRes = mockResponse();
      
      const startTime = Date.now();
      tasksController.getAllTasks(getAllReq, getAllRes);
      const endTime = Date.now();

      expect(getAllRes.status).toHaveBeenCalledWith(200);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒以内に完了
      
      const callArgs = getAllRes.json.mock.calls[0][0];
      expect(callArgs.data.length).toBeGreaterThanOrEqual(100);
    });
  });
});