import React from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ onFileSelect, disabled }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        disabled
          ? 'border-gray-700 bg-gray-900/50 cursor-not-allowed'
          : 'border-gray-600 bg-gray-900/30 hover:border-gray-500 cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="audio-upload"
      />
      <label
        htmlFor="audio-upload"
        className={`flex flex-col items-center gap-3 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <Upload
          className={`w-12 h-12 ${
            disabled ? 'text-gray-700' : 'text-gray-400'
          }`}
        />
        <div>
          <p className={`text-lg font-medium ${
            disabled ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Drop audio file here or click to browse
          </p>
          <p className={`text-sm mt-1 ${
            disabled ? 'text-gray-800' : 'text-gray-500'
          }`}>
            Supports WAV, MP3, M4A, and other audio formats
          </p>
        </div>
      </label>
    </div>
  );
}
