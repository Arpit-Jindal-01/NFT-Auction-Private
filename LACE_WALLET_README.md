# 🌙 Lace Wallet Integration - Quick Start

Clean, modular Lace Wallet connection for Midnight blockchain local network.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Frontend/midnight-wallet.js` | **Core API** - Main wallet connection library |
| `Frontend/wallet-demo.html` | **Demo Page** - Standalone test page |
| `Frontend/integration-example.js` | **Integration Guide** - How to add to existing pages |
| `LACE_WALLET_INTEGRATION.md` | **Full Documentation** - Complete API reference |

## 🚀 Quick Start (3 Steps)

### 1️⃣ Add Script to Your HTML

```html
<script src="midnight-wallet.js"></script>
```

### 2️⃣ Add UI Elements

```html
<!-- Status -->
<span id="walletStatus">Disconnected</span>

<!-- Address -->
<span id="walletAddress">Not connected</span>

<!-- Connect Button -->
<button id="connectWalletBtn">Connect Wallet</button>
```

### 3️⃣ Initialize JavaScript

```javascript
// On page load
window.MidnightWalletAPI.init('connectWalletBtn', {
    statusElementId: 'walletStatus',
    addressElementId: 'walletAddress',
    connectButtonId: 'connectWalletBtn'
});
```

**That's it!** ✅ The wallet connection is ready.

## 🎯 Using the Wallet

### Check Connection

```javascript
const status = window.MidnightWalletAPI.getStatus();

if (status.connected) {
    console.log('Connected to:', status.address);
} else {
    alert('Please connect wallet first');
}
```

### Manual Connect

```javascript
const result = await window.MidnightWalletAPI.connect();

if (result.success) {
    console.log('Address:', result.address);
} else {
    console.error('Error:', result.error);
}
```

### Access Global State

```javascript
// Direct access to wallet state
console.log(window.MidnightWallet.connected);
console.log(window.MidnightWallet.address);
```

### Listen for Changes

```javascript
window.MidnightWalletAPI.listenForChanges((newAddress) => {
    console.log('Address changed:', newAddress);
});
```

## 🧪 Testing

### Try the Demo

Open in browser:
```bash
open Frontend/wallet-demo.html
```

### Console Testing

```javascript
// Check installation
window.MidnightWalletAPI.isInstalled()

// Get status
window.MidnightWalletAPI.getStatus()

// Connect
await window.MidnightWalletAPI.connect()

// View state
console.log(window.MidnightWallet)
```

## 📋 Features

✅ **Connect** to Lace Wallet  
✅ **Get** unshielded address (mn_addr_undeployed...)  
✅ **Display** address in UI  
✅ **Store** in global state  
✅ **Handle** errors  
✅ **Show** connection status  
✅ **Listen** for account changes  
✅ **Auto-update** UI  

## 🔧 Requirements

- Lace Wallet browser extension installed
- Configured for Midnight Local Network
- Modern browser (Chrome, Firefox, Edge)

## 📖 Full Documentation

See [`LACE_WALLET_INTEGRATION.md`](LACE_WALLET_INTEGRATION.md) for:
- Complete API reference
- Advanced usage patterns
- Error handling
- Integration examples
- Troubleshooting guide

## 🎨 Integration with Existing Pages

See [`Frontend/integration-example.js`](Frontend/integration-example.js) for:
- Step-by-step integration
- Code examples
- Complete minimal example

## 🔍 API Quick Reference

| Function | Description |
|----------|-------------|
| `connect()` | Connect to Lace Wallet |
| `disconnect()` | Disconnect wallet |
| `getStatus()` | Get connection status |
| `isInstalled()` | Check if Lace is installed |
| `init(btnId, elements)` | Initialize with UI |
| `updateUI(status, elements)` | Update UI manually |
| `listenForChanges(callback)` | Listen for account changes |

## ⚡ Example: Use in Auction

```javascript
document.getElementById('startAuctionBtn').addEventListener('click', async () => {
    // Check wallet
    const wallet = window.MidnightWalletAPI.getStatus();
    
    if (!wallet.connected) {
        alert('Please connect wallet first');
        return;
    }
    
    // Start auction with wallet address
    const response = await fetch('/api/auction/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            walletAddress: wallet.address
        })
    });
    
    const result = await response.json();
    console.log('Auction started:', result);
});
```

## 🎯 Next Steps

1. ✅ **Test** with `wallet-demo.html`
2. ✅ **Integrate** into your pages
3. ✅ **Use** wallet address in transactions
4. ✅ **Deploy** your application

## 📞 Support

- Check browser console for errors
- Verify Lace Wallet is installed
- Review `LACE_WALLET_INTEGRATION.md`
- Check `integration-example.js` for examples

---

**Version:** 1.0.0  
**Network:** Midnight Local (Undeployed)  
**Last Updated:** February 2026

🚀 **Ready to use!** Start with `wallet-demo.html` to see it in action.
