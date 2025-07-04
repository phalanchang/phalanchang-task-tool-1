import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'medium' 
}) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // モーダル表示時は背景スクロールを防ぐ
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            <button 
              className="modal-close-btn"
              onClick={onClose}
              aria-label="モーダルを閉じる"
            >
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;