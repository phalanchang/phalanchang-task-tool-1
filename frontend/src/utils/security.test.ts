/**
 * セキュリティユーティリティのテスト
 */

import {
  escapeHtml,
  containsHtmlTags,
  containsScriptTags,
  containsDangerousEvents,
  validateInputSecurity,
  sanitizeInput
} from './security';

describe('Security Utils', () => {
  describe('escapeHtml', () => {
    it('HTML特殊文字をエスケープする', () => {
      expect(escapeHtml('<div>test</div>')).toBe('&lt;div&gt;test&lt;/div&gt;');
      expect(escapeHtml('test & more')).toBe('test &amp; more');
      expect(escapeHtml('"quoted text"')).toBe('&quot;quoted text&quot;');
      expect(escapeHtml("'single quoted'")).toBe('&#x27;single quoted&#x27;');
    });

    it('通常のテキストはそのまま返す', () => {
      expect(escapeHtml('normal text')).toBe('normal text');
      expect(escapeHtml('123456')).toBe('123456');
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('containsHtmlTags', () => {
    it('HTMLタグを検出する', () => {
      expect(containsHtmlTags('<div>test</div>')).toBe(true);
      expect(containsHtmlTags('<script>alert("test")</script>')).toBe(true);
      expect(containsHtmlTags('<img src="test.jpg">')).toBe(true);
      expect(containsHtmlTags('text <span>with tags</span>')).toBe(true);
    });

    it('HTMLタグでないテキストは false を返す', () => {
      expect(containsHtmlTags('normal text')).toBe(false);
      expect(containsHtmlTags('text with < and > symbols')).toBe(false);
      expect(containsHtmlTags('math: 5 < 10 > 3')).toBe(false);
      expect(containsHtmlTags('')).toBe(false);
    });

    it('不完全なHTMLタグは検出しない', () => {
      expect(containsHtmlTags('<incomplete')).toBe(false);
      expect(containsHtmlTags('incomplete>')).toBe(false);
    });
  });

  describe('containsScriptTags', () => {
    it('スクリプトタグを検出する', () => {
      expect(containsScriptTags('<script>alert("test")</script>')).toBe(true);
      expect(containsScriptTags('<script src="malicious.js"></script>')).toBe(true);
      expect(containsScriptTags('<SCRIPT>alert("test")</SCRIPT>')).toBe(true);
      expect(containsScriptTags('text <script>evil()</script> text')).toBe(true);
    });

    it('スクリプトタグでないテキストは false を返す', () => {
      expect(containsScriptTags('normal text')).toBe(false);
      expect(containsScriptTags('<div>test</div>')).toBe(false);
      expect(containsScriptTags('script without tags')).toBe(false);
      expect(containsScriptTags('')).toBe(false);
    });

    it('不完全なスクリプトタグは検出しない', () => {
      expect(containsScriptTags('<script>incomplete')).toBe(false);
      expect(containsScriptTags('incomplete</script>')).toBe(false);
    });
  });

  describe('containsDangerousEvents', () => {
    it('危険なイベントハンドラーを検出する', () => {
      expect(containsDangerousEvents('onclick="alert()"')).toBe(true);
      expect(containsDangerousEvents('onload="malicious()"')).toBe(true);
      expect(containsDangerousEvents('onerror="hack()"')).toBe(true);
      expect(containsDangerousEvents('text onmouseover="evil()" text')).toBe(true);
      expect(containsDangerousEvents('ONCLICK="alert()"')).toBe(true);
    });

    it('危険なイベントがないテキストは false を返す', () => {
      expect(containsDangerousEvents('normal text')).toBe(false);
      expect(containsDangerousEvents('click here')).toBe(false);
      expect(containsDangerousEvents('on load complete')).toBe(false);
      expect(containsDangerousEvents('')).toBe(false);
    });
  });

  describe('validateInputSecurity', () => {
    it('安全な入力は valid を返す', () => {
      const result = validateInputSecurity('normal safe text');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('HTMLタグを含む入力は invalid を返す', () => {
      const result = validateInputSecurity('<div>test</div>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTMLタグは使用できません');
    });

    it('スクリプトタグを含む入力は invalid を返す', () => {
      const result = validateInputSecurity('<script>alert("test")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('不正なスクリプトが含まれています');
    });

    it('危険なイベントを含む入力は invalid を返す', () => {
      const result = validateInputSecurity('onclick="alert()"');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('危険なイベントハンドラーが含まれています');
    });

    it('複数の問題がある場合、全てのエラーを返す', () => {
      const result = validateInputSecurity('<script onclick="alert()">test</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('HTMLタグは使用できません');
      expect(result.errors).toContain('不正なスクリプトが含まれています');
      expect(result.errors).toContain('危険なイベントハンドラーが含まれています');
    });
  });

  describe('sanitizeInput', () => {
    it('HTMLタグを除去してエスケープする', () => {
      const input = '<div>test & more</div>';
      const result = sanitizeInput(input);
      
      // HTMLタグが除去され、特殊文字がエスケープされることを確認
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('</div>');
      expect(result).toContain('test');
      expect(result).toContain('&amp;');
    });

    it('スクリプトタグを除去する', () => {
      const input = '<script>alert("test")</script>safe text';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('safe text');
    });

    it('通常のテキストはエスケープのみ行う', () => {
      const input = 'normal text & symbols';
      const result = sanitizeInput(input);
      
      expect(result).toContain('normal text');
      expect(result).toContain('&amp;');
    });

    it('空文字列は空文字列を返す', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('ネストしたHTMLタグも正しく除去する', () => {
      const input = '<div><span onclick="alert()">test</span></div>';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<span>');
      expect(result).not.toContain('onclick');
      expect(result).toContain('test');
    });
  });

  describe('エッジケース', () => {
    it('非常に長い文字列を処理できる', () => {
      const longString = 'a'.repeat(10000);
      expect(() => escapeHtml(longString)).not.toThrow();
      expect(() => sanitizeInput(longString)).not.toThrow();
      expect(() => validateInputSecurity(longString)).not.toThrow();
    });

    it('特殊文字の組み合わせを処理できる', () => {
      const specialString = '&<>"\' onclick onerror';
      const result = sanitizeInput(specialString);
      
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('null や undefined に対して安全に動作する', () => {
      // TypeScriptでは型チェックにより防がれるが、
      // ランタイムでの安全性も確保
      expect(() => escapeHtml(null as any)).not.toThrow();
      expect(() => escapeHtml(undefined as any)).not.toThrow();
    });
  });
});