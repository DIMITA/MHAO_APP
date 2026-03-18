#!/bin/bash
# Download Poppins fonts from Google Fonts
# Run from mobile/ directory: bash scripts/setup_fonts.sh

FONTS_DIR="assets/fonts"
BASE_URL="https://github.com/google/fonts/raw/main/ofl/poppins"

echo "Downloading Poppins fonts..."

curl -L "$BASE_URL/Poppins-Regular.ttf" -o "$FONTS_DIR/Poppins-Regular.ttf"
curl -L "$BASE_URL/Poppins-Medium.ttf" -o "$FONTS_DIR/Poppins-Medium.ttf"
curl -L "$BASE_URL/Poppins-SemiBold.ttf" -o "$FONTS_DIR/Poppins-SemiBold.ttf"
curl -L "$BASE_URL/Poppins-Bold.ttf" -o "$FONTS_DIR/Poppins-Bold.ttf"

echo "Done! Fonts saved to $FONTS_DIR/"
