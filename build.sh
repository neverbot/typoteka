#!/bin/bash

# usage:
# ./build.sh <content-directory>
#
# <content-directory> must contain a typoteka.json file with:
# {
#   "title": "Book Title",
#   "files": {
#     "content": ["file1.md", "file2.md"],
#     "assets": ["images/*"]
#   },
#   "styles": {
#     "path": "../styles/test",
#     "fixes": {
#       "pandoc": ["fixes/pandoc/filter.lua"],
#       "pagedjs": ["fixes/pagedjs/handlers.js"]
#     }
#   }
# }

set -e  # Exit on any error

# Clean up content directory path to avoid double slashes
CONTENT_DIR="${1%/}"  # Remove trailing slash if present
CONFIG_FILE="$CONTENT_DIR/typoteka.json"
BUILD_DIR="build"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "error: jq is required but not installed. Please install it first:" >&2
    echo "  macOS: brew install jq" >&2
    echo "  Linux: sudo apt-get install jq" >&2
    exit 1
fi

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <content-directory>" >&2
    exit 1
fi

# Validation checks
if [ ! -d "$CONTENT_DIR" ]; then
    echo "error: Content directory '$CONTENT_DIR' does not exist" >&2
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "error: Config file '$CONFIG_FILE' not found" >&2
    exit 1
fi

## ************************************************************************
##  Reading info
## ************************************************************************

# Read configuration from JSON
echo "info: reading configuration from $CONFIG_FILE"

# Get styles directory
STYLES_PATH=$(jq -r '.styles.path // empty' "$CONFIG_FILE")
if [ -z "$STYLES_PATH" ]; then
    echo "error: styles.path not defined in $CONFIG_FILE" >&2
    exit 1
fi
STYLES_DIR="$CONTENT_DIR/$STYLES_PATH"

if [ ! -d "$STYLES_DIR" ]; then
    echo "error: Styles directory '$STYLES_DIR' does not exist" >&2
    exit 1
fi

STYLE_FILE="$STYLES_DIR/styles.css"
if [ ! -f "$STYLE_FILE" ]; then
    echo "error: Style file '$STYLE_FILE' not found" >&2
    exit 1
fi

BOOK_TITLE=$(jq -r '.title' "$CONFIG_FILE")
BOOK_LANG=$(jq -r '.language // "en-GB"' "$CONFIG_FILE")  # default to en-GB if not specified
CONTENT_FILES=$(jq -r '.files.content[]' "$CONFIG_FILE" | while read -r file; do
    echo "$CONTENT_DIR/$file"
done)
ASSET_PATTERNS=$(jq -r '.files.assets[]' "$CONFIG_FILE")

# Get and validate pandoc filters
PANDOC_FILTERS=""
PANDOC_FILTERS_DISPLAY=""
while read -r filter; do
    if [ -n "$filter" ]; then
        FILTER_PATH="$STYLES_DIR/$filter"
        if [ ! -f "$FILTER_PATH" ]; then
            echo "error: Pandoc filter '$filter' not found in styles directory" >&2
            exit 1
        fi
        PANDOC_FILTERS="$PANDOC_FILTERS --lua-filter=$FILTER_PATH"
        [ -n "$PANDOC_FILTERS_DISPLAY" ] && PANDOC_FILTERS_DISPLAY="$PANDOC_FILTERS_DISPLAY\n"
        PANDOC_FILTERS_DISPLAY="$PANDOC_FILTERS_DISPLAY$(basename "$filter")"
    fi
done < <(jq -r '.styles.fixes.pandoc[] // empty' "$CONFIG_FILE")

# Get and validate pagedjs scripts
PAGEDJS_SCRIPTS=""
PAGEDJS_SCRIPTS_DISPLAY=""
while read -r script; do
    if [ -n "$script" ]; then
        SCRIPT_PATH="$STYLES_DIR/$script"
        if [ ! -f "$SCRIPT_PATH" ]; then
            echo "error: PagedJS script '$script' not found in styles directory" >&2
            exit 1
        fi
        PAGEDJS_SCRIPTS="$PAGEDJS_SCRIPTS $SCRIPT_PATH"
        [ -n "$PAGEDJS_SCRIPTS_DISPLAY" ] && PAGEDJS_SCRIPTS_DISPLAY="$PAGEDJS_SCRIPTS_DISPLAY\n"
        PAGEDJS_SCRIPTS_DISPLAY="$PAGEDJS_SCRIPTS_DISPLAY$(basename "$script")"
    fi
done < <(jq -r '.styles.fixes.pagedjs[] // empty' "$CONFIG_FILE")

echo "info: processing '$BOOK_TITLE'"
echo "info: language: $BOOK_LANG"
echo "info: content files:"
echo "$CONTENT_FILES" | sed 's/^/      /'
echo "info: asset patterns:"
echo "$ASSET_PATTERNS" | sed 's/^/      /'
echo "info: pandoc filters:"
echo "$PANDOC_FILTERS_DISPLAY" | sed 's/^/      /'
echo "info: pagedjs scripts:"
echo "$PAGEDJS_SCRIPTS_DISPLAY" | sed 's/^/      /'

## ************************************************************************
##  Build process
## ************************************************************************

# Prepare build directory
echo -n "info: cleaning backup directory..."
rm -rf "$BUILD_DIR.bak"
echo -e "\rinfo: cleaning backup directory                       ok"

echo -n "info: backing up current build..."
if [ -d "$BUILD_DIR" ]; then
    mv "$BUILD_DIR" "$BUILD_DIR.bak"
fi
echo -e "\rinfo: backing up current build                        ok"

echo -n "info: preparing build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/styles/fixes/pagedjs" "$BUILD_DIR/viewer"
echo -e "\rinfo: preparing build directory                       ok"

# Copy PagedJS viewer files
echo -n "info: copying viewer files..."
cp viewer/pagedjs/*.{js,html,css} "$BUILD_DIR/viewer/"
cp -R viewer/fonts "$BUILD_DIR/viewer/"
echo -e "\rinfo: copying viewer files                            ok"

# Copy only required style files (exclude pandoc fixes)
echo -n "info: copying style files..."
mkdir -p "$BUILD_DIR/styles/fixes/pagedjs"
cp "$STYLES_DIR"/*.css "$BUILD_DIR/styles/"
cp "$STYLES_DIR/fixes/pagedjs/"*.js "$BUILD_DIR/styles/fixes/pagedjs/"
echo -e "\rinfo: copying style files                             ok"

# Copy assets based on patterns, preserving directory structure
echo -n "info: copying asset files..."
for pattern in $ASSET_PATTERNS; do
    for asset in "$CONTENT_DIR"/$pattern; do
        if [ -e "$asset" ]; then
            # Get the relative path from content directory
            rel_path=${asset#$CONTENT_DIR/}
            # Create the target directory
            target_dir="$BUILD_DIR/$(dirname "$rel_path")"
            mkdir -p "$target_dir"
            # Copy the file preserving the structure
            cp -R "$asset" "$target_dir/"
        fi
    done
done
echo -e "\rinfo: copying asset files                             ok"

## ************************************************************************
##  Generate html from markdown files
## ************************************************************************

echo ""
echo -n "info: generating HTML from markdown files..."

# Generate HTML using pandoc
pandoc --standalone \
    --css="$STYLE_FILE" \
    -f markdown+smart \
    --metadata pagetitle="$BOOK_TITLE" \
    --number-sections \
    --to=html5 \
    -V lang=$BOOK_LANG \
    --section-divs=true \
    $PANDOC_FILTERS \
    $CONTENT_FILES \
    -o "$BUILD_DIR/content.html"
echo -e "\rinfo: generating HTML from markdown files             ok"

# Generate preview HTML
echo -n "info: generating preview HTML..."
# Extract body content
sed -n '/<body>/,/<\/body>/p' "$BUILD_DIR/content.html" | tail -n +2 | ghead -n -1 > "$BUILD_DIR/body.html"

# Create preview HTML using template
TEMPLATE_PATH="template/template.html"
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo -e "\rerror: template file '$TEMPLATE_PATH' not found" >&2
    exit 1
fi

TEMPLATE_FILE=$(cat "$TEMPLATE_PATH")
BODY=$(cat "$BUILD_DIR/body.html")

# Generate handler script tags from pagedjs scripts
HANDLER_SCRIPTS=""
for script in $PAGEDJS_SCRIPTS; do
    # Get the path relative to styles directory by removing the STYLES_DIR prefix
    RELATIVE_PATH="./styles/${script#$STYLES_DIR/}"
    HANDLER_SCRIPTS="${HANDLER_SCRIPTS}<script src=\"${RELATIVE_PATH}\"></script>"
done

# Replace markers in template and save to preview.html
PREVIEW_HTML="${TEMPLATE_FILE//%^HANDLERS%^/$HANDLER_SCRIPTS}"
PREVIEW_HTML="${PREVIEW_HTML//%^CONTENT%^/$BODY}"
printf '%s\n' "$PREVIEW_HTML" > "$BUILD_DIR/preview.html"
rm -f "$BUILD_DIR/body.html"  # Clean up temporary file

echo -e "\rinfo: generating preview HTML                         ok"

echo -n "info: build completed successfully..."
echo -e "\rinfo: build completed successfully                    ok"
echo "info: output files:"
echo "      - Main HTML: $BUILD_DIR/content.html"
echo "      - Preview: $BUILD_DIR/preview.html"
