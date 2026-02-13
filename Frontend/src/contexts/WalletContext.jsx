/**
 * WalletContext
 * Migrated from legacy Chain.js Wallet class
 * Preserves exact localStorage logic and storage keys
 */

import { createContext, useContext, useState, useEffect } from 'react';

// Exact storage keys from legacy code
const STORAGE_KEYS = {
  WALLET: 'midnight_wallet',
  AUCTIONS: 'midnight_auctions',
  TRANSACTION_HISTORY: 'midnight_transactions'
};

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);

  // Load wallet from localStorage on mount (exact match to legacy loadWallet())
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (saved) {
      const data = JSON.parse(saved);
      setAddress(data.address);
      setBalance(data.balance);
      setConnected(data.connected);
    }
  }, []);

  // Save to localStorage (exact match to legacy saveWallet())
  const saveWallet = (walletData) => {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(walletData));
  };

  // Connect wallet (exact match to legacy connect())
  const connect = (userAddress) => {
    if (!userAddress || userAddress.trim() === '') {
      throw new Error('Address cannot be empty');
    }

    const trimmedAddress = userAddress.trim();
    const newConnected = true;
    
    // Initialize balance if first time (exact match to legacy)
    const newBalance = balance === 0 ? 31337 : balance;

    setAddress(trimmedAddress);
    setBalance(newBalance);
    setConnected(newConnected);

    saveWallet({
      address: trimmedAddress,
      balance: newBalance,
      connected: newConnected
    });

    logTransaction('CONNECT', 0, 'Wallet connected with initial balance');
    return trimmedAddress;
  };

  // Disconnect wallet (exact match to legacy disconnect())
  const disconnect = () => {
    const newConnected = false;
    setConnected(newConnected);
    
    saveWallet({
      address,
      balance,
      connected: newConnected
    });

    logTransaction('DISCONNECT', 0, 'Wallet disconnected');
  };

  // Deduct tokens (exact match to legacy deductTokens())
  const deductTokens = (amount, reason) => {
    if (balance < amount) {
      throw new Error(`Insufficient balance. Need ${amount} tNIGHT, have ${balance} tNIGHT`);
    }

    const newBalance = balance - amount;
    setBalance(newBalance);

    saveWallet({
      address,
      balance: newBalance,
      connected
    });

    logTransaction('DEBIT', amount, reason);
  };

  // Add tokens (exact match to legacy addTokens())
  const addTokens = (amount, reason) => {
    const newBalance = balance + amount;
    setBalance(newBalance);

    saveWallet({
      address,
      balance: newBalance,
      connected
    });

    logTransaction('CREDIT', amount, reason);
  };

  // Log transaction (exact match to legacy logTransaction())
  const logTransaction = (type, amount, reason) => {
    const tx = {
      id: generateTxHash(),
      type,
      amount,
      reason,
      balance,
      timestamp: Date.now(),
      address
    };

    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    const history = saved ? JSON.parse(saved) : [];
    history.unshift(tx);
    
    // Keep only last 50 transactions
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(history));
    return tx.id;
  };

  // Generate transaction hash (exact match to legacy generateTxHash())
  const generateTxHash = () => {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // Get transaction history (exact match to legacy getTransactionHistory())
  const getTransactionHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    return saved ? JSON.parse(saved) : [];
  };

  const value = {
    // State
    address,
    balance,
    connected,
    // Methods (matching legacy API exactly)
    connect,
    disconnect,
    deductTokens,
    addTokens,
    getTransactionHistory,
    // Helper getters (matching legacy API)
    isConnected: () => connected,
    getAddress: () => address,
    getBalance: () => balance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

export default WalletContext;
