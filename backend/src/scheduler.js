/**
 * デイリータスク自動更新スケジューラー
 * 
 * 日本時間の00:00に自動的にデイリータスクを生成・更新します。
 * node-cronを使用して、タイムゾーンを考慮した正確なスケジューリングを実現します。
 */

const cron = require('node-cron');
const { Task } = require('./models/Task');
const { getJSTDate, getJSTDateTime, getTimeDebugInfo } = require('./utils/timezone');

/**
 * デイリータスクスケジューラークラス
 */
class DailyTaskScheduler {
  
  /**
   * スケジューラーのインスタンス
   * @private
   */
  static _schedulerTask = null;
  
  /**
   * スケジューラーが実行中かどうか
   * @private
   */
  static _isRunning = false;
  
  /**
   * デイリータスク自動生成スケジューラーを開始
   * 日本時間の00:00に実行されます
   */
  static start() {
    if (this._isRunning) {
      console.log('デイリータスク自動更新スケジューラーは既に実行中です');
      return;
    }
    
    try {
      // 日本時間の00:00に実行（Asia/Tokyoタイムゾーン指定）
      this._schedulerTask = cron.schedule('0 0 * * *', async () => {
        await this._executeScheduledTask();
      }, {
        scheduled: true,
        timezone: "Asia/Tokyo"
      });
      
      this._isRunning = true;
      
      const startTime = getJSTDateTime();
      console.log(`🕛 デイリータスク自動更新スケジューラーが開始されました (JST: ${startTime})`);
      console.log('📅 スケジュール: 毎日 00:00 (日本時間) に実行');
      
      // デバッグ用：現在の時刻情報を表示
      const timeDebug = getTimeDebugInfo();
      console.log('⏰ 現在の時刻情報:', timeDebug);
      
    } catch (error) {
      console.error('❌ デイリータスクスケジューラー開始エラー:', error);
      this._isRunning = false;
    }
  }
  
  /**
   * スケジューラーを停止
   */
  static stop() {
    if (!this._isRunning) {
      console.log('デイリータスク自動更新スケジューラーは実行されていません');
      return;
    }
    
    try {
      if (this._schedulerTask) {
        this._schedulerTask.stop();
        this._schedulerTask = null;
      }
      
      this._isRunning = false;
      
      const stopTime = getJSTDateTime();
      console.log(`🛑 デイリータスク自動更新スケジューラーが停止されました (JST: ${stopTime})`);
      
    } catch (error) {
      console.error('❌ デイリータスクスケジューラー停止エラー:', error);
    }
  }
  
  /**
   * スケジューラーの状態を取得
   * @returns {Object} スケジューラーの状態情報
   */
  static getStatus() {
    return {
      isRunning: this._isRunning,
      hasTask: this._schedulerTask !== null,
      currentJSTTime: getJSTDateTime(),
      nextExecutionJST: '毎日 00:00 (日本時間)',
      timeDebug: getTimeDebugInfo()
    };
  }
  
  /**
   * 手動でスケジューラータスクを実行（テスト用）
   * @returns {Promise<Object>} 実行結果
   */
  static async executeManually() {
    console.log('🔧 デイリータスク生成を手動実行します...');
    return await this._executeScheduledTask();
  }
  
  /**
   * スケジューラーによって実行される実際のタスク
   * @private
   * @returns {Promise<Object>} 実行結果
   */
  static async _executeScheduledTask() {
    const executionStartTime = getJSTDateTime();
    const targetDate = getJSTDate();
    
    console.log('');
    console.log('🚀 ================================');
    console.log('📅 デイリータスク自動生成を開始');
    console.log(`⏰ 実行時刻: ${executionStartTime} (JST)`);
    console.log(`📆 対象日: ${targetDate} (JST)`);
    console.log('🚀 ================================');
    
    try {
      // デイリータスクの生成
      const result = await Task.generateTasksForDate(targetDate);
      
      const executionEndTime = getJSTDateTime();
      
      console.log('✅ ================================');
      console.log('📅 デイリータスク自動生成が完了');
      console.log(`⏰ 完了時刻: ${executionEndTime} (JST)`);
      console.log(`📊 実行結果:`);
      console.log(`   - 生成されたタスク: ${result.generated}件`);
      console.log(`   - 既存タスク: ${result.existing}件`);
      console.log(`   - 合計タスク: ${result.total}件`);
      console.log('✅ ================================');
      console.log('');
      
      // 成功ログをファイルに記録する場合の準備
      const logData = {
        executionTime: executionStartTime,
        completionTime: executionEndTime,
        targetDate: targetDate,
        result: result,
        status: 'success'
      };
      
      return logData;
      
    } catch (error) {
      const executionEndTime = getJSTDateTime();
      
      console.error('❌ ================================');
      console.error('📅 デイリータスク自動生成でエラーが発生');
      console.error(`⏰ エラー発生時刻: ${executionEndTime} (JST)`);
      console.error(`🚫 エラー詳細:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.error('❌ ================================');
      console.error('');
      
      // エラーログをファイルに記録する場合の準備
      const errorLogData = {
        executionTime: executionStartTime,
        errorTime: executionEndTime,
        targetDate: targetDate,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        status: 'error'
      };
      
      // エラーがあってもスケジューラーは継続
      return errorLogData;
    }
  }
  
  /**
   * テスト用：次回実行時刻を短時間後に設定
   * 本番環境では使用しないでください
   * @param {number} minutesFromNow - 何分後に実行するか
   */
  static startTestMode(minutesFromNow = 1) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ テストモードは本番環境では使用できません');
      return;
    }
    
    if (this._isRunning) {
      this.stop();
    }
    
    // 指定分後に実行されるcron式を生成
    const now = new Date();
    const targetTime = new Date(now.getTime() + minutesFromNow * 60 * 1000);
    const cronExpression = `${targetTime.getMinutes()} ${targetTime.getHours()} * * *`;
    
    console.log(`🧪 テストモード: ${minutesFromNow}分後 (${targetTime.toLocaleString()}) に実行予定`);
    console.log(`🧪 Cron式: ${cronExpression}`);
    
    try {
      this._schedulerTask = cron.schedule(cronExpression, async () => {
        await this._executeScheduledTask();
        // テストモードでは1回のみ実行
        this.stop();
      }, {
        scheduled: true,
        timezone: "Asia/Tokyo"
      });
      
      this._isRunning = true;
      console.log('🧪 テストモードでスケジューラーが開始されました');
      
    } catch (error) {
      console.error('❌ テストモードスケジューラー開始エラー:', error);
      this._isRunning = false;
    }
  }
}

module.exports = DailyTaskScheduler;