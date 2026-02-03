/**
 * TrapMasterPro Preset Categories
 * Organized by: Creative, Genre, Stereo, Frequency, Loudness
 * Each category contains multiple presets optimized for Trap-Soul, Hip-Hop, Trap, R&B
 */

export const PRESET_CATEGORIES = {
  CREATIVE: {
    name: 'Creative',
    description: 'Artistic character and vibe presets',
    presets: [
      {
        id: 'bigcappo',
        name: 'BigCappo',
        intent: 'Emotional trap-soul vocals, human and imperfect',
        description: 'Signature preset for expressive, slightly off-key vocals. Preserves emotion while subtle pitch correction.',
        loudnessTarget: -9,
        tags: ['vocal', 'emotional', 'trap-soul', 'signature']
      },
      {
        id: 'vintage-warmth',
        name: 'Vintage Warmth',
        intent: 'Analog warmth and vintage character',
        description: 'Adds tape saturation and analog warmth. Perfect for retro R&B and soulful hip-hop.',
        loudnessTarget: -9,
        tags: ['vintage', 'warm', 'analog', 'saturation']
      },
      {
        id: 'lo-fi-character',
        name: 'Lo-Fi Character',
        intent: 'Lo-fi aesthetic with vintage vibe',
        description: 'Adds lo-fi character with reduced highs and heavy compression. Great for chill trap and lo-fi hip-hop.',
        loudnessTarget: -9,
        tags: ['lo-fi', 'vintage', 'chill', 'aesthetic']
      },
      {
        id: 'neo-soul',
        name: 'Neo Soul',
        intent: 'Smooth, soulful character',
        description: 'Smooth compression and gentle saturation for neo-soul tracks. Maintains dynamics while adding character.',
        loudnessTarget: -9,
        tags: ['neo-soul', 'smooth', 'soulful', 'r&b']
      },
      {
        id: 'dark-trap',
        name: 'Dark Trap',
        intent: 'Dark, aggressive trap character',
        description: 'Enhanced low-end and aggressive compression for dark trap. Adds weight and intensity.',
        loudnessTarget: -8.5,
        tags: ['dark', 'aggressive', 'trap', 'heavy']
      },
      {
        id: 'smooth-rnb',
        name: 'Smooth R&B',
        intent: 'Silky smooth R&B character',
        description: 'Gentle processing for smooth R&B. Enhances vocals and maintains musicality.',
        loudnessTarget: -9,
        tags: ['r&b', 'smooth', 'vocal', 'musical']
      }
    ]
  },
  
  GENRE: {
    name: 'Genre',
    description: 'Genre-specific mastering presets',
    presets: [
      {
        id: 'trap-soul',
        name: 'Trap-Soul',
        intent: 'Optimized for trap-soul fusion',
        description: 'Balanced processing for trap-soul. Enhances both trap elements and soulful vocals.',
        loudnessTarget: -9,
        tags: ['trap-soul', 'balanced', 'fusion']
      },
      {
        id: 'modern-trap',
        name: 'Modern Trap',
        intent: 'Contemporary trap mastering',
        description: 'Loud, punchy mastering for modern trap. Maximum impact with controlled bass.',
        loudnessTarget: -8.5,
        tags: ['trap', 'modern', 'punchy', 'loud']
      },
      {
        id: 'classic-hiphop',
        name: 'Classic Hip-Hop',
        intent: '90s hip-hop character',
        description: 'Warm, punchy mastering reminiscent of 90s hip-hop. Great for boom-bap and classic styles.',
        loudnessTarget: -9,
        tags: ['hip-hop', 'classic', '90s', 'boom-bap']
      },
      {
        id: 'contemporary-rnb',
        name: 'Contemporary R&B',
        intent: 'Modern R&B mastering',
        description: 'Clean, polished mastering for contemporary R&B. Enhances vocals and maintains clarity.',
        loudnessTarget: -9,
        tags: ['r&b', 'contemporary', 'clean', 'polished']
      },
      {
        id: 'afrobeat-fusion',
        name: 'Afrobeat Fusion',
        intent: 'Afrobeat and trap fusion',
        description: 'Enhanced rhythm and percussion for Afrobeat-trap fusion. Maintains groove and energy.',
        loudnessTarget: -9,
        tags: ['afrobeat', 'fusion', 'rhythmic', 'groove']
      },
      {
        id: 'drill',
        name: 'Drill',
        intent: 'UK/US Drill mastering',
        description: 'Aggressive, dark mastering for drill. Heavy compression and enhanced low-end.',
        loudnessTarget: -8.5,
        tags: ['drill', 'aggressive', 'dark', 'uk-drill']
      }
    ]
  },
  
  STEREO: {
    name: 'Stereo',
    description: 'Stereo width and imaging presets',
    presets: [
      {
        id: 'wide-spacious',
        name: 'Wide & Spacious',
        intent: 'Maximum stereo width',
        description: 'Extreme stereo width for immersive sound. Mono-compatible bass.',
        loudnessTarget: -9,
        tags: ['wide', 'stereo', 'spacious', 'immersive']
      },
      {
        id: 'focus-center',
        name: 'Focus Center',
        intent: 'Narrow, centered imaging',
        description: 'Reduces width for focused, centered sound. Great for mono playback.',
        loudnessTarget: -9,
        tags: ['narrow', 'centered', 'mono', 'focused']
      },
      {
        id: 'immersive',
        name: 'Immersive',
        intent: '3D immersive soundstage',
        description: 'Creates immersive 3D soundstage. Enhanced depth and width.',
        loudnessTarget: -9,
        tags: ['immersive', '3d', 'depth', 'soundstage']
      },
      {
        id: 'mono-optimized',
        name: 'Mono Optimized',
        intent: 'Perfect mono compatibility',
        description: 'Optimized for mono playback. Ensures perfect translation to mono systems.',
        loudnessTarget: -9,
        tags: ['mono', 'compatibility', 'translation']
      },
      {
        id: 'wide-vocals',
        name: 'Wide Vocals',
        intent: 'Wide vocal imaging',
        description: 'Enhances vocal width while keeping rhythm tight. Perfect for vocal-forward tracks.',
        loudnessTarget: -9,
        tags: ['vocals', 'wide', 'vocal-forward']
      },
      {
        id: 'tight-rhythm',
        name: 'Tight Rhythm',
        intent: 'Tight, focused rhythm section',
        description: 'Keeps rhythm section tight and centered while allowing other elements width.',
        loudnessTarget: -9,
        tags: ['rhythm', 'tight', 'focused', 'centered']
      }
    ]
  },
  
  FREQUENCY: {
    name: 'Frequency',
    description: 'Frequency-specific correction presets',
    presets: [
      {
        id: 'de-harsh',
        name: 'De-Harsh',
        intent: 'Remove harsh frequencies',
        description: 'Intelligently removes harshness in 2.5-6kHz without dulling. Preserves clarity.',
        loudnessTarget: -9,
        tags: ['harshness', 'correction', 'clarity']
      },
      {
        id: 'mud-remover',
        name: 'Mud Remover',
        intent: 'Clean low-mid mud',
        description: 'Removes mud and boxiness in 150-350Hz. Cleans up low-mids without losing warmth.',
        loudnessTarget: -9,
        tags: ['mud', 'low-mid', 'clean', 'boxiness']
      },
      {
        id: 'bass-tamer',
        name: 'Bass Tamer',
        intent: 'Control and stabilize bass',
        description: 'Tames and stabilizes bass frequencies (30-120Hz). Ensures consistent low-end.',
        loudnessTarget: -9,
        tags: ['bass', 'low-end', 'control', 'stability']
      },
      {
        id: 'vocal-forward',
        name: 'Vocal Forward',
        intent: 'Bring vocals forward',
        description: 'Enhances vocal presence (1-4kHz) to bring vocals forward in the mix.',
        loudnessTarget: -9,
        tags: ['vocals', 'presence', 'forward', 'vocal-forward']
      },
      {
        id: 'modern-bright',
        name: 'Modern Bright',
        intent: 'Enhance high frequencies',
        description: 'Adds modern brightness and air. Enhances high frequencies for contemporary sound.',
        loudnessTarget: -9,
        tags: ['bright', 'highs', 'air', 'modern']
      },
      {
        id: 'smooth-mids',
        name: 'Smooth Mids',
        intent: 'Smooth midrange',
        description: 'Smooths out midrange frequencies. Reduces harshness and adds polish.',
        loudnessTarget: -9,
        tags: ['mids', 'smooth', 'polish', 'midrange']
      },
      {
        id: 'bass-boost',
        name: 'Bass Boost',
        intent: 'Enhanced low-end',
        description: 'Boosts and enhances bass frequencies. Adds weight and impact.',
        loudnessTarget: -9,
        tags: ['bass', 'boost', 'low-end', 'weight']
      },
      {
        id: 'vocal-clarity',
        name: 'Vocal Clarity',
        intent: 'Enhance vocal clarity',
        description: 'Enhances vocal clarity and intelligibility. Perfect for vocal-heavy tracks.',
        loudnessTarget: -9,
        tags: ['vocals', 'clarity', 'intelligibility', 'vocal-heavy']
      }
    ]
  },
  
  LOUDNESS: {
    name: 'Loudness',
    description: 'Loudness and impact presets',
    presets: [
      {
        id: 'maximum-impact',
        name: 'Maximum Impact',
        intent: 'Maximum loudness and punch',
        description: 'Aggressive processing for maximum loudness. Perfect for competitive loudness.',
        loudnessTarget: -8.5,
        tags: ['loud', 'impact', 'competitive', 'maximum']
      },
      {
        id: 'festival-banger',
        name: 'Festival Banger',
        intent: 'Festival-ready loudness',
        description: 'Optimized for festival and club playback. Maximum loudness with controlled bass.',
        loudnessTarget: -8.5,
        tags: ['festival', 'club', 'loud', 'banger']
      },
      {
        id: 'streaming-optimized',
        name: 'Streaming Optimized',
        intent: 'Streaming platform optimization',
        description: 'Optimized for streaming platforms. Balanced loudness with dynamic preservation.',
        loudnessTarget: -14,
        tags: ['streaming', 'platform', 'balanced', 'dynamic']
      },
      {
        id: 'radio-ready',
        name: 'Radio Ready',
        intent: 'Radio broadcast standard',
        description: 'Meets radio broadcast standards. Professional loudness with clarity.',
        loudnessTarget: -9,
        tags: ['radio', 'broadcast', 'professional', 'standard']
      },
      {
        id: 'dynamic-clear',
        name: 'Dynamic & Clear',
        intent: 'Preserve dynamics',
        description: 'Light processing that preserves dynamics. Great for musical content.',
        loudnessTarget: -10,
        tags: ['dynamic', 'clear', 'musical', 'preserve']
      },
      {
        id: 'competitive-loud',
        name: 'Competitive Loud',
        intent: 'Competitive loudness',
        description: 'Aggressive loudness for competitive releases. Maximum impact.',
        loudnessTarget: -8,
        tags: ['competitive', 'loud', 'impact', 'release']
      }
    ]
  }
};

/**
 * Get all presets flattened
 */
export function getAllPresets() {
  const allPresets = [];
  Object.values(PRESET_CATEGORIES).forEach(category => {
    category.presets.forEach(preset => {
      allPresets.push({
        ...preset,
        category: category.name,
        categoryId: category.name.toLowerCase().replace(' ', '-')
      });
    });
  });
  return allPresets;
}

/**
 * Get preset by ID
 */
export function getPresetById(id) {
  const allPresets = getAllPresets();
  return allPresets.find(p => p.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(categoryName) {
  const category = Object.values(PRESET_CATEGORIES).find(c => c.name === categoryName);
  return category ? category.presets : [];
}

/**
 * Get presets by tag
 */
export function getPresetsByTag(tag) {
  const allPresets = getAllPresets();
  return allPresets.filter(p => p.tags.includes(tag));
}
