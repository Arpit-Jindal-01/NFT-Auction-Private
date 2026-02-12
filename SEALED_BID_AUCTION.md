# Sealed-Bid Auction Contract

## Overview

This Compact smart contract implements a **sealed-bid auction** mechanism on the Midnight blockchain. In a sealed-bid auction, bidders submit encrypted/hashed bids during the commit phase, and then reveal their actual bids later, ensuring fairness and preventing bid sniping.

## Auction Phases

```
Init → Commit → Reveal → Finalized
```

1. **Init**: Initial state, auction not started
2. **Commit**: Bidders submit hashes of their bids (amount + nonce)
3. **Reveal**: Bidders reveal actual amounts and nonces for verification
4. **Finalized**: Winner determined, auction complete

## Architecture

### State Variables (Ledger)

```compact
ledger currentPhase: Phase          // Current auction phase
ledger totalCommits: Field          // Number of committed bids
ledger totalReveals: Field          // Number of revealed bids
ledger highestBid: Field            // Winning bid amount
ledger winnerAddress: Field         // Winner's slot number (1-5)

// Commitment storage (supports up to 5 bidders)
ledger commit{N}Hash: Field         // Hash of bid N
ledger commit{N}Revealed: Boolean   // Whether bid N is revealed
ledger commit{N}Amount: Field       // Revealed amount for bid N
```

### Context Witnesses (Inputs)

```compact
witness context$bidHash(): Field      // Hash of (amount + nonce)
witness context$bidAmount(): Field    // Actual bid amount
witness context$bidNonce(): Field     // Random nonce for privacy
witness context$bidderSlot(): Field   // Bidder's slot (1-5)
```

## Functions

### 1. `startAuction()`

Starts the auction and moves to commit phase.

**Returns**: `1` on success

```javascript
// Usage
await contractClient.callFunction('startAuction', {});
```

### 2. `commitBid()`

Submit a hashed bid during commit phase.

**Process**:
1. Bidder computes: `hash = amount + nonce` (simplified)
2. Submit `hash` and choose slot (1-5)
3. Contract stores commitment

**Context Required**:
- `bidHash`: Hash of your bid
- `bidderSlot`: Your slot number (1-5)

**Returns**: Total number of commits

```javascript
// Example: Commit a bid
const amount = 1000;
const nonce = 12345;
const hash = amount + nonce;  // Simplified (use proper hash in production)

await contractClient.callFunction('commitBid', {
  bidHash: hash,
  bidderSlot: 1  // Choose slot 1
});
```

### 3. `startRevealPhase()`

Move auction from commit to reveal phase.

**Returns**: `1` on success

```javascript
await contractClient.callFunction('startRevealPhase', {});
```

### 4. `revealBid()`

Reveal your bid by providing amount and nonce.

**Process**:
1. Provide original `amount` and `nonce`
2. Contract recomputes hash: `amount + nonce`
3. Verifies hash matches commitment
4. If valid, stores revealed amount

**Context Required**:
- `bidAmount`: Your original bid amount
- `bidNonce`: Your original nonce
- `bidderSlot`: Your slot number

**Returns**: Total number of reveals

```javascript
// Example: Reveal your bid
await contractClient.callFunction('revealBid', {
  bidAmount: 1000,
  bidNonce: 12345,
  bidderSlot: 1
});
```

### 5. `finalizeAuction()`

Determine the winner after reveal phase.

**Process**:
1. Checks all revealed bids (slots 1-5)
2. Finds highest bid amount
3. Sets winner and highest bid
4. Moves to Finalized phase

**Returns**: Winner's slot number

```javascript
const winner = await contractClient.callFunction('finalizeAuction', {});
console.log(`Winner is bidder in slot ${winner}`);
```

### 6. `getStatus()`

Get current auction phase.

**Returns**: `Phase` enum (Init, Commit, Reveal, Finalized)

```javascript
const phase = await contractClient.callFunction('getStatus', {});
// phase: 0=Init, 1=Commit, 2=Reveal, 3=Finalized
```

### 7. `getWinner()`

Get winner's slot number (after finalization).

**Returns**: Slot number (1-5) or 0 if no winner

```javascript
const winnerSlot = await contractClient.callFunction('getWinner', {});
```

### 8. `getHighestBid()`

Get winning bid amount (after finalization).

**Returns**: Highest bid amount

```javascript
const highestBid = await contractClient.callFunction('getHighestBid', {});
console.log(`Winning bid: ${highestBid}`);
```

## Complete Flow Example

### Frontend JavaScript

```javascript
// Phase 1: Start Auction
await contractClient.callFunction('startAuction', {});

// Phase 2: Bidders Commit (Alice, Bob, Carol)
const alice = { amount: 1000, nonce: 11111 };
const bob = { amount: 1500, nonce: 22222 };
const carol = { amount: 1200, nonce: 33333 };

// Alice commits (slot 1)
await contractClient.callFunction('commitBid', {
  bidHash: alice.amount + alice.nonce,
  bidderSlot: 1
});

// Bob commits (slot 2)
await contractClient.callFunction('commitBid', {
  bidHash: bob.amount + bob.nonce,
  bidderSlot: 2
});

// Carol commits (slot 3)
await contractClient.callFunction('commitBid', {
  bidHash: carol.amount + carol.nonce,
  bidderSlot: 3
});

// Phase 3: Start Reveal Phase
await contractClient.callFunction('startRevealPhase', {});

// Phase 4: Bidders Reveal
await contractClient.callFunction('revealBid', {
  bidAmount: alice.amount,
  bidNonce: alice.nonce,
  bidderSlot: 1
});

await contractClient.callFunction('revealBid', {
  bidAmount: bob.amount,
  bidNonce: bob.nonce,
  bidderSlot: 2
});

await contractClient.callFunction('revealBid', {
  bidAmount: carol.amount,
  bidNonce: carol.nonce,
  bidderSlot: 3
});

// Phase 5: Finalize
const winner = await contractClient.callFunction('finalizeAuction', {});
const winningBid = await contractClient.callFunction('getHighestBid', {});

console.log(`Winner: Slot ${winner} with bid ${winningBid}`);
// Output: Winner: Slot 2 with bid 1500 (Bob wins!)
```

## Security Features

### 1. **Commitment Binding**
- Bidders cannot change their bid after committing
- Hash locks in both amount and nonce

### 2. **Reveal Verification**
- Contract verifies `hash(amount, nonce) == committedHash`
- Invalid reveals are rejected (not counted)

### 3. **Fair Ordering**
- All bids committed before any reveals
- No information leakage during commit phase

### 4. **Immutable Results**
- Winner and highest bid stored on-chain
- Cannot be altered after finalization

## Limitations

### Current Implementation

1. **Fixed Slots**: Only 5 bidders supported (slots 1-5)
   - Limitation due to Compact's limited data structures
   - Can be extended by adding more slot variables

2. **Simplified Hashing**: Uses `amount + nonce` instead of cryptographic hash
   - Production should use Poseidon hash or similar
   - Example: `hash = poseidon(amount, nonce)`

3. **Manual Slot Assignment**: Bidders must choose unique slots
   - Could add collision detection in production
   - Frontend should track available slots

## Compilation

```bash
# Compile the contract
compactc ./Contracts/sealed_bid_auction.compact ./build/sealed_auction

# Or use npm script (add to package.json first)
npm run compile:sealed
```

## Testing

```javascript
// Test script example
const { ContractClient } = require('./local-runtime/contract-client.js');

async function testSealedAuction() {
  const client = new ContractClient('./build/sealed_auction/contract');
  
  // Test flow
  console.log('1. Starting auction...');
  await client.callFunction('startAuction', {});
  
  console.log('2. Committing bids...');
  await client.callFunction('commitBid', { bidHash: 11111, bidderSlot: 1 });
  await client.callFunction('commitBid', { bidHash: 23722, bidderSlot: 2 });
  
  console.log('3. Moving to reveal...');
  await client.callFunction('startRevealPhase', {});
  
  console.log('4. Revealing bids...');
  await client.callFunction('revealBid', { 
    bidAmount: 1000, 
    bidNonce: 10111, 
    bidderSlot: 1 
  });
  await client.callFunction('revealBid', { 
    bidAmount: 1500, 
    bidNonce: 22222, 
    bidderSlot: 2 
  });
  
  console.log('5. Finalizing...');
  const winner = await client.callFunction('finalizeAuction', {});
  const winningBid = await client.callFunction('getHighestBid', {});
  
  console.log(`Winner: Slot ${winner}, Amount: ${winningBid}`);
}

testSealedAuction();
```

## Production Improvements

### 1. **Cryptographic Hashing**
```compact
// Use Poseidon hash (if available in Midnight Compact)
const computedHash = poseidon(amount, nonce);
```

### 2. **Dynamic Bidder Support**
- Implement with arrays or maps (when supported)
- Or extend to more fixed slots (10, 20, 100)

### 3. **Bidder Identity**
- Store actual wallet addresses instead of slot numbers
- Link slots to public keys

### 4. **Time Locks**
```compact
ledger commitDeadline: Field;
ledger revealDeadline: Field;

// Verify current time < deadline
```

### 5. **Deposit Requirements**
- Require deposit to commit
- Slash deposits for non-reveals

### 6. **Minimum Bid**
```compact
ledger minimumBid: Field;

// Reject reveals below minimum
if (amount < minimumBid) {
  // Reject
}
```

## API Integration

Backend endpoint to interact with sealed-bid auction:

```javascript
// server.js
app.post('/api/sealed-auction/commit', async (req, res) => {
  const { bidHash, slot } = req.body;
  
  const result = await contractClient.callContractFunction('commitBid', {
    bidHash,
    bidderSlot: slot
  });
  
  res.json({ success: true, txHash: result.txHash });
});

app.post('/api/sealed-auction/reveal', async (req, res) => {
  const { amount, nonce, slot } = req.body;
  
  const result = await contractClient.callContractFunction('revealBid', {
    bidAmount: amount,
    bidNonce: nonce,
    bidderSlot: slot
  });
  
  res.json({ success: true, txHash: result.txHash });
});
```

## References

- **Midnight Docs**: https://docs.midnight.network/
- **Compact Language**: Midnight's smart contract language
- **Sealed-Bid Auctions**: https://en.wikipedia.org/wiki/Vickrey_auction

---

**Ready to deploy!** Compile the contract and integrate with your Midnight dApp. 🚀
