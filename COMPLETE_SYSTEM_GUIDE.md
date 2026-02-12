# 🌙 Complete Midnight NFT Auction System Guide

## 🎯 System Overview

You now have a **complete full-stack Midnight blockchain application** with:

### ✅ **Frontend (Lace Wallet)**
- Connect Lace Wallet to local Midnight network
- Send tNIGHT token transactions
- Check wallet balance
- Track transaction status
- Real-time auction state updates

### ✅ **Backend (Express API)**
- Call Compact contract functions (getStatus, getTopBid)
- Sign transactions with backend wallet
- Submit to Midnight node (localhost:9944)
- Environment-based configuration

---

## 📁 File Structure

```
NFT-Copy/
├── Frontend/
│   ├── midnight-wallet.js      # Core Lace wallet API
│   ├── app.html                 # Unified UI (wallet + auctions + transactions)
│   ├── wallet-demo.html         # Standalone wallet demo
│   └── test-wallet.html         # Developer testing suite
│
├── local-runtime/
│   ├── server.js                # Express API server (port 3000)
│   ├── contract-client.js       # Backend contract interaction module
│   └── wallet.js                # LocalWallet implementation
│
├── test-contract-api.js         # API endpoint test script
├── .env.example                 # Environment configuration template
│
└── Documentation/
    ├── LACE_WALLET_INTEGRATION.md       # Wallet integration guide
    ├── LACE_WALLET_TRANSACTION_GUIDE.md # Transaction functionality
    └── CONTRACT_API_GUIDE.md            # Backend API documentation
```

---

## 🚀 Quick Start (5 Steps)

### 1️⃣ **Install Lace Wallet**
```bash
# Visit Lace wallet website and install browser extension
# https://www.lace.io/
```

### 2️⃣ **Start Midnight Node** (if not already running)
```bash
# Make sure your local Midnight node is running on localhost:9944
```

### 3️⃣ **Configure Environment**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration:
# NODE_URL=http://localhost:9944
# CONTRACT_ADDRESS=<your_deployed_contract_address>
# WALLET_SEED=<your_32_byte_seed_hex>
```

### 4️⃣ **Start Backend Server**
```bash
# Terminal 1: Start Node.js API server
npm start
# or
node local-runtime/server.js

# Server will run on http://localhost:3000
```

### 5️⃣ **Start Frontend Server**
```bash
# Terminal 2: Start Python HTTP server
python3 -m http.server 8000
# or
python -m http.server 8000

# Server will run on http://localhost:8000
```

---

## 🌐 Access Points

### Frontend URLs:
- **Main App**: http://localhost:8000/Frontend/app.html
- **Wallet Demo**: http://localhost:8000/Frontend/wallet-demo.html
- **Test Suite**: http://localhost:8000/Frontend/test-wallet.html

### Backend API:
- **Base URL**: http://localhost:3000
- **Health Check**: GET http://localhost:3000/health
- **Contract Info**: GET http://localhost:3000/api/contract/info
- **Test Contract**: POST http://localhost:3000/api/test-contract

---

## 🧪 Testing the System

### **Test Frontend (Wallet)**

1. Open http://localhost:8000/Frontend/app.html
2. Click **"Connect Lace Wallet"**
3. Your address should appear (starts with `mn_addr_undeployed...`)
4. Try sending a transaction:
   - Enter recipient address
   - Enter amount (e.g., 1.5)
   - Click **"Send Transaction"**
   - Approve in Lace wallet popup

### **Test Backend (Contract API)**

#### **Option 1: Using Test Script** (Recommended)
```bash
# Run automated tests
npm run test:api

# This will test:
# - Health check
# - Contract info endpoint
# - getStatus function (default)
# - getStatus function (explicit)
# - getTopBid function
# - Error handling (invalid function)
```

#### **Option 2: Using curl**
```bash
# Test health
curl http://localhost:3000/health

# Get contract info
curl http://localhost:3000/api/contract/info

# Call getStatus
curl -X POST http://localhost:3000/api/test-contract \
  -H "Content-Type: application/json" \
  -d '{"function": "getStatus"}'

# Call getTopBid
curl -X POST http://localhost:3000/api/test-contract \
  -H "Content-Type: application/json" \
  -d '{"function": "getTopBid"}'
```

#### **Option 3: Using JavaScript/Fetch**
```javascript
// In browser console or Node.js script
const response = await fetch('http://localhost:3000/api/test-contract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ function: 'getStatus' })
});

const data = await response.json();
console.log('Status:', data.status);
console.log('TX Hash:', data.txHash);
```

---

## 🔧 Environment Configuration

### Required Variables (.env file)

```env
# Midnight Node RPC URL
NODE_URL=http://localhost:9944

# Deployed Contract Address
CONTRACT_ADDRESS=your_contract_address_here

# Backend Wallet Seed (32 bytes in hex)
WALLET_SEED=your_32_byte_hex_seed_here

# Alternative: Use seed phrase instead
# SEED_PHRASE="your twelve word seed phrase here"
```

### Getting Your Configuration Values:

#### **Contract Address**
```bash
# After deploying your contract, find the address in:
cat deployment-record.json
# Look for "contractAddress" field
```

#### **Wallet Seed**
```bash
# Generate a new seed:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use existing wallet seed from deployment
```

---

## 📚 API Reference

### **POST /api/test-contract**

Call Compact contract functions from backend.

**Request Body:**
```json
{
  "function": "getStatus",  // or "getTopBid"
  "params": {}              // optional, future use
}
```

**Response (Success):**
```json
{
  "success": true,
  "function": "getStatus",
  "status": "NotStarted",
  "txHash": "0xabc123...",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Function not found: invalidFunction",
  "available": ["getStatus", "getTopBid"]
}
```

### **GET /api/contract/info**

Get information about the contract client.

**Response:**
```json
{
  "success": true,
  "info": {
    "contractLoaded": true,
    "availableCircuits": ["getStatus", "getTopBid"],
    "nodeUrl": "http://localhost:9944"
  }
}
```

---

## 🔍 Troubleshooting

### **Frontend Issues**

#### "Lace Wallet not detected"
```
✅ Solution:
1. Install Lace wallet extension
2. Refresh the page
3. Check browser console for errors
```

#### "Failed to connect to wallet"
```
✅ Solution:
1. Unlock Lace wallet
2. Switch to Midnight network in wallet
3. Try connecting again
```

#### "Transaction failed"
```
✅ Solution:
1. Check if you have sufficient tNIGHT balance
2. Verify recipient address format (mn_addr_undeployed...)
3. Check if Midnight node is running
4. Look for error message in UI
```

### **Backend Issues**

#### "Cannot load contract"
```
✅ Solution:
1. Verify contract is compiled: ls build/auction/contract/
2. Check CONTRACT_ADDRESS in .env
3. Ensure contract was deployed successfully
```

#### "Node connection failed"
```
✅ Solution:
1. Verify Midnight node is running: curl http://localhost:9944
2. Check NODE_URL in .env (should be http://localhost:9944)
3. Look at server logs for detailed error
```

#### "Invalid wallet seed"
```
✅ Solution:
1. Verify WALLET_SEED is 64 hex characters (32 bytes)
2. Generate new seed: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
3. Or use SEED_PHRASE instead of WALLET_SEED
```

---

## 🎨 Frontend Features

### **Wallet Card**
- **Connect Button**: Opens Lace wallet connection
- **Status Display**: Shows connected/disconnected state
- **Address Display**: Shows your unshielded address
- **Disconnect Button**: Safely disconnects wallet

### **Transaction Card**
- **Recipient Input**: Enter destination address
- **Amount Input**: Enter tNIGHT amount to send
- **Send Button**: Initiates transaction with Lace signing
- **Check Balance**: Query current wallet balance
- **Result Display**: Shows success/error messages with TX hash

### **Auction Card** (when connected)
- **Auction Status**: Shows current auction state
- **Top Bid**: Displays highest bid if any
- **Auto-refresh**: Updates every 3 seconds

---

## 🛠️ Development Scripts

```bash
# Start backend server
npm start

# Test contract API
npm run test:api

# Compile contract
npm run compile

# Deploy contract locally
npm run deploy

# Run all (compile + deploy)
npm run all
```

---

## 📖 Documentation Files

- **LACE_WALLET_INTEGRATION.md**: Complete wallet integration guide
- **LACE_WALLET_TRANSACTION_GUIDE.md**: Transaction functionality details
- **CONTRACT_API_GUIDE.md**: Backend API comprehensive documentation
- **LACE_ARCHITECTURE.md**: System architecture overview
- **LACE_WALLET_README.md**: Quick reference guide

---

## 🔐 Security Considerations

### **Frontend**
- ✅ Never store private keys in JavaScript
- ✅ All signing happens in Lace wallet (secure enclave)
- ✅ Wallet connection requires user approval
- ✅ Transactions require explicit user confirmation

### **Backend**
- ✅ Store seeds in .env file (never commit to git)
- ✅ Add .env to .gitignore
- ✅ Use environment variables for sensitive data
- ✅ Consider using encrypted key storage in production

### **Production Checklist**
```bash
# Before deploying to production:
1. Generate production wallet seed securely
2. Use HTTPS for all API endpoints
3. Add rate limiting to API
4. Implement proper error logging
5. Add authentication/authorization if needed
6. Use environment-specific configurations
7. Enable CORS properly for your domain
8. Monitor transaction submissions
```

---

## 🎯 Next Steps

### **For Development**
1. ✅ Test wallet connection with real Lace wallet
2. ✅ Send test transactions between addresses
3. ✅ Test contract API endpoints
4. ✅ Monitor transaction confirmations
5. ⏳ Add more contract functions as needed

### **For Production**
1. ⏳ Switch to mainnet Midnight node
2. ⏳ Update CONTRACT_ADDRESS for production contract
3. ⏳ Secure backend wallet management
4. ⏳ Add proper authentication
5. ⏳ Set up monitoring and logging
6. ⏳ Deploy to production servers

---

## 💡 Tips & Best Practices

### **Frontend Development**
- Use browser console to debug wallet issues
- Check Network tab for API call responses
- Test with different wallet states (locked/unlocked)
- Handle all error cases gracefully

### **Backend Development**
- Check server logs for detailed errors
- Test contract functions individually
- Verify .env configuration before starting
- Use test script for automated validation

### **Testing**
- Test wallet connection first
- Verify simple transactions before complex ones
- Test error cases (insufficient funds, invalid address)
- Monitor node logs during testing

---

## 🆘 Getting Help

### **Check Logs**
```bash
# Backend server logs
# Look for contract client initialization messages
# Check for transaction submission details

# Frontend browser console
# Look for wallet API messages
# Check for transaction responses
```

### **Common Debug Commands**
```bash
# Check if node is running
curl http://localhost:9944

# Test backend health
curl http://localhost:3000/health

# Get contract info
curl http://localhost:3000/api/contract/info

# View environment
cat .env

# Check compiled contract
ls -la build/auction/contract/
```

### **Resources**
- **Midnight Docs**: Official Midnight documentation
- **Lace Wallet**: https://www.lace.io/
- **Project Docs**: See documentation/ folder

---

## ✨ Summary

You now have a complete system with:

✅ **Frontend**: Lace wallet integration with transaction support  
✅ **Backend**: Express API for contract interaction  
✅ **Testing**: Automated test scripts  
✅ **Documentation**: Comprehensive guides  
✅ **Configuration**: Environment-based setup  

**Ready to use!** Start both servers and open the app in your browser.

---

**Happy Building! 🚀**
