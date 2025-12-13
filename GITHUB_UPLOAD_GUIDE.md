# Complete Guide: Adding UniLocate Files to GitHub Repository

## Prerequisites
- Git installed on your computer
- GitHub account
- Access to the repository: https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git

## Step-by-Step Process

### Step 1: Open Terminal/Command Prompt
1. Open Terminal (on Mac) or Command Prompt (on Windows)
2. Navigate to your UniLocate project folder:
   ```bash
   cd /Users/shouvik/Cursor\ AI/UniLocate
   ```

### Step 2: Check Git Status
1. Check if git is already initialized:
   ```bash
   git status
   ```

### Step 3: Initialize Git Repository (if not already done)
If you see "fatal: not a git repository", initialize git:
```bash
git init
```

### Step 4: Configure Git (if first time)
Set your name and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 5: Add GitHub Repository as Remote
```bash
git remote add origin https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git
```

### Step 6: Create .gitignore File (Important!)
Create a .gitignore file to exclude sensitive files:
```bash
touch .gitignore
```

Add this content to .gitignore:
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Local development
.env.local
.env.*.local
```

### Step 7: Add All Files to Git
```bash
git add .
```

### Step 8: Check What Will Be Committed
```bash
git status
```

### Step 9: Commit Your Changes
```bash
git commit -m "Initial commit: Add UniLocate project with all features"
```

### Step 10: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Alternative Method: Using GitHub Desktop (Easier for Beginners)

### If you prefer a visual interface:

1. **Download GitHub Desktop** from https://desktop.github.com/

2. **Sign in** to your GitHub account

3. **Add your repository:**
   - Click "Clone a repository from the Internet"
   - Enter the repository URL: `https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git`
   - Choose local path: `/Users/shouvik/Cursor AI/UniLocate`

4. **Add files:**
   - Copy all your UniLocate files to the cloned repository folder
   - GitHub Desktop will automatically detect the changes

5. **Commit and push:**
   - Add a commit message: "Initial commit: Add UniLocate project"
   - Click "Commit to main"
   - Click "Push origin"

## Troubleshooting Common Issues

### Issue 1: "Authentication failed"
**Solution:**
- Use GitHub Personal Access Token instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Generate new token with repo permissions
- Use token as password when prompted

### Issue 2: "Repository not found"
**Solution:**
- Verify the repository URL is correct
- Ensure you have access to the repository
- Check if the repository exists and is not private (or you have access)

### Issue 3: "LF will be replaced by CRLF"
**Solution:**
This is just a warning and can be ignored, or run:
```bash
git config --global core.autocrlf false
```

## Important Files to Include

Make sure these important files are included:
- `package.json` - Project dependencies
- `README.md` - Project documentation
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- Source code in `app/`, `components/`, `lib/`, `models/`, `api/` folders

## Files to Exclude (Don't commit)

- `node_modules/` folder (too large)
- `.env` files (contain sensitive information)
- `.next/` folder (build output)
- `.DS_Store` files (system files)

## Quick Commands Summary

```bash
# Navigate to project
cd /Users/shouvik/Cursor\ AI/UniLocate

# Initialize git (if not done)
git init

# Add remote repository
git remote add origin https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Add UniLocate project"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Verification

After pushing, visit your GitHub repository:
`https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-`

You should see all your UniLocate files uploaded successfully!

---

**Need Help?** If you encounter any issues, please let me know which step you're having trouble with.
