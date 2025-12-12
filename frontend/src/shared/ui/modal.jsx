import React, { useEffect } from 'react';
import { cn } from '../../core/utils/utils';

const Modal = ({ isOpen, onClose, children, className }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl",
        className
      )}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
    {children}
  </div>
);

const ModalTitle = ({ children, className }) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h3>
);

const ModalBody = ({ children, className }) => (
  <div className={cn("px-6 py-4", className)}>
    {children}
  </div>
);

const ModalFooter = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-t border-gray-200 flex justify-end space-x-2", className)}>
    {children}
  </div>
);

const ModalCloseButton = ({ onClose, className }) => (
  <button
    onClick={onClose}
    className={cn(
      "absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors",
      className
    )}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

export { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalCloseButton };