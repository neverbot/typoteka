# typoteka

**Typoteka** takes its name from the fusion of *typography* and *bibliotheka* — the Greek word for library. 

It is a minimal yet powerful toolkit for crafting well-styled books and documents. Write your content in [Markdown](https://en.wikipedia.org/wiki/Markdown), convert it to clean HTML with [Pandoc](https://pandoc.org), apply custom CSS for layout and design, and render high-quality PDFs using [paged.js](https://pagedjs.org). **Typoteka** is aimed at writers, designers, and developers who want full control over the publishing process using open, modern technologies.

**Why?** Because separating content from presentation matters. Traditional layout software often entangles text with visual formatting, making it harder to reuse, revise, or version-control your work. Typoteka follows a clean, modern approach where your writing lives in Markdown—**plain, portable, and future-proof**—while design is handled independently via CSS. This separation gives you flexibility, clarity, and the power to publish beautifully without compromising structure. Both your writing and your design styles can in **version control** systems like git, making collaboration, tracking changes, and managing revisions seamless and transparent.

## Usage

1. Create a directory for your book content with a `typoteka.json` file.
2. Write your content in Markdown files.
3. Run the build script:
   ```bash
   ./build.sh path/to/content-dir
   ```
4. Find the generated files in the `build` directory:
   - `content.html`: The main HTML file. Just your content, in HTML.
   - `preview.html`: A styled preview with the PagedJS interface. This is the file you want.

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

```bash
# this will convert the book inside the example directory
./build.sh example
```

### Alternative styles

If you want to test how Typoteka works with different styles, you can edit the `example/typoteka.json` file and change its values. Inside the `example` directory, you can find both `typoteka.example.json` and `typoteka.novel.json`. The first one is the default style, while the second one is a more traditional novel style with more complex layout.

To switch to the novel style, change the contents of `typoteka.json` with the contents of `typoteka.novel.json`, then run the build script again:

```bash
./build.sh example
```

and the book will be generated using the new style.

## Tools and Dependencies

This project relies on these open-source tools:

- [pandoc](https://pandoc.org): Universal document converter.
- [pagedjs](https://pagedjs.org): Library for paginating content in the browser.
- [book_avanced-interface](https://gitlab.coko.foundation/pagedjs/starter-kits/book_avanced-interface): The web viewer is based on this pagedjs starter kit.
- [jq](https://stedolan.github.io/jq/): Command-line JSON processor.

## Project Structure

```
example/               # Example book content
  ├── typoteka.json    # Book configuration
  └── frankenstein.md  # Book content in markdown

lib/                   # External dependencies
  └── pagedjs/         # PagedJS library (git submodule)

styles/                # Style templates
  └── example/         # Example style
      ├── styles.css   # Main CSS styles
      ├── fonts/       # Font files
      └── fixes/       # Style-specific fixes
          ├── pandoc/  # Pandoc Lua filters
          └── pagedjs/ # PagedJS javascript handlers

template/              # Template to insert user content in
  └── template.html    # Main HTML template

viewer/                # Web viewer interface
  ├── fonts/           # Fonts used by the viewer
  └── pagedjs/         # Viewer-specific PagedJS setup

build.sh               # Build script to generate the book
```
