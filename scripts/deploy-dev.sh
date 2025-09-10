#!/bin/bash

# MIA React App - Development Deployment Script
# This script builds and deploys the app to Cloudflare Pages dev environment

set -e

echo "🚀 Starting MIA React App deployment to dev environment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is authenticated
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please authenticate with Cloudflare:"
    wrangler login
fi

# Build the project
echo "📦 Building the project..."
npm run build

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=miawapp

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at: https://dev.animacionesmia.com"
echo "📊 Check deployment status at: https://dash.cloudflare.com"
