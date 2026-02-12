# Contract API Testing Guide

Complete guide for using the Express API endpoint to interact with deployed Compact contracts.

---

## 📋 Overview

The `/api/test-contract` endpoint allows you to call functions on your deployed Compact contract from the backend, using the Midnight SDK.

---

## 🚀 Quick Start

### 1. Configure Environment Variables

Create or update your `.env` file:

```bash
# Local Node Configuration
NODE_URL=http://localhost:9944

# Contract Configuration
CONTRACT_ADDRESS=your_deployed_contract_address_here

# Backend Wallet (for signing transactions)
WALLET_SEED=your_wallet_seed_phrase_here
```

### 2. Start the Server

```bash
npm start
# or
node local-runtime/server.js
```

### 3. Test the Endpoint

```bash
curl -X POST http://localhost:3000/api/test-contract \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📡 API Endpoints

### POST `/api/test-contract`

Call a contract function with backend wallet signing.

**Request Body:**

```json
{
  "function": "getStatus",
  "args": []
}
```

**Available Functions:**
- `getStatus` - Get current auction status (default)
- `getTopBid` - Get highest bid amount
- `startAuction` - Start a new auction
- `recordBid` - Record a new bid
- `endAuction` - End the auction
- `settle` - Settle the auction

**Response (Success):**

```json
{
  "success": true,
  "message": "Contract function called successfully",
  "txHash": "0x1234567890abcdef...",
  "result": {
    "success": true,
    "txHash": "0x1234567890abcdef...",
    "status": "0",
    "blockNumber": 1707678000,
    "timestamp": "2026-02-11T12:00:00.000Z",
    "contractAddress": "your-contract-address",
    "function": "getStatus"
  },
  "contractInfo": {
    "contractAddress": "your-contract-address",
    "nodeUrl": "http://localhost:9944",
    "availableFunctions": [
      "startAuction",
      "recordBid",
      "endAuction",
      "settle",
      "getStatus",
      "getTopBid"
    ]
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message",
  "function": "getStatus"
}
```

---

### GET `/api/contract/info`

Get contract information.

**Response:**

```json
{
  "success": true,
  "contract": {
    "contractAddress": "your-contract-address",
    "nodeUrl": "http://localhost:9944",
    "availableFunctions": [
      "startAuction",
      "recordBid",
      "endAuction",
      "settle",
      "getStatus",
      "getTopBid"
    ]
  }
}
```

---

## 🧪 Testing Examples

### Example 1: Call getStatus

```bash
curl -X POST http://localhost:3000/api/test-contract \
  -H "Content-Type: application/json" \
  -d '{"function": "getStatus"}'
```

### Example 2: Call getTopBid

```bash
curl -X POST http://localhost:3000/api/test-contract \
  -H "Content-Type: application/json" \
  -d '{"function": "getTopBid"}'
```

### Example 3: Get Contract Info

```bash
curl http://localhost:3000/api/contract/info
```

### Example 4: Using JavaScript Fetch

```javascript
async function testContract() {
    const response = await fetch('http://localhost:3000/api/test-contract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            function: 'getStatus'
        })
    });
    
    const data = await response.json();
    console.log('Transaction Hash:', data.txHash);
    console.log('Result:', data.result);
}

testContract();
```

### Example 5: Using from Frontend

```javascript
// In your frontend JavaScript
document.getElementById('testContractBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/test-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ function: 'getStatus' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Success! TX Hash:', data.txHash);
            alert(`Transaction sent! Hash: ${data.txHash}`);
        } else {
            console.error('❌ Error:', data.error);
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('❌ Failed:', error);
        alert(`Failed: ${error.message}`);
    }
});
```

---

## 🔧 Implementation Details

### Architecture

```
Frontend/Browser
      │
      │ HTTP POST
      ▼
Express Server (localhost:3000)
      │
      │ POST /api/test-contract
      ▼
ContractClient.js
      │
      ├─> Load contract from build/
      ├─> Create circuit context
      ├─> Call contract function
      ├─> Sign with backend wallet
      │
      ▼
Compact Contract
      │
      │ Returns result
      ▼
[Optional] Submit to Node
      │
      │ localhost:9944
      ▼
Midnight Local Node
      │
      ▼
Return TX Hash to Client
```

### Contract Client Module

The `ContractClient` class handles all contract interactions:

**Key Methods:**
- `callGetStatus()` - Call getStatus function
- `callGetTopBid()` - Call getTopBid function
- `callContractFunction(name, args)` - Generic function caller
- `submitTransaction(tx)` - Submit to node
- `getInfo()` - Get contract metadata

**Features:**
- ✅ Automatic wallet management
- ✅ Environment variable configuration
- ✅ Error handling with detailed messages
- ✅ Transaction hash generation
- ✅ Local mode simulation
- ✅ Production-ready node submission

---

## 🔐 Security

### Environment Variables

**Required:**
- `CONTRACT_ADDRESS` - Deployed contract address
- `NODE_URL` - Midnight node endpoint
- `WALLET_SEED` - Backend wallet seed phrase

**Important:**
- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Keep seed phrases secure
- ✅ Use separate wallets for backend vs frontend
- ✅ Rotate credentials regularly

### Best Practices

1. **Separate Wallets**: Backend wallet should be different from user wallets
2. **Access Control**: Add authentication to the API endpoint
3. **Rate Limiting**: Implement rate limiting for production
4. **Logging**: Log all contract calls for audit trail
5. **Error Handling**: Never expose sensitive details in errors

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Solution:** Check that contract is compiled:
```bash
npm run compile
```

### Error: "Contract function not found"

**Solution:** Verify function name matches contract:
```bash
curl http://localhost:3000/api/contract/info
```

### Error: "Node connection failed"

**Solution:** Check local node is running:
```bash
# Check if node is accessible
curl http://localhost:9944

# Start local node if needed
# (Your node startup command here)
```

### Error: "Environment variable not set"

**Solution:** Create/update `.env` file:
```bash
cp .env.example .env
# Edit .env with your values
```

### Success but no actual transaction

**Solution:** This is expected in local mode! The system simulates transactions. To submit to actual node:
1. Ensure `NODE_URL` points to running node
2. Check node accepts connections
3. Review logs for submission details

---

## 📊 Response Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| `success` | Whether call succeeded | `true` |
| `txHash` | Transaction hash | `0x1234...` |
| `status` | Contract status value | `"0"` |
| `blockNumber` | Block timestamp | `1707678000` |
| `timestamp` | ISO timestamp | `"2026-02-11T12:00:00.000Z"` |
| `contractAddress` | Contract address | `"sample-address..."` |
| `function` | Function called | `"getStatus"` |

---

## 🚀 Production Deployment

### Before Production

1. **Set Real Values in `.env`:**
   ```bash
   NODE_URL=https://rpc.mainnet.midnight.network
   CONTRACT_ADDRESS=<real_deployed_address>
   WALLET_SEED=<secure_seed_phrase>
   ```

2. **Add Authentication:**
   ```javascript
   // Add middleware for auth
   function requireAuth(req, res, next) {
       const token = req.headers.authorization;
       if (!isValidToken(token)) {
           return sendJSON(res, 401, { error: 'Unauthorized' });
       }
       next();
   }
   ```

3. **Add Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

4. **Enable HTTPS:**
   - Use reverse proxy (nginx)
   - Or use HTTPS directly in Express

5. **Monitor and Log:**
   - Set up proper logging
   - Monitor transaction success rates
   - Track errors and alerts

---

## 📝 Testing Checklist

- [ ] Environment variables configured
- [ ] Server starts without errors
- [ ] Contract info endpoint returns data
- [ ] getStatus call succeeds
- [ ] getTopBid call succeeds
- [ ] Transaction hash is returned
- [ ] Error handling works correctly
- [ ] CORS allows frontend access
- [ ] Logs are clear and helpful

---

## 🔗 Related Files

- `local-runtime/contract-client.js` - Contract interaction module
- `local-runtime/server.js` - Express server with endpoint
- `.env` - Environment configuration
- `build/auction/contract/index.js` - Compiled contract

---

## 📚 Example Integration

### Full Frontend Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contract Testing</title>
</head>
<body>
    <h1>Contract Function Tester</h1>
    
    <button id="getStatus">Get Status</button>
    <button id="getTopBid">Get Top Bid</button>
    <button id="getInfo">Contract Info</button>
    
    <pre id="result"></pre>
    
    <script>
        const API = 'http://localhost:3000';
        const resultDiv = document.getElementById('result');
        
        async function callContract(functionName) {
            try {
                const response = await fetch(`${API}/api/test-contract`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ function: functionName })
                });
                
                const data = await response.json();
                resultDiv.textContent = JSON.stringify(data, null, 2);
                
                if (data.success) {
                    alert(`✅ Success! TX: ${data.txHash}`);
                }
            } catch (error) {
                resultDiv.textContent = `Error: ${error.message}`;
            }
        }
        
        async function getInfo() {
            const response = await fetch(`${API}/api/contract/info`);
            const data = await response.json();
            resultDiv.textContent = JSON.stringify(data, null, 2);
        }
        
        document.getElementById('getStatus').onclick = () => callContract('getStatus');
        document.getElementById('getTopBid').onclick = () => callContract('getTopBid');
        document.getElementById('getInfo').onclick = getInfo;
    </script>
</body>
</html>
```

---

## 🎯 Success Criteria

✅ Server starts successfully  
✅ Contract client initializes  
✅ Environment variables loaded  
✅ API endpoint responds  
✅ Contract functions callable  
✅ Transaction hashes returned  
✅ Error handling works  
✅ Documentation complete  

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Network:** Midnight Local & Production Ready

🚀 **Ready to use!**
