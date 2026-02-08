# NFT Auction Private - Deployment Guide

## Project Overview
Private NFT Auction Smart Contract on Midnight Network using Compact language and zero-knowledge proofs.

## Current Status
✅ Compact VS Code extension installed  
✅ Project structure created  
✅ Contract code written (fixed version available)  
⚠️  Compiler requires Midnight Network official tooling

## Files Created
- `Contracts/nft_auction_private.compact` - Original contract
- `Contracts/nft_auction_fixed.compact` - Corrected syntax version
- `Contracts/std.compact` - Standard library
- `package.json` - Project configuration
- `tsconfig.json` - TypeScript configuration

## Contract Features
1. **Create Auction** - Initialize auction with NFT ID, end time, and reserve price
2. **Submit Bid** - Private bid submission with ZK proofs
3. **Close Auction** - End bidding period
4. **Finalize Auction** - Reveal winner and settle payment

## Compilation Issues Encountered
The local Compact compiler binary is being terminated by macOS (SIGKILL - exit code 137).

### Possible Causes:
1. Binary requires Chez Scheme runtime
2. Missing Midnight Network authentication/tooling
3. macOS compatibility issues
4. Requires official Midnight SDK

## Next Steps to Deploy

### Option 1: Use Official Midnight Network Tools
1. **Contact Midnight Network** for official compiler access
2. **Install Midnight SDK** from official sources
3. **Authenticate** with Midnight Network registry
4. **Use official Docker image**:
   ```bash
   docker login ghcr.io
   docker run --rm -v $(pwd):/code ghcr.io/midnight-ntwrk/compactc:latest "compactc /code/Contracts/nft_auction_fixed.compact /code/build"
   ```

### Option 2: Use Midnight CLI
```bash
# Install Midnight CLI (when available)
npm install -g @midnight-ntwrk/cli

# Compile contract
midnight compile ./Contracts/nft_auction_fixed.compact

# Deploy to network
midnight deploy --network testnet
```

### Option 3: Manual Compilation Steps
Once you have a working compiler:

```bash
# Navigate to project
cd "/Users/arpitjindal/VS Code/NFT-Copy"

# Compile contract
compactc ./Contracts/nft_auction_fixed.compact ./build

# Build TypeScript
npm install
npm run build

# Deploy
npm run deploy
```

## Contract Interface

### Functions Available:
- `init()` - Initialize contract
- `createAuction(seller, nftId, endTime, reservePrice)` - Create new auction
- `submitBid(amount)` - Submit private bid
- `closeAuction()` - Close bidding
- `finalizeAuction(winner)` - Finalize and reveal winner

## Resources Needed
1. **Midnight Network Account** - Get from https://midnight.network
2. **Testnet Tokens** - For gas fees
3. **Official Compiler** - From Midnight Network
4. **Node.js & npm** - Already installed ✅
5. **Docker** - Already installed ✅

## Support
- Midnight Network Documentation: https://docs.midnight.network
- Compact Language Reference: Check extension/tmp/doc/Compact.html
- GitHub Issues: Report to Midnight Network repository

## Frontend Integration
A basic HTML frontend is available at `Frontend/index.html` for interacting with the deployed contract.
