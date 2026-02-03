# Deployment Guide - TrapMasterPro

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub/GitLab/Bitbucket repository (or direct Vercel CLI)

### Deployment Steps

#### Option 1: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click "Deploy"

#### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Vercel Configuration

The project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- SPA rewrites for client-side routing

### Environment Variables

No environment variables required for basic deployment.

### Post-Deployment Verification

1. **Test Export Functionality:**
   - Load an audio file
   - Select a preset
   - Export Apple Music Lossless format
   - Verify file downloads correctly

2. **Run CLI Validation:**
   - Download exported file
   - Run ffprobe check (see REFERENCE_TEST.md)
   - Run ffmpeg ebur128 check (see REFERENCE_TEST.md)

3. **Check Console:**
   - Open browser DevTools
   - Verify export validation logs appear
   - Check for any errors

## Release Tagging

After reference test passes:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This prevents regression by marking a known-good version.

## Monitoring

- Check Vercel deployment logs for build errors
- Monitor browser console for runtime errors
- Track export validation results in REFERENCE_TEST.md
