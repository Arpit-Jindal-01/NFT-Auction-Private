#!/usr/bin/env node

/**
 * Test Script for Contract API Endpoint
 * Tests the /api/test-contract endpoint
 */

const API_BASE = 'http://localhost:3000';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60) + '\n');
}

async function testEndpoint(name, config) {
    try {
        log(`📡 Testing: ${name}`, 'blue');
        
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}${config.path}`, {
            method: config.method || 'GET',
            headers: config.headers || { 'Content-Type': 'application/json' },
            body: config.body ? JSON.stringify(config.body) : undefined,
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        if (response.ok && data.success !== false) {
            log(`✅ Success (${duration}ms)`, 'green');
            
            if (config.showResponse) {
                console.log(JSON.stringify(data, null, 2));
            } else if (data.txHash) {
                log(`   TX Hash: ${data.txHash}`, 'green');
            }
            
            return { success: true, data, duration };
        } else {
            log(`❌ Failed: ${data.error || 'Unknown error'}`, 'red');
            return { success: false, error: data.error };
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function runTests() {
    section('🧪 CONTRACT API ENDPOINT TESTS');
    
    // Test 1: Health Check
    section('Test 1: Health Check');
    await testEndpoint('Health Check', {
        path: '/health',
        method: 'GET',
    });
    
    // Test 2: Get Contract Info
    section('Test 2: Get Contract Info');
    const infoResult = await testEndpoint('Contract Info', {
        path: '/api/contract/info',
        method: 'GET',
        showResponse: true,
    });
    
    // Test 3: Call getStatus (default)
    section('Test 3: Call getStatus (default)');
    await testEndpoint('getStatus - Default Call', {
        path: '/api/test-contract',
        method: 'POST',
        body: {},
    });
    
    // Test 4: Call getStatus (explicit)
    section('Test 4: Call getStatus (explicit)');
    await testEndpoint('getStatus - Explicit', {
        path: '/api/test-contract',
        method: 'POST',
        body: { function: 'getStatus' },
    });
    
    // Test 5: Call getTopBid
    section('Test 5: Call getTopBid');
    await testEndpoint('getTopBid', {
        path: '/api/test-contract',
        method: 'POST',
        body: { function: 'getTopBid' },
    });
    
    // Test 6: Invalid function
    section('Test 6: Invalid Function (Error Test)');
    await testEndpoint('Invalid Function', {
        path: '/api/test-contract',
        method: 'POST',
        body: { function: 'nonExistentFunction' },
    });
    
    // Summary
    section('📊 TEST SUMMARY');
    log('All basic tests completed!', 'green');
    log('\n💡 Tips:', 'yellow');
    console.log('   - Check server logs for detailed output');
    console.log('   - View CONTRACT_API_GUIDE.md for full documentation');
    console.log('   - Test from frontend: http://localhost:8000/Frontend/app.html');
    console.log('\n');
}

// Main execution
(async () => {
    try {
        // Check if server is running
        log('🔍 Checking if server is running...', 'blue');
        const healthCheck = await fetch(`${API_BASE}/health`).catch(() => null);
        
        if (!healthCheck) {
            log('❌ Server not running!', 'red');
            log('\n💡 Start the server first:', 'yellow');
            console.log('   npm start');
            console.log('   # or');
            console.log('   node local-runtime/server.js\n');
            process.exit(1);
        }
        
        log('✅ Server is running\n', 'green');
        
        // Run tests
        await runTests();
        
    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        process.exit(1);
    }
})();
