# TrapMasterPro Export Specifications

## Accurate Marketing Claims

### Apple Music Lossless-Compatible Export
**Claim:** "Apple Music Lossless-compatible export preset: 24-bit/48kHz PCM WAV, true-peak ceiling -0.5 dBTP. ALAC conversion supported (Apple Music/iTunes)."

**What it actually does:**
- Exports 24-bit PCM WAV at 48kHz sample rate
- Applies true-peak limiting targeting -0.5 dBTP ceiling (conservative true-peak estimate, not full ITU-R BS.1770-grade)
- Applies TPDF dithering when reducing from float32 to 24-bit
- Uses high-quality sample rate conversion (custom when needed)
- Validates export specs and logs measurements (sample rate, bit depth, peak, true-peak estimate, LUFS)
- Optional loudness target (-9 LUFS) for competitive masters (preset feature, not Apple compatibility requirement)

**What it doesn't do:**
- Does not create ALAC files directly (exports WAV that can be converted)
- Does not have official Apple certification
- True peak detection is simplified (conservative estimate, not full ITU-R BS.1770-grade true peak)
- Does not claim windowed sinc/Blackman windowing in marketing (engineering detail only)

## Export Formats

### 1. Apple Music Lossless-Compatible
- **Format:** PCM WAV
- **Sample Rate:** 48,000 Hz
- **Bit Depth:** 24-bit
- **True Peak Ceiling:** -0.5 dBTP
- **Dithering:** TPDF (when reducing from float32)
- **Normalization:** Optional (target LUFS: -9)

### 2. WAV Export
- **Bit Depths:** 16-bit, 24-bit, 32-bit float
- **Sample Rate:** Preserves original or converts if specified
- **Dithering:** Applied only when reducing bit depth (float32 → 24-bit or 16-bit)
- **True Peak Limiting:** Optional (when ceiling specified)

### 3. MP3 Export
- **Bitrate:** 320 kbps
- **Processing:** Lossless processing before encoding
- **Dithering:** Applied before encoding

## Validation & Logging

The export system includes validation that logs:
- Sample rate
- Bit depth (always float32 in processing, converted on export)
- Peak level (dBFS)
- True peak level (dBTP) - simplified measurement
- LUFS measurement
- Warnings/errors if specs don't match targets

## Technical Implementation Notes

### Sample Rate Conversion
- High-quality sample rate conversion (custom when needed)
- Engineering detail: Uses windowed sinc interpolation with Blackman windowing
- Custom implementation (not browser default)
- Filter length: 64 samples
- **Marketing-safe:** "High-quality sample rate conversion (custom when needed)"

### Dithering
- TPDF (Triangular Probability Density Function)
- Only applied when reducing bit depth (float32 → integer)
- Not applied when staying in float32

### True Peak Limiting
- Simplified true peak detection using interpolation
- Not full 4x oversampling + reconstruction filter
- Conservative approach with safety margin

## Verification Checklist

To verify exports meet specifications:

1. **File Spec Check:**
   - Open exported WAV in audio editor
   - Verify: 48,000 Hz sample rate
   - Verify: 24-bit PCM (not 32-bit float)

2. **True Peak Check:**
   - Run exported file through true-peak meter
   - Verify: Max true peak ≤ -0.5 dBTP

3. **Dither Check:**
   - Dither should only appear when reducing bit depth
   - No dither in 32-bit float exports

## Marketing Language (DO NOT USE)

❌ "Apple Music Lossless certified"
❌ "Meets Apple Music Lossless requirements"
❌ "4x oversampling true-peak detection" (unless fully implemented)
❌ "Windowed sinc interpolation / Blackman windowing" (marketing - use engineering doc only)
❌ "ITU-R BS.1770-grade true peak" (unless fully implemented)
❌ "Apple Music compatibility" for LUFS normalization (it's a preset feature)

## Marketing Language (USE THIS - Canonical Version)

✅ "Apple Music Lossless-compatible export preset: 24-bit/48kHz PCM WAV with a -0.5 dBTP ceiling (conservative true-peak estimate)"
✅ "ALAC conversion supported via Apple Music/iTunes"
✅ "Professional dithering when reducing bit depth"
✅ "High-quality sample rate conversion (custom when needed)"
✅ "Export validation (sample rate, bit depth, peak/true-peak estimate, LUFS)"
✅ "No official Apple certification claimed"
✅ "Optional loudness target for competitive masters" (for LUFS normalization)
