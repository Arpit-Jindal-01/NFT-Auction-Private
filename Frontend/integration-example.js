/**
 * Integration Example: Adding Lace Wallet to index-local.html
 * 
 * This file shows the changes needed to integrate the wallet
 * into your existing auction interface.
 */

// ============================================
// STEP 1: Add to HTML (before </body>)
// ============================================

/*
<script src="midnight-wallet.js"></script>
*/

// ============================================
// STEP 2: Add Wallet UI to Status Banner
// ============================================

/*
Add this inside your .status-banner:

<div class="status-item">
    <span class="status-label">Wallet</span>
    <span class="status-value">
        <span id="walletStatusDot" class="dot-disconnected">●</span>
        <span id="walletStatus" class="status-disconnected">Disconnected</span>
    </span>
</div>
<div class="status-item">
    <span class="status-label">Address</span>
    <span class="status-value" id="walletAddress" style="font-size: 0.85em; font-family: monospace;">
        Not connected
    </span>
</div>
<div class="status-item">
    <button id="connectWalletBtn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
        Connect Lace Wallet
    </button>
</div>
*/

// ============================================
// STEP 3: Add CSS Styles (in <style> tag)
// ============================================

/*
.dot-connected {
    color: #28a745;
    font-size: 1.2em;
}

.dot-disconnected {
    color: #dc3545;
    font-size: 1.2em;
}

.status-connected {
    color: #28a745;
    font-weight: 600;
}

.status-disconnected {
    color: #dc3545;
    font-weight: 600;
}

.btn-small {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.btn-small:hover {
    background: #5568d3;
}

.btn-small:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
*/

// ============================================
// STEP 4: Initialize Wallet (in <script>)
// ============================================

// Add this AFTER your existing initialization code:

// Initialize Lace Wallet Connection
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔌 Initializing Lace Wallet...');
    
    // Initialize wallet API
    window.MidnightWalletAPI.init('connectWalletBtn', {
        statusElementId: 'walletStatus',
        addressElementId: 'walletAddress',
        connectButtonId: 'connectWalletBtn',
        statusDotId: 'walletStatusDot'
    });
    
    // Listen for account changes
    window.MidnightWalletAPI.listenForChanges((newAddress) => {
        console.log('🔄 Wallet address changed:', newAddress);
        addLog(`🔄 Wallet address changed: ${newAddress.substring(0, 20)}...`, 'info');
    });
    
    console.log('✅ Wallet integration ready');
});

// ============================================
// STEP 5: Use Wallet in Your Functions
// ============================================

// Example: Check wallet before starting auction
document.getElementById('startAuctionBtn').addEventListener('click', async () => {
    // Check wallet connection
    const walletStatus = window.MidnightWalletAPI.getStatus();
    
    if (!walletStatus.connected) {
        addLog('⚠️  Please connect your Lace Wallet first', 'warning');
        alert('Please connect your Lace Wallet before starting an auction');
        return;
    }
    
    addLog(`⏳ Starting auction with wallet: ${walletStatus.address.substring(0, 20)}...`, 'info');
    
    // Your existing auction start code here...
    try {
        const response = await fetch(`${API_BASE}/auction/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                walletAddress: walletStatus.address
            })
        });
        const data = await response.json();
        
        if (data.success) {
            addLog('✅ Auction started successfully!', 'success');
            updateUI(data.state);
        } else {
            addLog(`❌ Failed to start auction: ${data.error}`, 'error');
        }
    } catch (error) {
        addLog(`❌ Error: ${error.message}`, 'error');
    }
});

// ============================================
// STEP 6: Optional - Add Wallet Balance Display
// ============================================

// Add this function to display wallet balance
async function fetchWalletBalance() {
    const status = window.MidnightWalletAPI.getStatus();
    
    if (!status.connected) return;
    
    try {
        // Call your backend to get balance for this address
        const response = await fetch(`${API_BASE}/wallet/balance?address=${status.address}`);
        const data = await response.json();
        
        if (data.success) {
            // Update UI with balance
            const balanceElement = document.getElementById('walletBalance');
            if (balanceElement) {
                balanceElement.textContent = data.balance.toLocaleString();
            }
        }
    } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
    }
}

// Call periodically
setInterval(() => {
    const status = window.MidnightWalletAPI.getStatus();
    if (status.connected) {
        fetchWalletBalance();
    }
}, 5000);

// ============================================
// COMPLETE MINIMAL EXAMPLE
// ============================================

/*
<!DOCTYPE html>
<html>
<head>
    <title>NFT Auction with Lace Wallet</title>
    <style>
        .status-banner {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .dot-connected { color: #28a745; font-size: 1.2em; }
        .dot-disconnected { color: #dc3545; font-size: 1.2em; }
        .status-connected { color: #28a745; font-weight: 600; }
        .status-disconnected { color: #dc3545; font-weight: 600; }
        .btn {
            padding: 12px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>NFT Auction with Lace Wallet</h1>
        
        <div class="status-banner">
            <div class="status-item">
                <span>Wallet Status</span>
                <span>
                    <span id="walletStatusDot" class="dot-disconnected">●</span>
                    <span id="walletStatus" class="status-disconnected">Disconnected</span>
                </span>
            </div>
            <div class="status-item">
                <span>Address</span>
                <span id="walletAddress" style="font-family: monospace; font-size: 0.85em;">
                    Not connected
                </span>
            </div>
            <div class="status-item">
                <button id="connectWalletBtn" class="btn" style="width: 100%; margin-top: 10px;">
                    Connect Lace Wallet
                </button>
            </div>
        </div>
        
        <button id="startAuctionBtn" class="btn">Start Auction</button>
    </div>
    
    <script src="midnight-wallet.js"></script>
    <script>
        // Message helper
        window.showMessage = (msg, type) => console.log(`[${type}] ${msg}`);
        
        // Initialize wallet
        window.MidnightWalletAPI.init('connectWalletBtn', {
            statusElementId: 'walletStatus',
            addressElementId: 'walletAddress',
            connectButtonId: 'connectWalletBtn',
            statusDotId: 'walletStatusDot'
        });
        
        // Start auction with wallet
        document.getElementById('startAuctionBtn').addEventListener('click', async () => {
            const status = window.MidnightWalletAPI.getStatus();
            
            if (!status.connected) {
                alert('Please connect wallet first');
                return;
            }
            
            console.log('Starting auction with address:', status.address);
            // Your auction logic here
        });
    </script>
</body>
</html>
*/
