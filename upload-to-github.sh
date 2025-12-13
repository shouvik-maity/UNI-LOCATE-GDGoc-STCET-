#!/bin/bash

# UniLocate GitHub Upload Script
# This script automates the process of uploading your UniLocate project to GitHub

echo "🚀 Starting UniLocate GitHub Upload Process..."
echo "=============================================="

# Navigate to the project directory
cd /Users/shouvik/Cursor\ AI/UniLocate

echo "📁 Current directory: $(pwd)"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote origin already exists. Updating..."
    git remote set-url origin https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git
else
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-.git
fi

# Add all files
echo "📤 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Initial commit: Add UniLocate project with all features"
fi

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "=============================================="
echo "🎉 Upload complete! Check your repository at:"
echo "https://github.com/shouvik-maity/UNI-LOCATE-GDGoc-STCET-"
echo "=============================================="
