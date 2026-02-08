# NFT Auction Private 🎨

A privacy-preserving NFT auction smart contract built on **Midnight Network** using **Compact language** and zero-knowledge proofs.

## ✨ Features

- 🔒 **Private Bidding** - Bids remain encrypted until auction ends
- 🛡️ **Zero-Knowledge Proofs** - Winner verification without revealing all bids
- 💰 **Reserve Price Protection** - Minimum bid enforcement
- ⏰ **Time-Locked Auctions** - Automated auction lifecycle management
- 🎯 **Fair Winner Selection** - Transparent, verifiable winner determination

## 📁 Project Structure

```
NFT-Copy/
├── Contracts/
│   ├── nft_auction_private.compact    # Original contract
│   ├── nft_auction_fixed.compact      # Corrected version (use this)
│   └── std.compact                     # Standard library
├── Frontend/
│   ├── index.html                      # Web interface
│   └── src/                            # Frontend assets
├── build/                              # Compiled artifacts (generated)
├── deploy.sh                           # Deployment script
├── deploy.ts                           # TypeScript deployment
├── package.json                        # Project config
├── tsconfig.json                       # TypeScript config
├── DEPLOYMENT.md                       # Detailed deployment guide
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites

- ✅ Node.js & npm (installed)
- ✅ Docker (installed)
- ✅ VS Code with Compact extension (installed)
- ⚠️ Midnight Network account & credentials (needed)
- ⚠️ Compact compiler tooling (in progress)

### Installation

```bash
# Navigate to project
cd "/Users/arpitjindal/VS Code/NFT-Copy"

# Install dependencies
npm install

# Compile contract (requires Midnight tooling)
npm run compile

# Deploy
npm run deploy
```

## 📝 Contract Interface

### Main Functions

#### `init()`
Initialize the contract with default state.

#### `createAuction(seller, nftId, endTime, reservePrice)`
Create a new auction.
- `seller`: Address - NFT seller's address
- `nftId`: Uint256 - Unique NFT identifier
- `endTime`: Uint64 - Auction end timestamp
- `reservePrice`: Uint64 - Minimum acceptable bid

#### `submitBid(amount)`
Submit a private bid (encrypted).
- `amount`: Uint64 - Bid amount in tokens

#### `closeAuction()`
Close the auction after end time.

#### `finalizeAuction(winner)`
Finalize auction and reveal winner.
- `winner`: Address - Winning bidder's address

## ⚙️ Configuration

Create a `.env` file:

```env
NETWORK=testnet
RPC_ENDPOINT=https://rpc.testnet.midnight.network
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

## 🔧 Development Commands

```bash
# Clean build artifacts
npm run clean

# Compile contract only
npm run compile

# Build TypeScript
npm run build

# Deploy to network
npm run deploy

# Run all (clean, compile, build, deploy)
npm run all
```

## ⚠️ Current Status

### ✅ Completed
- VS Code Compact extension installed
- Contract code written and corrected
- Project structure created
- Deployment scripts prepared
- Frontend interface created
- Documentation complete

### ⚠️ In Progress
- **Compiler Setup** - The Compact compiler requires:
  1. Official Midnight Network authentication
  2. Docker registry access (ghcr.io)
  3. Or properly configured local binary

### 🔜 Next Steps
1. Get Midnight Network credentials
2. Authenticate with Docker registry
3. Compile contract with official tooling
4. Test on Midnight testnet
5. Deploy to mainnet

## 🐛 Troubleshooting

### Compiler Issues
If you see "killed" or exit code 137:
- The compiler needs proper Midnight Network setup
- Use official Docker image with authentication
- Contact Midnight Network for access

### Docker Authorization Failed
```bash
# Login to GitHub Container Registry
docker login ghcr.io
# Use your Midnight Network credentials
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- **Midnight Network**: https://midnight.network
- **Documentation**: https://docs.midnight.network
- **Compact Language**: See `compact-0.2.13/extension/tmp/doc/Compact.html
- **Frontend Demo**: Open `Frontend/index.html` in browser

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues related to:
- **Compact Compiler**: Contact Midnight Network support
- **Contract Logic**: Open an issue in this repository
- **Deployment**: See DEPLOYMENT.md for detailed guide

## 🎯 Roadmap

- [x] Smart contract development
- [x] Frontend interface
- [x] Deployment scripts
- [ ] Compile with official tooling
- [ ] Testnet deployment
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Advanced features (Dutch auction, etc.)

---

Built with ❤️ using Midnight Network & Compact Language
