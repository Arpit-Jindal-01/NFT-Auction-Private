#!/bin/bash

# NFT Auction Private - Deployment Script
# This script will deploy the smart contract once compilation is working

set -e

echo "🚀 NFT Auction Deployment Script"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found (needed for official compiler)${NC}"
else
    echo -e "${GREEN}✅ Docker found: $(docker --version)${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Compiling contract..."
echo -e "${YELLOW}Note: This requires a working Compact compiler${NC}"

# Try Docker first (official method)
if command -v docker &> /dev/null; then
    echo "Attempting Docker compilation..."
    if docker run --rm -v "$(pwd)":/code ghcr.io/midnight-ntwrk/compactc:latest "compactc /code/Contracts/nft_auction_fixed.compact /code/build" 2>/dev/null; then
        echo -e "${GREEN}✅ Contract compiled successfully with Docker${NC}"
        COMPILED=true
    else
        echo -e "${YELLOW}⚠️  Docker compilation failed (may need authentication)${NC}"
        COMPILED=false
    fi
else
    COMPILED=false
fi

# Try local compiler if Docker failed
if [ "$COMPILED" = false ] && command -v compactc &> /dev/null; then
    echo "Attempting local compiler..."
    if compactc ./Contracts/nft_auction_fixed.compact ./build; then
        echo -e "${GREEN}✅ Contract compiled successfully with local compiler${NC}"
        COMPILED=true
    else
        echo -e "${RED}❌ Local compilation failed${NC}"
        COMPILED=false
    fi
fi

if [ "$COMPILED" = false ]; then
    echo ""
    echo -e "${RED}❌ Compilation failed${NC}"
    echo ""
    echo "Please ensure you have:"
    echo "1. Midnight Network account and authentication"
    echo "2. Docker logged into ghcr.io"
    echo "3. Or a working local Compact compiler"
    echo ""
    echo "See DEPLOYMENT.md for detailed instructions"
    exit 1
fi

echo ""
echo "🏗️  Building TypeScript..."
npm run build

echo ""
echo "🌐 Deploying to network..."
echo -e "${YELLOW}Note: Ensure you have testnet tokens and network access${NC}"

# This would run the actual deployment
# npm run deploy

echo ""
echo -e "${GREEN}✨ Deployment script completed${NC}"
echo ""
echo "Next steps:"
echo "1. Configure your Midnight Network credentials"
echo "2. Get testnet tokens from faucet"
echo "3. Run: npm run deploy"
echo ""
echo "Contract ABI will be available in: ./build/"
