#!/usr/bin/env node

/**
 * LOCAL WALLET - NFT Auction Contract
 * Working implementation based on test-contract.js pattern
 */

import {
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Private state class
class PrivateState {
  constructor(secretKey, nonce) {
    this.secretKey = secretKey;
    this.nonce = nonce;
  }

  static random() {
    const secretKey = crypto.randomBytes(32);
    return new PrivateState(secretKey, 0n);
  }
}

// Local wallet implementation WITHOUT SDK complexity
// Uses same approach as test-contract.js - simple state simulation
export class LocalWallet {
  constructor() {
    // Mock state tracking (like test-contract.js)
    this.mockState = {
      auctionStatus: 0n, // Init
      highestBid: 0n,
      totalBids: 0n
    };
    
    // Auction data storage
    this.auctionData = null;
    
    // Load wallet credentials
    this.loadWalletCredentials();
    
    // Initialize wallet balance and transaction tracking
    this.walletBalance = 10000n; // Starting balance: 10,000 tokens
    this.transactionHistory = [];
    this.transactionFee = 5n; // Fee per transaction: 5 tokens
    this.bidAmount = 100n; // Each bid costs 100 tokens
    
    this.contractAddress = sampleContractAddress();
    
    console.log('✅ Wallet initialized');
    console.log(`📍 Contract Address: ${this.contractAddress}`);
    console.log(`💰 Wallet Balance: ${this.walletBalance} tokens`);
    console.log(`🔑 Address: ${this.shieldedAddress.substring(0, 30)}...`);
  }

  loadWalletCredentials() {
    try {
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse .env file
      const lines = envContent.split('\n');
      for (const line of lines) {
        if (line.startsWith('SEED_PHRASE=')) {
          this.seedPhrase = line.split('SEED_PHRASE=')[1].replace(/"/g, '').trim();
        }
        if (line.startsWith('SHIELDED_ADDRESS=')) {
          this.shieldedAddress = line.split('SHIELDED_ADDRESS=')[1].trim();
        }
        if (line.startsWith('UNSHIELDED_ADDRESS=')) {
          this.unshieldedAddress = line.split('UNSHIELDED_ADDRESS=')[1].trim();
        }
      }
      
      console.log('🔐 Wallet credentials loaded from .env');
    } catch (error) {
      console.warn('⚠️  Could not load .env, using defaults');
      this.seedPhrase = 'demo seed phrase';
      this.shieldedAddress = 'mn_shield-addr_demo';
      this.unshieldedAddress = 'mn_addr_demo';
    }
  }

  getLedger() {
    return this.mockState;
  }

  getWalletInfo() {
    return {
      balance: this.walletBalance.toString(),
      shieldedAddress: this.shieldedAddress,
      unshieldedAddress: this.unshieldedAddress,
      transactionCount: this.transactionHistory.length,
      contractAddress: this.contractAddress
    };
  }

  getTransactionHistory() {
    return this.transactionHistory;
  }

  deductBalance(amount, reason) {
    const totalCost = amount + this.transactionFee;
    
    if (this.walletBalance < totalCost) {
      throw new Error(`Insufficient balance. Need ${totalCost}, have ${this.walletBalance}`);
    }
    
    this.walletBalance -= totalCost;
    
    const transaction = {
      timestamp: new Date().toISOString(),
      type: reason,
      amount: amount.toString(),
      fee: this.transactionFee.toString(),
      total: totalCost.toString(),
      balanceAfter: this.walletBalance.toString()
    };
    
    this.transactionHistory.push(transaction);
    
    console.log(`💸 Deducted ${totalCost} tokens (${amount} + ${this.transactionFee} fee)`);
    console.log(`💰 New balance: ${this.walletBalance} tokens`);
    
    return transaction;
  }

  async executeCircuit(circuitName) {
    console.log(`\n⚡ Executing: ${circuitName}()`);
    
    try {
      // Check balance and deduct transaction fee for state-changing operations
      let transaction = null;
      
      if (circuitName === 'recordBid') {
        // Bid costs bidAmount + transaction fee
        transaction = this.deductBalance(this.bidAmount, 'Bid Submission');
      } else if (['startAuction', 'endAuction', 'settle'].includes(circuitName)) {
        // Other state changes only cost transaction fee
        transaction = this.deductBalance(0n, circuitName);
      }
      
      // Simulate circuit execution with state updates
      const returnValue = this.updateMockState(circuitName);
      
      console.log(`✅ ${circuitName}() executed successfully, returned: ${returnValue}`);
      
      return {
        success: true,
        ledger: this.mockState,
        returnValue: returnValue,
        transaction: transaction,
        walletBalance: this.walletBalance.toString()
      };
      
    } catch (error) {
      console.log(`❌ ${circuitName}() failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  updateMockState(circuitName) {
    // Simulate state transitions exactly like test-contract.js
    switch(circuitName) {
      case 'startAuction':
        this.mockState.auctionStatus = 1n; // Open
        return 1n;
        
      case 'recordBid':
        this.mockState.totalBids += 1n;
        this.mockState.highestBid += 100n; // Each bid adds 100
        return this.mockState.highestBid;
        
      case 'endAuction':
        this.mockState.auctionStatus = 2n; // Closed
        return 2n;
        
      case 'settle':
        this.mockState.auctionStatus = 3n; // Done
        return 3n;
        
      case 'getStatus':
        return this.mockState.auctionStatus;
        
      case 'getTopBid':
        return this.mockState.highestBid;
        
      default:
        throw new Error(`Unknown circuit: ${circuitName}`);
    }
  }

  async startAuction(auctionParams = {}) {
    // Store auction data
    this.auctionData = {
      sellerAddress: auctionParams.sellerAddress,
      nftId: auctionParams.nftId,
      nftName: auctionParams.nftName,
      description: auctionParams.description,
      endTime: auctionParams.endTime,
      reservePrice: auctionParams.reservePrice,
      minIncrement: auctionParams.minIncrement || 100,
      hideBidders: auctionParams.hideBidders || false,
      hideAmounts: auctionParams.hideAmounts || false,
      createdAt: Date.now()
    };
    
    console.log('\n🎨 Creating Auction:');
    if (auctionParams.nftId) console.log(`   NFT ID: ${auctionParams.nftId}`);
    if (auctionParams.nftName) console.log(`   Name: ${auctionParams.nftName}`);
    if (auctionParams.reservePrice) console.log(`   Reserve Price: ${auctionParams.reservePrice} tokens`);
    if (auctionParams.endTime) console.log(`   Duration: ${auctionParams.endTime} hours`);
    
    const result = await this.executeCircuit('startAuction');
    if (result.success) {
      result.auctionData = this.auctionData;
    }
    return result;
  }

  async recordBid() {
    return this.executeCircuit('recordBid');
  }

  async endAuction() {
    return this.executeCircuit('endAuction');
  }

  async settle() {
    return this.executeCircuit('settle');
  }

  async getStatus() {
    return this.executeCircuit('getStatus');
  }

  async getTopBid() {
    return this.executeCircuit('getTopBid');
  }

  displayState() {
    const state = this.mockState;
    console.log('\n📊 Current Contract State:');
    console.log('─'.repeat(50));
    console.log(`Status: ${this.getStatusName(state.auctionStatus)}`);
    console.log(`Highest Bid: ${state.highestBid}`);
    console.log(`Total Bids: ${state.totalBids}`);
    console.log('─'.repeat(50));
    return state;
  }

  getStatusName(status) {
    const map = {
      0n: 'Init',
      1n: 'Open',
      2n: 'Closed',
      3n: 'Done'
    };
    return map[status] || 'Unknown';
  }
}

export default LocalWallet;
