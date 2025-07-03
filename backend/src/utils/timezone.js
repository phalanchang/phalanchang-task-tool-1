/**
 * タイムゾーン関連のユーティリティ関数
 * 
 * 日本時間（JST）での日付・時刻操作を提供します。
 * サーバーの時刻設定に依存せず、正確な日本時間を取得できます。
 */

/**
 * 日本時間（JST）での現在の日付を取得
 * @returns {string} YYYY-MM-DD形式の日本時間での今日の日付
 */
function getJSTDate() {
  const now = new Date();
  
  // 日本時間（UTC+9）での日付文字列を取得
  const jstDateString = now.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // YYYY/MM/DD → YYYY-MM-DD に変換
  return jstDateString.replace(/\//g, '-');
}

/**
 * 日本時間（JST）での現在の日時を取得
 * @returns {string} 日本時間での現在の日時文字列
 */
function getJSTDateTime() {
  const now = new Date();
  
  return now.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 日本時間（JST）での現在時刻を取得
 * @returns {string} HH:MM:SS形式の日本時間での現在時刻
 */
function getJSTTime() {
  const now = new Date();
  
  return now.toLocaleTimeString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 指定した日付が日本時間での今日かどうかを判定
 * @param {string} dateString - 判定する日付（YYYY-MM-DD形式）
 * @returns {boolean} 日本時間での今日の場合true
 */
function isJSTToday(dateString) {
  const todayJST = getJSTDate();
  return dateString === todayJST;
}

/**
 * 日本時間での指定日付の開始時刻（00:00:00）を取得
 * @param {string} dateString - 日付（YYYY-MM-DD形式）
 * @returns {Date} 日本時間での指定日付の00:00:00のDateオブジェクト
 */
function getJSTDateStart(dateString) {
  // 日本時間での指定日付の00:00:00を作成
  const [year, month, day] = dateString.split('-');
  const dateInJST = new Date(`${year}-${month}-${day}T00:00:00+09:00`);
  return dateInJST;
}

/**
 * 日本時間での日付文字列を UTC Dateオブジェクトに変換
 * @param {string} jstDateString - 日本時間での日付（YYYY-MM-DD形式）
 * @param {string} [time='00:00:00'] - 時刻（HH:MM:SS形式、デフォルトは00:00:00）
 * @returns {Date} UTC基準のDateオブジェクト
 */
function jstDateToUTC(jstDateString, time = '00:00:00') {
  const dateTimeString = `${jstDateString}T${time}+09:00`;
  return new Date(dateTimeString);
}

/**
 * UTC Dateオブジェクトを日本時間での日付文字列に変換
 * @param {Date} utcDate - UTC基準のDateオブジェクト
 * @returns {string} YYYY-MM-DD形式の日本時間での日付
 */
function utcDateToJST(utcDate) {
  return utcDate.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

/**
 * デバッグ用：現在の時刻情報を取得
 * @returns {Object} 各種時刻情報を含むオブジェクト
 */
function getTimeDebugInfo() {
  const now = new Date();
  
  return {
    utc: {
      date: now.toISOString().split('T')[0],
      time: now.toISOString().split('T')[1].split('.')[0],
      full: now.toISOString()
    },
    jst: {
      date: getJSTDate(),
      time: getJSTTime(),
      dateTime: getJSTDateTime()
    },
    serverLocal: {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      dateTime: now.toLocaleString()
    },
    timezone: {
      offset: now.getTimezoneOffset(),
      offsetHours: now.getTimezoneOffset() / 60
    }
  };
}

module.exports = {
  getJSTDate,
  getJSTDateTime,
  getJSTTime,
  isJSTToday,
  getJSTDateStart,
  jstDateToUTC,
  utcDateToJST,
  getTimeDebugInfo
};