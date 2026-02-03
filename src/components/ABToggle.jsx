import React from 'react';
import { Play, Pause } from 'lucide-react';

export default function ABToggle({ isOriginal, onToggle, isPlaying, onPlay, onPause }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => onToggle(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isOriginal
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Original
        </button>
        <button
          onClick={() => onToggle(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !isOriginal
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Preset
        </button>
      </div>
      
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
