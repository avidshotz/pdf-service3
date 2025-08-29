# HTML to PDF Chrome Extension

A Chrome extension that converts HTML content to PDF and downloads it. This extension provides a custom onboard PDF renderer that works entirely within the browser.

## Features

- **Convert entire web pages** to PDF with custom formatting
- **Convert selected content** to PDF
- **Customizable PDF settings**:
  - Page size (A4, Letter, Legal, A3)
  - Orientation (Portrait/Landscape)
  - Margins
  - Custom filename
- **High-quality output** with proper CSS rendering
- **Automatic URL resolution** for relative links and images
- **Settings persistence** across browser sessions

## Installation

### Development Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the extension**:
   ```bash
   npm run build
   ```
4. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory

### Production Installation

1. **Build for production**:
   ```bash
   npm run build
   ```
2. **Package the extension**:
   - The built files will be in the `dist/` directory
   - Load the `dist/` folder as an unpacked extension in Chrome

## Usage

1. **Navigate** to any webpage you want to convert
2. **Click the extension icon** in your Chrome toolbar
3. **Configure settings** (optional):
   - Choose page size and orientation
   - Set margins
   - Enter custom filename
4. **Convert content**:
   - Click "Convert Current Page" to convert the entire page
   - Select text on the page, then click "Convert Selection" to convert only the selected content
5. **Download** the generated PDF

## Technical Architecture

### Components

- **`manifest.json`**: Extension configuration and permissions
- **`popup.html/js/css`**: User interface for settings and controls
- **`content.js`**: Extracts HTML content from web pages
- **`background.js`**: Service worker that handles PDF generation and downloads
- **`pdf-generator.js`**: Script injected into temporary tabs for PDF creation

### PDF Generation Process

1. **Content Extraction**: The content script extracts HTML from the current page or selection
2. **URL Resolution**: Relative URLs are converted to absolute URLs
3. **Temporary Tab Creation**: A hidden tab is created with the HTML content
4. **Script Injection**: The PDF generator script is injected into the temporary tab
5. **Rendering**: The content is rendered with print-optimized CSS
6. **PDF Generation**: The rendered content is converted to PDF using browser APIs
7. **Download**: The PDF is automatically downloaded to the user's default download folder

### Browser Compatibility

- **Chrome**: Full support (primary target)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Limited support (may require modifications)
- **Safari**: Not supported (different extension architecture)

## Development

### Project Structure

```
├── manifest.json          # Extension manifest
├── package.json           # Dependencies and scripts
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script for page interaction
├── background.js         # Service worker for background tasks
├── pdf-generator.js      # PDF generation logic
├── webpack.config.js     # Build configuration
└── README.md             # This file
```

### Available Scripts

- `npm run build`: Build the extension for production
- `npm run dev`: Build in development mode with watch
- `npm test`: Run tests (when implemented)

### Customization

#### Adding New Page Sizes

Edit `popup.html` and `pdf-generator.js` to add new page size options:

```javascript
// In pdf-generator.js
const sizes = {
    'A4': { width: 210, height: 297 },
    'Letter': { width: 216, height: 279 },
    'Legal': { width: 216, height: 356 },
    'A3': { width: 297, height: 420 },
    'Custom': { width: 200, height: 300 } // Add your custom size
};
```

#### Modifying PDF Styles

Edit the `applyPrintStyles` function in `pdf-generator.js` to customize the PDF appearance:

```javascript
function applyPrintStyles(settings) {
    // Add your custom CSS rules here
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            /* Your custom styles */
        }
    `;
}
```

## Troubleshooting

### Common Issues

1. **Extension not working on certain sites**:
   - Check if the site has Content Security Policy (CSP) restrictions
   - Some sites may block content script injection

2. **Images not appearing in PDF**:
   - Ensure images are loaded before PDF generation
   - Check if images are served over HTTPS

3. **PDF quality issues**:
   - Adjust the DPI settings in `pdf-generator.js`
   - Check print styles for better rendering

### Debug Mode

Enable debug logging by adding this to `background.js`:

```javascript
const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log('[PDF Extension]:', ...args);
    }
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] Support for custom fonts
- [ ] Table of contents generation
- [ ] Watermark support
- [ ] Password protection
- [ ] Batch processing
- [ ] Cloud storage integration
