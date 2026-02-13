/**
 * AuctionContext
 * Migrated from legacy Chain.js FakeBlockchain class
 * Preserves exact localStorage logic and auction behavior
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

// Storage key from legacy code
const STORAGE_KEY = 'midnight_auctions';

const AuctionContext = createContext(null);

export function AuctionProvider({ children }) {
  const [auctions, setAuctions] = useState([]);
  const wallet = useWallet();

  // Load auctions from localStorage on mount (exact match to legacy loadAuctions())
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAuctions(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage (exact match to legacy saveAuctions())
  const saveAuctions = (auctionList) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auctionList));
    setAuctions(auctionList);
  };

  // Generate auction ID (exact match to legacy generateAuctionId())
  const generateAuctionId = () => {
    return 'auction_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  };

  // Create auction (exact match to legacy createAuction())
  const createAuction = (title, startingPrice) => {
    if (!wallet.isConnected()) {
      throw new Error('Wallet not connected');
    }

    if (!title || title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    if (startingPrice <= 0) {
      throw new Error('Starting price must be greater than 0');
    }

    // Deduct creation fee (exact match to legacy)
    const creationFee = 100;
    wallet.deductTokens(creationFee, `Create auction: ${title}`);

    const auction = {
      id: generateAuctionId(),
      title: title.trim(),
      startingPrice: parseFloat(startingPrice),
      highestBid: parseFloat(startingPrice),
      highestBidder: null,
      creator: wallet.getAddress(),
      status: 'open',
      bids: [],
      createdAt: Date.now(),
      endedAt: null,
      settledAt: null
    };

    const newAuctions = [auction, ...auctions];
    saveAuctions(newAuctions);

    return auction;
  };

  // Place bid (exact match to legacy placeBid())
  const placeBid = (auctionId, bidAmount) => {
    if (!wallet.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'open') {
      throw new Error('Auction is not open');
    }

    if (bidAmount <= auction.highestBid) {
      throw new Error(`Bid must be higher than current highest bid of ${auction.highestBid} tNIGHT`);
    }

    if (auction.creator === wallet.getAddress()) {
      throw new Error('Cannot bid on your own auction');
    }

    // Deduct bid amount (exact match to legacy)
    wallet.deductTokens(bidAmount, `Bid on auction: ${auction.title}`);

    // Refund previous highest bidder if exists (legacy logic preserved)
    if (auction.highestBidder && auction.bids.length > 0) {
      const previousBid = auction.highestBid;
      const previousBidder = auction.highestBidder;
      // Note: Legacy code has this but doesn't execute refund
      // Preserving exact behavior
    }

    // Update auction (exact match to legacy)
    auction.highestBid = parseFloat(bidAmount);
    auction.highestBidder = wallet.getAddress();
    auction.bids.push({
      bidder: wallet.getAddress(),
      amount: parseFloat(bidAmount),
      timestamp: Date.now()
    });

    const newAuctions = [...auctions];
    saveAuctions(newAuctions);

    return auction;
  };

  // End auction (exact match to legacy endAuction())
  const endAuction = (auctionId) => {
    if (!wallet.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'open') {
      throw new Error('Auction is already ended');
    }

    if (auction.creator !== wallet.getAddress()) {
      throw new Error('Only creator can end auction');
    }

    auction.status = 'ended';
    auction.endedAt = Date.now();

    const newAuctions = [...auctions];
    saveAuctions(newAuctions);

    return auction;
  };

  // Settle auction (exact match to legacy settleAuction())
  const settleAuction = (auctionId) => {
    if (!wallet.isConnected()) {
      throw new Error('Wallet not connected');
    }

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'ended') {
      throw new Error('Auction must be ended before settlement');
    }

    if (auction.creator !== wallet.getAddress()) {
      throw new Error('Only creator can settle auction');
    }

    // Transfer highest bid to creator (exact match to legacy)
    if (auction.highestBidder) {
      wallet.addTokens(auction.highestBid, `Settlement from auction: ${auction.title}`);
    }

    auction.status = 'settled';
    auction.settledAt = Date.now();

    const newAuctions = [...auctions];
    saveAuctions(newAuctions);

    return auction;
  };

  // Get all auctions (exact match to legacy getAuctions())
  const getAuctions = () => {
    return [...auctions];
  };

  // Get single auction (exact match to legacy getAuction())
  const getAuction = (auctionId) => {
    return auctions.find(a => a.id === auctionId);
  };

  // Get my auctions (exact match to legacy getMyAuctions())
  const getMyAuctions = () => {
    if (!wallet.isConnected()) return [];
    return auctions.filter(a => a.creator === wallet.getAddress());
  };

  // Get my bids (exact match to legacy getMyBids())
  const getMyBids = () => {
    if (!wallet.isConnected()) return [];
    return auctions.filter(a => 
      a.bids.some(b => b.bidder === wallet.getAddress())
    );
  };

  // Clear all data (exact match to legacy clearAll())
  const clearAll = () => {
    saveAuctions([]);
  };

  const value = {
    // State
    auctions,
    // Methods (matching legacy API exactly)
    createAuction,
    placeBid,
    endAuction,
    settleAuction,
    getAuctions,
    getAuction,
    getMyAuctions,
    getMyBids,
    clearAll
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
}

// Custom hook to use auction context
export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within AuctionProvider');
  }
  return context;
}

export default AuctionContext;
