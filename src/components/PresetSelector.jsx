import React from 'react';
import { Music, Play } from 'lucide-react';

export default function PresetSelector({ 
  presets, 
  selectedPreset, 
  onSelect, 
  presetIntents,
  isPlaying,
  onPreview 
}) {
  const handlePresetClick = (preset) => {
    onSelect(preset);
    // Auto-preview when clicking a preset
    if (onPreview) {
      onPreview(preset);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Presets</h2>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Live Preview</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`group text-left p-4 rounded-lg border transition-all relative ${
              selectedPreset === preset
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-white mb-1">{preset}</div>
                <div className="text-xs text-gray-400">
                  {presetIntents[preset] || 'Adaptive mastering preset'}
                </div>
              </div>
              {selectedPreset === preset && (
                <Play className="w-4 h-4 text-purple-400 ml-2 flex-shrink-0" />
              )}
            </div>
            {selectedPreset === preset && (
              <div className="mt-2 pt-2 border-t border-purple-500/20">
                <div className="text-xs text-purple-300">
                  Click to preview • Switch presets in real-time
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
