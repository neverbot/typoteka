# Typoteka - Agent Instructions

Technical reference for AI agents working with this repository.

**Language**: All code comments and documentation must be in English.

## Overview

Typoteka converts Markdown to paginated book output:

```
Markdown --> Pandoc (HTML) --> PagedJS (pagination) --> Print/PDF
```

Each book has a `typoteka.json` config specifying content files and styling.

## Project Structure

```
typoteka/
  build.sh                    # Main build script (requires jq)
  template/template.html      # HTML template with placeholders
  viewer/pagedjs/
    paged.js                  # PagedJS library (DO NOT MODIFY)
    interface.js              # Viewer interface + debug console
    interface.html            # Debug panel HTML
  styles/<style-name>/
    styles.css                # CSS for the style
    fonts/                    # Custom fonts
    fixes/pandoc/*.lua        # Pandoc Lua filters
    fixes/pagedjs/*.js        # PagedJS handlers
  example/                    # Example book (Frankenstein)
    typoteka.json             # Book config
    frankenstein.md           # Content
  build/                      # Build output (generated)
```

## Configuration: typoteka.json

```json
{
  "title": "Book Title",
  "language": "en-GB",
  "files": {
    "content": ["chapter1.md", "chapter2.md"],
    "assets": ["media/*"]
  },
  "styles": {
    "path": "../styles/novel",
    "fixes": {
      "pandoc": ["fixes/pandoc/some-filter.lua"],
      "pagedjs": ["fixes/pagedjs/some-handler.js"]
    }
  }
}
```

## Build Process

Run: `./build.sh <content-dir>`

Example: `./build.sh example`

Steps:
1. Read `typoteka.json` from the content directory
2. Run Pandoc with Lua filters to generate `build/content.html`
3. Inject content into template to create `build/preview.html`
4. Copy viewer, styles, and fonts to `build/`

Output:
- `build/content.html` - Raw HTML content
- `build/preview.html` - Full preview with PagedJS

## PagedJS Handlers

Handlers extend `Paged.Handler` and run during pagination. Key hooks:

- `beforeParsed(content)` - Modify content before parsing
- `afterPageLayout(pageElement, page, breakToken)` - After each page
- `afterRendered(pages)` - After all pages rendered

Current handlers in `styles/novel/`:
- `create-toc.js` - Generates Table of Contents from headings
- `remove-span-in-h1.js` - Cleans up header structure

Handlers are registered with `Paged.registerHandlers(HandlerClass)`.

## Pandoc Lua Filters

Filters transform the AST during Pandoc conversion. Current filters:

- `fix-header-hierarchy.lua` - Adjusts header levels
- `fix-pagedjs-structures.lua` - Wraps chapters in divs for page breaks
- `remove-empty-paragraphs.lua` - Removes empty p elements
- `strip-img-paragraphs.lua` - Unwraps images from paragraphs
- `filter-html-auto-table-column-widths.lua` - Fixes table widths

## Testing and Preview

### Local preview

1. Build: `./build.sh example`
2. Serve: `cd build && python3 -m http.server 8082`
3. Open: `http://localhost:8082/preview.html`

### With browser MCP (Firefox DevTools)

1. Build: `./build.sh example`
2. Reload page: `navigate_page` with reload
3. Wait for render: `sleep 60` (full Frankenstein takes ~60 seconds)
4. Check result: `evaluate_script` to query page count or content

Example check:
```javascript
document.querySelectorAll('.pagedjs_page').length  // Total pages
document.querySelector("#pagedjs-status").textContent  // Status
```

## Important Constraints

1. **paged.js is external**: Never make permanent edits to `viewer/pagedjs/paged.js`. It is the PagedJS library.

2. **Render time**: Large books (Frankenstein: ~285 pages) take time to render. Wait before checking results, no more than 10 seconds.

3. **Template content**: Content is embedded in `preview.html` inside a `<template id="book-content">` element. PagedJS reads from this template.

4. **CSS target-counter**: TOC page numbers use CSS `target-counter()`. This is native PagedJS functionality - no JavaScript fallback needed.

5. **Paths in build/**: All paths in `preview.html` are relative to `build/` (`./viewer/...`, `./styles/...`).

## Debug Console

The viewer includes a debug panel (toggle in bottom-right). It shows:
- PagedJS status and page count
- Log messages from handlers
- Buttons: Clear, Copy, Export, Reinit, Test Overflow, Analyze Content

Access via `#debug-panel` and `#debug-console` in the DOM.

## File Reference

Core files:
- `build.sh` - Build script
- `template/template.html` - HTML template
- `viewer/pagedjs/interface.js` - Viewer with debug system
- `styles/novel/styles.css` - Novel style CSS
- `styles/novel/fixes/pagedjs/create-toc.js` - TOC generator
- `example/typoteka.json` - Example configuration
