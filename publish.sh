#!/bin/bash

# Build and publish script for vibecurb
# Requires manual 2FA entry

echo "🔨 Building vibecurb..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "📦 Publishing to NPM..."
echo "⚠️  You will be prompted for 2FA code"
npm publish --access public

echo "✅ Done!"
