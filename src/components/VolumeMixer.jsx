import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function VolumeMixer({ originalVolume, processedVolume, onOriginalChange, onProcessedChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Volume Mix</span>
      </div>
      
      <div className="space-y-3">
        {/* Original Volume */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Original</span>
            <span className="text-xs text-gray-500">{Math.round(originalVolume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={originalVolume}
              onChange={(e) => onOriginalChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <Volume2 className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        
        {/* Processed Volume */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Processed</span>
            <span className="text-xs text-gray-500">{Math.round(processedVolume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={processedVolume}
              onChange={(e) => onProcessedChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <Volume2 className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Quick Mix Presets */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => {
            onOriginalChange(1);
            onProcessedChange(0);
          }}
          className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          Original Only
        </button>
        <button
          onClick={() => {
            onOriginalChange(0.5);
            onProcessedChange(0.5);
          }}
          className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          Both 50/50
        </button>
        <button
          onClick={() => {
            onOriginalChange(0);
            onProcessedChange(1);
          }}
          className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          Processed Only
        </button>
      </div>
    </div>
  );
}
