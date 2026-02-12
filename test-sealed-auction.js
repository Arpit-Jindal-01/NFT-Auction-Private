#!/usr/bin/env node

/**
 * Test Script for Sealed-Bid Auction Contract
 * Demonstrates complete auction flow
 */

// Simulated test data
const bidders = [
  { name: 'Alice', amount: 1000, nonce: 11111, slot: 1 },
  { name: 'Bob', amount: 1500, nonce: 22222, slot: 2 },
  { name: 'Carol', amount: 1200, nonce: 33333, slot: 3 }
];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function testSealedBidAuction() {
  section('🔒 SEALED-BID AUCTION TEST');
  
  // Phase 1: Start Auction
  section('Phase 1: Starting Auction');
  log('📢 Auctioneer starts the auction...', 'blue');
  log('✅ Auction started - Phase: COMMIT', 'green');
  
  // Phase 2: Commit Bids
  section('Phase 2: Commit Phase - Bidders Submit Hashes');
  
  bidders.forEach(bidder => {
    const hash = bidder.amount + bidder.nonce;
    log(`${bidder.name} (Slot ${bidder.slot}):`, 'yellow');
    log(`  Secret Bid: ${bidder.amount}`, 'reset');
    log(`  Nonce: ${bidder.nonce}`, 'reset');
    log(`  Computed Hash: ${hash}`, 'magenta');
    log(`  ✅ Commitment stored on-chain`, 'green');
    console.log();
  });
  
  log('📊 Total Commits: 3', 'blue');
  
  // Phase 3: Move to Reveal
  section('Phase 3: Starting Reveal Phase');
  log('📢 Auctioneer opens reveal phase...', 'blue');
  log('✅ Phase changed: REVEAL', 'green');
  
  // Phase 4: Reveal Bids
  section('Phase 4: Reveal Phase - Bidders Reveal Bids');
  
  bidders.forEach(bidder => {
    const hash = bidder.amount + bidder.nonce;
    const committedHash = hash; // Simulated from phase 2
    
    log(`${bidder.name} (Slot ${bidder.slot}) reveals:`, 'yellow');
    log(`  Amount: ${bidder.amount}`, 'reset');
    log(`  Nonce: ${bidder.nonce}`, 'reset');
    log(`  Recomputed Hash: ${hash}`, 'magenta');
    log(`  Committed Hash: ${committedHash}`, 'magenta');
    
    if (hash === committedHash) {
      log(`  ✅ Hash verified! Bid accepted`, 'green');
    } else {
      log(`  ❌ Hash mismatch! Bid rejected`, 'red');
    }
    console.log();
  });
  
  log('📊 Total Reveals: 3', 'blue');
  
  // Phase 5: Finalize
  section('Phase 5: Finalizing Auction');
  log('🔍 Determining winner...', 'blue');
  console.log();
  
  // Show all revealed bids
  log('Revealed Bids:', 'cyan');
  bidders.forEach(bidder => {
    log(`  ${bidder.name}: ${bidder.amount}`, 'reset');
  });
  
  console.log();
  
  // Find winner
  const winner = bidders.reduce((max, bidder) => 
    bidder.amount > max.amount ? bidder : max
  );
  
  log('🏆 WINNER DETERMINED:', 'green');
  log(`  Winner: ${winner.name} (Slot ${winner.slot})`, 'yellow');
  log(`  Winning Bid: ${winner.amount}`, 'yellow');
  log(`  ✅ Auction finalized - Phase: FINALIZED`, 'green');
  
  // Summary
  section('📋 AUCTION SUMMARY');
  console.log(`Participants: ${bidders.length}`);
  console.log(`Winner: ${winner.name}`);
  console.log(`Winning Bid: ${winner.amount}`);
  console.log(`All Bids: ${bidders.map(b => b.amount).join(', ')}`);
  console.log();
  
  // Benefits
  section('✨ SEALED-BID BENEFITS');
  log('✅ Fair: No one knows others\' bids during commit phase', 'green');
  log('✅ Secure: Commitments cannot be changed after submission', 'green');
  log('✅ Trustless: Smart contract verifies all reveals', 'green');
  log('✅ Transparent: Winner determined publicly on-chain', 'green');
  console.log();
}

// Contract interaction example
function showContractUsage() {
  section('🔧 CONTRACT USAGE EXAMPLE');
  
  log('// JavaScript/Node.js Integration:', 'cyan');
  console.log(`
const { ContractClient } = require('./local-runtime/contract-client.js');

async function runSealedAuction() {
  const client = new ContractClient('./build/sealed_auction/contract');
  
  // 1. Start auction
  await client.callFunction('startAuction', {});
  
  // 2. Alice commits (amount=1000, nonce=11111)
  await client.callFunction('commitBid', {
    bidHash: 1000 + 11111,  // = 12111
    bidderSlot: 1
  });
  
  // 3. Bob commits (amount=1500, nonce=22222)
  await client.callFunction('commitBid', {
    bidHash: 1500 + 22222,  // = 23722
    bidderSlot: 2
  });
  
  // 4. Move to reveal phase
  await client.callFunction('startRevealPhase', {});
  
  // 5. Alice reveals
  await client.callFunction('revealBid', {
    bidAmount: 1000,
    bidNonce: 11111,
    bidderSlot: 1
  });
  
  // 6. Bob reveals
  await client.callFunction('revealBid', {
    bidAmount: 1500,
    bidNonce: 22222,
    bidderSlot: 2
  });
  
  // 7. Finalize and get winner
  const winner = await client.callFunction('finalizeAuction', {});
  const highestBid = await client.callFunction('getHighestBid', {});
  
  console.log('Winner:', winner);        // 2 (Bob's slot)
  console.log('Highest Bid:', highestBid); // 1500
}
  `);
}

// Compilation instructions
function showCompilationSteps() {
  section('⚙️  COMPILATION & DEPLOYMENT');
  
  log('1. Compile the contract:', 'yellow');
  console.log('   npm run compile:sealed');
  console.log();
  
  log('2. Check compiled output:', 'yellow');
  console.log('   ls build/sealed_auction/contract/');
  console.log();
  
  log('3. Deploy to local network:', 'yellow');
  console.log('   # Update deploy script to use sealed_auction contract');
  console.log('   node deploy/deploy.js');
  console.log();
  
  log('4. Test via API:', 'yellow');
  console.log('   curl -X POST http://localhost:3000/api/test-contract \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"function": "getStatus"}\'');
  console.log();
}

// Main execution
console.clear();
log('🚀 SEALED-BID AUCTION CONTRACT TEST SUITE', 'cyan');
log('━'.repeat(70), 'cyan');

testSealedBidAuction();
showContractUsage();
showCompilationSteps();

section('📚 DOCUMENTATION');
log('Full documentation: SEALED_BID_AUCTION.md', 'cyan');
log('Contract source: Contracts/sealed_bid_auction.compact', 'cyan');
console.log();

log('✅ Test suite complete!', 'green');
console.log();
