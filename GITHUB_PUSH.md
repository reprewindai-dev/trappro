# Push to GitHub - Git Bash Commands

## Quick Start

### 1. Open Git Bash
Navigate to your project folder in Git Bash:
`
`````git
### 2. Create GitHub Repository First
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `trap-master-pro` (or your preferred name)
4. **Don't** initialize with README
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/trap-master-pro.git`)

### 3. Add Remote and Push

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name:

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Complete Command Sequence

Copy and paste these commands one by one in Git Bash:

```bash
# Navigate to project
cd "/c/Users/antho/iCloudDrive/Carrousel app/Voloco tutorial/Complete apps_/trap-master-pro-private"

# Check status
git status

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## If You Get Authentication Errors

### Option 1: Use Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Option 2: Use GitHub CLI
```bash
# Install GitHub CLI (if not installed)
# Then authenticate
gh auth login

# Push
git push -u origin main
```

## Verify Push

After pushing, check your GitHub repository - you should see all 42 files!

## Tag Release (After Testing)

Once you've verified exports work:
```bash
git tag v1.0.0
git push origin v1.0.0
```
