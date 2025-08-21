import React from 'react';
import { XIcon } from 'lucide-react';

export  function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md md:max-w-lg bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-4 border-t border-gray-200">{footer}</div>}
      </div>
    </div>
  );
}