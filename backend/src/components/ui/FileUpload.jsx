import React, { useState, useRef } from 'react';
import { UploadIcon } from 'lucide-react';

export  function FileUpload({ onFileChange, previewUrl, accept = 'image/*', className = '' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(previewUrl || null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type && file.type.startsWith('image/')) {
        setPreviewFromFile(file);
        if (onFileChange) onFileChange(file);
      }
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreviewFromFile(file);
      if (onFileChange) onFileChange(file);
    }
  };
  const setPreviewFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className={`${className}`}>
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="mx-auto h-48 object-contain" />
            <p className="mt-2 text-sm text-gray-500">Click or drag to replace image</p>
          </div>
        ) : (
          <div className="py-4">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">Drag and drop an image here, or click to select</p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
    </div>
  );
}