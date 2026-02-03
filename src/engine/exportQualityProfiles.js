/**
 * Export Quality Profiles
 * Different quality settings for different use cases
 */

export const EXPORT_QUALITY_PROFILES = {
  APPLE_LOSSLESS: {
    name: 'Apple Music Lossless',
    description: 'Apple Music Lossless-compatible: 24-bit/48kHz PCM WAV, true-peak ceiling -0.5 dBTP',
    settings: {
      targetLUFS: -9,
      truePeak: -0.5,
      sampleRate: 48000,
      bitDepth: 24,
      format: 'WAV',
      normalize: true,
      dither: true,
      lossless: true,
      note: 'ALAC conversion supported (Apple Music/iTunes)'
    },
    platforms: ['Apple Music Lossless', 'iTunes Store']
  },
  
  APPLE_HIRES: {
    name: 'Apple Music Hi-Res Lossless',
    description: 'Apple Music Hi-Res Lossless-compatible: 24-bit/96kHz PCM WAV',
    settings: {
      targetLUFS: -9,
      truePeak: -0.5,
      sampleRate: 96000,
      bitDepth: 24,
      format: 'WAV',
      normalize: true,
      dither: true,
      lossless: true,
      note: 'ALAC conversion supported (Apple Music/iTunes)'
    },
    platforms: ['Apple Music Hi-Res']
  },
  
  STREAMING: {
    name: 'Streaming Platforms',
    description: 'Optimized for Spotify, Apple Music, etc.',
    settings: {
      targetLUFS: -14,
      truePeak: -1.0,
      sampleRate: 44100,
      bitDepth: 16,
      mp3Bitrate: 320,
      normalize: true,
      dither: true
    },
    platforms: ['Spotify', 'Apple Music', 'Tidal', 'Amazon Music']
  },
  
  RADIO: {
    name: 'Radio Broadcast',
    description: 'Meets radio broadcast standards',
    settings: {
      targetLUFS: -9,
      truePeak: -0.5,
      sampleRate: 44100,
      bitDepth: 16,
      mp3Bitrate: 320,
      normalize: true,
      dither: true
    },
    platforms: ['Radio', 'Broadcast']
  },
  
  CLUB: {
    name: 'Club & Festival',
    description: 'Maximum loudness for club/festival playback',
    settings: {
      targetLUFS: -8.5,
      truePeak: -0.3,
      sampleRate: 48000,
      bitDepth: 24,
      mp3Bitrate: 320,
      normalize: false,
      dither: false
    },
    platforms: ['Club', 'Festival', 'Live Performance']
  },
  
  MASTER: {
    name: 'Master Quality',
    description: 'Highest quality for archiving and distribution',
    settings: {
      targetLUFS: -9,
      truePeak: -0.5,
      sampleRate: 96000,
      bitDepth: 32,
      format: 'WAV',
      mp3Bitrate: 320,
      normalize: true,
      dither: true,
      lossless: true
    },
    platforms: ['Master', 'Archive', 'Distribution']
  },
  
  SOCIAL: {
    name: 'Social Media',
    description: 'Optimized for Instagram, TikTok, YouTube',
    settings: {
      targetLUFS: -12,
      truePeak: -1.0,
      sampleRate: 44100,
      bitDepth: 16,
      mp3Bitrate: 256,
      normalize: true,
      dither: true
    },
    platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter']
  },
  
  DEMO: {
    name: 'Demo Quality',
    description: 'Fast export for previews and demos',
    settings: {
      targetLUFS: -14,
      truePeak: -1.0,
      sampleRate: 44100,
      bitDepth: 16,
      mp3Bitrate: 192,
      normalize: true,
      dither: false
    },
    platforms: ['Demo', 'Preview', 'Quick Share']
  }
};

/**
 * Get quality profile by name
 */
export function getQualityProfile(name) {
  return EXPORT_QUALITY_PROFILES[name.toUpperCase()] || EXPORT_QUALITY_PROFILES.STREAMING;
}

/**
 * Get all quality profiles
 */
export function getAllQualityProfiles() {
  return Object.values(EXPORT_QUALITY_PROFILES);
}
