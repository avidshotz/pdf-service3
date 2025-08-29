/**
 * HTML to PDF Converter - Standalone Node.js Module
 * 
 * This module provides a function to convert HTML content to PDF files
 * using Puppeteer (headless Chrome) for high-quality rendering.
 * 
 * Features:
 * - Converts HTML strings to PDF files
 * - Supports custom page sizes, orientations, and margins
 * - Applies Liberation Serif font for professional typography
 * - Handles HTML code blocks rendering
 * - Automatic file download/saving
 * - Command-line interface for batch processing
 * - Comprehensive error handling and logging
 * 
 * Dependencies:
 * - puppeteer: For headless browser automation and PDF generation
 * - fs.promises: For asynchronous file system operations
 * - path: For file path manipulation
 * 
 * Usage Examples:
 * 
 * // As a module
 * const { convertHTMLToPDF } = require('./pdf-converter.js');
 * 
 * // Basic usage
 * await convertHTMLToPDF('<h1>Hello World</h1>', 'output.pdf');
 * 
 * // Advanced usage with options
 * await convertHTMLToPDF(htmlContent, 'output.pdf', {
 *   pageSize: 'A4',
 *   orientation: 'portrait',
 *   margin: 10,
 *   includeFonts: true,
 *   renderCodeBlocks: true
 * });
 * 
 * // Command line usage
 * node pdf-converter.js input.html output.pdf --page-size=Letter --orientation=landscape
 * 
 * @author PDF Service Team
 * @version 1.0.0
 * @license MIT
 */

// Import required Node.js modules
const puppeteer = require('puppeteer'); // Headless Chrome browser automation
const fs = require('fs').promises; // Asynchronous file system operations
const path = require('path'); // File path utilities

/**
 * Converts HTML content to a PDF file using Puppeteer
 * 
 * This is the main function that orchestrates the entire PDF conversion process.
 * It launches a headless browser, processes the HTML content, applies styling,
 * and generates a high-quality PDF file.
 * 
 * Process Flow:
 * 1. Validate and set default options
 * 2. Launch Puppeteer browser instance
 * 3. Create a new page and set content
 * 4. Process HTML with fonts and styling
 * 5. Generate PDF with specified options
 * 6. Clean up browser resources
 * 
 * @param {string} htmlContent - The HTML content to convert (can be partial HTML or complete document)
 * @param {string} outputPath - Path where the PDF file should be saved (absolute or relative)
 * @param {Object} options - Configuration options for the PDF generation
 * @param {string} options.pageSize - Page size: 'A4', 'Letter', 'Legal', 'A3' (default: 'A4')
 * @param {string} options.orientation - Page orientation: 'portrait' or 'landscape' (default: 'portrait')
 * @param {number} options.margin - Margin in millimeters (default: 10)
 * @param {boolean} options.includeFonts - Whether to include Liberation Serif font (default: true)
 * @param {boolean} options.renderCodeBlocks - Whether to render HTML code blocks as actual HTML (default: true)
 * @returns {Promise<string>} - Path to the generated PDF file
 * @throws {Error} - If PDF generation fails or browser cannot be launched
 * 
 * @example
 * // Basic usage
 * const pdfPath = await convertHTMLToPDF('<h1>Hello World</h1>', 'output.pdf');
 * 
 * @example
 * // Advanced usage with custom options
 * const pdfPath = await convertHTMLToPDF(htmlContent, 'output.pdf', {
 *   pageSize: 'Letter',
 *   orientation: 'landscape',
 *   margin: 20,
 *   includeFonts: false
 * });
 */
async function convertHTMLToPDF(htmlContent, outputPath, options = {}) {
    // Validate input parameters
    if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('htmlContent must be a non-empty string');
    }
    if (!outputPath || typeof outputPath !== 'string') {
        throw new Error('outputPath must be a non-empty string');
    }

    // Set default options and merge with provided options
    // This ensures all required properties exist with sensible defaults
    const config = {
        pageSize: options.pageSize || 'A4',
        orientation: options.orientation || 'portrait',
        margin: options.margin || 10,
        includeFonts: options.includeFonts !== false, // Default to true unless explicitly set to false
        renderCodeBlocks: options.renderCodeBlocks !== false, // Default to true unless explicitly set to false
        ...options // Spread any additional options
    };

    // Log configuration for debugging and transparency
    console.log('🚀 Starting HTML to PDF conversion...');
    console.log(`📄 Page Size: ${config.pageSize}`);
    console.log(`🔄 Orientation: ${config.orientation}`);
    console.log(`📏 Margin: ${config.margin}mm`);
    console.log(`🔤 Include Fonts: ${config.includeFonts}`);
    console.log(`💻 Render Code Blocks: ${config.renderCodeBlocks}`);

    let browser;
    try {
        // Launch Puppeteer browser instance with optimized settings
        // These settings are designed for server-side operation and stability
        console.log('🌐 Launching browser...');
        browser = await puppeteer.launch({
            headless: true, // Run in headless mode (no GUI) for server environments
            args: [
                '--no-sandbox', // Required for some server environments (Docker, etc.)
                '--disable-setuid-sandbox', // Disable setuid sandbox for security
                '--disable-dev-shm-usage', // Prevents issues in Docker containers with limited shared memory
                '--disable-gpu', // Disable GPU hardware acceleration for stability
                '--no-first-run', // Skip first run setup
                '--no-zygote', // Disable zygote process for better resource management
                '--single-process' // Run in single process mode for better isolation
            ]
        });

        // Create a new page in the browser for content rendering
        console.log('📄 Creating new page...');
        const page = await browser.newPage();

        // Process the HTML content to add fonts, styling, and handle code blocks
        // This step ensures the HTML is properly formatted for PDF generation
        const processedHTML = processHTMLContent(htmlContent, config);
        
        // Set the page content with our processed HTML
        // waitUntil: 'networkidle0' ensures all resources are loaded before proceeding
        console.log('📝 Setting page content...');
        await page.setContent(processedHTML, {
            waitUntil: 'networkidle0' // Wait until network is idle (no requests for 500ms)
        });

        // Configure PDF generation options
        // These options control the appearance and layout of the generated PDF
        const pdfOptions = {
            path: outputPath, // Output file path
            format: config.pageSize, // Page size (A4, Letter, etc.)
            landscape: config.orientation === 'landscape', // Convert orientation to boolean
            margin: {
                top: `${config.margin}mm`, // Top margin
                right: `${config.margin}mm`, // Right margin
                bottom: `${config.margin}mm`, // Bottom margin
                left: `${config.margin}mm` // Left margin
            },
            printBackground: true, // Include background colors and images in PDF
            preferCSSPageSize: true, // Use CSS page size if available in the HTML
            displayHeaderFooter: false, // Don't show browser header/footer
            scale: 1.0 // Scale factor (1.0 = 100%, 0.8 = 80%, etc.)
        };

        console.log('🖨️ Generating PDF...');
        
        // Generate the PDF using Puppeteer's PDF generation capabilities
        // This is the core operation that converts the rendered page to PDF
        await page.pdf(pdfOptions);

        console.log(`✅ PDF generated successfully: ${outputPath}`);
        return outputPath;

    } catch (error) {
        // Log detailed error information for debugging
        console.error('❌ Error generating PDF:', error.message);
        console.error('Stack trace:', error.stack);
        throw error; // Re-throw the error for the calling code to handle
    } finally {
        // Always close the browser to free up system resources
        // This is crucial for preventing memory leaks in long-running applications
        if (browser) {
            console.log('🔒 Closing browser...');
            await browser.close();
        }
    }
}

/**
 * Processes HTML content to add fonts, styling, and render code blocks
 * 
 * This function prepares the HTML content for PDF generation by:
 * 1. Checking if the HTML is a complete document or needs wrapping
 * 2. Adding professional CSS styling with Liberation Serif font
 * 3. Optionally rendering HTML code blocks as actual HTML previews
 * 4. Fixing centering issues by removing interfering wrapper divs
 * 
 * The function handles both complete HTML documents and partial HTML fragments,
 * ensuring consistent styling and typography in the final PDF.
 * 
 * @param {string} htmlContent - Raw HTML content (can be complete document or fragment)
 * @param {Object} config - Configuration options from the main function
 * @param {boolean} config.includeFonts - Whether to include Liberation Serif font
 * @param {boolean} config.renderCodeBlocks - Whether to render HTML code blocks
 * @param {number} config.margin - Margin setting for CSS
 * @returns {string} - Processed HTML with fonts, styling, and rendered code blocks
 * 
 * @example
 * const processed = processHTMLContent('<h1>Hello</h1>', { includeFonts: true });
 * // Returns complete HTML document with CSS styling
 */
function processHTMLContent(htmlContent, config) {
    console.log('🎨 Processing HTML content...');

    // Fix centering issues by removing interfering wrapper divs
    console.log('🔧 Fixing centering issues...');
    htmlContent = fixCenteringIssues(htmlContent);

    // Check if the HTML already has a complete document structure
    // This regex checks for the presence of HTML, head, and body tags
    const hasHTML = /<html[^>]*>/i.test(htmlContent);
    const hasHead = /<head[^>]*>/i.test(htmlContent);
    const hasBody = /<body[^>]*>/i.test(htmlContent);

    let processedHTML = htmlContent;

    // If it's not a complete HTML document, wrap it in a proper HTML structure
    // This ensures consistent rendering regardless of input format
    if (!hasHTML || !hasHead || !hasBody) {
        console.log('📋 Wrapping HTML content in complete document structure...');
        processedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML to PDF</title>
    ${generateCSS(config)}
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    } else {
        // It's a complete HTML document, just inject our CSS into the head section
        console.log('📋 Adding CSS to existing HTML document...');
        processedHTML = htmlContent.replace('</head>', `${generateCSS(config)}
</head>`);
    }

    // Optionally render HTML code blocks as actual HTML previews
    // This is useful for documentation that shows both code and rendered output
    if (config.renderCodeBlocks) {
        console.log('🔧 Rendering HTML code blocks...');
        processedHTML = renderHTMLCodeBlocks(processedHTML);
    }

    return processedHTML;
}

/**
 * Generates CSS styles for the PDF with professional typography and layout
 * 
 * This function creates comprehensive CSS that ensures:
 * - Professional typography using Liberation Serif font
 * - Proper page breaks and layout control
 * - Consistent styling across different HTML elements
 * - Print-optimized styles for PDF generation
 * - Responsive design that works well in PDF format
 * 
 * The CSS includes styles for:
 * - Typography and fonts
 * - Headings and text hierarchy
 * - Code blocks and syntax highlighting
 * - Tables and data presentation
 * - Images and media
 * - Lists and navigation
 * - Blockquotes and citations
 * - Page break controls
 * - Print-specific optimizations
 * 
 * @param {Object} config - Configuration options
 * @param {boolean} config.includeFonts - Whether to include Liberation Serif font
 * @param {number} config.margin - Margin setting for the document
 * @returns {string} - Complete CSS styles as a string
 * 
 * @example
 * const css = generateCSS({ includeFonts: true, margin: 15 });
 * // Returns CSS string with Liberation Serif font and 15mm margins
 */
function generateCSS(config) {
    // Base CSS with Liberation Serif font and professional styling
    // The CSS is designed for PDF generation with print-optimized styles
    let css = `
    <style>
        /* Import Liberation Serif font from Google Fonts if enabled */
        /* This font provides excellent readability and professional appearance */
        ${config.includeFonts ? `
        @import url('https://fonts.googleapis.com/css2?family=Liberation+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        ` : ''}
        
        /* Base styles for the document body */
        /* These styles establish the foundation for all content */
        body {
            font-family: ${config.includeFonts ? "'Liberation Serif', 'Times New Roman', 'Georgia', serif" : "'Times New Roman', 'Georgia', serif"} !important;
            font-size: 12pt; /* Standard document font size */
            line-height: 1.4; /* Comfortable reading line height */
            margin: ${config.margin}mm; /* Apply configured margins */
            color: #333; /* Dark gray for good readability */
            background: white; /* Clean white background */
        }
        
        /* Heading styles with proper hierarchy and spacing */
        /* Headings use the same font family for consistency */
        h1, h2, h3, h4, h5, h6 {
            font-family: ${config.includeFonts ? "'Liberation Serif', 'Times New Roman', 'Georgia', serif" : "'Times New Roman', 'Georgia', serif"} !important;
            color: #000000 !important; /* Pure black for headings - no blue tint */
            background: none !important; /* Remove any background gradients */
            border: none !important; /* Remove any borders */
            text-decoration: none !important; /* Remove any underlines */
            box-shadow: none !important; /* Remove any shadows */
            margin-top: 1.5em; /* Generous top margin */
            margin-bottom: 0.5em; /* Tighter bottom margin */
            page-break-after: avoid; /* Prevent headings from being orphaned at page breaks */
        }
        
        /* Specific heading sizes for clear hierarchy */
        h1 { font-size: 24pt; } /* Main title */
        h2 { font-size: 20pt; } /* Section headers */
        h3 { font-size: 16pt; } /* Subsection headers */
        
        /* Apply consistent font family to all text elements */
        /* This ensures typography consistency throughout the document */
        p, div, span, li, td, th {
            font-family: ${config.includeFonts ? "'Liberation Serif', 'Times New Roman', 'Georgia', serif" : "'Times New Roman', 'Georgia', serif"} !important;
        }
        
        /* Code blocks styling for technical content */
        /* Uses monospace font for code readability */
        pre, code {
            font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
            background-color: #f8f9fa; /* Light gray background */
            padding: 8px; /* Internal spacing */
            border-radius: 4px; /* Rounded corners */
            border: 1px solid #e9ecef; /* Subtle border */
            white-space: pre-wrap; /* Preserve whitespace and wrap long lines */
            word-wrap: break-word; /* Break long words to prevent overflow */
        }
        
        /* Table styles for data presentation */
        /* Ensures tables are well-formatted and readable */
        table {
            border-collapse: collapse; /* Remove spacing between cells */
            width: 100%; /* Full width tables */
            margin: 1em 0; /* Vertical spacing around tables */
            page-break-inside: avoid; /* Keep tables together on same page */
        }
        
        /* Table cell styling */
        th, td {
            border: 1px solid #ddd; /* Light gray borders */
            padding: 8px; /* Cell padding */
            text-align: left; /* Left-aligned text */
        }
        
        /* Table header styling */
        th {
            background-color: #f8f9fa; /* Light background for headers */
            font-weight: bold; /* Bold text for headers */
        }
        
        /* Image styling for media content */
        /* Ensures images scale properly and don't break across pages */
        img {
            max-width: 100%; /* Prevent images from overflowing */
            height: auto; /* Maintain aspect ratio */
            page-break-inside: avoid; /* Keep images with their content */
        }
        
        /* List styling for organized content */
        /* Provides proper indentation and spacing for lists */
        ul, ol {
            margin: 1em 0; /* Vertical spacing around lists */
            padding-left: 2em; /* Indent list items */
        }
        
        /* List item styling */
        li {
            margin: 0.5em 0; /* Spacing between list items */
        }
        
        /* Blockquote styling for citations and quotes */
        /* Provides visual distinction for quoted content */
        blockquote {
            border-left: 4px solid #007bff; /* Blue left border */
            margin: 1em 0; /* Vertical spacing */
            padding-left: 1em; /* Left padding for content */
            font-style: italic; /* Italic text for quotes */
            color: #666; /* Gray color for subtle appearance */
        }
        
        /* Page break controls for layout management */
        /* These classes can be used in HTML to control page breaks */
        .page-break {
            page-break-before: always; /* Force page break before element */
        }
        
        .no-break {
            page-break-inside: avoid; /* Prevent element from breaking across pages */
        }
        
        /* Print-specific styles for PDF optimization */
        /* These styles ensure optimal rendering in PDF format */
        @media print {
            body {
                margin: 0; /* Remove body margins for print */
                padding: ${config.margin}mm; /* Apply margins as padding */
            }
            
            /* Ensure good contrast and color accuracy for printing */
            /* This is crucial for PDF generation quality */
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>`;

    return css;
}

/**
 * Fixes centering issues by removing interfering wrapper divs
 * 
 * This function detects and removes wrapper divs that prevent proper centering
 * of content. It looks for patterns where a wrapper div contains a child div
 * with centering styles (like margin: auto) and removes the wrapper to allow
 * the centering to work properly.
 * 
 * Common patterns it fixes:
 * - <div class="content"><div style="margin: auto">...</div></div>
 * - <div><div style="margin: 0 auto">...</div></div>
 * - Any wrapper div that contains a div with auto margins
 * 
 * @param {string} htmlContent - HTML content to process
 * @returns {string} - HTML content with centering issues fixed
 * 
 * @example
 * // Input: <div class="content"><div style="margin: auto">Centered content</div></div>
 * // Output: <div style="margin: auto">Centered content</div>
 */
function fixCenteringIssues(htmlContent) {
    // Pattern to match wrapper divs that contain divs with auto margins
    // This regex looks for a div that contains another div with margin: auto or margin: 0 auto
    const centeringPattern = /<div[^>]*class\s*=\s*["']content["'][^>]*>\s*(<div[^>]*style\s*=\s*["'][^"']*margin\s*:\s*[^"']*auto[^"']*["'][^>]*>[\s\S]*?<\/div>)\s*<\/div>/gi;
    
    // Also match any wrapper div that contains a div with auto margins (more general pattern)
    const generalCenteringPattern = /<div[^>]*>\s*(<div[^>]*style\s*=\s*["'][^"']*margin\s*:\s*[^"']*auto[^"']*["'][^>]*>[\s\S]*?<\/div>)\s*<\/div>/gi;
    
    let fixedContent = htmlContent;
    
    // First, try to match the specific "content" class pattern
    if (centeringPattern.test(fixedContent)) {
        console.log('🎯 Found wrapper div with "content" class interfering with centering - removing it');
        fixedContent = fixedContent.replace(centeringPattern, '$1');
    }
    
    // Then check for general wrapper divs that might interfere with centering
    // We need to be more careful with this pattern to avoid removing legitimate nested divs
    const generalMatches = fixedContent.match(generalCenteringPattern);
    if (generalMatches) {
        // Only remove wrapper divs if they don't have meaningful styling or content
        // and if the inner div has clear centering styles
        fixedContent = fixedContent.replace(generalCenteringPattern, (match, innerDiv) => {
            // Check if the wrapper div has minimal or no styling
            const wrapperDiv = match.replace(innerDiv, '').replace(/<\/div>$/, '');
            const hasMinimalStyling = !wrapperDiv.includes('style=') || 
                                    wrapperDiv.includes('style=""') || 
                                    wrapperDiv.includes("style=''");
            
            // Check if the inner div has clear centering styles
            const hasCenteringStyles = innerDiv.includes('margin:') && 
                                     (innerDiv.includes('auto') || innerDiv.includes('center'));
            
            if (hasMinimalStyling && hasCenteringStyles) {
                console.log('🎯 Found interfering wrapper div - removing it to fix centering');
                return innerDiv;
            }
            
            // Keep the original if the wrapper has meaningful styling
            return match;
        });
    }
    
    return fixedContent;
}

/**
 * Renders HTML code blocks as actual HTML in the document
 * 
 * This function finds <pre><code> blocks that contain HTML markup and renders them
 * as actual HTML elements with a preview label. This is useful for documentation
 * that shows both the code and its rendered output.
 * 
 * The function uses regex to identify code blocks and checks if they contain HTML
 * tags. If HTML is detected, it creates a preview section showing how the code
 * would render.
 * 
 * Note: This is a simplified implementation using regex. For production use with
 * complex HTML, consider using a proper HTML parser like jsdom or cheerio.
 * 
 * @param {string} htmlContent - HTML content to process
 * @returns {string} - HTML content with rendered code blocks
 * 
 * @example
 * // Input: <pre><code>&lt;h1&gt;Hello World&lt;/h1&gt;</code></pre>
 * // Output: Original code block + rendered HTML preview
 */
function renderHTMLCodeBlocks(htmlContent) {
    // Use regex to find and replace code blocks
    // This pattern matches <pre><code>content</code></pre> with any content
    return htmlContent.replace(
        /<pre><code>([\s\S]*?)<\/code><\/pre>/gi,
        (match, codeContent) => {
            // Check if this looks like HTML (contains angle brackets)
            // This is a simple heuristic - in practice, you might want more sophisticated detection
            if (codeContent.includes('<') && codeContent.includes('>')) {
                // Create a container for the rendered HTML preview
                // The preview is styled to be visually distinct from the code
                const renderedHTML = `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: #666;">Rendered HTML Preview:</div>
                    <div>${codeContent}</div>
                </div>`;
                
                // Return both the original code block and the rendered version
                // This allows users to see both the code and its output
                return match + renderedHTML;
            }
            
            // If it's not HTML, just return the original code block unchanged
            return match;
        }
    );
}

/**
 * Command-line interface for the PDF converter
 * 
 * This function provides a CLI for batch processing HTML files to PDF.
 * It parses command-line arguments, reads input files, and calls the main
 * conversion function with appropriate options.
 * 
 * Command-line usage:
 * node pdf-converter.js <input-file> <output-file> [options]
 * 
 * Arguments:
 * - input-file: Path to HTML file or '-' for stdin
 * - output-file: Path where PDF should be saved
 * 
 * Options:
 * - --page-size=A4|Letter|Legal|A3: Set page size
 * - --orientation=portrait|landscape: Set page orientation
 * - --margin=10: Set margin in millimeters
 * - --no-fonts: Disable Liberation Serif font
 * - --no-code-blocks: Disable HTML code block rendering
 * 
 * Examples:
 * node pdf-converter.js input.html output.pdf
 * node pdf-converter.js input.html output.pdf --page-size=Letter --orientation=landscape
 * node pdf-converter.js input.html output.pdf --margin=20 --no-fonts
 * cat input.html | node pdf-converter.js - output.pdf
 * 
 * @returns {Promise<void>} - Resolves when conversion is complete
 * @throws {Error} - If conversion fails or arguments are invalid
 */
async function main() {
    // Get command-line arguments (skip first two: node executable and script name)
    const args = process.argv.slice(2);
    
    // Show help if insufficient arguments provided
    if (args.length < 2) {
        console.log(`
📄 HTML to PDF Converter - Command Line Interface

Usage: node pdf-converter.js <input-file> <output-file> [options]

Arguments:
  input-file    Path to HTML file or '-' for stdin
  output-file   Path where PDF should be saved

Options:
  --page-size=A4|Letter|Legal|A3     Page size (default: A4)
  --orientation=portrait|landscape   Page orientation (default: portrait)
  --margin=10                        Margin in mm (default: 10)
  --no-fonts                         Disable Liberation Serif font
  --no-code-blocks                   Disable HTML code block rendering

Examples:
  node pdf-converter.js input.html output.pdf
  node pdf-converter.js input.html output.pdf --page-size=Letter --orientation=landscape
  node pdf-converter.js input.html output.pdf --margin=20 --no-fonts
  cat input.html | node pdf-converter.js - output.pdf
        `);
        process.exit(1); // Exit with error code
    }

    // Extract input file, output file, and options from arguments
    const [inputFile, outputFile, ...options] = args;
    
    // Initialize configuration with default values
    const config = {
        pageSize: 'A4',
        orientation: 'portrait',
        margin: 10,
        includeFonts: true,
        renderCodeBlocks: true
    };

    // Parse command line options and update configuration
    // This loop processes each option and updates the config object accordingly
    options.forEach(option => {
        if (option.startsWith('--page-size=')) {
            config.pageSize = option.split('=')[1];
        } else if (option.startsWith('--orientation=')) {
            config.orientation = option.split('=')[1];
        } else if (option.startsWith('--margin=')) {
            config.margin = parseInt(option.split('=')[1]);
        } else if (option === '--no-fonts') {
            config.includeFonts = false;
        } else if (option === '--no-code-blocks') {
            config.renderCodeBlocks = false;
        }
    });

    try {
        console.log('📖 Reading input file...');
        
        // Read input file or stdin based on the input parameter
        let htmlContent;
        if (inputFile === '-') {
            // Read from stdin (useful for piping content)
            console.log('📥 Reading from stdin...');
            htmlContent = await new Promise((resolve) => {
                let data = '';
                process.stdin.on('data', chunk => data += chunk);
                process.stdin.on('end', () => resolve(data));
            });
        } else {
            // Read from specified file
            console.log(`📂 Reading file: ${inputFile}`);
            htmlContent = await fs.readFile(inputFile, 'utf8');
        }

        console.log(`📄 Converting ${inputFile} to ${outputFile}...`);
        
        // Call the main conversion function with the processed content and configuration
        await convertHTMLToPDF(htmlContent, outputFile, config);
        
        console.log(`🎉 Success! PDF saved to: ${outputFile}`);
        
    } catch (error) {
        // Handle and display errors with helpful information
        console.error('❌ Error:', error.message);
        console.error('💡 Tip: Check that the input file exists and is valid HTML');
        process.exit(1); // Exit with error code
    }
}

// Export the main functions for use as a module
// This allows other files to import and use these functions
module.exports = {
    convertHTMLToPDF,      // Main conversion function
    processHTMLContent,    // HTML processing function
    generateCSS,          // CSS generation function
    renderHTMLCodeBlocks, // Code block rendering function
    fixCenteringIssues    // Centering issue fix function
};

// Run the CLI if this file is executed directly (not imported as a module)
// This check determines whether the file is being run directly or imported
if (require.main === module) {
    // Execute the main function and handle any uncaught errors
    main().catch(error => {
        console.error('❌ Fatal error:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1); // Exit with error code
    });
}
