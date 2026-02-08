#!/usr/bin/env node

/**
 * Local API Server for NFT Auction Contract
 * Provides HTTP endpoints to interact with the contract locally
 */

import http from 'http';
import { LocalWallet } from './wallet.js';

const PORT = 3000;

// Initialize wallet
let wallet;

function initializeWallet() {
  console.log('\n🔧 Initializing Local Contract Environment...\n');
  wallet = new LocalWallet();
  wallet.displayState();
}

/**
 * Parse JSON body from request
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Send JSON response
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

/**
 * Handle API requests
 */
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendJSON(res, 200, { ok: true });
    return;
  }

  console.log(`\n📨 ${req.method} ${path}`);

  try {
    // Route: Get contract state
    if (path === '/state' && req.method === 'GET') {
      const state = wallet.getLedger();
      const walletInfo = wallet.getWalletInfo();
      sendJSON(res, 200, {
        success: true,
        state: {
          auctionStatus: state.auctionStatus.toString(),
          highestBid: state.highestBid.toString(),
          totalBids: state.totalBids.toString(),
          statusName: wallet.getStatusName(state.auctionStatus)
        },
        wallet: walletInfo,
        contractAddress: wallet.contractAddress
      });
      return;
    }

    // Route: Start auction
    if (path === '/auction/start' && req.method === 'POST') {
      const body = await parseBody(req);
      const result = await wallet.startAuction(body);
      wallet.displayState();
      sendJSON(res, 200, {
        success: result.success,
        message: result.success ? 'Auction started' : 'Failed to start auction',
        state: result.success ? {
          auctionStatus: result.ledger.auctionStatus.toString(),
          highestBid: result.ledger.highestBid.toString(),
          totalBids: result.ledger.totalBids.toString(),
          statusName: wallet.getStatusName(result.ledger.auctionStatus)
        } : null,
        auctionData: result.auctionData,
        transaction: result.transaction,
        walletBalance: result.walletBalance,
        error: result.error
      });
      return;
    }

    // Route: Record bid
    if (path === '/auction/bid' && req.method === 'POST') {
      const result = await wallet.recordBid();
      wallet.displayState();
      sendJSON(res, 200, {
        success: result.success,
        message: result.success ? 'Bid recorded' : 'Failed to record bid',
        state: result.success ? {
          auctionStatus: result.ledger.auctionStatus.toString(),
          highestBid: result.ledger.highestBid.toString(),
          totalBids: result.ledger.totalBids.toString(),
          statusName: wallet.getStatusName(result.ledger.auctionStatus)
        } : null,
        transaction: result.transaction,
        walletBalance: result.walletBalance,
        error: result.error
      });
      return;
    }

    // Route: End auction
    if (path === '/auction/end' && req.method === 'POST') {
      const result = await wallet.endAuction();
      wallet.displayState();
      sendJSON(res, 200, {
        success: result.success,
        message: result.success ? 'Auction ended' : 'Failed to end auction',
        state: result.success ? {
          auctionStatus: result.ledger.auctionStatus.toString(),
          highestBid: result.ledger.highestBid.toString(),
          totalBids: result.ledger.totalBids.toString(),
          statusName: wallet.getStatusName(result.ledger.auctionStatus)
        } : null,
        transaction: result.transaction,
        walletBalance: result.walletBalance,
        error: result.error
      });
      return;
    }

    // Route: Settle auction
    if (path === '/auction/settle' && req.method === 'POST') {
      const result = await wallet.settle();
      wallet.displayState();
      sendJSON(res, 200, {
        success: result.success,
        message: result.success ? 'Auction settled' : 'Failed to settle auction',
        state: result.success ? {
          auctionStatus: result.ledger.auctionStatus.toString(),
          highestBid: result.ledger.highestBid.toString(),
          totalBids: result.ledger.totalBids.toString(),
          statusName: wallet.getStatusName(result.ledger.auctionStatus)
        } : null,
        transaction: result.transaction,
        walletBalance: result.walletBalance,
        error: result.error
      });
      return;
    }

    // Route: Get status
    if (path === '/auction/status' && req.method === 'GET') {
      const result = await wallet.getStatus();
      sendJSON(res, 200, {
        success: result.success,
        state: result.success ? {
          auctionStatus: result.ledger.auctionStatus.toString(),
          statusName: wallet.getStatusName(result.ledger.auctionStatus)
        } : null,
        error: result.error
      });
      return;
    }

    // Route: Get top bid
    if (path === '/auction/topbid' && req.method === 'GET') {
      const result = await wallet.getTopBid();
      sendJSON(res, 200, {
        success: result.success,
        topBid: result.success ? result.ledger.highestBid.toString() : null,
        error: result.error
      });
      return;
    }

    // Route: Get wallet info
    if (path === '/wallet' && req.method === 'GET') {
      const walletInfo = wallet.getWalletInfo();
      sendJSON(res, 200, {
        success: true,
        wallet: walletInfo
      });
      return;
    }

    // Route: Get transaction history
    if (path === '/wallet/transactions' && req.method === 'GET') {
      const transactions = wallet.getTransactionHistory();
      sendJSON(res, 200, {
        success: true,
        transactions: transactions,
        count: transactions.length
      });
      return;
    }

    // Route: Health check
    if (path === '/health' && req.method === 'GET') {
      sendJSON(res, 200, {
        status: 'ok',
        contract: 'nft-auction',
        mode: 'local',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Route: Reset (for testing)
    if (path === '/reset' && req.method === 'POST') {
      initializeWallet();
      sendJSON(res, 200, {
        success: true,
        message: 'Contract reset to initial state'
      });
      return;
    }

    // 404 Not Found
    sendJSON(res, 404, {
      success: false,
      error: 'Endpoint not found',
      availableEndpoints: [
        'GET  /health',
        'GET  /state',
        'GET  /wallet',
        'GET  /wallet/transactions',
        'POST /auction/start',
        'POST /auction/bid',
        'POST /auction/end',
        'POST /auction/settle',
        'GET  /auction/status',
        'GET  /auction/topbid',
        'POST /reset'
      ]
    });

  } catch (error) {
    console.error('❌ Error:', error);
    sendJSON(res, 500, {
      success: false,
      error: error.message
    });
  }
}

// Initialize and start server
initializeWallet();

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 LOCAL NFT AUCTION CONTRACT SERVER');
  console.log('='.repeat(60));
  console.log(`\n📡 Server running at: http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/state`);
  console.log(`   GET  http://localhost:${PORT}/wallet`);
  console.log(`   GET  http://localhost:${PORT}/wallet/transactions`);
  console.log(`   POST http://localhost:${PORT}/auction/start`);
  console.log(`   POST http://localhost:${PORT}/auction/bid`);
  console.log(`   POST http://localhost:${PORT}/auction/end`);
  console.log(`   POST http://localhost:${PORT}/auction/settle`);
  console.log(`   GET  http://localhost:${PORT}/auction/status`);
  console.log(`   GET  http://localhost:${PORT}/auction/topbid`);
  console.log(`   POST http://localhost:${PORT}/reset`);
  console.log('\n💡 Press Ctrl+C to stop the server\n');
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
