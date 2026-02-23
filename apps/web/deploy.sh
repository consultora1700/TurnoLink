#!/bin/bash

# TurnoLink Web Deploy Script
# This script builds the Next.js app and copies static files for standalone mode

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "TurnoLink Web - Deploy Script"
echo "=========================================="

# Step 1: Build
echo ""
echo "[1/4] Building Next.js application..."
npm run build

# Step 2: Copy static files to standalone
echo ""
echo "[2/4] Copying static files to standalone..."
STANDALONE_DIR=".next/standalone/apps/web"

if [ -d "$STANDALONE_DIR" ]; then
    # Copy .next/static
    cp -r .next/static "$STANDALONE_DIR/.next/static"
    echo "  ✓ Copied .next/static"

    # Copy public folder
    cp -r public "$STANDALONE_DIR/public"
    echo "  ✓ Copied public folder"
else
    echo "  ⚠ Standalone directory not found. Skipping static file copy."
    echo "  (This is normal if output is not set to 'standalone')"
fi

# Step 3: Restart PM2
echo ""
echo "[3/4] Restarting PM2 service..."
pm2 restart web --update-env

# Step 4: Verify
echo ""
echo "[4/4] Verifying deployment..."
sleep 3

# Check if CSS loads
CSS_FILE=$(curl -s http://localhost:3000 2>/dev/null | grep -o '_next/static/css/[^"]*\.css' | head -1)
if [ -n "$CSS_FILE" ]; then
    STATUS=$(curl -sI "http://localhost:3000/$CSS_FILE" 2>/dev/null | head -1 | grep -o "200 OK" || echo "FAILED")
    if [ "$STATUS" = "200 OK" ]; then
        echo "  ✓ CSS file loads correctly"
    else
        echo "  ✗ CSS file not loading! Check deployment."
        exit 1
    fi
else
    echo "  ⚠ Could not verify CSS (no CSS reference found in HTML)"
fi

echo ""
echo "=========================================="
echo "Deploy completed successfully!"
echo "=========================================="
