const app = require('./app');
const DailyTaskScheduler = require('./scheduler');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  
  // デイリータスク自動更新スケジューラーを開始
  // テスト環境ではスケジューラーを無効化
  if (process.env.NODE_ENV !== 'test') {
    console.log('');
    console.log('📅 デイリータスク自動更新機能を初期化中...');
    
    try {
      DailyTaskScheduler.start();
      console.log('✅ デイリータスク自動更新機能が正常に開始されました');
    } catch (error) {
      console.error('❌ デイリータスク自動更新機能の開始に失敗しました:', error);
    }
  } else {
    console.log('🧪 テスト環境のため、デイリータスク自動更新機能はスキップされました');
  }
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM信号を受信しました。サーバーを安全にシャットダウンします...');
  
  // スケジューラーを停止
  try {
    DailyTaskScheduler.stop();
    console.log('✅ デイリータスクスケジューラーが停止されました');
  } catch (error) {
    console.error('❌ デイリータスクスケジューラーの停止に失敗しました:', error);
  }
  
  console.log('👋 サーバーが正常にシャットダウンされました');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT信号を受信しました。サーバーを安全にシャットダウンします...');
  
  // スケジューラーを停止
  try {
    DailyTaskScheduler.stop();
    console.log('✅ デイリータスクスケジューラーが停止されました');
  } catch (error) {
    console.error('❌ デイリータスクスケジューラーの停止に失敗しました:', error);
  }
  
  console.log('👋 サーバーが正常にシャットダウンされました');
  process.exit(0);
});