# Quick Start Guide

## Prerequisites

- **Node.js** (version 14 or higher)
- **Chrome browser** (version 88 or higher)

## Installation Steps

### Option 1: Automated Installation (Windows)

1. **Double-click** `install.bat` or run `install.ps1` in PowerShell
2. Follow the on-screen instructions
3. The script will automatically install dependencies and build the extension

### Option 2: Manual Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this directory

## Testing the Extension

1. **Open the test page**:
   - Open `test-page.html` in Chrome
   - Or navigate to any webpage you want to convert

2. **Use the extension**:
   - Click the extension icon in your Chrome toolbar
   - Configure settings (optional)
   - Click "Convert Current Page" or "Convert Selection"

3. **Download the PDF**:
   - The PDF will be automatically downloaded to your default download folder

## Troubleshooting

### Common Issues

**Extension not appearing in toolbar**:
- Check if the extension is enabled in `chrome://extensions/`
- Try refreshing the page or restarting Chrome

**PDF generation fails**:
- Ensure you're on a regular webpage (not a Chrome settings page)
- Check the browser console for error messages
- Try with a simpler webpage first

**Images not appearing in PDF**:
- Some websites block external image loading
- Try with the included test page first

### Getting Help

1. Check the browser console for error messages
2. Verify all files are present in the `dist` folder
3. Try reinstalling the extension
4. Check the full README.md for detailed documentation

## Next Steps

- Customize the PDF settings in the extension popup
- Try converting different types of web content
- Explore the code to understand how it works
- Consider contributing improvements

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full README.md documentation
3. Check the browser console for error messages
4. Try with the included test page first
