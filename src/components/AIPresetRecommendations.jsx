import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function AIPresetRecommendations({ recommendations, onSelect }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-300">AI Recommendations</h3>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Based on your audio analysis, these presets are recommended:
      </p>
      
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => onSelect(rec.preset.id)}
            className="w-full text-left p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{rec.preset.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {Math.round(rec.score)}% match
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {rec.preset.description}
                </div>
                <div className="text-xs text-purple-300">
                  {rec.reason}
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
