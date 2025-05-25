// Debug startup - immediate console test
console.log('=== TYPOTEKA DEBUG: JavaScript file loaded ===');

document.addEventListener('DOMContentLoaded', (event) => {
  console.log('=== TYPOTEKA DEBUG: DOM loaded ===');
  
  let p = includeHTML();
  p.then(() => {
    // Initialize debug system after interface is loaded
    initializeDebugSystem();
    console.log('=== TYPOTEKA DEBUG: Debug system initialized ===');
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
    debugLog('PagedJS Handler initialized', 'info');
  }

  beforeParsed(content) {
    debugLog(`beforeParsed: Content length: ${content.length} characters`, 'info');
  }

  afterParsed(parsed) {
    debugLog(`afterParsed: Found ${parsed.children.length} top-level elements`, 'info');
  }

  beforePageLayout(page, contents, breakToken) {
    debugLog(`beforePageLayout: Page ${page.id}, Content items: ${contents ? contents.length : 'none'}`, 'info');
    if (breakToken) {
      debugLog(`beforePageLayout: Break token present - ${breakToken.toString()}`, 'info');
    }
  }

  afterPageLayout(pageElement, page, breakToken) {
    let nbr = page.id.replace('page-', '');
    let span = document.querySelector("#nrb-pages");
    span.innerHTML = nbr;
    
    debugLog(`afterPageLayout: Completed page ${nbr}`, 'info');
    
    if (breakToken) {
      debugLog(`afterPageLayout: Break token for next page - ${breakToken.toString()}`, 'info');
      if (breakToken.node) {
        debugLog(`afterPageLayout: Break at node: ${breakToken.node.nodeName} - "${breakToken.node.textContent?.substring(0, 50)}..."`, 'info');
      }
    } else {
      debugLog(`afterPageLayout: No break token - this might be the last page`, 'warn');
    }
    
    // Update debug panel
    updatePagedJSPages(nbr);
  }

  renderError(error) {
    debugLog(`PagedJS Render Error: ${error.message}`, 'error');
    debugLog(`Error stack: ${error.stack}`, 'error');
    updatePagedJSError(error.message);
  }

  layoutError(error) {
    debugLog(`PagedJS Layout Error: ${error.message}`, 'error');
    debugLog(`Error stack: ${error.stack}`, 'error');
    updatePagedJSError(error.message);
  }

  afterRendered(pages) {
    let print = document.querySelector("#button-print");
    print.dataset.ready = 'true';
    
    debugLog(`afterRendered: Total pages rendered: ${pages.length}`, 'success');
    
    // Check if we have content after the last page
    const lastPage = pages[pages.length - 1];
    if (lastPage && lastPage.element) {
      debugLog(`afterRendered: Last page content length: ${lastPage.element.textContent?.length || 0} characters`, 'info');
    }
    
    updatePagedJSStatus('Completed');
    updatePagedJSPages(pages.length);
    
    // Additional diagnostics
    this.diagnoseContentCompletion();
  }

  diagnoseContentCompletion() {
    debugLog('=== Content Completion Diagnostics ===', 'info');
    
    // Check original content length
    const bookContent = document.querySelector("#book-content");
    if (bookContent && bookContent.content) {
      const originalContent = bookContent.content.cloneNode(true);
      const originalText = originalContent.textContent || '';
      debugLog(`Original content length: ${originalText.length} characters`, 'info');
    }
    
    // Check rendered content length
    const renderedContent = document.querySelector("#renderbook");
    if (renderedContent) {
      const renderedText = renderedContent.textContent || '';
      debugLog(`Rendered content length: ${renderedText.length} characters`, 'info');
      
      // Look for specific markers to see how far we got
      const markers = [
        'Table of Contents',
        'Letter 1',
        'Letter 2', 
        'Letter 3',
        'Letter 4',
        'Chapter 1',
        'Chapter 2',
        'Chapter 5',
        'Chapter 10',
        'Chapter 15',
        'Chapter 20'
      ];
      
      markers.forEach(marker => {
        if (renderedText.includes(marker)) {
          debugLog(`✓ Found: ${marker}`, 'success');
        } else {
          debugLog(`✗ Missing: ${marker}`, 'error');
        }
      });
    }
    
    debugLog('=== End Diagnostics ===', 'info');
  }
}

Paged.registerHandlers(interfacePaged);

// Debug System
let debugConsole = null;
let originalConsole = {};
let earlyMessages = []; // Buffer for messages before debug console is ready

function initializeDebugSystem() {
  console.log('=== Initializing debug system ===');
  
  // Capture original console methods
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Find debug console element
  debugConsole = document.querySelector("#debug-console");
  console.log('Debug console element found:', !!debugConsole);
  
  // Setup debug buttons
  setupDebugButtons();
  
  // Replay any early messages that were buffered
  if (debugConsole && earlyMessages.length > 0) {
    console.log(`Replaying ${earlyMessages.length} early messages`);
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
  
  console.log('=== Debug system fully initialized ===');
}

function setupDebugButtons() {
  console.log('Setting up debug buttons...');
  
  const clearBtn = document.querySelector("#debug-clear-btn");
  const copyBtn = document.querySelector("#debug-copy-btn");
  const exportBtn = document.querySelector("#debug-export-btn");
  const reinitBtn = document.querySelector("#debug-reinit-btn");
  const testOverflowBtn = document.querySelector("#debug-test-overflow-btn");
  const analyzeContentBtn = document.querySelector("#debug-analyze-content-btn");

  console.log('Debug buttons found:', {
    clear: !!clearBtn,
    copy: !!copyBtn,
    export: !!exportBtn,
    reinit: !!reinitBtn,
    testOverflow: !!testOverflowBtn,
    analyzeContent: !!analyzeContentBtn
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      console.log('Clear button clicked');
      if (debugConsole) {
        debugConsole.innerHTML = '';
        debugLog('Console cleared', 'info');
      } else {
        console.error('Debug console not found for clearing');
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      console.log('Copy button clicked');
      copyDebugLog();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      console.log('Export button clicked');
      exportDebugLog();
    });
  }

  if (reinitBtn) {
    reinitBtn.addEventListener('click', () => {
      console.log('Reinit button clicked');
      reinitializePagedJS();
    });
  }

  if (testOverflowBtn) {
    testOverflowBtn.addEventListener('click', () => {
      console.log('Test overflow button clicked');
      testOverflowHandling();
    });
  }

  if (analyzeContentBtn) {
    analyzeContentBtn.addEventListener('click', () => {
      console.log('Analyze content button clicked');
      analyzeContentStructure();
    });
  }
  
  console.log('Debug buttons setup completed');
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
    if (originalConsole && originalConsole.log) {
      originalConsole.log('[TYPOTEKA] Debug panel not ready, buffering message:', message);
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
  debugLog(`Status update: ${status}`, 'info');
  const statusElement = document.querySelector("#pagedjs-status");
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = `reset-this debug-value status-${status.toLowerCase()}`;
  }
}

function updatePagedJSPages(count) {
  debugLog(`Page count update: ${count}`, 'info');
  const pagesElement = document.querySelector("#pagedjs-pages");
  if (pagesElement) {
    pagesElement.textContent = count;
  }
}

function updatePagedJSError(error) {
  debugLog(`Error update: ${error}`, 'error');
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
  if (!debugConsole) {
    debugLog('No debug console available for copying', 'warn');
    return;
  }

  const logs = Array.from(debugConsole.children).map(entry => {
    const timestamp = entry.querySelector('.debug-timestamp').textContent;
    const message = entry.querySelector('.debug-message').textContent;
    const type = entry.className.match(/debug-(\w+)/)?.[1] || 'log';
    return `${timestamp} [${type.toUpperCase()}] ${message}`;
  }).join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern browsers
    navigator.clipboard.writeText(logs).then(() => {
      debugLog('Debug log copied to clipboard', 'success');
    }).catch(err => {
      debugLog(`Failed to copy log: ${err.message}`, 'error');
      // Fallback to legacy method
      fallbackCopyText(logs);
    });
  } else {
    // Legacy browsers
    fallbackCopyText(logs);
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
    
    if (successful) {
      debugLog('Debug log copied to clipboard (legacy method)', 'success');
    } else {
      debugLog('Failed to copy log to clipboard', 'error');
    }
  } catch (err) {
    debugLog(`Failed to copy log: ${err.message}`, 'error');
  }
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

function analyzeContentStructure() {
  debugLog('=== Analyzing Content Structure ===', 'info');
  
  const bookContent = document.querySelector("#book-content");
  if (!bookContent || !bookContent.content) {
    debugLog('Book content not found', 'error');
    return;
  }
  
  const content = bookContent.content.cloneNode(true);
  
  // Count different element types
  const sections = content.querySelectorAll('section');
  const divs = content.querySelectorAll('div');
  const paragraphs = content.querySelectorAll('p');
  const headers = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const spans = content.querySelectorAll('span');
  const emptySpans = content.querySelectorAll('span:empty');
  const anchors = content.querySelectorAll('a');
  
  debugLog(`Content analysis:`, 'info');
  debugLog(`- Sections: ${sections.length}`, 'info');
  debugLog(`- Divs: ${divs.length}`, 'info');
  debugLog(`- Paragraphs: ${paragraphs.length}`, 'info');
  debugLog(`- Headers: ${headers.length}`, 'info');
  debugLog(`- Spans: ${spans.length}`, 'info');
  debugLog(`- Empty spans: ${emptySpans.length}`, 'info');
  debugLog(`- Anchors: ${anchors.length}`, 'info');
  
  // Check for problematic patterns
  const emptyParagraphs = content.querySelectorAll('p:empty');
  const deeplyNested = content.querySelectorAll('section section section section');
  
  if (emptyParagraphs.length > 0) {
    debugLog(`⚠️ Found ${emptyParagraphs.length} empty paragraphs`, 'warn');
  }
  
  if (deeplyNested.length > 0) {
    debugLog(`⚠️ Found ${deeplyNested.length} deeply nested sections`, 'warn');
  }
  
  // Look for the specific content markers
  const textContent = content.textContent || '';
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  debugLog(`Total word count: ${wordCount}`, 'info');
  
  // Check for specific problematic elements that might cause PagedJS to stop
  const problematicSelectors = [
    'p:has(span:empty[id])',
    'section:empty',
    'div:empty',
    '*[style*="display: none"]'
  ];
  
  problematicSelectors.forEach(selector => {
    try {
      const elements = content.querySelectorAll(selector);
      if (elements.length > 0) {
        debugLog(`⚠️ Found ${elements.length} elements matching: ${selector}`, 'warn');
      }
    } catch (e) {
      // Some selectors might not be supported
    }
  });
  
  debugLog('=== End Content Analysis ===', 'info');
}

// Test function for debug system - can be called from browser console
function testDebugSystem() {
  console.log('=== Testing debug system ===');
  
  // Test if debug console exists
  const debugConsoleElement = document.querySelector("#debug-console");
  console.log('Debug console element:', debugConsoleElement);
  
  // Test debug logging
  debugLog('Test message from testDebugSystem()', 'info');
  debugLog('Test warning message', 'warn');
  debugLog('Test error message', 'error');
  debugLog('Test success message', 'success');
  
  // Test status updates
  updatePagedJSStatus('Testing');
  updatePagedJSPages(42);
  updatePagedJSError('Test error message');
  
  // Test button functionality
  const buttons = {
    clear: document.querySelector("#debug-clear-btn"),
    export: document.querySelector("#debug-export-btn"),
    reinit: document.querySelector("#debug-reinit-btn"),
    testOverflow: document.querySelector("#debug-test-overflow-btn"),
    analyzeContent: document.querySelector("#debug-analyze-content-btn")
  };
  
  console.log('Button elements found:', buttons);
  
  // Test if buttons have event listeners
  Object.entries(buttons).forEach(([name, btn]) => {
    if (btn) {
      console.log(`Button ${name}: found, click to test functionality`);
    } else {
      console.log(`Button ${name}: NOT FOUND`);
    }
  });
  
  console.log('=== Debug system test completed ===');
  return buttons;
}

// Make it globally available
window.testDebugSystem = testDebugSystem;
