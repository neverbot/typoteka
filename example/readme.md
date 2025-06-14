As an example of how to use Typoteka, this repository includes a sample book based on [Mary Shelley's "Frankenstein; or, The Modern Prometheus"](https://www.gutenberg.org/ebooks/84) (1818). The content is sourced from [Project Gutenberg](https://www.gutenberg.org/), which provides free access to thousands of public domain books.

The epub included is downloaded from Project Gutenberg. It is also included a markdown version of the book, which is the format used by Typoteka to generate the final HTML output.

The conversion has been done executing:

```bash
pandoc frankenstein.epub -o frankenstein.md --extract-media=./media --wrap=none
```

The changes made to the markdown file are: 

Important one: the removal of a few lines at the beginning that were not part of the book content, which will generate wrong image links (notice the xlink:href attribute is not relative to the `media` directory). Don't know if this is a bug in Pandoc or in the epub file, but it is not a problem related to Typoteka.

```markdown
::: x-ebookmaker-cover
<svg xmlns="http://www.w3.org/2000/svg" height="100%" preserveaspectratio="xMidYMid meet" version="1.1" viewbox="0 0 1600 2400" width="100%" xmlns:xlink="http://www.w3.org/1999/xlink">
`<image width="1600" height="2400" xlink:href="5095274894661566813_84-cover.png">`{=html}`</image>`{=html}
</svg>
:::
```

Either way, the best solution is to remove the head of the book until: `START OF THE PROJECT GUTENBERG EBOOK` and from `END OF THE PROJECT GUTENBERG EBOOK` to the end. Remove the full sections inside fenced blocks (`:::::`) including this messages.

Also, some empty elements were generated by Pandoc when converting the epub to markdown, which are not needed:

```markdown
[]{#wrap0000.xhtml}

[]{#1672564695976068600_84-h-0.htm.xhtml}

<div>

</div>
```

This elements were removed from the beginning of the markdown file.
