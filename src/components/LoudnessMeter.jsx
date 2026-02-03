import React from 'react';
import { Volume2 } from 'lucide-react';

export default function LoudnessMeter({ lufs, label = 'LUFS' }) {
  // Normalize LUFS to 0-100 scale (-70 to 0 LUFS)
  const normalized = Math.max(0, Math.min(100, ((lufs + 70) / 70) * 100));
  
  // Color based on loudness
  const getColor = () => {
    if (lufs > -9) return 'bg-red-500';
    if (lufs > -12) return 'bg-yellow-500';
    if (lufs > -16) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-mono font-semibold ${
          lufs > -9 ? 'text-red-400' : 
          lufs > -12 ? 'text-yellow-400' : 
          lufs > -16 ? 'text-green-400' : 'text-blue-400'
        }`}>
          {lufs.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
