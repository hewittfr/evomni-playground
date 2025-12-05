#!/bin/bash

echo "🚀 GitHub Pages Deployment Script"
echo "=================================="
echo ""

# Ensure we're on the main branch
echo "📋 Ensuring we're on main branch..."
git checkout main

# Add and commit any changes
echo ""
echo "📋 Committing any pending changes..."
git add -A
git commit -m "Deploy updates to GitHub Pages" || echo "No changes to commit"

# Push to main branch
echo ""
echo "📋 Pushing code to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub."
    echo "   You may need to authenticate with GitHub."
    exit 1
fi

echo "✅ Code pushed successfully!"

# Build the app
echo ""
echo "📋 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Deploy to GitHub Pages
echo ""
echo "📋 Deploying to GitHub Pages..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your app should be available at:"
echo "   https://hewittfr.github.io/evomni-playground"
echo ""
echo "📝 Note: It may take 1-2 minutes for GitHub Pages to build."
echo "📝 Check deployment status at:"
echo "   https://github.com/hewittfr/evomni-playground/deployments"

