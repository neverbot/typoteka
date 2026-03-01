// Typoteka interface.js

document.addEventListener('DOMContentLoaded', (event) => {
  let p = includeHTML();
  p.then(() => {
    initializeDebugSystem();
    interfaceEvents();
  });

  function startPreview() {
    var flowBook = document.querySelector("#book-content");
    if (!flowBook || !flowBook.content) {
      debugLog('Book content template not found', 'error');
      return;
    }
    
    debugLog('Content loaded, starting PagedJS...', 'info');
    var book_content = flowBook.content;
    
    var paged = new Paged.Previewer();
    updatePagedJSStatus('Rendering...');
    paged.preview(book_content, ["styles/styles.css"], document.querySelector("#renderbook")).then(function (flow) {
      updatePagedJSStatus('Ready');
    }).catch(function (error) {
      debugLog('PagedJS preview failed: ' + error.message, 'error');
      updatePagedJSStatus('Error');
      updatePagedJSError(error.message);
    });
  }

  function whenFullyLoaded(fn) {
    if (document.readyState === 'complete') {
      fn();
    } else {
      window.addEventListener('load', fn);
    }
  }

  whenFullyLoaded(function () {
    p.then(function () {
      startPreview();
    });
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

  // Debug toggle is now handled in initializeDebugSystem()
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
    const nbr = page.id.replace('page-', '');
    const span = document.querySelector("#nrb-pages");
    if (span) span.innerHTML = nbr;
    updatePagedJSPages(nbr);
  }

  renderError(error) {
    debugLog(`PagedJS error: ${error.message}`, 'error');
    updatePagedJSError(error.message);
  }

  layoutError(error) {
    debugLog(`PagedJS layout error: ${error.message}`, 'error');
    updatePagedJSError(error.message);
  }

  afterRendered(pages) {
    const print = document.querySelector("#button-print");
    if (print) print.dataset.ready = 'true';
    debugLog(`Preview ready: ${pages.length} pages`, 'info');
    updatePagedJSPages(pages.length);
    updatePagedJSStatus('Completed');
  }
}

Paged.registerHandlers(interfacePaged);

// Debug System
let debugConsole = null;
let originalConsole = {};
let earlyMessages = []; // Buffer for messages before debug console is ready

function initializeDebugSystem() {
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };
  debugConsole = document.querySelector("#debug-console");
  
  // Setup debug buttons
  setupDebugButtons();
  
  // Replay any early messages that were buffered
  if (debugConsole && earlyMessages.length > 0) {
    // Replay buffered messages
    earlyMessages.forEach(msg => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = `reset-this debug-log-entry debug-${msg.type}`;
      logEntry.innerHTML = `<span class="reset-this debug-timestamp">[${timestamp}]</span> <span class="reset-this debug-message">${msg.message}</span>`;
      debugConsole.appendChild(logEntry);
    });
    debugConsole.scrollTop = debugConsole.scrollHeight;
    earlyMessages = []; // Clear the buffer
  }

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
  
  // Setup debug toggle event listener
  const debugToggle = document.querySelector("#debug-toggle");
  const debugPanel = document.querySelector("#debug-panel");
  
  if (debugToggle && debugPanel) {
    debugToggle.addEventListener("input", (e) => {
      debugPanel.style.display = e.target.checked ? 'block' : 'none';
    });
  }
}

function setupDebugButtons() {
  const clearBtn = document.querySelector("#debug-clear-btn");
  const copyBtn = document.querySelector("#debug-copy-btn");
  const exportBtn = document.querySelector("#debug-export-btn");
  const reinitBtn = document.querySelector("#debug-reinit-btn");
  const testOverflowBtn = document.querySelector("#debug-test-overflow-btn");
  const analyzeContentBtn = document.querySelector("#debug-analyze-content-btn");

  if (clearBtn) clearBtn.addEventListener('click', () => { if (debugConsole) debugConsole.innerHTML = ''; });
  if (copyBtn) copyBtn.addEventListener('click', copyDebugLog);
  if (exportBtn) exportBtn.addEventListener('click', exportDebugLog);
  if (reinitBtn) reinitBtn.addEventListener('click', reinitializePagedJS);
  if (testOverflowBtn) testOverflowBtn.addEventListener('click', testOverflowHandling);
  if (analyzeContentBtn) analyzeContentBtn.addEventListener('click', analyzeContentStructure);
}

function debugLog(message, type = 'log') {
  // Always log to browser console first
  if (originalConsole && originalConsole[type]) {
    originalConsole[type](`[TYPOTEKA] ${message}`);
  } else {
    console.log(`[TYPOTEKA] ${message}`);
  }
  
  // Try to find debug console if we don't have it
  if (!debugConsole) {
    debugConsole = document.querySelector("#debug-console");
  }
  
  // If still no debug console, buffer the message for later
  if (!debugConsole) {
    earlyMessages.push({ message, type, timestamp: new Date() });
    if (originalConsole && originalConsole.log && type === 'error') {
      originalConsole.log('[TYPOTEKA]', message);
    }
    return;
  }

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

function copyDebugLog() {
  if (!debugConsole) return;
  const logs = Array.from(debugConsole.children).map(entry => {
    const timestamp = entry.querySelector('.debug-timestamp').textContent;
    const message = entry.querySelector('.debug-message').textContent;
    const type = entry.className.match(/debug-(\w+)/)?.[1] || 'log';
    return `${timestamp} [${type.toUpperCase()}] ${message}`;
  }).join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(logs).then(() => debugLog('Log copied to clipboard', 'info')).catch(() => fallbackCopyText(logs));
  } else {
    fallbackCopyText(logs);
    debugLog('Log copied to clipboard', 'info');
  }
}

function fallbackCopyText(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
  } catch (err) {}
}

function reinitializePagedJS() {
  debugLog('Reinitializing PagedJS...', 'info');
  updatePagedJSStatus('Reinitializing...');
  const renderTarget = document.querySelector("#renderbook");
  if (!renderTarget) return;
  renderTarget.innerHTML = '';
  
  var flowBook = document.querySelector("#book-content");
  if (!flowBook || !flowBook.content) {
    debugLog('Book content template not found', 'error');
    return;
  }
  
  var paged = new Paged.Previewer();
  paged.preview(flowBook.content, ["styles/styles.css"], renderTarget)
    .then(function () {
      debugLog('Reinitialization completed', 'info');
      updatePagedJSStatus('Ready');
    })
    .catch(function (error) {
      debugLog('PagedJS reinitialization failed: ' + error.message, 'error');
      updatePagedJSStatus('Error');
      updatePagedJSError(error.message);
    });
}

function testOverflowHandling() {
  try {
    // This should trigger our defensive null checks
    if (window.Paged && window.Paged.Layout) {
      const layout = new window.Paged.Layout();
      if (layout.addOverflowNodes) {
        layout.addOverflowNodes(null, null);
      }
    }
  } catch (error) {}
}

function analyzeContentStructure() {
  const bookContent = document.querySelector("#book-content");
  if (!bookContent || !bookContent.content) {
    debugLog('Book content not found', 'warn');
    return;
  }
  const content = bookContent.content.cloneNode(true);
  const sections = content.querySelectorAll('section');
  const paragraphs = content.querySelectorAll('p');
  const headers = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const wordCount = (content.textContent || '').split(/\s+/).filter(w => w.length > 0).length;
  debugLog(`Content: ${sections.length} sections, ${paragraphs.length} paragraphs, ${headers.length} headers, ${wordCount} words`, 'info');
}

function testDebugSystem() {
  updatePagedJSStatus('Testing');
  updatePagedJSPages(42);
  return { debugConsole, clear: document.querySelector("#debug-clear-btn"), copy: document.querySelector("#debug-copy-btn") };
}

// Make it globally available
window.testDebugSystem = testDebugSystem;
