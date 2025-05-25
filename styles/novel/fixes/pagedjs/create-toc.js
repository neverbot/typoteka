function createToc(config) {
  const content = config.content;
  const tocElement = config.tocElement;
  const titleElements = config.titleElements;
  const avoidClasses = config.avoidClasses || [];

  let tocElementDiv = content.querySelector(tocElement);
  let tocUl = document.createElement("ul");
  tocUl.id = "list-toc-generated";
  tocElementDiv.appendChild(tocUl);

  // add class to all title elements
  let tocElementNbr = 0;
  for (var i = 0; i < titleElements.length; i++) {
    let titleHierarchy = i + 1;
    let titleElement = content.querySelectorAll(titleElements[i]);

    titleElement.forEach(function (element) {
      // Check if element should be skipped due to having an avoided class
      let shouldSkip = false;
      if (avoidClasses.length > 0) {
        shouldSkip = avoidClasses.some(className => {
          // Check if element has the class
          if (element.classList.contains(className)) {
            return true;
          }
          // Check if any parent has the class
          if (element.closest('.' + className) !== null) {
            return true;
          }
          return false;
        });
      }

      if (shouldSkip) {
        return; // skip this element
      }

      // add classes to the element
      element.classList.add("title-element");
      element.setAttribute("data-title-level", titleHierarchy);

      // add id if doesn't exist
      tocElementNbr++;
      if (element.id == "") {
        element.id = "title-element-" + tocElementNbr;
      }
    });
  }

  // create toc list
  let tocElements = content.querySelectorAll(".title-element");

  for (var i = 0; i < tocElements.length; i++) {
    let tocElement = tocElements[i];

    let tocNewLi = document.createElement("li");

    // Add class for the hierarcy of toc
    tocNewLi.classList.add("toc-element");
    tocNewLi.classList.add(
      "toc-element-level-" + tocElement.dataset.titleLevel
    );

    // Keep class of title elements
    let classTocElement = tocElement.classList;
    for (var n = 0; n < classTocElement.length; n++) {
      if (classTocElement[n] != "title-element") {
        tocNewLi.classList.add(classTocElement[n]);
      }
    }

    // Create the element
    tocNewLi.innerHTML =
      '<a href="#' + tocElement.id + '">' + tocElement.innerHTML + "</a>";
    tocUl.appendChild(tocNewLi);
  }
}

class handlers extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  beforeParsed(content) {
    // first, if the book already has an element with id "contents",
    // remove it
    let tocElement = content.querySelector("#contents");
    if (tocElement) {
      // remove only the things inside the element, not the element itself
      while (tocElement.firstChild) {
        tocElement.removeChild(tocElement.firstChild);
      }

      // add child with h2 title
      let h2Title = document.createElement("h2");
      h2Title.innerHTML = "Table of Contents";
      tocElement.appendChild(h2Title);
    }

    createToc({
      content: content,
      tocElement: "#contents",
      titleElements: ["h2", "h3"],
      avoidClasses: ["no-break", "no-toc", "level3"],
    });
  }
}

Paged.registerHandlers(handlers);