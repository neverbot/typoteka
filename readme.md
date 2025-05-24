# typoteka

**Typoteka** takes its name from the fusion of *typography* and *bibliotheka* — the Greek word for library. It is a minimal yet powerful toolkit for crafting well-styled books and documents. Write your content in [**Markdown**](https://en.wikipedia.org/wiki/Markdown), convert it to clean HTML with [**Pandoc**](https://pandoc.org), apply custom CSS for layout and design, and render high-quality PDFs using [**paged.js**](https://pagedjs.org). **Typoteka** is aimed at writers, designers, and developers who want full control over the publishing process using open, modern technologies.

## Project Structure

```
example/               # Example book content
  ├── typoteka.json    # Book configuration
  └── frankenstein.md  # Book content in markdown
styles/                # Style templates
  └── test/            # Example style
      ├── styles.css   # Main CSS styles
      └── fixes/       # Style-specific fixes
          ├── pandoc/  # Pandoc Lua filters
          └── pagedjs/ # PagedJS handlers
lib/                   # External dependencies
  └── pagedjs/         # PagedJS library (git submodule)
viewer/                # Web viewer interface
  ├── fonts/           # Embedded fonts
  └── pagedjs/         # Viewer-specific PagedJS setup
```

## Configuration

Books are defined using a `typoteka.json` configuration file:

```json
{
  "title": "Book Title",
  "language": "en-GB",
  "files": {
    "content": ["chapter1.md", "chapter2.md"],
    "assets": ["images/*"]
  },
  "styles": {
    "path": "../styles/test",
    "fixes": {
      "pandoc": ["fixes/pandoc/filter.lua"],
      "pagedjs": ["fixes/pagedjs/handlers.js"]
    }
  }
}
```

Take a look at the [example book](example/typoteka.json) for a complete configuration.

## Example Book

The repository includes an example book: [Mary Shelley's "Frankenstein; or, The Modern Prometheus" (1818)](https://www.gutenberg.org/ebooks/84). The content is sourced from [Project Gutenberg](https://www.gutenberg.org/), which provides free access to thousands of public domain books.

## Usage

1. Create a directory for your book content with a `typoteka.json` file
2. Write your content in Markdown files
3. Run the build script:
   ```bash
   ./build.sh path/to/content-dir
   ```
4. Find the generated files in the `build` directory:
   - `book.html`: The main HTML file
   - `preview.html`: A styled preview with the PagedJS interface

## Tools and Dependencies

This project relies on these open-source tools:

- [pandoc](https://pandoc.org): Universal document converter.
- [pagedjs](https://pagedjs.org): Library for paginating content in the browser.
- [book_avanced-interface](https://gitlab.coko.foundation/pagedjs/starter-kits/book_avanced-interface): The web viewer is based on this pagedjs starter kit.
- [jq](https://stedolan.github.io/jq/): Command-line JSON processor.
