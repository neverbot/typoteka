document.addEventListener('DOMContentLoaded', (event) => {
  // Initialize debug system early
  initializeDebugSystem();
  
  let p = includeHTML();
  p.then(() => {
    interfaceEvents();
  })

  let flowBook = document.querySelector("#book-content");
  let book_content = flowBook.content;
  let paged = new Paged.Previewer();
  
  debugLog('Starting PagedJS preview...', 'info');
  updatePagedJSStatus('Rendering...');
  
  paged.preview(book_content, ["styles/styles.css"], document.querySelector("#renderbook")).then((flow) => {
    debugLog('PagedJS preview completed successfully', 'success');
    updatePagedJSStatus('Ready');
  }).catch((error) => {
    debugLog(`PagedJS preview failed: ${error.message}`, 'error');
    updatePagedJSStatus('Error');
    updatePagedJSError(error.message);
  });
});

function interfaceEvents() {

  let body = document.getElementsByTagName("body")[0];

  // set a "unique" filename based on title element, in case several books are opened
  var fileTitle = document.getElementsByTagName("title")[0].text;

  /* BASELINE ---------------------------------------------------------------------------------------------------- 
  ----------------------------------------------------------------------------------------------------------------*/

  /* Set baseline onload */
  let baselineToggle = localStorage.getItem('baselineToggle' + fileTitle);
  let baselineButton = document.querySelector('#label-baseline-toggle');
  let baselineSize = localStorage.getItem('baselineSize' + fileTitle);
  let baselinePosition = localStorage.getItem('baselinePosition');
  let baselineSizeInput = document.querySelector('#size-baseline');
  let baselinePositionInput = document.querySelector('#position-baseline');

  if (baselineToggle == "no-baseline") {
    body.classList.add('no-baseline');
    baselineButton.innerHTML = "See";
  } else if (baselineToggle == "baseline") {
    body.classList.remove('no-baseline');
    document.querySelector("#baseline-toggle").checked = "checked";
    baselineButton.innerHTML = "Hide";
  } else {
    body.classList.add('no-baseline');
    localStorage.setItem('baselineToggle' + fileTitle, 'no-baseline');
    baselineButton.innerHTML = "See";
  }

  /* Get baseline size and position on load*/
  if (baselineSize) {
    baselineSizeInput.value = baselineSize;
    document.documentElement.style.setProperty('--pagedjs-baseline', baselineSize + 'px');
  } else {
    localStorage.setItem('baselineSize' + fileTitle, baselineSizeInput.value);
  }
  baselinePositionInput.addEventListener("input", (e) => {
  });
  if (baselinePosition) {
    baselinePositionInput.value = baselinePosition;
    document.documentElement.style.setProperty('--pagedjs-baseline-position', baselinePosition + 'px');
  } else {
    localStorage.setItem('baselineSPosition', baselinePositionInput.value);
  }

  /* Toggle baseline */
  document.querySelector("#baseline-toggle").addEventListener("input", (e) => {
    if (e.target.checked) {
      /* see baseline */
      body.classList.remove('no-baseline');
      localStorage.setItem('baselineToggle' + fileTitle, 'baseline');
      baselineButton.innerHTML = "Hide";
    } else {
      /* hide baseline */
      body.classList.add('no-baseline');
      localStorage.setItem('baselineToggle' + fileTitle, 'no-baseline');
      baselineButton.innerHTML = "See";
    }
  });

  /* Change baseline size on input */
  document.querySelector("#size-baseline").addEventListener("input", (e) => {
    document.documentElement.style.setProperty('--pagedjs-baseline', e.target.value + 'px');
    localStorage.setItem('baselineSize' + fileTitle, baselineSizeInput.value);
  });

  /* Change baseline position on input */
  document.querySelector("#position-baseline").addEventListener("input", (e) => {
    document.documentElement.style.setProperty('--pagedjs-baseline-position', e.target.value + 'px');
    localStorage.setItem('baselinePosition', baselinePositionInput.value);
  });

  /* MARGIN BOXES ---------------------------------------------------------------------------------------------------- 
 ----------------------------------------------------------------------------------------------------------------*/
  let marginButton = document.querySelector('#label-marginbox-toggle');

  body.classList.add('no-marginboxes');

  document.querySelector("#marginbox-toggle").addEventListener("input", (e) => {
    if (e.target.checked) {
      /* see baseline */
      body.classList.remove('no-marginboxes');
      marginButton.innerHTML = "Hide";
    } else {
      /* hide baseline */
      body.classList.add('no-marginboxes');
      marginButton.innerHTML = "See";
    }
  });

  /* Preview ---------------------------------------------------------------------------------------------------- 
  ----------------------------------------------------------------------------------------------------------------*/

  document.querySelector("#preview-toggle").addEventListener("input", (e) => {
    if (e.target.checked) {
      /* preview mode */
      body.classList.add('interface-preview');
    } else {
      body.classList.remove('interface-preview');
    }
  });

  /* Debug ------------------------------------------------------------------------------------------------------ 
  ----------------------------------------------------------------------------------------------------------------*/

  document.querySelector("#debug-toggle").addEventListener("input", (e) => {
    const debugPanel = document.querySelector("#debug-panel");
    if (e.target.checked) {
      debugPanel.style.display = 'block';
      debugLog('Debug panel opened', 'info');
    } else {
      debugPanel.style.display = 'none';
    }
  });
}

function includeHTML() {
  var z, i, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  /*search for elements with a certain atrribute:*/
  let elmnt = document.getElementById("interface-header")
  file = elmnt.getAttribute("w3-include-html");
  let a = new Promise((resolve, reject) => {
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          resolve();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  });
  return a;
}

class interfacePaged extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPageLayout(pageElement, page, breakToken) {
    let nbr = page.id.replace('page-', '');
    let span = document.querySelector("#nrb-pages");
    span.innerHTML = nbr;
    
    // Update debug panel
    updatePagedJSPages(nbr);
  }

  afterRendered(pages) {
    let print = document.querySelector("#button-print");
    print.dataset.ready = 'true';
    
    debugLog(`Rendering completed. Total pages: ${pages.length}`, 'success');
    updatePagedJSStatus('Completed');
    updatePagedJSPages(pages.length);
  }
}

Paged.registerHandlers(interfacePaged);

// Debug System
let debugConsole = null;
let originalConsole = {};

function initializeDebugSystem() {
  // Capture original console methods
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Override console methods to capture output
  console.log = (...args) => {
    originalConsole.log(...args);
    debugLog(args.join(' '), 'log');
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    debugLog(args.join(' '), 'warn');
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    debugLog(args.join(' '), 'error');
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    debugLog(args.join(' '), 'info');
  };

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    debugLog(`Unhandled error: ${event.error.message} at ${event.filename}:${event.lineno}`, 'error');
    updatePagedJSError(event.error.message);
  });

  // Initialize debug panel after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    debugConsole = document.querySelector("#debug-console");
    setupDebugButtons();
  });
}

function setupDebugButtons() {
  const clearBtn = document.querySelector("#debug-clear-btn");
  const exportBtn = document.querySelector("#debug-export-btn");
  const reinitBtn = document.querySelector("#debug-reinit-btn");
  const testOverflowBtn = document.querySelector("#debug-test-overflow-btn");

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (debugConsole) {
        debugConsole.innerHTML = '';
        debugLog('Console cleared', 'info');
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportDebugLog();
    });
  }

  if (reinitBtn) {
    reinitBtn.addEventListener('click', () => {
      reinitializePagedJS();
    });
  }

  if (testOverflowBtn) {
    testOverflowBtn.addEventListener('click', () => {
      testOverflowHandling();
    });
  }
}

function debugLog(message, type = 'log') {
  if (!debugConsole) return;

  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = `reset-this debug-log-entry debug-${type}`;
  logEntry.innerHTML = `<span class="reset-this debug-timestamp">[${timestamp}]</span> <span class="reset-this debug-message">${message}</span>`;
  
  debugConsole.appendChild(logEntry);
  debugConsole.scrollTop = debugConsole.scrollHeight;
}

function updatePagedJSStatus(status) {
  const statusElement = document.querySelector("#pagedjs-status");
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = `reset-this debug-value status-${status.toLowerCase()}`;
  }
}

function updatePagedJSPages(count) {
  const pagesElement = document.querySelector("#pagedjs-pages");
  if (pagesElement) {
    pagesElement.textContent = count;
  }
}

function updatePagedJSError(error) {
  const errorElement = document.querySelector("#pagedjs-error");
  if (errorElement) {
    errorElement.textContent = error;
    errorElement.className = "reset-this debug-value error-text";
  }
}

function exportDebugLog() {
  if (!debugConsole) return;

  const logs = Array.from(debugConsole.children).map(entry => {
    const timestamp = entry.querySelector('.debug-timestamp').textContent;
    const message = entry.querySelector('.debug-message').textContent;
    const type = entry.className.match(/debug-(\w+)/)?.[1] || 'log';
    return `${timestamp} [${type.toUpperCase()}] ${message}`;
  }).join('\n');

  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pagedjs-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  debugLog('Debug log exported', 'info');
}

function reinitializePagedJS() {
  debugLog('Reinitializing PagedJS...', 'info');
  updatePagedJSStatus('Reinitializing...');
  
  try {
    // Clear existing rendering
    const renderTarget = document.querySelector("#renderbook");
    if (renderTarget) {
      renderTarget.innerHTML = '';
    }

    // Get content again
    const flowBook = document.querySelector("#book-content");
    const book_content = flowBook.content;
    
    // Create new previewer
    const paged = new Paged.Previewer();
    
    paged.preview(book_content, ["styles/styles.css"], renderTarget).then((flow) => {
      debugLog('PagedJS reinitialization completed successfully', 'success');
      updatePagedJSStatus('Ready');
    }).catch((error) => {
      debugLog(`PagedJS reinitialization failed: ${error.message}`, 'error');
      updatePagedJSStatus('Error');
      updatePagedJSError(error.message);
    });
  } catch (error) {
    debugLog(`Failed to reinitialize PagedJS: ${error.message}`, 'error');
    updatePagedJSStatus('Error');
    updatePagedJSError(error.message);
  }
}

function testOverflowHandling() {
  debugLog('Testing overflow handling...', 'info');
  
  // Test the addOverflowNodes function with null parameters
  try {
    // This should trigger our defensive null checks
    if (window.Paged && window.Paged.Layout) {
      const layout = new window.Paged.Layout();
      if (layout.addOverflowNodes) {
        layout.addOverflowNodes(null, null);
        debugLog('Overflow handling test completed - null checks working', 'success');
      } else {
        debugLog('addOverflowNodes method not found', 'warn');
      }
    } else {
      debugLog('PagedJS Layout not available for testing', 'warn');
    }
  } catch (error) {
    debugLog(`Overflow handling test failed: ${error.message}`, 'error');
  }
}
