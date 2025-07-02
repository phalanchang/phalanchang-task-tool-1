import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { RecurringTaskFormData, RecurringTask } from './TaskList';
import { validateInputSecurity, sanitizeInput } from '../utils/security';
import './RecurringTaskForm.css';

interface RecurringTaskFormProps {
  onSubmit: (data: RecurringTaskFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  editingTask?: RecurringTask | null; // 編集対象のタスク（編集モード時）
  mode?: 'create' | 'edit'; // フォームモード
}

const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({ 
  onSubmit, 
  onCancel, 
  loading = false,
  editingTask = null,
  mode = 'create'
}) => {
  
  /**
   * Escapeキーでフォームをキャンセル
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, loading]);
  // 編集モード時は既存データで初期化 - useCallbackでメモ化
  const getInitialFormData = useCallback((): RecurringTaskFormData => {
    if (mode === 'edit' && editingTask) {
      return {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        time: editingTask.recurring_config?.time || '09:00',
        display_order: editingTask.display_order || 1,
        points: editingTask.points || 0
      };
    }
    return {
      title: '',
      description: '',
      priority: 'medium',
      time: '09:00',
      display_order: 1,
      points: 0
    };
  }, [mode, editingTask]);

  const [formData, setFormData] = useState<RecurringTaskFormData>(() => getInitialFormData());

  // 編集対象が変更された時にフォームデータを更新
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [getInitialFormData]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  /**
   * フォームバリデーション（セキュリティチェック含む）
   */
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // タイトルバリデーション
    if (!formData.title.trim()) {
      newErrors.title = 'タスク名は必須です';
    } else if (formData.title.length > 255) {
      newErrors.title = 'タスク名は255文字以内で入力してください';
    } else {
      // セキュリティチェック
      const titleSecurity = validateInputSecurity(formData.title);
      if (!titleSecurity.isValid) {
        newErrors.title = titleSecurity.errors[0];
      }
    }

    // 説明バリデーション（オプション）
    if (formData.description.length > 1000) {
      newErrors.description = '説明は1000文字以内で入力してください';
    } else if (formData.description.trim()) {
      // 説明が入力されている場合のセキュリティチェック
      const descriptionSecurity = validateInputSecurity(formData.description);
      if (!descriptionSecurity.isValid) {
        newErrors.description = descriptionSecurity.errors[0];
      }
    }

    // 時間バリデーション（より柔軟に）
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.time)) {
      newErrors.time = '正しい時間形式（例：09:30）で入力してください';
    } else {
      // 時間の範囲チェック
      const [hours, minutes] = formData.time.split(':').map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        newErrors.time = '有効な時間を入力してください（00:00-23:59）';
      }
    }

    // 表示順番バリデーション
    if (formData.display_order !== undefined) {
      if (formData.display_order < 1 || formData.display_order > 999) {
        newErrors.display_order = '表示順番は1から999の間で入力してください';
      }
    }

    // ポイントバリデーション
    if (formData.points !== undefined) {
      if (formData.points < 0 || formData.points > 1000) {
        newErrors.points = 'ポイントは0から1000の間で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信処理（サニタイゼーション含む）
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // サニタイズされたデータを送信
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description)
      };
      
      // デバッグログ: フォーム送信時のデータ確認
      console.log('RecurringTaskForm - handleSubmit:', sanitizedData);
      console.log('RecurringTaskForm - ポイント値:', sanitizedData.points, 'タイプ:', typeof sanitizedData.points);
      
      onSubmit(sanitizedData);
    }
  };

  /**
   * 入力値変更処理 - useCallbackでパフォーマンス最適化
   */
  const handleInputChange = useCallback((field: keyof RecurringTaskFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // エラーをクリア
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  /**
   * 優先度ラベル取得
   */
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high': return '🔴 高優先度';
      case 'medium': return '🟡 中優先度';
      case 'low': return '🟢 低優先度';
      default: return '🟡 中優先度';
    }
  };

  /**
   * 時間選択肢生成（30分刻み） - メモ化でパフォーマンス最適化
   */
  const generateTimeOptions = useMemo((): string[] => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  }, []);

  return (
    <div className="recurring-task-form">
      <form onSubmit={handleSubmit}>
        <h3 id="modal-title">
          {mode === 'edit' ? '✏️ 繰り返しタスクを編集' : '🔄 新しい繰り返しタスクを作成'}
        </h3>
        <p id="modal-description" className="form-description">
          {mode === 'edit' 
            ? '繰り返しタスクの設定を変更します。変更後は新しい設定でタスクが生成されます。'
            : '毎日実行する新しいタスクを作成します。設定した時刻に実行予定のタスクが自動生成されます。'}
        </p>

        <div className="form-grid">
          {/* タスク名 */}
          <div className="form-group form-group--full-width">
            <label htmlFor="task-title" className="form-label">
              📝 タスク名 <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例: 朝の運動、メール確認、日報作成"
              maxLength={255}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : "title-help"}
              autoFocus
            />
            {errors.title && (
              <div id="title-error" className="error-text" role="alert">
                {errors.title}
              </div>
            )}
            <div id="title-help" className="help-text">
              毎日繰り返すタスクの名前を入力してください
            </div>
          </div>

          {/* 説明 */}
          <div className="form-group form-group--full-width">
            <label htmlFor="task-description" className="form-label">
              📄 説明
            </label>
            <textarea
              id="task-description"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="タスクの詳細説明（オプション）"
              rows={3}
              maxLength={1000}
              disabled={loading}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : "description-help"}
            />
            {errors.description && (
              <div id="description-error" className="error-text" role="alert">
                {errors.description}
              </div>
            )}
            <div id="description-help" className="help-text">
              タスクの詳細や注意事項を記載できます（任意）
            </div>
            <div className="char-count">
              {formData.description.length}/1000
            </div>
          </div>

          {/* 優先度 */}
          <div className="form-group">
            <label className="form-label">⭐ 優先度</label>
            <fieldset className="priority-fieldset">
              <legend className="priority-legend">優先度を選択してください</legend>
              <div className="priority-options" role="radiogroup" aria-labelledby="priority-legend">
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <label key={priority} className="priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      disabled={loading}
                      aria-describedby="priority-help"
                    />
                    <span className="priority-label">
                      {getPriorityLabel(priority)}
                    </span>
                  </label>
                ))}
              </div>
              <div id="priority-help" className="help-text">
                タスクの重要度を設定します
              </div>
            </fieldset>
          </div>

          {/* 実行時刻 */}
          <div className="form-group">
            <label htmlFor="task-time" className="form-label">
              🕐 実行時刻
            </label>
            <select
              id="task-time"
              className={`form-select ${errors.time ? 'error' : ''}`}
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.time}
              aria-describedby={errors.time ? "time-error" : "time-help"}
            >
              {generateTimeOptions.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.time && (
              <div id="time-error" className="error-text" role="alert">
                {errors.time}
              </div>
            )}
            <div id="time-help" className="help-text">
              設定した時刻に毎日のタスクが自動生成されます
            </div>
          </div>

          {/* 表示順番 */}
          <div className="form-group">
            <label htmlFor="task-display-order" className="form-label">
              🔢 表示順番
            </label>
            <input
              id="task-display-order"
              type="number"
              min="1"
              max="999"
              className={`form-input ${errors.display_order ? 'error' : ''}`}
              value={formData.display_order || 1}
              onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 1)}
              disabled={loading}
              aria-invalid={!!errors.display_order}
              aria-describedby={errors.display_order ? "display-order-error" : "display-order-help"}
            />
            {errors.display_order && (
              <div id="display-order-error" className="error-text" role="alert">
                {errors.display_order}
              </div>
            )}
            <div id="display-order-help" className="help-text">
              デイリータスク画面での表示順番（1から999まで。小さい数字が上に表示されます）
            </div>
          </div>

          {/* ポイント */}
          <div className="form-group">
            <label htmlFor="task-points" className="form-label">
              💎 ポイント
            </label>
            <input
              id="task-points"
              type="number"
              min="0"
              max="1000"
              className={`form-input ${errors.points ? 'error' : ''}`}
              value={formData.points || 0}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === '' ? 0 : parseInt(value);
                console.log('ポイント入力値変更:', value, '->', numValue);
                handleInputChange('points', numValue);
              }}
              disabled={loading}
              aria-invalid={!!errors.points}
              aria-describedby={errors.points ? "points-error" : "points-help"}
            />
            {errors.points && (
              <div id="points-error" className="error-text" role="alert">
                {errors.points}
              </div>
            )}
            <div id="points-help" className="help-text">
              タスク完了時に獲得できるポイント（0から1000まで。時間・難易度・重要度を考慮して設定）
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="form-preview">
          <h4>📋 プレビュー</h4>
          <div className="preview-card">
            <div className="preview-title">
              {formData.title || 'タスク名'}
            </div>
            <div className="preview-schedule">
              🕐 毎日 {formData.time}
            </div>
            <div className="preview-priority">
              {getPriorityLabel(formData.priority)}
            </div>
            <div className="preview-points">
              💎 {formData.points || 0} ポイント
            </div>
            <div className="preview-display-order">
              🔢 表示順番: {formData.display_order || 1}
            </div>
            {formData.description && (
              <div className="preview-description">
                {formData.description}
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            aria-label="フォームをキャンセルして閉じる"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.title.trim()}
            aria-label={loading 
              ? (mode === 'edit' ? "繰り返しタスクを更新中" : "繰り返しタスクを作成中") 
              : (mode === 'edit' ? "繰り返しタスクを更新する" : "繰り返しタスクを作成する")}
          >
            {loading ? (
              <span aria-live="polite">
                {mode === 'edit' ? '更新中...' : '作成中...'}
              </span>
            ) : (
              <span>
                {mode === 'edit' ? '💾 更新する' : '✨ 作成する'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringTaskForm;