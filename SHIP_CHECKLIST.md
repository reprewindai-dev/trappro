# Ship Checklist - TrapMasterPro v1.0.0

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All linter errors resolved
- [x] Marketing language updated (no unsubstantiated claims)
- [x] Export validation implemented
- [x] File header validation added
- [x] True peak limiting implemented
- [x] Dithering only when reducing bit depth

### ✅ Documentation
- [x] EXPORT_SPECS.md updated with accurate claims
- [x] REFERENCE_TEST.md with CLI verification commands
- [x] DEPLOYMENT.md created
- [x] SHIP_CHECKLIST.md (this file)

### ✅ Vercel Configuration
- [x] vercel.json created
- [x] .vercelignore created
- [x] Build command: `npm run build`
- [x] Output directory: `dist`

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Option A: Via Dashboard
# 1. Go to vercel.com
# 2. Import Git repository
# 3. Vercel auto-detects Vite settings
# 4. Click Deploy

# Option B: Via CLI
npm i -g vercel
vercel
```

### 2. Post-Deployment Testing

#### Test Export Functionality
1. Load test audio file
2. Select preset (e.g., BigCappo)
3. Export "Apple Music Lossless"
4. Verify file downloads
5. Check console for validation logs

#### Run CLI Verification (Required)

**File Header Check:**
```bash
ffprobe -hide_banner -show_streams -select_streams a:0 "exported_file.wav"
```

**Expected:**
- `sample_rate=48000` ✓
- `bits_per_sample=24` ✓

**True Peak Check:**
```bash
ffmpeg -hide_banner -i "exported_file.wav" -filter_complex ebur128=peak=true -f null -
```

**Expected:**
- True peak ≤ -0.5 dBTP ✓

### 3. Document Results

Paste CLI results into `REFERENCE_TEST.md`:
- ffprobe output
- ffmpeg ebur128 output
- Pass/fail status for each check

### 4. Tag Release

Once CLI checks pass:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Marketing Claims (Use These Only)

✅ **Canonical Public-Facing Spec:**
"Apple Music Lossless-compatible export preset: 24-bit/48kHz PCM WAV with a -0.5 dBTP ceiling (conservative true-peak estimate). ALAC conversion supported via Apple Music/iTunes. Includes professional dithering when reducing bit depth and export validation (sample rate, bit depth, peak/true-peak estimate, LUFS). No official Apple certification claimed."

## What NOT to Claim

❌ "Apple Music Lossless certified"
❌ "Meets Apple Music Lossless requirements"
❌ "4x oversampling true-peak detection"
❌ "Windowed sinc interpolation" (in marketing)
❌ "ITU-R BS.1770-grade true peak"

## Success Criteria

- [ ] Vercel deployment successful
- [ ] Export functionality works
- [ ] File header validation passes (sample_rate=48000, bits_per_sample=24)
- [ ] True peak ≤ -0.5 dBTP (verified via ffmpeg)
- [ ] Console validation logs appear correctly
- [ ] Reference test results documented
- [ ] v1.0.0 tagged

## Post-Launch Monitoring

- Monitor Vercel deployment logs
- Check browser console for errors
- Track export validation results
- Update REFERENCE_TEST.md with any issues
