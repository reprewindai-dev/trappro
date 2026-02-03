# TrapMasterPro

Professional mastering engine for Trap-Soul, Hip-Hop, Trap, and R&B genres.

## 🎯 Overview

TrapMasterPro is a premium web-based mastering application with real-time preview and professional export capabilities. Built specifically for Trap-Soul, Hip-Hop, Trap, and R&B culture.

## ✨ Key Features

### Real-Time Processing
- **Instant Preset Switching** - Change presets during playback with zero latency
- **Simultaneous Playback** - Hear original and processed audio at the same time
- **Volume Mixer** - Adjust balance between original/processed (0-100% each)
- **Live Waveform** - Real-time visualization during playback

### 32 Adaptive Presets (5 Categories)

#### Creative (6 presets)
- BigCappo (Signature) - Advanced pitch correction for emotional trap-soul vocals
- Vintage Warmth - Analog warmth and vintage character
- Lo-Fi Character - Lo-fi aesthetic with vintage vibe
- Neo Soul - Smooth, soulful character
- Dark Trap - Dark, aggressive trap character
- Smooth R&B - Silky smooth R&B character

#### Genre (6 presets)
- Trap-Soul - Optimized for trap-soul fusion
- Modern Trap - Contemporary trap mastering
- Classic Hip-Hop - 90s hip-hop character
- Contemporary R&B - Modern R&B mastering
- Afrobeat Fusion - Enhanced rhythm and percussion
- Drill - UK/US Drill mastering

#### Stereo (6 presets)
- Wide & Spacious - Maximum stereo width
- Focus Center - Narrow, centered imaging
- Immersive - 3D immersive soundstage
- Mono Optimized - Perfect mono compatibility
- Wide Vocals - Wide vocal imaging
- Tight Rhythm - Tight, focused rhythm section

#### Frequency (8 presets)
- De-Harsh - Remove harsh frequencies
- Mud Remover - Clean low-mid mud
- Bass Tamer - Control and stabilize bass
- Vocal Forward - Bring vocals forward
- Modern Bright - Enhance high frequencies
- Smooth Mids - Smooth midrange
- Bass Boost - Enhanced low-end
- Vocal Clarity - Enhance vocal clarity

#### Loudness (6 presets)
- Maximum Impact - Maximum loudness and punch
- Festival Banger - Festival-ready loudness
- Streaming Optimized - Streaming platform optimization
- Radio Ready - Radio broadcast standard
- Dynamic & Clear - Preserve dynamics
- Competitive Loud - Competitive loudness

### Advanced Features

#### BigCappo Preset - Advanced Pitch Correction
- **Autocorrelation-based pitch detection** - More accurate than zero-crossing
- **Adaptive correction** - Helps when off-key (25 cent threshold)
- **Formant preservation** - Keeps natural vocal character
- **Smooth transitions** - No robotic artifacts
- **Real-time processing** - Works during live preview

#### AI Preset Recommender
- Analyzes audio characteristics
- Recommends top 5 presets
- Explains why each preset is recommended
- Problem-based preset search

#### Stem-Aware Detection
- Detects if audio is stems vs full mix
- Provides intelligent hints
- Warns when stems detected
- Recommends appropriate presets

#### Export System

**Apple Music Lossless-Compatible Export:**
- 24-bit/48kHz PCM WAV
- True-peak ceiling -0.5 dBTP (conservative estimate)
- Professional dithering when reducing bit depth
- Export validation (sample rate, bit depth, peak, true-peak, LUFS)
- ALAC conversion supported via Apple Music/iTunes
- No official Apple certification claimed

**Other Export Formats:**
- WAV (16/24/32-bit options)
- MP3 (320 kbps)
- Export quality profiles (6 profiles)

#### Mobile Optimization
- Automatic device detection
- Performance mode detection (high/medium/low)
- Optimized buffer sizes per device
- Adaptive processing complexity

#### Export Monetization
- Free tier: 3 exports per day
- Pay-per-export option (ready)
- Premium unlock support
- Usage tracking

## 🏗️ Architecture

### Engine Modules (13 files)
- `audioEngine.js` - Main audio engine
- `audioAnalysis.js` - Global audio analysis
- `dspModules.js` - Core DSP modules
- `presets.js` - Preset implementations
- `presetCategories.js` - Preset organization
- `realtimeProcessor.js` - Real-time processing
- `advancedPitchCorrector.js` - Pitch correction
- `professionalDSP.js` - Professional-grade DSP
- `losslessProcessor.js` - Lossless processing
- `aiPresetRecommender.js` - AI recommendations
- `stemAwareDetector.js` - Stem detection
- `exportMonetization.js` - Export limits
- `mobileOptimizer.js` - Mobile optimization
- `exportValidator.js` - Export validation

### UI Components (10 files)
- `App.jsx` - Main application
- `FileUpload.jsx` - File upload
- `PresetSelector.jsx` - Preset selection
- `LoudnessMeter.jsx` - LUFS meter
- `VolumeMixer.jsx` - Volume mixing
- `ABToggle.jsx` - A/B comparison
- `WaveformVisualizer.jsx` - Waveform display
- `ExportButtons.jsx` - Export options
- `AIPresetRecommendations.jsx` - AI recommendations UI
- `StemAwareHint.jsx` - Stem detection warnings
- `ExportValidationPanel.jsx` - Export validation display

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📦 Deployment

### Vercel Deployment

1. **Via Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Import Git repository
   - Vercel auto-detects Vite settings
   - Click Deploy

2. **Via CLI:**
   ```bash
   npm i -g vercel
   vercel
   ```

### Configuration
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

## ✅ Verification

After deployment, verify exports with CLI tools:

### File Header Check
```bash
ffprobe -hide_banner -show_streams -select_streams a:0 "export.wav"
```

**Expected:**
- `sample_rate=48000`
- `bits_per_sample=24`

### True Peak Check
```bash
ffmpeg -hide_banner -i "export.wav" -filter_complex ebur128=peak=true -f null -
```

**Expected:**
- True peak ≤ -0.5 dBTP

See `REFERENCE_TEST.md` for detailed verification procedures.

## 📋 Technical Specifications

### Audio Processing
- **Sample Rates:** 44.1kHz, 48kHz, 96kHz support
- **Bit Depths:** 16-bit, 24-bit, 32-bit float
- **Channels:** Mono, Stereo
- **Processing:** Lossless 32-bit float throughout

### DSP Algorithms
- Multiband compressor (4-band)
- Intelligent dynamic EQ
- True peak limiter (conservative estimate)
- Advanced stereo enhancer
- Intelligent bass processor
- Professional dithering (TPDF)

### Analysis Capabilities
- Integrated & short-term LUFS
- Dynamic range & crest factor
- Spectral balance (low/mid/high)
- Vocal dominance (1-4 kHz)
- Harshness detection (2.5-6 kHz)
- Mud detection (150-350 Hz)
- Bass stability (30-120 Hz)
- Stereo correlation & mono safety

## 📝 Marketing Claims (Canonical)

**Apple Music Lossless-Compatible Export:**
"24-bit/48kHz PCM WAV with a -0.5 dBTP ceiling (conservative true-peak estimate). ALAC conversion supported via Apple Music/iTunes. Includes professional dithering when reducing bit depth and export validation (sample rate, bit depth, peak/true-peak estimate, LUFS). No official Apple certification claimed."

## 🎨 UI Features

- Modern, minimal design
- Real-time feedback
- Live preview indicators
- Export validation display
- AI recommendation cards
- Stem detection warnings

## 🔧 Dependencies

- React 18.3.1
- Vite 5.4.11
- Tailwind CSS 3.4.17
- Lucide React (icons)
- lamejs (MP3 encoding)

## 📄 Documentation

- `EXPORT_SPECS.md` - Export specifications and marketing claims
- `REFERENCE_TEST.md` - Verification procedures and test results
- `DEPLOYMENT.md` - Deployment guide
- `SHIP_CHECKLIST.md` - Pre-launch checklist

## 🎯 Unique Differentiators

1. First mastering engine built specifically for Trap-Soul/Hip-Hop culture
2. AI-powered preset recommendations
3. Stem-aware detection with intelligent hints
4. Real-time preset switching during playback
5. Simultaneous original + processed playback
6. Advanced pitch correction (BigCappo preset)
7. Mobile-optimized processing
8. Apple Music Lossless-compatible exports
9. Pay-per-export monetization ready

## 📊 Project Structure

```
trap-master-pro-private/
├── src/
│   ├── engine/          (13 modules)
│   ├── components/      (11 React components)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── package.json
└── Documentation files
```

## 🚢 Version

**v1.0.0** - Production Ready

## 📞 Support

For issues or questions, refer to:
- `EXPORT_SPECS.md` for export specifications
- `REFERENCE_TEST.md` for verification
- `DEPLOYMENT.md` for deployment help

---

**Built with ❤️ for Trap-Soul, Hip-Hop, Trap, and R&B artists**
