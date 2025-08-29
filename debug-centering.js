const { processHTMLContent } = require('./pdf-converter.js');

// Test HTML with centering issue
const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Centering Debug Test</title>
</head>
<body>
    <div class="content">
        <div style="font-family:'Times New Roman', Times, serif; color:#000; max-width:750px; margin:40px auto;">
            <h1>Test Header</h1>
            <p>This should be centered content.</p>
        </div>
    </div>
</body>
</html>`;

console.log('=== ORIGINAL HTML ===');
console.log(testHTML);
console.log('\n=== PROCESSED HTML ===');
const processed = processHTMLContent(testHTML, { margin: 10, includeFonts: true });
console.log(processed);
