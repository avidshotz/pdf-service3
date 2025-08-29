# HTML to PDF Converter - Standalone Node.js Module

A powerful, standalone Node.js module for converting HTML content to professional PDF files with Liberation Serif typography and advanced styling features.

## 🚀 Features

- **Professional Typography**: Liberation Serif font for beautiful, readable documents
- **HTML Code Rendering**: Automatically renders HTML code blocks as actual HTML
- **Flexible Configuration**: Custom page sizes, orientations, margins, and more
- **High-Quality Output**: Uses Puppeteer (headless Chrome) for perfect rendering
- **Command Line Interface**: Easy-to-use CLI for batch processing
- **Module Integration**: Simple API for use in other Node.js applications
- **Error Handling**: Comprehensive error handling and logging

## 📦 Installation

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager

### Install Dependencies

```bash
# Install Puppeteer and other dependencies
npm install

# Or if you prefer yarn
yarn install
```

## 🎯 Quick Start

### Command Line Usage

```bash
# Basic conversion
node pdf-converter.js input.html output.pdf

# With custom options
node pdf-converter.js input.html output.pdf --page-size=Letter --orientation=landscape --margin=20

# Read from stdin
echo "<h1>Hello World</h1>" | node pdf-converter.js - output.pdf
```

### Programmatic Usage

```javascript
const { convertHTMLToPDF } = require('./pdf-converter.js');

// Basic usage
await convertHTMLToPDF('<h1>Hello World</h1>', 'output.pdf');

// Advanced usage with options
await convertHTMLToPDF(htmlContent, 'output.pdf', {
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 10,
    includeFonts: true,
    renderCodeBlocks: true
});
```

## 📋 API Reference

### `convertHTMLToPDF(htmlContent, outputPath, options)`

Converts HTML content to a PDF file.

#### Parameters

- **`htmlContent`** (string): The HTML content to convert
- **`outputPath`** (string): Path where the PDF file should be saved
- **`options`** (object, optional): Configuration options

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageSize` | string | `'A4'` | Page size: `'A4'`, `'Letter'`, `'Legal'`, `'A3'` |
| `orientation` | string | `'portrait'` | Page orientation: `'portrait'` or `'landscape'` |
| `margin` | number | `10` | Margin in millimeters |
| `includeFonts` | boolean | `true` | Whether to include Liberation Serif font |
| `renderCodeBlocks` | boolean | `true` | Whether to render HTML code blocks as actual HTML |

#### Returns

- **Promise<string>**: Path to the generated PDF file

#### Example

```javascript
const { convertHTMLToPDF } = require('./pdf-converter.js');

async function createPDF() {
    try {
        const htmlContent = `
            <h1>My Document</h1>
            <p>This is a test document.</p>
            <pre><code>&lt;div&gt;This HTML will be rendered&lt;/div&gt;</code></pre>
        `;
        
        const outputPath = await convertHTMLToPDF(htmlContent, 'my-document.pdf', {
            pageSize: 'Letter',
            orientation: 'landscape',
            margin: 15,
            includeFonts: true,
            renderCodeBlocks: true
        });
        
        console.log(`PDF created: ${outputPath}`);
    } catch (error) {
        console.error('Error creating PDF:', error.message);
    }
}
```

## 🖥️ Command Line Interface

### Usage

```bash
node pdf-converter.js <input-file> <output-file> [options]
```

### Arguments

- **`input-file`**: Path to HTML file or `-` for stdin
- **`output-file`**: Path where PDF should be saved

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--page-size=SIZE` | Page size (A4, Letter, Legal, A3) | `--page-size=Letter` |
| `--orientation=ORIENT` | Page orientation (portrait, landscape) | `--orientation=landscape` |
| `--margin=N` | Margin in mm | `--margin=20` |
| `--no-fonts` | Disable Liberation Serif font | `--no-fonts` |
| `--no-code-blocks` | Disable HTML code block rendering | `--no-code-blocks` |

### Examples

```bash
# Basic conversion
node pdf-converter.js document.html output.pdf

# Landscape Letter size with custom margins
node pdf-converter.js document.html output.pdf --page-size=Letter --orientation=landscape --margin=20

# Use system fonts only
node pdf-converter.js document.html output.pdf --no-fonts

# Disable code block rendering
node pdf-converter.js document.html output.pdf --no-code-blocks

# Read from stdin
echo "<h1>Hello</h1>" | node pdf-converter.js - output.pdf
```

## 🧪 Examples

### Run All Examples

```bash
# Run comprehensive examples
npm run example

# Or directly
node example-usage.js
```

### Individual Examples

```bash
# Basic example
node -e "
const { convertHTMLToPDF } = require('./pdf-converter.js');
convertHTMLToPDF('<h1>Hello World</h1>', 'test.pdf');
"

# Advanced example with options
node -e "
const { convertHTMLToPDF } = require('./pdf-converter.js');
convertHTMLToPDF('<h1>Test</h1>', 'test.pdf', {
    pageSize: 'Letter',
    orientation: 'landscape',
    margin: 15
});
"
```

## 🔧 Advanced Features

### HTML Code Block Rendering

The module automatically detects HTML code blocks and renders them as actual HTML:

```html
<pre><code>&lt;div style="background: blue; color: white;"&gt;
    This HTML will be rendered as actual HTML in the PDF
&lt;/div&gt;</code></pre>
```

### Page Break Controls

Use CSS classes to control page breaks:

```html
<div class="page-break"></div>  <!-- Force page break -->
<div class="no-break">...</div> <!-- Prevent page break -->
```

### Custom Styling

The module automatically adds professional CSS styling including:

- Liberation Serif font (when enabled)
- Proper typography hierarchy
- Table styling
- Code block formatting
- Print-optimized styles

## 🐳 Docker Support

### Dockerfile

```dockerfile
FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY pdf-converter.js ./

# Create output directory
RUN mkdir -p /app/output

# Set volume for output
VOLUME /app/output

# Default command
CMD ["node", "pdf-converter.js"]
```

### Docker Usage

```bash
# Build image
docker build -t html-to-pdf-converter .

# Run with file input
docker run -v $(pwd):/app/output html-to-pdf-converter input.html output.pdf

# Run with stdin
echo "<h1>Hello</h1>" | docker run -i -v $(pwd):/app/output html-to-pdf-converter - output.pdf
```

## 🔍 Troubleshooting

### Common Issues

#### Puppeteer Installation Issues

```bash
# On Ubuntu/Debian
sudo apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget
```

#### Memory Issues

For large documents, you may need to increase Node.js memory:

```bash
node --max-old-space-size=4096 pdf-converter.js input.html output.pdf
```

#### Font Issues

If Liberation Serif font is not available:

```bash
# Disable custom fonts
node pdf-converter.js input.html output.pdf --no-fonts
```

### Debug Mode

Enable verbose logging:

```javascript
// Set environment variable for debug output
process.env.DEBUG = 'pdf-converter:*';
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check this README and inline code comments
- **Examples**: See `example-usage.js` for comprehensive examples

## 🔄 Changelog

### Version 1.0.0
- Initial release
- HTML to PDF conversion with Puppeteer
- Liberation Serif font support
- HTML code block rendering
- Command line interface
- Comprehensive error handling
- Docker support

