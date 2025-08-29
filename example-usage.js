/**
 * Example Usage of HTML to PDF Converter
 * 
 * This file demonstrates how to use the pdf-converter.js module
 * in various scenarios with different configurations.
 */

const { convertHTMLToPDF } = require('./pdf-converter.js');

/**
 * Example 1: Basic HTML to PDF conversion
 */
async function basicExample() {
    console.log('\n📄 Example 1: Basic HTML to PDF conversion');
    
    const htmlContent = `
        <h1>Hello World!</h1>
        <p>This is a simple HTML document that will be converted to PDF.</p>
        <p>The text will be rendered using Liberation Serif font for professional appearance.</p>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'basic-example.pdf');
        console.log('✅ Basic example completed successfully!');
    } catch (error) {
        console.error('❌ Basic example failed:', error.message);
    }
}

/**
 * Example 2: Advanced HTML with tables and styling
 */
async function advancedExample() {
    console.log('\n📄 Example 2: Advanced HTML with tables and styling');
    
    const htmlContent = `
        <h1>Advanced HTML Example</h1>
        
        <h2>Table Example</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>John Doe</td>
                    <td>30</td>
                    <td>New York</td>
                </tr>
                <tr>
                    <td>Jane Smith</td>
                    <td>25</td>
                    <td>Los Angeles</td>
                </tr>
            </tbody>
        </table>
        
        <h2>Code Block Example</h2>
        <pre><code>&lt;div style="background-color: #e3f2fd; padding: 10px; border-radius: 5px;"&gt;
    &lt;h3 style="color: #1976d2;"&gt;Rendered HTML Example&lt;/h3&gt;
    &lt;p&gt;This HTML code should be rendered as actual HTML in the PDF.&lt;/p&gt;
    &lt;ul&gt;
        &lt;li&gt;Feature 1: Liberation Serif font&lt;/li&gt;
        &lt;li&gt;Feature 2: HTML code rendering&lt;/li&gt;
        &lt;li&gt;Feature 3: Professional styling&lt;/li&gt;
    &lt;/ul&gt;
&lt;/div&gt;</code></pre>
        
        <h2>List Example</h2>
        <ul>
            <li>First item with some text</li>
            <li>Second item with <strong>bold text</strong></li>
            <li>Third item with <em>italic text</em></li>
        </ul>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'advanced-example.pdf', {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 15,
            includeFonts: true,
            renderCodeBlocks: true
        });
        console.log('✅ Advanced example completed successfully!');
    } catch (error) {
        console.error('❌ Advanced example failed:', error.message);
    }
}

/**
 * Example 3: Landscape orientation with custom margins
 */
async function landscapeExample() {
    console.log('\n📄 Example 3: Landscape orientation with custom margins');
    
    const htmlContent = `
        <h1>Landscape Document</h1>
        <p>This document is formatted in landscape orientation with custom margins.</p>
        
        <h2>Features Demonstrated:</h2>
        <ul>
            <li>Landscape orientation</li>
            <li>Custom margin settings</li>
            <li>Professional typography</li>
            <li>Page break controls</li>
        </ul>
        
        <div class="page-break"></div>
        
        <h1>Second Page</h1>
        <p>This content appears on a new page due to the page break control.</p>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'landscape-example.pdf', {
            pageSize: 'A4',
            orientation: 'landscape',
            margin: 20,
            includeFonts: true,
            renderCodeBlocks: true
        });
        console.log('✅ Landscape example completed successfully!');
    } catch (error) {
        console.error('❌ Landscape example failed:', error.message);
    }
}

/**
 * Example 4: Letter size with minimal fonts
 */
async function letterSizeExample() {
    console.log('\n📄 Example 4: Letter size with minimal fonts');
    
    const htmlContent = `
        <h1>Letter Size Document</h1>
        <p>This document uses Letter size format and system fonts only.</p>
        
        <h2>Configuration:</h2>
        <ul>
            <li>Page Size: Letter</li>
            <li>Fonts: System fonts only (no Liberation Serif)</li>
            <li>Code blocks: Disabled</li>
        </ul>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'letter-example.pdf', {
            pageSize: 'Letter',
            orientation: 'portrait',
            margin: 10,
            includeFonts: false, // Use system fonts only
            renderCodeBlocks: false // Disable code block rendering
        });
        console.log('✅ Letter size example completed successfully!');
    } catch (error) {
        console.error('❌ Letter size example failed:', error.message);
    }
}

/**
 * Example 5: Reading HTML from file
 */
async function fileInputExample() {
    console.log('\n📄 Example 5: Reading HTML from file');
    
    const fs = require('fs').promises;
    
    try {
        // Read HTML content from a file
        const htmlContent = await fs.readFile('test-simple.html', 'utf8');
        
        await convertHTMLToPDF(htmlContent, 'file-input-example.pdf', {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 12,
            includeFonts: true,
            renderCodeBlocks: true
        });
        console.log('✅ File input example completed successfully!');
    } catch (error) {
        console.error('❌ File input example failed:', error.message);
    }
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
    console.log('🚀 Starting HTML to PDF Converter Examples...\n');
    
    try {
        // Run all examples
        await basicExample();
        await advancedExample();
        await landscapeExample();
        await letterSizeExample();
        await fileInputExample();
        
        console.log('\n🎉 All examples completed successfully!');
        console.log('\n📁 Generated PDF files:');
        console.log('  - basic-example.pdf');
        console.log('  - advanced-example.pdf');
        console.log('  - landscape-example.pdf');
        console.log('  - letter-example.pdf');
        console.log('  - file-input-example.pdf');
        
    } catch (error) {
        console.error('\n❌ Error running examples:', error.message);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

// Export functions for use as a module
module.exports = {
    basicExample,
    advancedExample,
    landscapeExample,
    letterSizeExample,
    fileInputExample,
    runAllExamples
};

