#!/bin/bash

# Static export build script for deployment
echo "🚀 Building for static export..."

# Backup original config
cp next.config.mjs next.config.mjs.backup

# Use export config
cp next.config.export.mjs next.config.mjs

# Build
next build

# Restore original config
cp next.config.mjs.backup next.config.mjs
rm next.config.mjs.backup

echo "✅ Static export build complete! Check the /out folder."