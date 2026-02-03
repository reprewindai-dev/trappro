import React from 'react';
import { Download, Radio, Music, Volume2, Share2, Zap } from 'lucide-react';

const icons = {
  STREAMING: Music,
  RADIO: Radio,
  CLUB: Volume2,
  MASTER: Download,
  SOCIAL: Share2,
  DEMO: Zap
};

export default function ExportQualitySelector({ selectedProfile, onSelect, profiles }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Export Quality</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {profiles.map((profile) => {
          const Icon = icons[profile.name.toUpperCase().split(' ')[0]] || Download;
          const isSelected = selectedProfile?.name === profile.name;
          
          return (
            <button
              key={profile.name}
              onClick={() => onSelect(profile)}
              className={`text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${
                  isSelected ? 'text-purple-400' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}>
                    {profile.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {profile.description}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.platforms.slice(0, 3).map((platform) => (
                      <span
                        key={platform}
                        className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedProfile && (
        <div className="p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400">
          <div className="grid grid-cols-2 gap-2">
            <div>Target LUFS: <span className="text-white">{selectedProfile.settings.targetLUFS} dB</span></div>
            <div>Sample Rate: <span className="text-white">{selectedProfile.settings.sampleRate} Hz</span></div>
            <div>Bit Depth: <span className="text-white">{selectedProfile.settings.bitDepth} bit</span></div>
            <div>MP3 Bitrate: <span className="text-white">{selectedProfile.settings.mp3Bitrate} kbps</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
