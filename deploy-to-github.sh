#!/bin/bash

echo "🚀 GitHub Pages Deployment Script"
echo "=================================="
echo ""

# Open GitHub to create repository
echo "📋 Opening GitHub to create repository..."
echo ""
open "https://github.com/new"
echo ""
echo "Please create a repository with these settings:"
echo "  • Name: evomni-playground"
echo "  • Public (required for GitHub Pages)"
echo "  • Do NOT add README, .gitignore, or license"
echo ""
read -p "Press Enter after you've created the repository..."
echo ""

# Add remote origin
echo "📋 Linking to GitHub repository..."
git remote add origin https://github.com/frankhewitt/evomni-playground.git 2>/dev/null || git remote set-url origin https://github.com/frankhewitt/evomni-playground.git

# Push to main branch
echo ""
echo "📋 Pushing code to GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub."
    echo "   Make sure the repository was created successfully."
    echo "   You may need to authenticate with GitHub."
    exit 1
fi

echo "✅ Code pushed successfully!"

# Deploy to GitHub Pages
echo ""
echo "📋 Building and deploying to GitHub Pages..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your app should be available at:"
echo "   https://frankhewitt.github.io/evomni-playground"
echo ""
echo "📝 Note: It may take 1-2 minutes for GitHub Pages to build."
echo "📝 Check deployment status at:"
echo "   https://github.com/frankhewitt/evomni-playground/deployments"
