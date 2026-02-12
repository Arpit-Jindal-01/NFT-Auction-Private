# Browser-Only Midnight Demo Guide

## 📋 Overview

This is a **complete frontend-only** Midnight blockchain demo that runs entirely in the browser with **no backend required**. It demonstrates:

1. ✅ Detecting Lace wallet provider
2. ✅ Connecting to Lace wallet
3. ✅ Displaying unshielded address
4. ✅ Building transaction objects
5. ✅ Signing with Lace popup
6. ✅ Submitting to Midnight node from browser
7. ✅ Displaying transaction hash
8. ✅ Error handling

---

## 🚀 Quick Start

### Option 1: Using Python Server (Recommended)

```bash
# In your project directory
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/Frontend/midnight-browser-demo.html
```

### Option 2: Direct File Access

```bash
# Open directly (may have CORS limitations)
open Frontend/midnight-browser-demo.html
```

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `midnight-browser-demo.html`
3. Select "Open with Live Server"

---

## 🎯 How It Works

### 1. Provider Detection

The script checks three locations for Lace wallet:

```javascript
// Method 1: Direct midnight provider
if (window.midnight) return window.midnight;

// Method 2: Lace-specific provider  
if (window.lace) return window.lace;

// Method 3: Cardano namespace
if (window.cardano?.lace) return window.cardano.lace;
```

### 2. Wallet Connection

When user clicks "Connect":

```javascript
// Enable wallet (shows Lace popup)
const wallet = await laceProvider.enable();

// Get unshielded address
const addresses = await wallet.getUnshieldedAddresses();
userAddress = addresses[0]; // e.g., mn_addr_undeployed...
```

### 3. Transaction Building

Constructs a simple transaction object:

```javascript
const tx = {
    from: userAddress,
    to: recipient,
    amount: parseFloat(amount),
    currency: 'tNIGHT',
    timestamp: Date.now(),
    type: 'transfer',
    network: 'undeployed'
};
```

### 4. Transaction Signing

Requests user signature via Lace popup:

```javascript
// Try multiple signing methods
if (wallet.signTransaction) {
    return await wallet.signTransaction(tx);
}

if (wallet.request) {
    return await wallet.request({
        method: 'midnight_signTransaction',
        params: [tx]
    });
}
```

### 5. Transaction Submission

Submits directly to Midnight node from browser:

```javascript
const response = await fetch('http://localhost:9944/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: signedTx })
});

const result = await response.json();
// Returns: { txHash: '0x...', status: 'pending' }
```

### 6. Result Display

Shows transaction hash in the UI:

```javascript
showResult(`
    ✅ Transaction Sent!
    TX Hash: ${txHash}
    Amount: ${amount} tNIGHT
    To: ${recipient}
`, 'success');
```

---

## 🛠️ Components Breakdown

### HTML Structure

```html
<!-- Status Display -->
<div class="status-box">
    <div id="walletStatus">Checking...</div>
    <div id="connectionStatus">Not Connected</div>
</div>

<!-- Address Display -->
<div id="addressDisplay">Not connected</div>

<!-- Connect Button -->
<button id="connectBtn">Connect Lace Wallet</button>

<!-- Transaction Form -->
<input id="recipientInput" placeholder="mn_addr_undeployed...">
<input id="amountInput" value="1">
<button id="sendTxBtn">Send Demo Transaction</button>

<!-- Result Display -->
<div id="resultBox"></div>
```

### JavaScript Functions

| Function | Purpose |
|----------|---------|
| `detectLaceProvider()` | Find Lace wallet in window object |
| `connectWallet()` | Connect and get address |
| `buildTransaction()` | Create tx object |
| `signTransaction()` | Request Lace signature |
| `submitTransaction()` | POST to Midnight node |
| `sendTransaction()` | Complete flow orchestration |

---

## 🎨 Customization

### Styling

All styles are in `<style>` tag. Modify colors:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success color */
background: #28a745;

/* Error color */
background: #dc3545;
```

### Configuration

Change node URL at top of script:

```javascript
const MIDNIGHT_NODE_URL = 'http://localhost:9944';
// or for remote node:
// const MIDNIGHT_NODE_URL = 'https://your-node.example.com';
```

### Transaction Fields

Modify transaction structure:

```javascript
function buildTransaction(recipient, amount) {
    return {
        from: userAddress,
        to: recipient,
        amount: parseFloat(amount),
        // Add custom fields:
        memo: 'Demo transaction',
        fee: 0.01,
        gasLimit: 21000
    };
}
```

---

## 🔍 Testing & Debugging

### Console Commands

Open browser console and use:

```javascript
// Check connection
midnightDemo.isConnected()

// Get current address  
midnightDemo.getAddress()

// Get provider object
midnightDemo.getProvider()

// Manually connect
midnightDemo.connect()

// Manually send (after filling form)
midnightDemo.send()
```

### Check Provider

```javascript
// In console:
console.log('Midnight:', window.midnight);
console.log('Lace:', window.lace);
console.log('Cardano:', window.cardano);
```

### Simulate Transaction

If node is unavailable, the script automatically generates a demo hash:

```javascript
// When fetch fails:
return {
    txHash: '0x' + generateDemoHash(),
    status: 'pending',
    message: 'Simulated (node not available)'
};
```

---

## 🚨 Troubleshooting

### "Lace wallet not detected"

**Solution:**
1. Install Lace wallet extension: https://www.lace.io/
2. Refresh the page
3. Check browser console for provider detection logs

### "Connection rejected"

**Solution:**
1. Unlock Lace wallet
2. Switch to Midnight network in wallet
3. Try connecting again
4. Check wallet is not already connected to another site

### "Transaction failed"

**Possible causes:**
- Insufficient tNIGHT balance
- Invalid recipient address
- Midnight node not running
- Network mismatch

**Check:**
```bash
# Verify node is running
curl http://localhost:9944

# Check node logs
tail -f midnight-node.log
```

### CORS Errors

If you see CORS errors in console:

**Solution:**
1. Use a local server (Python, Node, etc.)
2. Don't open HTML file directly
3. Configure node with proper CORS headers

---

## 📦 Standalone Usage

To use this in your own project:

### 1. Copy the HTML file

```bash
cp Frontend/midnight-browser-demo.html your-project/
```

### 2. Or extract just the JavaScript

```javascript
// 1. Copy entire <script> section
// 2. Save as midnight-wallet-standalone.js
// 3. Include in your HTML:
<script src="midnight-wallet-standalone.js"></script>
```

### 3. Use the API

```javascript
// In your code:
document.getElementById('myConnectBtn').addEventListener('click', async () => {
    await midnightDemo.connect();
});

document.getElementById('mySendBtn').addEventListener('click', async () => {
    await midnightDemo.send();
});
```

---

## 🔐 Security Notes

### Important Considerations

1. **Private Keys**: Never stored in browser - handled by Lace wallet
2. **Signing**: Always happens in Lace secure environment
3. **Node Connection**: Direct HTTP (use HTTPS in production)
4. **User Approval**: Every transaction requires explicit user confirmation

### Production Checklist

```javascript
// ✅ Use HTTPS for node connection
const MIDNIGHT_NODE_URL = 'https://node.example.com';

// ✅ Add proper error handling
try {
    await submitTransaction(tx);
} catch (error) {
    logToMonitoring(error);
    showUserFriendlyError();
}

// ✅ Validate all inputs
if (!isValidAddress(recipient)) {
    throw new Error('Invalid address format');
}

// ✅ Add rate limiting
const rateLimiter = new RateLimiter(5, 60000); // 5 tx per minute
```

---

## 🎓 Learning Resources

### Understanding the Code

**For Beginners:**
1. Read `detectLaceProvider()` - Shows how to find wallet
2. Read `connectWallet()` - Shows async/await pattern
3. Read `sendTransaction()` - Shows complete flow

**For Advanced:**
1. Study error handling in `submitTransaction()`
2. Analyze fallback strategies in `signTransaction()`
3. Review state management pattern

### Key Concepts

| Concept | Explanation |
|---------|-------------|
| Provider | JavaScript API injected by browser extension |
| Enable | User approval to connect dApp to wallet |
| Unshielded Address | Public address format (mn_addr_undeployed...) |
| Signing | Cryptographic signature by wallet's private key |
| Node Submission | POST request to blockchain node RPC |

---

## 🔄 Flow Diagram

```
User Opens Page
    ↓
Detect Lace Provider [window.midnight/lace/cardano.lace]
    ↓
User Clicks "Connect"
    ↓
Show Lace Popup [laceProvider.enable()]
    ↓
User Approves
    ↓
Get Unshielded Address [wallet.getUnshieldedAddresses()]
    ↓
Display Address in UI
    ↓
User Enters Recipient & Amount
    ↓
User Clicks "Send"
    ↓
Build Transaction Object {from, to, amount, ...}
    ↓
Request Signature [wallet.signTransaction(tx)]
    ↓
Show Lace Signing Popup
    ↓
User Approves Signature
    ↓
Submit to Node [fetch(NODE_URL/submit)]
    ↓
Receive TX Hash
    ↓
Display in UI ✅
```

---

## 📊 Expected Output

### Console Logs

```
🚀 Midnight Browser Demo Initializing...
🔍 Detecting Lace wallet provider...
✅ Found window.midnight
✅ Demo ready!
💡 Debug commands available:
  midnightDemo.connect() - Connect wallet
  midnightDemo.send() - Send transaction
  midnightDemo.getAddress() - Get current address
  midnightDemo.isConnected() - Check connection status

--- User Clicks Connect ---

📢 Requesting wallet connection...
🔑 Getting wallet address...
✅ Connected! Address: mn_addr_undeployed1abc123def456...

--- User Sends Transaction ---

🔨 Building transaction...
📦 Transaction built: {from: "mn_addr...", to: "mn_addr...", amount: 1}
✍️ Requesting signature from Lace...
📝 Using wallet.signTransaction
📤 Submitting transaction to Midnight node...
✅ Transaction submitted: {txHash: "0xabc123...", status: "pending"}
🎉 Transaction complete!
```

### UI Display

```
🌙 Midnight Browser Demo
Frontend-Only Lace Wallet Integration

Lace Wallet: Installed ✓
Connection: Connected ✓

Your Address:
mn_addr_undeployed1abc123def456789...

[Connected] (disabled button)

Send Transaction
Recipient Address: [input field]
Amount (tNIGHT): [1]

[Send Demo Transaction]

✅ Transaction Sent!
TX Hash:
0xabc123def456789...
Amount: 1 tNIGHT
To: mn_addr_undeployed...
```

---

## 🆚 Comparison with Backend Approach

| Feature | Browser-Only | Backend API |
|---------|--------------|-------------|
| **Setup** | Open HTML file | Run Node.js server |
| **Dependencies** | None | Express, SDK packages |
| **Signing** | Lace popup | Backend wallet |
| **Security** | User controls keys | Server controls keys |
| **Complexity** | Low | Medium |
| **Best For** | Demos, testing | Production, automation |

---

## ✅ Checklist

Before using this demo:

- [ ] Lace wallet installed
- [ ] Python server running (port 8000)
- [ ] Midnight node running (port 9944)
- [ ] Wallet has test tNIGHT tokens
- [ ] Browser console open for debugging

---

## 📞 Support

If you encounter issues:

1. **Check Console**: Look for error messages
2. **Test Provider**: Run `console.log(window.midnight)`
3. **Test Node**: Run `curl http://localhost:9944`
4. **Check Network**: Ensure wallet is on correct network

---

## 🎉 Success!

If everything works, you should see:
- ✅ Lace wallet detected
- ✅ Connection successful
- ✅ Address displayed
- ✅ Transaction hash returned

**You now have a working browser-only Midnight demo!** 🚀

---

**File Location:** `Frontend/midnight-browser-demo.html`

**Access URL:** `http://localhost:8000/Frontend/midnight-browser-demo.html`
