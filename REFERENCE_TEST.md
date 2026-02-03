# Reference Test - Apple Music Lossless Export

## Purpose
This document tracks the baseline validation results for Apple Music Lossless-compatible exports to prevent regression.

## Test File
- **Source:** Use a standard test file (e.g., 44.1kHz/16-bit stereo WAV, 30 seconds)
- **Preset:** BigCappo (or any preset)
- **Export Format:** Apple Music Lossless-compatible

## CLI Verification Commands

### 1. File Header Check (Sample Rate + Bit Depth)

```bash
ffprobe -hide_banner -show_streams -select_streams a:0 "export.wav"
```

**Expected Output:**
```
sample_rate=48000
bits_per_sample=24
```

**Confirmation:**
- ✅ `sample_rate=48000`
- ✅ `bits_per_sample=24` (or equivalent PCM 24-bit reporting)

### 2. True Peak Estimate (External Sanity Check)

```bash
ffmpeg -hide_banner -i "export.wav" -filter_complex ebur128=peak=true -f null -
```

**Expected Output:**
```
[Parsed_ebur128_0 @ ...] Summary:
  Integrated loudness:
    I:         -9.2 LUFS
    Threshold: -23.0 LUFS
  Loudness range:
    LRA:       5.2 LU
    Threshold: -33.0 LUFS
    LRA low:   -15.0 LUFS
    LRA high:  -9.8 LUFS
  True peak:
    Peak:      -0.48 dBTP
```

**Confirmation:**
- ✅ Reported true peak ≤ -0.5 dBTP (or whatever safety margin expected)

## Expected Results (Baseline)

### File Specifications
- **Sample Rate:** 48,000 Hz
- **Bit Depth:** 24-bit PCM
- **Format:** WAV (RIFF)
- **Channels:** Stereo (2 channels)
- **Audio Format:** PCM (1)

### Audio Measurements
- **True Peak:** ≤ -0.5 dBTP (conservative estimate)
- **Peak:** ≤ -0.5 dBFS
- **LUFS:** ~-9 LUFS (varies by preset, optional target)

### Validation Checklist
- [ ] Sample rate matches: 48,000 Hz (verified via ffprobe)
- [ ] Bit depth: 24-bit PCM (verified via ffprobe)
- [ ] True peak ≤ -0.5 dBTP (verified via ffmpeg ebur128)
- [ ] No clipping (peak < 0 dBFS)
- [ ] Dithering applied (when reducing from float32)
- [ ] File size reasonable for duration

## Test Procedure

1. Load test audio file
2. Select preset (e.g., BigCappo)
3. Export using "Apple Music Lossless" option
4. Check console for validation results
5. Run CLI verification commands above
6. Verify exported file in audio editor
7. Compare results with baseline

## Logged Results Template

### Console Validation (In-App)
```
Export Validation Results:
Sample Rate: 48000 Hz ✓
Bit Depth: 24-bit ✓
Channels: 2 ✓
Duration: 30.00s ✓
Peak: -0.45 dBFS ✓
True Peak: -0.48 dBTP ✓ (conservative estimate)
LUFS: -9.2 LUFS ✓
Valid: ✓
```

### File Header Validation (ffprobe)
```
[STREAM]
sample_rate=48000
bits_per_sample=24
channels=2
codec_name=pcm_s24le
[/STREAM]
```

### True Peak Validation (ffmpeg ebur128)
```
True peak:
  Peak:      -0.48 dBTP
```

## Test Results Log

### Test Date: [DATE]
### Test File: [FILENAME]
### Preset Used: [PRESET NAME]

**ffprobe Results:**
```
[PASTE FFPROBE OUTPUT HERE]
```
- Sample Rate: [ ] Pass / [ ] Fail
- Bit Depth: [ ] Pass / [ ] Fail

**ffmpeg ebur128 Results:**
```
[PASTE FFMPEG OUTPUT HERE]
```
- True Peak: [ ] Pass / [ ] Fail (≤ -0.5 dBTP)

**Notes:**
- [Any observations or issues]

---

## Notes
- True peak measurement is a conservative estimate (not full ITU-R BS.1770)
- LUFS target (-9) is optional and preset-dependent
- Dithering only applies when reducing from float32 to 24-bit
- No official Apple certification claimed
- If CLI checks fail, adjust export implementation until they pass

## Regression Detection
If any of these values change significantly in future tests, investigate:
- Sample rate conversion issues
- Bit depth conversion problems
- True peak limiting not working
- Dithering not applied correctly
- WAV header encoding issues
