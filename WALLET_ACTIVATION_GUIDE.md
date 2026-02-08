# 🔑 Midnight Network Wallet Activation Guide

## Step-by-Step Wallet Activation Process

### Current Situation
Your wallet addresses show "undeployed" status, which means they exist locally but are not yet registered on the Midnight Network blockchain.

**Your Addresses:**
- **Shielded:** `mn_shield-addr_undeployed1kf5p5s7arvuu97ltfge86zqcczz5ukkdchk608v9x3kn0y28hyx53g248jw6qvrqelkmqlt69dam66sjx50x9yncjpqjcmz0qge3nhgp4xr36`
- **Unshielded:** `mn_addr_undeployed1dgfpxpn338naf5xxv2uqpsmjvpgmtnw3flmx480cwjhae0we3e2sye0g4a`
- **Dust:** `mn_dust_undeployed1w05ucv74utn03q4jdmvq7cp2g64wy5rrw7qq5yppwt3w7rt7dwd4vxdzctk`

---

## 🎯 Activation Process

### Step 1: Access Midnight Network Wallet

#### Option A: Official Midnight Wallet (Recommended)
```
URL: https://wallet.testnet.midnight.network
```

**What to do:**
1. Open the URL in your web browser (Chrome, Firefox, or Brave recommended)
2. Look for "Create Wallet" or "Import Wallet" option
3. You should see a wallet interface

#### Option B: Midnight CLI Tools
If you generated these addresses using CLI tools, you may already have a local wallet file.

**Check for existing wallet:**
```bash
# Look for wallet files in common locations
ls ~/.midnight/wallets/
ls ~/.config/midnight/
find ~ -name "*midnight*wallet*" 2>/dev/null
```

---

### Step 2: Understand Your Wallet Type

These addresses suggest you have:
- **Shielded address** → For private transactions (zero-knowledge proofs)
- **Unshielded address** → For public transactions (transparent)
- **Dust address** → For dust/change management

**This is a Midnight Network multi-address wallet setup.**

---

### Step 3: Import or Create Your Wallet

You need one of the following to access your wallet:

#### Option 1: Seed Phrase (Mnemonic)
- Usually 12 or 24 words
- Example: "word1 word2 word3 ... word24"
- **DO YOU HAVE THIS?** ⬇️

If YES:
1. Go to Midnight wallet portal
2. Click "Import Wallet"
3. Enter your seed phrase
4. Set a password
5. Wallet will regenerate your addresses

#### Option 2: Private Key
- 64 hexadecimal characters
- Example: "a1b2c3d4e5f6..."
- **DO YOU HAVE THIS?** ⬇️

If YES:
1. Go to wallet portal
2. Choose "Import from Private Key"
3. Paste your private key
4. Addresses will be derived

#### Option 3: Wallet File (Keystore)
- JSON file with encrypted keys
- Usually named something like "midnight-wallet.json"
- **DO YOU HAVE THIS?** ⬇️

If YES:
1. Import the keystore file
2. Enter the password you used when creating it
3. Wallet will unlock

---

### Step 4: Wallet Activation Transaction

Once you've imported your wallet, you need to **activate it on-chain**.

#### What is Activation?
- First transaction that registers your addresses on the blockchain
- Creates your account on Midnight Network
- Addresses move from "undeployed" to "deployed" status
- Small gas fee required (~0.001 MIDNIGHT)

#### How to Activate:

**Method 1: Request Testnet Tokens (Recommended)**
```
1. Visit: https://faucet.testnet.midnight.network
2. Enter your UNSHIELDED address:
   mn_addr_undeployed1dgfpxpn338naf5xxv2uqpsmjvpgmtnw3flmx480cwjhae0we3e2sye0g4a
3. Click "Request Tokens"
4. Wait for confirmation (1-5 minutes)
5. Check your wallet - should see tokens arrive
```

**When faucet sends you tokens, it automatically activates your wallet!**

**Method 2: Receive Tokens from Another Wallet**
If you know someone on Midnight testnet:
```
1. Give them your unshielded address
2. They send you tokens (even 0.01 MIDNIGHT)
3. Transaction activates your wallet
```

**Method 3: Manual Activation (If Wallet UI Supports)**
Some wallet interfaces have an "Activate Wallet" button:
```
1. Look for "Activate" or "Deploy Addresses" button
2. Confirm the transaction
3. Pay small gas fee
4. Wait for confirmation
```

---

### Step 5: Verify Activation

After activation, verify your wallet is live:

#### Check 1: Address Status
Your addresses should change from:
- ❌ `mn_addr_**undeployed**1dgfpx...` 
to:
- ✅ `mn_addr_1dgfpx...` (no "undeployed")

#### Check 2: Balance
```bash
# In wallet interface, you should see:
Unshielded Balance: 10.0 MIDNIGHT (or whatever you received)
Shielded Balance: 0 MIDNIGHT (initially)
```

#### Check 3: Blockchain Explorer
```
1. Visit: https://explorer.testnet.midnight.network
2. Search for your unshielded address
3. You should see:
   - Address exists ✅
   - Balance shown ✅
   - Transaction history ✅
```

If you see "Address not found" → wallet not activated yet.

---

### Step 6: Get Deployment Tokens

You need enough tokens for contract deployment:

**Required Amount:** ~0.1 MIDNIGHT tokens
- Contract deployment: ~0.001 MIDNIGHT
- Safety buffer: 0.099 MIDNIGHT

**How to Get Tokens:**
```
Faucet: https://faucet.testnet.midnight.network
- Request limit: Usually 10-100 MIDNIGHT per request
- Cooldown: 24 hours between requests
- Free for testnet
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "I don't have a seed phrase or private key"
**Problem:** You received these addresses but don't have the keys.

**Solution:**
- These addresses were generated somewhere - find how they were created
- Check your wallet software/tool
- Look for wallet backup files
- If truly lost, you'll need to generate a NEW wallet

**To generate new wallet:**
```bash
# If Midnight CLI is installed:
midnight-cli wallet create

# Or use the web wallet:
# Visit https://wallet.testnet.midnight.network
# Click "Create New Wallet"
# **SAVE YOUR SEED PHRASE!**
```

### Issue 2: "Faucet says address is invalid"
**Problem:** Faucet doesn't recognize your address format.

**Solution:**
- Use the UNSHIELDED address only (starts with `mn_addr_`)
- Remove any "undeployed" prefix if the faucet has a validator
- Try: `mn_addr_1dgfpxpn338naf5xxv2uqpsmjvpgmtnw3flmx480cwjhae0we3e2sye0g4a`
  (without "undeployed")

### Issue 3: "Wallet portal doesn't exist / 404 error"
**Problem:** The testnet portal URL might have changed.

**Solution:**
- Check official Midnight Network documentation
- Visit: https://docs.midnight.network
- Look for "Testnet" section
- Join Discord for latest info: https://discord.gg/midnight

### Issue 4: "Faucet request failed - rate limited"
**Problem:** Too many requests from your IP.

**Solution:**
- Wait 24 hours and try again
- Ask in Discord #testnet-faucet channel
- Someone might send you tokens directly

---

## 📋 Activation Checklist

Complete these in order:

- [ ] **Find your wallet recovery method**
  - [ ] Seed phrase (12-24 words)
  - [ ] Private key (64 hex chars)
  - [ ] Keystore file
  
- [ ] **Import wallet into Midnight Network**
  - [ ] Navigate to wallet portal
  - [ ] Import using seed/key/keystore
  - [ ] Verify addresses match

- [ ] **Activate wallet on-chain**
  - [ ] Request tokens from faucet OR
  - [ ] Receive tokens from friend OR
  - [ ] Click "Activate" in wallet UI

- [ ] **Verify activation successful**
  - [ ] Addresses no longer show "undeployed"
  - [ ] Balance shows in wallet
  - [ ] Address visible in explorer

- [ ] **Ensure sufficient balance**
  - [ ] At least 0.1 MIDNIGHT tokens
  - [ ] For contract deployment costs

- [ ] **Export private key for deployment**
  - [ ] Get private key from wallet
  - [ ] Add to `.env` file: `PRIVATE_KEY=...`
  - [ ] Keep secure, never share

---

## 🎯 After Wallet is Activated

Once your wallet shows:
- ✅ No "undeployed" in addresses
- ✅ Balance of testnet tokens
- ✅ Visible on blockchain explorer

**You're ready for deployment! Come back and tell me:**

```
"My wallet is activated and funded. Here's my private key: [paste it]"
```

Or if you prefer to keep the private key secure:
```
"My wallet is activated. I've added the private key to .env file."
```

Then run:
```bash
npm run deploy:real
```

---

## 🔒 Security Reminder

**NEVER share:**
- ❌ Your seed phrase
- ❌ Your private key
- ❌ Your keystore password

**These are for testnet only:**
- ⚠️ These specific addresses/keys are for TESTNET
- ⚠️ They have NO VALUE on mainnet
- ⚠️ However, still practice good security habits

**When moving to mainnet:**
- 🔐 Use a NEW wallet
- 🔐 Use hardware wallet if possible
- 🔐 Never reuse testnet keys

---

## 📞 Need Help?

### Resources
- **Midnight Docs:** https://docs.midnight.network
- **Discord:** https://discord.gg/midnight
  - Channel: #developer-support
  - Channel: #testnet-faucet
- **GitHub:** https://github.com/midnight-network
- **Status Page:** https://status.testnet.midnight.network

### What to Ask
When seeking help, provide:
1. "I'm trying to activate my Midnight wallet for testnet"
2. Your unshielded address (safe to share)
3. Whether you have seed phrase/private key
4. What error message you're seeing
5. Which step you're stuck on

---

## ⏭️ Next Steps After Activation

1. ✅ Wallet activated? → **Come back here**
2. ⚠️ Still stuck? → **Ask in Discord**
3. 🔄 Need new wallet? → **Create fresh one**
4. 🚀 Ready to deploy? → **Run `npm run deploy:real`**

---

**Status:** Waiting for wallet activation...
**When ready:** Tell me and we'll proceed with deployment!

*Guide created: February 8, 2026*
