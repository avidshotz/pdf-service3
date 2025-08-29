/**
 * Test file for the HTML to PDF Converter
 * 
 * This file tests the basic functionality of the pdf-converter.js module
 * to ensure it works correctly in different scenarios.
 */

const { convertHTMLToPDF } = require('./pdf-converter.js');
const fs = require('fs').promises;

/**
 * Test 1: Basic HTML conversion
 */
async function testBasicConversion() {
    console.log('🧪 Test 1: Basic HTML conversion');
    
    const htmlContent = `
        <h1>Test Document</h1>
        <p>This is a basic test of the HTML to PDF converter.</p>
        <p>The text should be rendered using Liberation Serif font.</p>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'test-basic.pdf');
        console.log('✅ Basic conversion test passed');
        return true;
    } catch (error) {
        console.error('❌ Basic conversion test failed:', error.message);
        return false;
    }
}

/**
 * Test 2: HTML with code blocks
 */
async function testCodeBlockRendering() {
    console.log('🧪 Test 2: HTML code block rendering');
    
    const htmlContent = `
        <h1>Code Block Test</h1>
        <p>Below is an HTML code block that should be rendered as actual HTML:</p>
        <pre><code>&lt;div style="background-color: #e3f2fd; padding: 10px; border-radius: 5px;"&gt;
    &lt;h3 style="color: #1976d2;"&gt;Rendered HTML Example&lt;/h3&gt;
    &lt;p&gt;This HTML code should be rendered as actual HTML in the PDF.&lt;/p&gt;
    &lt;ul&gt;
        &lt;li&gt;Feature 1: Liberation Serif font&lt;/li&gt;
        &lt;li&gt;Feature 2: HTML code rendering&lt;/li&gt;
        &lt;li&gt;Feature 3: Professional styling&lt;/li&gt;
    &lt;/ul&gt;
&lt;/div&gt;</code></pre>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'test-code-blocks.pdf', {
            renderCodeBlocks: true
        });
        console.log('✅ Code block rendering test passed');
        return true;
    } catch (error) {
        console.error('❌ Code block rendering test failed:', error.message);
        return false;
    }
}

/**
 * Test 3: Landscape orientation
 */
async function testLandscapeOrientation() {
    console.log('🧪 Test 3: Landscape orientation');
    
    const htmlContent = `
        <h1>Landscape Test</h1>
        <p>This document should be in landscape orientation.</p>
        <p>It should have wider margins and different page dimensions.</p>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'test-landscape.pdf', {
            orientation: 'landscape',
            margin: 15
        });
        console.log('✅ Landscape orientation test passed');
        return true;
    } catch (error) {
        console.error('❌ Landscape orientation test failed:', error.message);
        return false;
    }
}

/**
 * Test 4: Letter size with system fonts
 */
async function testLetterSize() {
    console.log('🧪 Test 4: Letter size with system fonts');
    
    const htmlContent = `
        <h1>Letter Size Test</h1>
        <p>This document uses Letter size and system fonts only.</p>
        <p>It should not include Liberation Serif font.</p>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'test-letter.pdf', {
            pageSize: 'Letter',
            includeFonts: false
        });
        console.log('✅ Letter size test passed');
        return true;
    } catch (error) {
        console.error('❌ Letter size test failed:', error.message);
        return false;
    }
}

/**
 * Test 5: Complex HTML with tables
 */
async function testComplexHTML() {
    console.log('🧪 Test 5: Complex HTML with tables');
    
    const htmlContent = `
        <h1>Complex HTML Test</h1>
        
        <h2>Table Example</h2>
        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Status</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>HTML Conversion</td>
                    <td>✅ Working</td>
                    <td>Converts HTML to PDF</td>
                </tr>
                <tr>
                    <td>Font Support</td>
                    <td>✅ Working</td>
                    <td>Liberation Serif typography</td>
                </tr>
                <tr>
                    <td>Code Rendering</td>
                    <td>✅ Working</td>
                    <td>HTML code blocks rendered</td>
                </tr>
            </tbody>
        </table>
        
        <h2>List Example</h2>
        <ul>
            <li>First item with <strong>bold text</strong></li>
            <li>Second item with <em>italic text</em></li>
            <li>Third item with <code>code text</code></li>
        </ul>
    `;
    
    try {
        await convertHTMLToPDF(htmlContent, 'test-complex.pdf');
        console.log('✅ Complex HTML test passed');
        return true;
    } catch (error) {
        console.error('❌ Complex HTML test failed:', error.message);
        return false;
    }
}

/**
 * Test 6: Error handling
 */
async function testErrorHandling() {
    console.log('🧪 Test 6: Error handling');
    
    try {
        // Test with invalid HTML (should still work)
        await convertHTMLToPDF('<invalid>html</invalid>', 'test-error.pdf');
        console.log('✅ Error handling test passed (invalid HTML handled gracefully)');
        return true;
    } catch (error) {
        console.error('❌ Error handling test failed:', error.message);
        return false;
    }
}

/**
 * Clean up test files
 */
async function cleanupTestFiles() {
    console.log('🧹 Cleaning up test files...');
    
    const testFiles = [
        'test-basic.pdf',
        'test-code-blocks.pdf',
        'test-landscape.pdf',
        'test-letter.pdf',
        'test-complex.pdf',
        'test-error.pdf'
    ];
    
    for (const file of testFiles) {
        try {
            await fs.unlink(file);
            console.log(`🗑️ Deleted ${file}`);
        } catch (error) {
            // File doesn't exist, that's okay
        }
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting HTML to PDF Converter Tests...\n');
    
    const tests = [
        testBasicConversion,
        testCodeBlockRendering,
        testLandscapeOrientation,
        testLetterSize,
        testComplexHTML,
        testErrorHandling
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        const result = await test();
        if (result) {
            passedTests++;
        }
        console.log(''); // Add spacing between tests
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! The PDF converter is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the error messages above.');
    }
    
    // Ask user if they want to clean up test files
    console.log('\n💡 Test PDF files have been created. You can examine them to verify the output quality.');
    console.log('Run this script again with --cleanup to remove test files.');
    
    return passedTests === totalTests;
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
    cleanupTestFiles().then(() => {
        console.log('✅ Cleanup completed');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    });
} else {
    // Run tests if this file is executed directly
    if (require.main === module) {
        runAllTests().then(success => {
            process.exit(success ? 0 : 1);
        }).catch(error => {
            console.error('❌ Fatal error:', error.message);
            process.exit(1);
        });
    }
}

// Export functions for use as a module
module.exports = {
    testBasicConversion,
    testCodeBlockRendering,
    testLandscapeOrientation,
    testLetterSize,
    testComplexHTML,
    testErrorHandling,
    runAllTests,
    cleanupTestFiles
};

