const express = require('express');
const router = express.Router();
const { createPool } = require('../../database/config');
const { getJSTDate, utcDateToJST } = require('../utils/timezone');

// データベース接続プールを作成
const pool = createPool();

// 日付をMySQLフォーマットに変換するヘルパー関数
function formatDateForMySQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// GET /api/daily-task-stats
router.get('/', async (req, res) => {
  try {
    const today = getJSTDate();
    const now = new Date();
    
    // 日本時間での現在の日時を取得
    const jstNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    
    // 今週の開始日（月曜日）と終了日（日曜日）を計算
    const currentDay = jstNow.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(jstNow);
    weekStart.setDate(jstNow.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 先週の開始日と終了日
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekEnd);
    lastWeekEnd.setDate(weekEnd.getDate() - 7);
    
    // 1. 今日の統計情報を取得
    const todayStatsQuery = `
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END) as earnedPoints
      FROM tasks
      WHERE is_recurring = TRUE
        AND DATE(created_at) = ?
    `;
    
    const [todayStats] = await pool.execute(todayStatsQuery, [today]);
    const todayData = {
      totalTasks: todayStats[0].totalTasks || 0,
      completedTasks: todayStats[0].completedTasks || 0,
      incompleteTasks: (todayStats[0].totalTasks || 0) - (todayStats[0].completedTasks || 0),
      completionRate: todayStats[0].totalTasks > 0 
        ? Math.round((todayStats[0].completedTasks / todayStats[0].totalTasks) * 100)
        : 0,
      earnedPoints: todayStats[0].earnedPoints || 0
    };
    
    // 2. 今週の統計情報を取得
    const weekStatsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END) as points
      FROM tasks
      WHERE is_recurring = TRUE
        AND created_at >= ? AND created_at <= ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const [weekStats] = await pool.execute(weekStatsQuery, [
      formatDateForMySQL(weekStart),
      formatDateForMySQL(weekEnd)
    ]);
    
    // 日別データを整形
    const dailyBreakdown = [];
    let totalWeekTasks = 0;
    let completedWeekTasks = 0;
    let weekPoints = 0;
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = formatDateForMySQL(currentDate).split(' ')[0];
      
      const dayData = weekStats.find(stat => stat.date === dateStr);
      dailyBreakdown.push({
        date: dateStr,
        completed: dayData ? dayData.completed : 0,
        total: dayData ? dayData.total : 0
      });
      
      if (dayData) {
        totalWeekTasks += dayData.total;
        completedWeekTasks += dayData.completed;
        weekPoints += dayData.points || 0;
      }
    }
    
    const thisWeekData = {
      totalTasks: totalWeekTasks,
      completedTasks: completedWeekTasks,
      completionRate: totalWeekTasks > 0 
        ? Math.round((completedWeekTasks / totalWeekTasks) * 100)
        : 0,
      dailyBreakdown,
      earnedPoints: weekPoints
    };
    
    // 3. 先週の統計情報を取得
    const lastWeekStatsQuery = `
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END) as earnedPoints
      FROM tasks
      WHERE is_recurring = TRUE
        AND created_at >= ? AND created_at <= ?
    `;
    
    const [lastWeekStats] = await pool.execute(lastWeekStatsQuery, [
      formatDateForMySQL(lastWeekStart),
      formatDateForMySQL(lastWeekEnd)
    ]);
    
    const lastWeekData = {
      completionRate: lastWeekStats[0].totalTasks > 0 
        ? Math.round((lastWeekStats[0].completedTasks / lastWeekStats[0].totalTasks) * 100)
        : 0,
      earnedPoints: lastWeekStats[0].earnedPoints || 0
    };
    
    // 4. タスク別の統計情報を取得
    const taskBreakdownQuery = `
      SELECT 
        t.source_task_id as taskId,
        rt.title,
        COUNT(t.id) as totalAttempts,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedAttempts,
        GROUP_CONCAT(
          CASE 
            WHEN DATE(t.created_at) >= DATE_SUB(?, INTERVAL 6 DAY) 
            THEN CONCAT(DATE(t.created_at), ':', t.status)
            ELSE NULL
          END
          ORDER BY t.created_at
          SEPARATOR ','
        ) as recentHistory
      FROM tasks t
      JOIN tasks rt ON t.source_task_id = rt.id
      WHERE t.is_recurring = TRUE
        AND t.source_task_id IS NOT NULL
        AND t.created_at >= DATE_SUB(?, INTERVAL 30 DAY)
      GROUP BY t.source_task_id, rt.title
      ORDER BY completedAttempts / totalAttempts DESC
    `;
    
    const [taskBreakdown] = await pool.execute(taskBreakdownQuery, [today, today]);
    
    // タスク別データを整形
    const taskBreakdownFormatted = taskBreakdown.map(task => {
      const successRate = task.totalAttempts > 0 
        ? Math.round((task.completedAttempts / task.totalAttempts) * 100)
        : 0;
      
      // 過去7日間の実行履歴を作成
      const lastSevenDays = [];
      const historyMap = new Map();
      
      if (task.recentHistory) {
        task.recentHistory.split(',').forEach(entry => {
          if (entry) {
            const [date, status] = entry.split(':');
            historyMap.set(date, status === 'completed');
          }
        });
      }
      
      // 過去7日間の配列を作成
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(jstNow);
        checkDate.setDate(jstNow.getDate() - i);
        const dateStr = formatDateForMySQL(checkDate).split(' ')[0];
        lastSevenDays.push(historyMap.get(dateStr) || false);
      }
      
      // 連続実行日数（ストリーク）を計算
      let streak = 0;
      for (let i = lastSevenDays.length - 1; i >= 0; i--) {
        if (lastSevenDays[i]) {
          streak++;
        } else {
          break;
        }
      }
      
      return {
        taskId: task.taskId,
        title: task.title,
        successRate,
        streak,
        lastSevenDays
      };
    });
    
    // レスポンスを返す
    res.status(200).json({
      today: todayData,
      thisWeek: thisWeekData,
      lastWeek: lastWeekData,
      taskBreakdown: taskBreakdownFormatted
    });
    
  } catch (error) {
    console.error('Error fetching daily task stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch daily task statistics'
    });
  }
});

module.exports = router;