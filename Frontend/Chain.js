

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    WALLET: 'midnight_wallet',
    AUCTIONS: 'midnight_auctions',
    TRANSACTION_HISTORY: 'midnight_transactions'
};

// ============================================================================
// WALLET ENGINE
// ============================================================================

class Wallet {
    constructor() {
        this.loadWallet();
    }

    loadWallet() {
        const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
        if (saved) {
            const data = JSON.parse(saved);
            this.address = data.address;
            this.balance = data.balance;
            this.connected = data.connected;
        } else {
            this.address = null;
            this.balance = 0;
            this.connected = false;
        }
    }

    saveWallet() {
        localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify({
            address: this.address,
            balance: this.balance,
            connected: this.connected
        }));
    }

    connect(address) {
        if (!address || address.trim() === '') {
            throw new Error('Address cannot be empty');
        }

        this.address = address.trim();
        this.connected = true;

        // Initialize balance if first time
        if (this.balance === 0) {
            this.balance = 31337; // Initial airdrop
        }

        this.saveWallet();
        this.logTransaction('CONNECT', 0, 'Wallet connected with initial balance');
        return this.address;
    }

    disconnect() {
        this.connected = false;
        this.saveWallet();
        this.logTransaction('DISCONNECT', 0, 'Wallet disconnected');
    }

    getBalance() {
        return this.balance;
    }

    getAddress() {
        return this.address;
    }

    isConnected() {
        return this.connected;
    }

    deductTokens(amount, reason) {
        if (this.balance < amount) {
            throw new Error(`Insufficient balance. Need ${amount} tNIGHT, have ${this.balance} tNIGHT`);
        }

        this.balance -= amount;
        this.saveWallet();
        this.logTransaction('DEBIT', amount, reason);
    }

    addTokens(amount, reason) {
        this.balance += amount;
        this.saveWallet();
        this.logTransaction('CREDIT', amount, reason);
    }

    logTransaction(type, amount, reason) {
        const tx = {
            id: this.generateTxHash(),
            type,
            amount,
            reason,
            balance: this.balance,
            timestamp: Date.now(),
            address: this.address
        };

        const history = this.getTransactionHistory();
        history.unshift(tx);
        
        // Keep only last 50 transactions
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem(STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(history));
        return tx.id;
    }

    getTransactionHistory() {
        const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
        return saved ? JSON.parse(saved) : [];
    }

    generateTxHash() {
        return '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
}

// ============================================================================
// FAKE BLOCKCHAIN ENGINE (AUCTION SYSTEM)
// ============================================================================

class FakeBlockchain {
    constructor(wallet) {
        this.wallet = wallet;
        this.loadAuctions();
    }

    loadAuctions() {
        const saved = localStorage.getItem(STORAGE_KEYS.AUCTIONS);
        this.auctions = saved ? JSON.parse(saved) : [];
    }

    saveAuctions() {
        localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(this.auctions));
    }

    createAuction(title, startingPrice) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        if (!title || title.trim() === '') {
            throw new Error('Title cannot be empty');
        }

        if (startingPrice <= 0) {
            throw new Error('Starting price must be greater than 0');
        }

        // Deduct creation fee
        const creationFee = 100;
        this.wallet.deductTokens(creationFee, `Create auction: ${title}`);

        const auction = {
            id: this.generateAuctionId(),
            title: title.trim(),
            startingPrice: parseFloat(startingPrice),
            highestBid: parseFloat(startingPrice),
            highestBidder: null,
            creator: this.wallet.getAddress(),
            status: 'open',
            bids: [],
            createdAt: Date.now(),
            endedAt: null,
            settledAt: null
        };

        this.auctions.unshift(auction);
        this.saveAuctions();

        return auction;
    }

    placeBid(auctionId, bidAmount) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const auction = this.auctions.find(a => a.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }

        if (auction.status !== 'open') {
            throw new Error('Auction is not open');
        }

        if (bidAmount <= auction.highestBid) {
            throw new Error(`Bid must be higher than current highest bid of ${auction.highestBid} tNIGHT`);
        }

        if (auction.creator === this.wallet.getAddress()) {
            throw new Error('Cannot bid on your own auction');
        }

        // Deduct bid amount
        this.wallet.deductTokens(bidAmount, `Bid on auction: ${auction.title}`);

        // Refund previous highest bidder if exists
        if (auction.highestBidder && auction.bids.length > 0) {
            const previousBid = auction.highestBid;
            const previousBidder = auction.highestBidder;
        }

        // Update auction
        auction.highestBid = parseFloat(bidAmount);
        auction.highestBidder = this.wallet.getAddress();
        auction.bids.push({
            bidder: this.wallet.getAddress(),
            amount: parseFloat(bidAmount),
            timestamp: Date.now()
        });

        this.saveAuctions();
        return auction;
    }

    endAuction(auctionId) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const auction = this.auctions.find(a => a.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }

        if (auction.status !== 'open') {
            throw new Error('Auction is already ended');
        }

        if (auction.creator !== this.wallet.getAddress()) {
            throw new Error('Only creator can end auction');
        }

        auction.status = 'ended';
        auction.endedAt = Date.now();
        this.saveAuctions();

        return auction;
    }

    settleAuction(auctionId) {
        if (!this.wallet.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const auction = this.auctions.find(a => a.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }

        if (auction.status !== 'ended') {
            throw new Error('Auction must be ended before settlement');
        }

        if (auction.creator !== this.wallet.getAddress()) {
            throw new Error('Only creator can settle auction');
        }

        // Transfer highest bid to creator
        if (auction.highestBidder) {
            this.wallet.addTokens(auction.highestBid, `Settlement from auction: ${auction.title}`);
        }

        auction.status = 'settled';
        auction.settledAt = Date.now();
        this.saveAuctions();

        return auction;
    }

    getAuctions() {
        return [...this.auctions];
    }

    getAuction(auctionId) {
        return this.auctions.find(a => a.id === auctionId);
    }

    getMyAuctions() {
        if (!this.wallet.isConnected()) return [];
        return this.auctions.filter(a => a.creator === this.wallet.getAddress());
    }

    getMyBids() {
        if (!this.wallet.isConnected()) return [];
        return this.auctions.filter(a => 
            a.bids.some(b => b.bidder === this.wallet.getAddress())
        );
    }

    generateAuctionId() {
        return 'auction_' + Date.now() + '_' + Math.random().toString(36).substring(7);
    }

    // Clear all data (for testing)
    clearAll() {
        this.auctions = [];
        this.saveAuctions();
    }
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

class ToastManager {
    constructor() {
        this.createToastContainer();
    }

    createToastContainer() {
        if (document.getElementById('fake-toast-container')) return;

        const container = document.createElement('div');
        container.id = 'fake-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = 'fake-toast';
        
        const colors = {
            success: {bg: '#d4edda', border: '#28a745', color: '#155724'},
            error: {bg: '#f8d7da', border: '#dc3545', color: '#721c24'},
            info: {bg: '#d1ecf1', border: '#17a2b8', color: '#0c5460'},
            warning: {bg: '#fff3cd', border: '#ffc107', color: '#856404'}
        };
        
        const style = colors[type] || colors.info;
        
        toast.style.cssText = `
            background: ${style.bg};
            border: 2px solid ${style.border};
            color: ${style.color};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const icon = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        }[type] || 'ℹ️';
        
        toast.innerHTML = `<span style="font-size: 18px;">${icon}</span><span>${message}</span>`;
        
        const container = document.getElementById('fake-toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ============================================================================
// MODAL SYSTEM
// ============================================================================

class ModalManager {
    constructor() {
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('fake-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'fake-modal-styles';
        style.textContent = `
            .fake-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .fake-modal {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            }
            
            .fake-modal h2 {
                margin: 0 0 20px 0;
                color: #667eea;
            }
            
            .fake-modal input,
            .fake-modal textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 15px;
                font-family: inherit;
            }
            
            .fake-modal input:focus,
            .fake-modal textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .fake-modal label {
                display: block;
                font-weight: 600;
                margin-bottom: 8px;
                color: #555;
            }
            
            .fake-modal-buttons {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .fake-modal button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .fake-modal .btn-primary {
                background: #667eea;
                color: white;
            }
            
            .fake-modal .btn-primary:hover {
                background: #5568d3;
            }
            
            .fake-modal .btn-secondary {
                background: #e0e0e0;
                color: #555;
            }
            
            .fake-modal .btn-secondary:hover {
                background: #d0d0d0;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    show(config) {
        return new Promise((resolve, reject) => {
            const overlay = document.createElement('div');
            overlay.className = 'fake-modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'fake-modal';
            
            let html = `<h2>${config.title}</h2>`;
            
            if (config.fields) {
                config.fields.forEach(field => {
                    html += `
                        <div>
                            <label>${field.label}</label>
                            ${field.type === 'textarea' 
                                ? `<textarea id="${field.id}" placeholder="${field.placeholder || ''}"></textarea>`
                                : `<input type="${field.type || 'text'}" id="${field.id}" 
                                    placeholder="${field.placeholder || ''}" 
                                    value="${field.value || ''}">`
                            }
                        </div>
                    `;
                });
            }
            
            html += `
                <div class="fake-modal-buttons">
                    <button class="btn-secondary" id="modal-cancel">Cancel</button>
                    <button class="btn-primary" id="modal-submit">${config.submitText || 'Submit'}</button>
                </div>
            `;
            
            modal.innerHTML = html;
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
            
            // Handle submit
            modal.querySelector('#modal-submit').addEventListener('click', () => {
                const data = {};
                if (config.fields) {
                    config.fields.forEach(field => {
                        data[field.id] = document.getElementById(field.id).value;
                    });
                }
                overlay.remove();
                resolve(data);
            });
            
            // Handle cancel
            modal.querySelector('#modal-cancel').addEventListener('click', () => {
                overlay.remove();
                reject(new Error('Cancelled'));
            });
            
            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    reject(new Error('Cancelled'));
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Handle overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    reject(new Error('Cancelled'));
                }
            });
        });
    }
}

// ============================================================================
// GLOBAL INSTANCES
// ============================================================================

const fakeWallet = new FakeWallet();
const fakeBlockchain = new FakeBlockchain(fakeWallet);
const toastManager = new ToastManager();
const modalManager = new ModalManager();

// ============================================================================
// EXPORTS
// ============================================================================

window.FakeChain = {
    wallet: fakeWallet,
    blockchain: fakeBlockchain,
    toast: toastManager,
    modal: modalManager
};
