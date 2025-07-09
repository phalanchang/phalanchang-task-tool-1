/**
 * セキュリティ関連のユーティリティ関数
 */

/**
 * HTMLエスケープ処理
 * XSS攻撃を防ぐためにHTMLの特殊文字をエスケープする
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * HTMLタグの存在をチェック
 */
export const containsHtmlTags = (text: string): boolean => {
  const htmlTagRegex = /<[^>]*>/g;
  return htmlTagRegex.test(text);
};

/**
 * スクリプトタグの存在をチェック
 */
export const containsScriptTags = (text: string): boolean => {
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return scriptRegex.test(text);
};

/**
 * 危険なJavaScriptイベントハンドラーをチェック
 */
export const containsDangerousEvents = (text: string): boolean => {
  const dangerousEvents = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onkeypress', 'onkeydown', 'onkeyup'
  ];
  
  const eventRegex = new RegExp(`\\b(${dangerousEvents.join('|')})\\s*=`, 'gi');
  return eventRegex.test(text);
};

/**
 * 入力値の包括的なセキュリティチェック
 */
export const validateInputSecurity = (text: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (containsHtmlTags(text)) {
    errors.push('HTMLタグは使用できません');
  }
  
  if (containsScriptTags(text)) {
    errors.push('不正なスクリプトが含まれています');
  }
  
  if (containsDangerousEvents(text)) {
    errors.push('危険なイベントハンドラーが含まれています');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 安全な文字列のサニタイゼーション
 * HTMLタグを除去し、安全な文字列に変換
 */
export const sanitizeInput = (text: string): string => {
  // HTMLタグを除去
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // 特殊文字をエスケープ
  return escapeHtml(withoutTags);
};