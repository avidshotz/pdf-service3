document.addEventListener('DOMContentLoaded', function() {
    const convertCurrentPageBtn = document.getElementById('convertCurrentPage');
    const convertSelectionBtn = document.getElementById('convertSelection');
    const convertHTMLBtn = document.getElementById('convertHTML');
    const clearHTMLBtn = document.getElementById('clearHTML');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    loadSettings();

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    convertCurrentPageBtn.addEventListener('click', function() {
        convertToPDF('currentPage');
    });

    convertSelectionBtn.addEventListener('click', function() {
        convertToPDF('selection');
    });

    convertHTMLBtn.addEventListener('click', function() {
        convertHTMLToPDF();
    });

    clearHTMLBtn.addEventListener('click', function() {
        document.getElementById('htmlInput').value = '';
    });

    function convertToPDF(type) {
        const settings = getSettings();
        
        showStatus('Converting to PDF...', 'loading');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs || tabs.length === 0) {
                showStatus('Error: No active tab found', 'error');
                return;
            }
            
            const activeTab = tabs[0];
            
            // Check if we can access this tab
            if (!activeTab.url || activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
                showStatus('Cannot access this page. Try a regular website.', 'error');
                return;
            }
            
            // Execute script to get content and generate PDF
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: getPageContent,
                args: [type, settings]
            }, function(result) {
                if (chrome.runtime.lastError) {
                    const errorMsg = chrome.runtime.lastError.message;
                    if (errorMsg.includes('Cannot access contents')) {
                        showStatus('Cannot access this page. Try a regular website or use HTML Input tab.', 'error');
                    } else {
                        showStatus('Error: ' + errorMsg, 'error');
                    }
                    return;
                }
                
                if (result && result[0] && result[0].result) {
                    const resultData = result[0].result;
                    if (resultData === false) {
                        showStatus('Error: Could not process page content. Try selecting text or use HTML Input tab.', 'error');
                    } else {
                        generatePDFFromHTML(resultData, settings);
                    }
                } else {
                    showStatus('Error: Could not process page content', 'error');
                }
            });
        });
    }

    // Function to be injected into the current tab
    function getPageContent(type, settings) {
        try {
            let html = '';
            
            if (type === 'currentPage') {
                // Clone the document to avoid modifying the original
                const clone = document.cloneNode(true);
                
                // Remove scripts and other unnecessary elements
                const scripts = clone.querySelectorAll('script, style[data-vite-dev-id], link[rel="stylesheet"]');
                scripts.forEach(script => script.remove());
                
                // Add base URL for relative links
                const base = document.createElement('base');
                base.href = window.location.href;
                clone.head.insertBefore(base, clone.head.firstChild);
                
                // Convert relative URLs to absolute
                convertRelativeUrls(clone);
                
                // Render HTML code blocks
                renderHTMLCodeBlocks(clone);
                
                html = clone.documentElement.outerHTML;
            } else if (type === 'selection') {
                const selection = window.getSelection();
                if (!selection.rangeCount) {
                    return false;
                }
                
                const range = selection.getRangeAt(0);
                const container = document.createElement('div');
                container.appendChild(range.cloneContents());
                
                // Convert relative URLs to absolute
                convertRelativeUrls(container);
                
                // Render HTML code blocks
                renderHTMLCodeBlocks(container);
                
                html = container.innerHTML;
            }
            
            if (!html) {
                return false;
            }
            
            // Create a complete HTML document with Liberation Serif font
            const completeHTML = createCompleteHTMLDocument(html, settings);
            
            // Create a blob URL to avoid "Cannot access contents of url" error
            const blob = new Blob([completeHTML], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            return blobUrl;
        } catch (error) {
            console.error('Error processing page content:', error);
            return false;
        }
    }

    function convertRelativeUrls(element) {
        // Convert relative URLs in img, a, and other elements
        const elementsWithUrls = element.querySelectorAll('img, a, link, script');
        
        elementsWithUrls.forEach(el => {
            if (el.src && !el.src.startsWith('http')) {
                el.src = new URL(el.src, window.location.href).href;
            }
            if (el.href && !el.href.startsWith('http')) {
                el.href = new URL(el.href, window.location.href).href;
            }
        });
        
        // Convert CSS background images
        const elementsWithBackground = element.querySelectorAll('*');
        elementsWithBackground.forEach(el => {
            const style = window.getComputedStyle(el);
            const backgroundImage = style.backgroundImage;
            
            if (backgroundImage && backgroundImage !== 'none') {
                const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch) {
                    const url = urlMatch[1];
                    if (!url.startsWith('http') && !url.startsWith('data:')) {
                        const absoluteUrl = new URL(url, window.location.href).href;
                        el.style.backgroundImage = `url("${absoluteUrl}")`;
                    }
                }
            }
        });
    }

    function renderHTMLCodeBlocks(element) {
        // Find all <code> blocks that contain HTML
        const codeBlocks = element.querySelectorAll('code');
        
        codeBlocks.forEach(codeBlock => {
            const content = codeBlock.textContent.trim();
            
            // Check if this looks like HTML (contains tags)
            if (content.includes('<') && content.includes('>')) {
                try {
                    // Create a temporary div to parse the HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    
                    // If it successfully parsed as HTML, render it
                    if (tempDiv.children.length > 0 || content.includes('<html') || content.includes('<body')) {
                        // Create a container for the rendered HTML
                        const container = document.createElement('div');
                        container.style.border = '1px solid #ddd';
                        container.style.padding = '10px';
                        container.style.margin = '10px 0';
                        container.style.backgroundColor = '#f9f9f9';
                        
                        // Add a label
                        const label = document.createElement('div');
                        label.textContent = 'Rendered HTML Preview:';
                        label.style.fontWeight = 'bold';
                        label.style.marginBottom = '5px';
                        label.style.color = '#666';
                        container.appendChild(label);
                        
                        // Add the rendered HTML
                        const renderedDiv = document.createElement('div');
                        renderedDiv.innerHTML = content;
                        container.appendChild(renderedDiv);
                        
                        // Insert after the code block
                        codeBlock.parentNode.insertBefore(container, codeBlock.nextSibling);
                    }
                } catch (error) {
                    // If parsing fails, leave the code block as is
                    console.log('Could not parse HTML in code block:', error);
                }
            }
        });
    }

    function createCompleteHTMLDocument(html, settings) {
        // Check if the HTML already has a complete document structure
        const hasHTML = /<html[^>]*>/i.test(html);
        const hasHead = /<head[^>]*>/i.test(html);
        const hasBody = /<body[^>]*>/i.test(html);
        
        if (hasHTML && hasHead && hasBody) {
            // It's a complete HTML document, just add Liberation Serif font
            return html.replace('</head>', `
                <style>
                    body {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                        font-size: 12pt;
                        line-height: 1.4;
                        margin: ${settings.margin}mm;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                    }
                    p, div, span, li, td, th {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                    }
                    pre, code {
                        font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
                    }
                </style>
            </head>`);
        } else {
            // Create a complete HTML document
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML to PDF</title>
    <style>
        body {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
            font-size: 12pt;
            line-height: 1.4;
            margin: ${settings.margin}mm;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 24pt; }
        h2 { font-size: 20pt; }
        h3 { font-size: 16pt; }
        p, div, span, li, td, th {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
        }
        pre, code {
            font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        li {
            margin: 0.5em 0;
        }
        blockquote {
            border-left: 4px solid #007bff;
            margin: 1em 0;
            padding-left: 1em;
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
        }
    }

    function generatePDFFromHTML(htmlOrBlobUrl, settings) {
        showStatus('Generating PDF...', 'loading');

        let htmlContentPromise;
        if (htmlOrBlobUrl.startsWith('blob:')) {
            htmlContentPromise = fetch(htmlOrBlobUrl)
                .then(response => response.text())
                .finally(() => URL.revokeObjectURL(htmlOrBlobUrl));
        } else {
            htmlContentPromise = Promise.resolve(htmlOrBlobUrl);
        }

        htmlContentPromise.then(html => {
            // Create a temporary div to render the HTML
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.padding = '20px';
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);
            
            // Load html2canvas and jsPDF from local files
            const script1 = document.createElement('script');
            script1.src = chrome.runtime.getURL('html2canvas.min.js');
            script1.onerror = function() {
                showStatus('Error: Failed to load html2canvas library', 'error');
                document.body.removeChild(tempDiv);
            };
            
            const script2 = document.createElement('script');
            script2.src = chrome.runtime.getURL('jspdf.umd.min.js');
            script2.onerror = function() {
                showStatus('Error: Failed to load jsPDF library', 'error');
                document.body.removeChild(tempDiv);
            };
            
            script1.onload = function() {
                script2.onload = function() {
                    // Wait a moment for libraries to initialize
                    setTimeout(() => {
                        // Check if libraries loaded properly
                        if (typeof html2canvas === 'undefined') {
                            showStatus('Error: html2canvas library failed to load', 'error');
                            document.body.removeChild(tempDiv);
                            return;
                        }
                        if (typeof window.jspdf === 'undefined') {
                            showStatus('Error: jsPDF library failed to load', 'error');
                            document.body.removeChild(tempDiv);
                            return;
                        }
                    // Generate PDF
                    html2canvas(tempDiv, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: 800,
                        height: tempDiv.scrollHeight
                    }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF({
                            orientation: settings.orientation,
                            unit: 'mm',
                            format: settings.pageSize
                        });
                        
                        const imgWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        let heightLeft = imgHeight;
                        let position = 0;
                        
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                        
                        while (heightLeft >= 0) {
                            position = heightLeft - imgHeight;
                            pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                            heightLeft -= pageHeight;
                        }
                        
                        // Convert to base64 and download
                        const pdfBase64 = pdf.output('datauristring').split(',')[1];
                        downloadPDF(pdfBase64, settings.filename);
                        
                        // Clean up
                        document.body.removeChild(tempDiv);
                    }).catch(error => {
                        showStatus('Error generating PDF: ' + error.message, 'error');
                        document.body.removeChild(tempDiv);
                    });
                    }, 100); // Small delay to ensure libraries are ready
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
        }).catch(error => {
            showStatus('Error fetching HTML content: ' + error.message, 'error');
        });
    }

    function downloadPDF(pdfData, filename) {
        try {
            // Convert base64 to blob
            const byteCharacters = atob(pdfData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // Create download URL
            const url = URL.createObjectURL(blob);
            
            // Download the file
            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            }, function(downloadId) {
                if (chrome.runtime.lastError) {
                    showStatus('Error downloading PDF: ' + chrome.runtime.lastError.message, 'error');
                } else {
                    showStatus('PDF downloaded successfully!', 'success');
                }
                // Clean up the URL
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            showStatus('Error creating PDF: ' + error.message, 'error');
        }
    }



    function convertHTMLToPDF() {
        const htmlInput = document.getElementById('htmlInput');
        const html = htmlInput.value.trim();
        
        if (!html) {
            showStatus('Please enter some HTML code', 'error');
            return;
        }
        
        const settings = getSettings();
        showStatus('Converting HTML to PDF...', 'loading');
        
        // Create a complete HTML document with Liberation Serif font
        const completeHTML = createCompleteHTMLDocument(html, settings);
        
        // Create a temporary div to render HTML code blocks
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = completeHTML;
        renderHTMLCodeBlocks(tempDiv);
        const processedHTML = tempDiv.innerHTML;
        
        // Generate PDF directly
        generatePDFFromHTML(processedHTML, settings);
    }



    function createCompleteHTMLDocument(html, settings) {
        // Check if the HTML already has a complete document structure
        const hasHTML = /<html[^>]*>/i.test(html);
        const hasHead = /<head[^>]*>/i.test(html);
        const hasBody = /<body[^>]*>/i.test(html);
        
        if (hasHTML && hasHead && hasBody) {
            // It's a complete HTML document, just add Liberation Serif font
            return html.replace('</head>', `
                <style>
                    body {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                        font-size: 12pt;
                        line-height: 1.4;
                        margin: ${settings.margin}mm;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                    }
                    p, div, span, li, td, th {
                        font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
                    }
                    pre, code {
                        font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
                    }
                </style>
            </head>`);
        } else {
            // Create a complete HTML document
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML to PDF</title>
    <style>
        body {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
            font-size: 12pt;
            line-height: 1.4;
            margin: ${settings.margin}mm;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 24pt; }
        h2 { font-size: 20pt; }
        h3 { font-size: 16pt; }
        p, div, span, li, td, th {
            font-family: 'Liberation Serif', 'Times New Roman', 'Georgia', serif !important;
        }
        pre, code {
            font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        li {
            margin: 0.5em 0;
        }
        blockquote {
            border-left: 4px solid #007bff;
            margin: 1em 0;
            padding-left: 1em;
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
        }
    }

    function getSettings() {
        return {
            pageSize: document.getElementById('pageSize').value || 'A4',
            orientation: document.getElementById('orientation').value || 'portrait',
            margin: parseInt(document.getElementById('margin').value) || 10,
            filename: document.getElementById('filename').value || 'document.pdf'
        };
    }

    function loadSettings() {
        chrome.storage.sync.get(['pageSize', 'orientation', 'margin', 'filename'], function(items) {
            if (items.pageSize) document.getElementById('pageSize').value = items.pageSize;
            if (items.orientation) document.getElementById('orientation').value = items.orientation;
            if (items.margin) document.getElementById('margin').value = items.margin;
            if (items.filename) document.getElementById('filename').value = items.filename;
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 3000);
        }
    }

    // Save settings when changed
    document.getElementById('pageSize').addEventListener('change', saveSettings);
    document.getElementById('orientation').addEventListener('change', saveSettings);
    document.getElementById('margin').addEventListener('change', saveSettings);
    document.getElementById('filename').addEventListener('input', saveSettings);

    function saveSettings() {
        const settings = getSettings();
        chrome.storage.sync.set(settings);
    }
});
