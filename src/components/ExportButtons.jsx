import React, { useState } from 'react';
import { Download, Loader2, Music } from 'lucide-react';

export default function ExportButtons({ onExportWAV, onExportMP3, onExportAppleLossless, disabled }) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const handleExportWAV = async () => {
    setExporting(true);
    setExportType('wav');
    try {
      await onExportWAV();
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const handleExportMP3 = async () => {
    setExporting(true);
    setExportType('mp3');
    try {
      await onExportMP3();
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const handleExportAppleLossless = async () => {
    setExporting(true);
    setExportType('alac');
    try {
      await onExportAppleLossless();
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportAppleLossless}
          disabled={disabled || exporting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
        >
          {exporting && exportType === 'alac' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Music className="w-5 h-5" />
          )}
          Apple Music Lossless
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">24-bit/48kHz</span>
        </button>
        
        <button
          onClick={handleExportWAV}
          disabled={disabled || exporting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting && exportType === 'wav' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Export WAV
        </button>
        
        <button
          onClick={handleExportMP3}
          disabled={disabled || exporting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting && exportType === 'mp3' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Export MP3
      </button>
      </div>
      
      {exportType === 'alac' && (
        <div className="text-xs text-gray-400 bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 space-y-1">
          <div>
            <strong className="text-purple-300">Apple Music Lossless-Compatible:</strong> 24-bit/48kHz PCM WAV with -0.5 dBTP ceiling (conservative true-peak estimate). ALAC conversion supported via Apple Music/iTunes.
          </div>
          <div className="text-gray-500 italic">
            No official Apple certification claimed.
          </div>
        </div>
      )}
    </div>
  );
}
