# Simple Installation Guide

This Chrome extension works without any build process or external dependencies!

## Quick Installation

1. **Download or clone** this repository to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top right corner)
4. **Click "Load unpacked"**
            5. **Select the folder** containing these files:
               - `manifest.json`
               - `popup.html`
               - `popup.css`
               - `popup.js`
               - `html2canvas.min.js`
               - `jspdf.umd.min.js`

## That's it!

The extension will now appear in your Chrome toolbar. You can:
- Click the extension icon to open the popup
- Configure PDF settings (page size, orientation, margins)
- Convert entire pages or selected content to PDF

## Testing

1. **Quick Test**: Open `test-simple.html` in Chrome for basic functionality
2. **Complete Verification**: Open `test-verification.html` for comprehensive testing
3. Click the extension icon
4. Choose "Convert Current Page" or select text and choose "Convert Selection"
5. The PDF will be generated and downloaded

For more complex examples, you can also use `test-page.html`.

## Troubleshooting

- **Extension not appearing**: Make sure you selected the correct folder with all the files
- **PDF not generating**: Try with the included `test-page.html` first
- **Permission errors**: The extension needs access to all websites to work properly

## Files Included

- `manifest.json` - Extension configuration
- `popup.html/css/js` - User interface with onboard PDF generation
- `test-page.html` - Test page to verify functionality

## Features

- **Liberation Serif Font**: All PDFs are generated using Liberation Serif font for professional typography
- **HTML Code Rendering**: HTML code blocks are automatically rendered as actual HTML in the PDF
- **HTML Input Tab**: Paste HTML code directly into a text box and convert to PDF
- **Customizable Settings**: Page size, orientation, margins, and filename
- **Selection Support**: Convert entire pages or selected content
- **Tabbed Interface**: Easy switching between page conversion and HTML input modes
- **Onboard Solution**: No external APIs or services - everything works locally in Chrome

No build process, no dependencies, no content scripts - just pure Chrome extension functionality!
