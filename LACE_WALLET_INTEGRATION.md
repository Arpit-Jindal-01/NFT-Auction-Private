# Lace Wallet Integration for Midnight Blockchain

Complete implementation for connecting Lace Wallet to Midnight Local Network (Undeployed).

## 📦 Files Created

1. **`Frontend/midnight-wallet.js`** - Core wallet connection API
2. **`Frontend/wallet-demo.html`** - Standalone demo page
3. **`LACE_WALLET_INTEGRATION.md`** - This documentation

## 🚀 Quick Start

### 1. Include the Script

Add to your HTML `<head>` or before `</body>`:

```html
<script src="midnight-wallet.js"></script>
```

### 2. Add UI Elements

```html
<!-- Status Display -->
<div id="walletStatus">Disconnected</div>
<div id="walletAddress">Not connected</div>

<!-- Connect Button -->
<button id="connectWalletBtn">Connect Wallet</button>
```

### 3. Initialize

```javascript
// Initialize wallet connection
window.MidnightWalletAPI.init('connectWalletBtn', {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn',
    statusDotId: 'walletStatusDot'
});
```

## 📚 API Reference

### Global Objects

#### `window.MidnightWallet`
Global state object containing:
- `connected` (boolean) - Connection status
- `address` (string|null) - Current unshielded address
- `unshieldedAddress` (string|null) - Unshielded address (same as address)
- `provider` (object|null) - Lace provider instance
- `isLaceInstalled` (boolean) - Lace installation status

#### `window.MidnightWalletAPI`
API functions for wallet interaction.

### Functions

#### `MidnightWalletAPI.connect()`
Connect to Lace Wallet.

**Returns:** `Promise<Object>`
```javascript
{
    success: true,
    connected: true,
    address: "mn_addr_undeployed...",
    unshieldedAddress: "mn_addr_undeployed...",
    message: "Successfully connected to Lace Wallet"
}
```

**Error Response:**
```javascript
{
    success: false,
    connected: false,
    address: null,
    error: "Error message",
    message: "Error message"
}
```

**Example:**
```javascript
const result = await window.MidnightWalletAPI.connect();
if (result.success) {
    console.log('Connected:', result.address);
} else {
    console.error('Error:', result.error);
}
```

#### `MidnightWalletAPI.disconnect()`
Disconnect wallet (clears state).

**Returns:** `Object`
```javascript
{
    success: true,
    connected: false,
    message: "Wallet disconnected"
}
```

**Example:**
```javascript
window.MidnightWalletAPI.disconnect();
```

#### `MidnightWalletAPI.getStatus()`
Get current wallet status.

**Returns:** `Object`
```javascript
{
    connected: true,
    address: "mn_addr_undeployed...",
    unshieldedAddress: "mn_addr_undeployed...",
    isLaceInstalled: true
}
```

**Example:**
```javascript
const status = window.MidnightWalletAPI.getStatus();
console.log('Wallet connected:', status.connected);
console.log('Address:', status.address);
```

#### `MidnightWalletAPI.isInstalled()`
Check if Lace Wallet is installed.

**Returns:** `boolean`

**Example:**
```javascript
if (window.MidnightWalletAPI.isInstalled()) {
    console.log('Lace Wallet is installed');
} else {
    alert('Please install Lace Wallet extension');
}
```

#### `MidnightWalletAPI.updateUI(status, elements)`
Manually update UI elements.

**Parameters:**
- `status` (Object) - Wallet status object
- `elements` (Object) - Element IDs mapping

**Example:**
```javascript
const status = window.MidnightWalletAPI.getStatus();
window.MidnightWalletAPI.updateUI(status, {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn',
    statusDotId: 'walletStatusDot'
});
```

#### `MidnightWalletAPI.init(buttonId, uiElements)`
Initialize wallet connection handler.

**Parameters:**
- `buttonId` (string) - ID of connect button
- `uiElements` (Object) - Element IDs mapping

**Example:**
```javascript
window.MidnightWalletAPI.init('connectWalletBtn', {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn',
    statusDotId: 'walletStatusDot'
});
```

#### `MidnightWalletAPI.listenForChanges(callback)`
Listen for account changes.

**Parameters:**
- `callback` (Function) - Called with new address when account changes

**Example:**
```javascript
window.MidnightWalletAPI.listenForChanges((newAddress) => {
    console.log('Account changed to:', newAddress);
    // Update your app state
});
```

## 🎨 UI Integration Example

### Full Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Midnight App</title>
    <style>
        .status-connected { color: green; }
        .status-disconnected { color: red; }
        .dot-connected { color: green; }
        .dot-disconnected { color: red; }
    </style>
</head>
<body>
    <h1>My Midnight DApp</h1>
    
    <!-- Wallet Section -->
    <div class="wallet-section">
        <div>
            Status: 
            <span id="walletStatusDot">●</span>
            <span id="walletStatus">Disconnected</span>
        </div>
        <div>
            Address: <span id="walletAddress">Not connected</span>
        </div>
        <button id="connectWalletBtn">Connect Wallet</button>
    </div>
    
    <!-- Your app content -->
    <div id="appContent">
        <!-- App UI here -->
    </div>
    
    <script src="midnight-wallet.js"></script>
    <script>
        // Show message helper
        window.showMessage = (msg, type) => {
            alert(msg);
        };
        
        // Initialize wallet
        window.MidnightWalletAPI.init('connectWalletBtn', {
            statusElementId: 'walletStatus',
            addressElementId: 'walletAddress',
            connectButtonId: 'connectWalletBtn',
            statusDotId: 'walletStatusDot'
        });
        
        // Listen for changes
        window.MidnightWalletAPI.listenForChanges((address) => {
            console.log('New address:', address);
        });
        
        // Use wallet in your app
        async function doSomethingWithWallet() {
            const status = window.MidnightWalletAPI.getStatus();
            
            if (!status.connected) {
                alert('Please connect wallet first');
                return;
            }
            
            console.log('Using address:', status.address);
            // Your app logic here
        }
    </script>
</body>
</html>
```

## 🔧 Integration with Existing Pages

### Adding to `index-local.html`

1. **Add Script Include** (before closing `</body>`):
```html
<script src="midnight-wallet.js"></script>
```

2. **Add Wallet UI** (in your status banner or header):
```html
<div class="wallet-status">
    <span id="walletStatusDot" class="dot-disconnected">●</span>
    <span id="walletStatus" class="status-disconnected">Disconnected</span>
    <button id="connectWalletBtn" class="btn-small">Connect Wallet</button>
</div>
<div class="wallet-address">
    <strong>Address:</strong> <span id="walletAddress">Not connected</span>
</div>
```

3. **Initialize in Your Script**:
```javascript
// After your existing initialization code
window.MidnightWalletAPI.init('connectWalletBtn', {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn',
    statusDotId: 'walletStatusDot'
});
```

## 💡 Usage Patterns

### Check Connection Before Action

```javascript
async function performAction() {
    const status = window.MidnightWalletAPI.getStatus();
    
    if (!status.connected) {
        alert('Please connect your Lace Wallet first');
        return;
    }
    
    // Perform action with status.address
    console.log('Using address:', status.address);
}
```

### Auto-Connect on Page Load

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Check if previously connected (you can use localStorage)
    const wasConnected = localStorage.getItem('walletWasConnected');
    
    if (wasConnected === 'true') {
        const result = await window.MidnightWalletAPI.connect();
        if (result.success) {
            console.log('Auto-connected');
        }
    }
});

// Save state when connecting
window.MidnightWalletAPI.listenForChanges((address) => {
    if (address) {
        localStorage.setItem('walletWasConnected', 'true');
    } else {
        localStorage.setItem('walletWasConnected', 'false');
    }
});
```

### React/Vue Integration

```javascript
// React Hook Example
import { useState, useEffect } from 'react';

function useWallet() {
    const [wallet, setWallet] = useState({
        connected: false,
        address: null
    });
    
    useEffect(() => {
        // Listen for changes
        window.MidnightWalletAPI.listenForChanges((address) => {
            setWallet({
                connected: true,
                address
            });
        });
        
        // Get initial status
        const status = window.MidnightWalletAPI.getStatus();
        setWallet(status);
    }, []);
    
    const connect = async () => {
        const result = await window.MidnightWalletAPI.connect();
        if (result.success) {
            setWallet(result);
        }
        return result;
    };
    
    return { wallet, connect };
}

// Usage
function MyComponent() {
    const { wallet, connect } = useWallet();
    
    return (
        <div>
            {wallet.connected ? (
                <p>Connected: {wallet.address}</p>
            ) : (
                <button onClick={connect}>Connect</button>
            )}
        </div>
    );
}
```

## 🔍 Error Handling

### Common Errors

1. **Lace Not Installed**
```javascript
{
    success: false,
    error: "Lace Wallet is not installed. Please install Lace Wallet extension."
}
```

2. **Connection Rejected**
```javascript
{
    success: false,
    error: "Failed to enable Lace Wallet. Please check your wallet settings."
}
```

3. **No Address Retrieved**
```javascript
{
    success: false,
    error: "Could not retrieve unshielded address from wallet."
}
```

### Handling Errors

```javascript
async function connectWithErrorHandling() {
    const result = await window.MidnightWalletAPI.connect();
    
    if (!result.success) {
        if (result.error.includes('not installed')) {
            // Show installation guide
            showInstallGuide();
        } else if (result.error.includes('rejected')) {
            // User rejected connection
            alert('Connection rejected. Please try again.');
        } else {
            // Generic error
            console.error('Connection error:', result.error);
            alert('Failed to connect: ' + result.error);
        }
        return;
    }
    
    // Success
    console.log('Connected:', result.address);
}
```

## 🧪 Testing

### Test in Demo Page

1. Open `Frontend/wallet-demo.html` in browser
2. Install Lace Wallet extension (if not installed)
3. Click "Connect Lace Wallet"
4. Verify address appears

### Test in Console

```javascript
// Check installation
console.log('Lace installed:', window.MidnightWalletAPI.isInstalled());

// Get status
console.log(window.MidnightWalletAPI.getStatus());

// Manual connect
await window.MidnightWalletAPI.connect();

// Check global state
console.log(window.MidnightWallet);
```

## 📋 Browser Compatibility

- Chrome/Chromium: ✅
- Firefox: ✅
- Edge: ✅
- Safari: ⚠️ (depends on Lace extension availability)

## 🔐 Security Notes

- Never send private keys through this API
- Always validate addresses before transactions
- Use HTTPS in production
- Implement proper CSP headers
- Validate all user inputs

## 📝 Address Format

Midnight Local Network addresses follow this format:
```
mn_addr_undeployed<unique_identifier>
```

Example:
```
mn_addr_undeployed1abc123def456...
```

## 🐛 Troubleshooting

### Wallet Not Detected

```javascript
// Check provider availability
console.log('window.midnight:', window.midnight);
console.log('window.lace:', window.lace);
console.log('window.cardano?.lace:', window.cardano?.lace);
```

### Connection Issues

1. Check Lace is running
2. Check wallet is unlocked
3. Check network settings (should be Local/Undeployed)
4. Check browser console for errors

### UI Not Updating

```javascript
// Manually trigger UI update
const status = window.MidnightWalletAPI.getStatus();
window.MidnightWalletAPI.updateUI(status, {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn',
    statusDotId: 'walletStatusDot'
});
```

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Lace Wallet installation
3. Check network settings in Lace
4. Review this documentation

## 🎯 Next Steps

1. ✅ Install Lace Wallet extension
2. ✅ Test with `wallet-demo.html`
3. ✅ Integrate into your pages
4. ✅ Add transaction functionality
5. ✅ Deploy to production

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Network:** Midnight Local (Undeployed)
