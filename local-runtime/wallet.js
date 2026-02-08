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
    
    // Multi-user balance tracking: Map of address -> balance
    this.userBalances = new Map();
    this.transactionHistory = [];
    this.transactionFee = 5n; // Fee per transaction: 5 tokens
    this.bidAmount = 100n; // Each bid costs 100 tokens
    
    // Initialize default wallet with balance
    this.userBalances.set(this.shieldedAddress, 10000n);
    
    this.contractAddress = sampleContractAddress();
    
    console.log('✅ Wallet initialized');
    console.log(`📍 Contract Address: ${this.contractAddress}`);
    console.log(`💰 Default Wallet Balance: 10,000 tokens`);
    console.log(`🔑 Default Address: ${this.shieldedAddress.substring(0, 30)}...`);
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

  getWalletInfo(address = null) {
    const userAddress = address || this.shieldedAddress;
    const balance = this.getUserBalance(userAddress);
    
    return {
      balance: balance.toString(),
      balanceNumber: Number(balance),
      shieldedAddress: userAddress,
      unshieldedAddress: this.unshieldedAddress,
      transactionCount: this.transactionHistory.filter(tx => tx.address === userAddress).length,
      address: userAddress,
      contractAddress: this.contractAddress
    };
  }

  getUserBalance(address) {
    if (!this.userBalances.has(address)) {
      // Initialize new user with 10,000 tokens
      this.userBalances.set(address, 10000n);
      console.log(`🆕 New user initialized: ${address.substring(0, 30)}... with 10,000 tokens`);
    }
    return this.userBalances.get(address);
  }

  deductFromUser(address, amount) {
    const currentBalance = this.getUserBalance(address);
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Required: ${amount}, Available: ${currentBalance}`);
    }
    this.userBalances.set(address, currentBalance - amount);
    console.log(`💸 Deducted ${amount} from ${address.substring(0, 20)}... New balance: ${this.userBalances.get(address)}`);
  }

  getTransactionHistory(address = null) {
    if (address) {
      return this.transactionHistory.filter(tx => tx.address === address);
    }
    return this.transactionHistory;
  }

  deductBalanceFromUser(address, amount, reason) {
    const totalCost = amount + this.transactionFee;
    const currentBalance = this.getUserBalance(address);
    
    if (currentBalance < totalCost) {
      throw new Error(`Insufficient balance. Need ${totalCost}, have ${currentBalance}`);
    }
    
    this.userBalances.set(address, currentBalance - totalCost);
    
    const transaction = {
      timestamp: new Date().toISOString(),
      type: reason,
      amount: amount.toString(),
      fee: this.transactionFee.toString(),
      total: totalCost.toString(),
      balanceAfter: this.getUserBalance(address).toString(),
      address: address
    };
    
    this.transactionHistory.push(transaction);
    
    console.log(`💸 Deducted ${totalCost} tokens from ${address.substring(0, 20)}... (${amount} + ${this.transactionFee} fee)`);
    console.log(`💰 New balance: ${this.getUserBalance(address)} tokens`);
    
    return transaction;
  }

  async executeCircuit(circuitName, userAddress = null) {
    const address = userAddress || this.shieldedAddress;
    console.log(`\n⚡ Executing: ${circuitName}() for ${address.substring(0, 25)}...`);
    
    try {
      // Check balance and deduct transaction fee for state-changing operations
      let transaction = null;
      
      if (circuitName === 'recordBid') {
        // Bid costs bidAmount + transaction fee
        transaction = this.deductBalanceFromUser(address, this.bidAmount, 'Bid Submission');
      } else if (['startAuction', 'endAuction', 'settle'].includes(circuitName)) {
        // Other state changes only cost transaction fee
        transaction = this.deductBalanceFromUser(address, 0n, circuitName);
      }
      
      // Simulate circuit execution with state updates
      const returnValue = this.updateMockState(circuitName);
      
      console.log(`✅ ${circuitName}() executed successfully, returned: ${returnValue}`);
      
      return {
        success: true,
        ledger: this.mockState,
        returnValue: returnValue,
        transaction: transaction,
        walletBalance: this.getUserBalance(address).toString(),
        userAddress: address
      };
      
    } catch (error) {
      console.log(`❌ ${circuitName}() failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        walletBalance: this.getUserBalance(address).toString()
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
    const sellerAddress = auctionParams.sellerAddress || this.shieldedAddress;
    
    // Store auction data
    this.auctionData = {
      sellerAddress: sellerAddress,
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
    console.log(`   Seller: ${sellerAddress.substring(0, 25)}...`);
    if (auctionParams.nftId) console.log(`   NFT ID: ${auctionParams.nftId}`);
    if (auctionParams.nftName) console.log(`   Name: ${auctionParams.nftName}`);
    if (auctionParams.reservePrice) console.log(`   Reserve Price: ${auctionParams.reservePrice} tokens`);
    if (auctionParams.endTime) console.log(`   Duration: ${auctionParams.endTime} hours`);
    
    const result = await this.executeCircuit('startAuction', sellerAddress);
    if (result.success) {
      result.auctionData = this.auctionData;
    }
    return result;
  }

  async recordBid(bidderAddress = null) {
    const address = bidderAddress || this.shieldedAddress;
    console.log(`\n💰 Recording bid from: ${address.substring(0, 25)}...`);
    return this.executeCircuit('recordBid', address);
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
