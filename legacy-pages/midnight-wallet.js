/**
 * Midnight Lace Wallet Integration
 * For Midnight Blockchain Local Network (Undeployed)
 * 
 * Handles:
 * - Lace wallet connection
 * - Unshielded address retrieval (mn_addr_undeployed...)
 * - UI updates
 * - Global state management
 * - Error handling
 */

// Global state management
window.MidnightWallet = {
    connected: false,
    address: null,
    unshieldedAddress: null,
    provider: null,
    isLaceInstalled: false
};

/**
 * Check if Lace Wallet is installed
 * @returns {boolean} True if Lace is installed
 */
function isLaceWalletInstalled() {
    return typeof window.midnight !== 'undefined' || 
           typeof window.lace !== 'undefined' ||
           typeof window.cardano?.lace !== 'undefined';
}

/**
 * Get the Lace/Midnight provider object
 * @returns {Object|null} Provider object or null
 */
function getLaceProvider() {
    // Try different possible provider locations
    if (window.midnight) {
        return window.midnight;
    }
    if (window.lace) {
        return window.lace;
    }
    if (window.cardano?.lace) {
        return window.cardano.lace;
    }
    return null;
}

/**
 * Connect to Lace Wallet
 * @returns {Promise<Object>} Connection result with address and status
 */
async function connectLaceWallet() {
    try {
        // Check if Lace is installed
        if (!isLaceWalletInstalled()) {
            throw new Error('Lace Wallet is not installed. Please install Lace Wallet extension.');
        }

        const provider = getLaceProvider();
        if (!provider) {
            throw new Error('Unable to access Lace Wallet provider.');
        }

        console.log('🔌 Connecting to Lace Wallet...');

        // Request connection/enable wallet
        let enabled = false;
        let accounts = null;

        // Try multiple connection methods
        if (provider.enable) {
            enabled = await provider.enable();
            console.log('✅ Wallet enabled:', enabled);
        } else if (provider.request) {
            accounts = await provider.request({ method: 'wallet_enable' });
            enabled = true;
        }

        if (!enabled && !accounts) {
            throw new Error('Failed to enable Lace Wallet. Please check your wallet settings.');
        }

        // Get unshielded address
        let unshieldedAddress = null;
        
        // Method 1: Direct address getter
        if (provider.getUnshieldedAddress) {
            unshieldedAddress = await provider.getUnshieldedAddress();
        }
        // Method 2: Get accounts then extract address
        else if (provider.getAccounts) {
            const accountsList = await provider.getAccounts();
            if (accountsList && accountsList.length > 0) {
                unshieldedAddress = accountsList[0];
            }
        }
        // Method 3: Request method
        else if (provider.request) {
            try {
                unshieldedAddress = await provider.request({ 
                    method: 'wallet_getUnshieldedAddress' 
                });
            } catch (err) {
                // Try alternative method
                const accountsResult = await provider.request({ 
                    method: 'wallet_getAccounts' 
                });
                if (accountsResult && accountsResult.length > 0) {
                    unshieldedAddress = accountsResult[0];
                }
            }
        }

        if (!unshieldedAddress) {
            throw new Error('Could not retrieve unshielded address from wallet.');
        }

        // Validate address format (should start with mn_addr_undeployed)
        if (!unshieldedAddress.startsWith('mn_addr_undeployed')) {
            console.warn('⚠️ Address format unexpected:', unshieldedAddress);
        }

        // Update global state
        window.MidnightWallet.connected = true;
        window.MidnightWallet.address = unshieldedAddress;
        window.MidnightWallet.unshieldedAddress = unshieldedAddress;
        window.MidnightWallet.provider = provider;
        window.MidnightWallet.isLaceInstalled = true;

        console.log('✅ Connected to Lace Wallet');
        console.log('📍 Unshielded Address:', unshieldedAddress);

        return {
            success: true,
            connected: true,
            address: unshieldedAddress,
            unshieldedAddress: unshieldedAddress,
            message: 'Successfully connected to Lace Wallet'
        };

    } catch (error) {
        console.error('❌ Wallet connection error:', error);
        
        // Update global state on error
        window.MidnightWallet.connected = false;
        window.MidnightWallet.address = null;
        window.MidnightWallet.unshieldedAddress = null;
        window.MidnightWallet.isLaceInstalled = isLaceWalletInstalled();

        return {
            success: false,
            connected: false,
            address: null,
            error: error.message,
            message: error.message
        };
    }
}

/**
 * Disconnect wallet (clear state)
 */
function disconnectWallet() {
    window.MidnightWallet.connected = false;
    window.MidnightWallet.address = null;
    window.MidnightWallet.unshieldedAddress = null;
    window.MidnightWallet.provider = null;
    
    console.log('🔌 Wallet disconnected');
    
    return {
        success: true,
        connected: false,
        message: 'Wallet disconnected'
    };
}

/**
 * Get current wallet status
 * @returns {Object} Current wallet state
 */
function getWalletStatus() {
    return {
        connected: window.MidnightWallet.connected,
        address: window.MidnightWallet.address,
        unshieldedAddress: window.MidnightWallet.unshieldedAddress,
        isLaceInstalled: isLaceWalletInstalled()
    };
}

/**
 * Update UI with wallet connection status
 * @param {Object} status - Wallet status object
 * @param {Object} elements - DOM element IDs for updating
 */
function updateWalletUI(status, elements = {}) {
    const {
        statusElementId = 'walletStatus',
        addressElementId = 'walletAddress',
        connectButtonId = 'connectWalletBtn',
        statusDotId = 'walletStatusDot'
    } = elements;

    // Update status text
    const statusElement = document.getElementById(statusElementId);
    if (statusElement) {
        statusElement.textContent = status.connected ? 'Connected' : 'Disconnected';
        statusElement.className = status.connected ? 'status-connected' : 'status-disconnected';
    }

    // Update address display
    const addressElement = document.getElementById(addressElementId);
    if (addressElement) {
        if (status.address) {
            // Show first 20 and last 10 characters
            const shortAddress = `${status.address.substring(0, 20)}...${status.address.substring(status.address.length - 10)}`;
            addressElement.textContent = shortAddress;
            addressElement.title = status.address; // Full address on hover
        } else {
            addressElement.textContent = 'Not connected';
            addressElement.title = '';
        }
    }

    // Update connect button
    const connectButton = document.getElementById(connectButtonId);
    if (connectButton) {
        connectButton.textContent = status.connected ? 'Disconnect' : 'Connect Wallet';
        connectButton.disabled = !status.isLaceInstalled && !status.connected;
        
        if (!status.isLaceInstalled) {
            connectButton.title = 'Lace Wallet not installed';
        } else {
            connectButton.title = '';
        }
    }

    // Update status dot
    const statusDot = document.getElementById(statusDotId);
    if (statusDot) {
        statusDot.textContent = '●';
        statusDot.className = status.connected ? 'dot-connected' : 'dot-disconnected';
    }

    console.log('🎨 UI updated:', status);
}

/**
 * Initialize wallet connection button
 * @param {string} buttonId - ID of the connect button
 * @param {Object} uiElements - DOM element IDs for UI updates
 */
function initWalletConnection(buttonId = 'connectWalletBtn', uiElements = {}) {
    const button = document.getElementById(buttonId);
    
    if (!button) {
        console.error(`❌ Connect button with ID "${buttonId}" not found`);
        return;
    }

    button.addEventListener('click', async () => {
        const currentStatus = getWalletStatus();
        
        if (currentStatus.connected) {
            // Disconnect
            const result = disconnectWallet();
            updateWalletUI(getWalletStatus(), uiElements);
            
            // Show message
            if (window.showMessage) {
                window.showMessage('Wallet disconnected', 'info');
            }
        } else {
            // Connect
            button.disabled = true;
            button.textContent = 'Connecting...';
            
            const result = await connectLaceWallet();
            
            if (result.success) {
                updateWalletUI(getWalletStatus(), uiElements);
                
                // Show success message
                if (window.showMessage) {
                    window.showMessage('Wallet connected successfully!', 'success');
                } else {
                    alert('✅ Wallet connected successfully!');
                }
            } else {
                // Show error message
                if (window.showMessage) {
                    window.showMessage(`Error: ${result.error}`, 'error');
                } else {
                    alert(`❌ Connection failed: ${result.error}`);
                }
                
                updateWalletUI(getWalletStatus(), uiElements);
            }
            
            button.disabled = false;
        }
    });

    // Initial UI update
    const initialStatus = getWalletStatus();
    updateWalletUI(initialStatus, uiElements);
    
    console.log('🚀 Wallet connection initialized');
    console.log('📦 Lace installed:', initialStatus.isLaceInstalled);
}

/**
 * Listen for wallet account changes
 */
function listenForAccountChanges(callback) {
    const provider = getLaceProvider();
    
    if (!provider) return;
    
    // Listen for account changes
    if (provider.on) {
        provider.on('accountsChanged', async (accounts) => {
            console.log('🔄 Account changed:', accounts);
            
            if (accounts && accounts.length > 0) {
                window.MidnightWallet.address = accounts[0];
                window.MidnightWallet.unshieldedAddress = accounts[0];
                
                if (callback) {
                    callback(accounts[0]);
                }
                
                // Auto-update UI
                updateWalletUI(getWalletStatus());
            } else {
                // Disconnected
                disconnectWallet();
                updateWalletUI(getWalletStatus());
            }
        });
    }
}

/**
 * Send test transaction on Midnight network
 * @param {string} recipientAddress - Recipient's unshielded address
 * @param {number|string} amount - Amount in tNIGHT tokens (default: 1)
 * @returns {Promise<Object>} Transaction result with hash
 */
async function sendTestTransaction(recipientAddress, amount = 1) {
    try {
        // Validate wallet connection
        if (!window.MidnightWallet.connected) {
            throw new Error('Wallet not connected. Please connect your Lace Wallet first.');
        }

        if (!window.MidnightWallet.provider) {
            throw new Error('Wallet provider not available.');
        }

        // Validate recipient address
        if (!recipientAddress) {
            throw new Error('Recipient address is required.');
        }

        if (!recipientAddress.startsWith('mn_addr_')) {
            throw new Error('Invalid recipient address format. Must start with mn_addr_');
        }

        // Validate amount
        const txAmount = parseFloat(amount);
        if (isNaN(txAmount) || txAmount <= 0) {
            throw new Error('Invalid amount. Must be a positive number.');
        }

        console.log('📤 Preparing transaction...');
        console.log('  From:', window.MidnightWallet.address);
        console.log('  To:', recipientAddress);
        console.log('  Amount:', txAmount, 'tNIGHT');

        const provider = window.MidnightWallet.provider;

        // Prepare transaction parameters
        const txParams = {
            from: window.MidnightWallet.address,
            to: recipientAddress,
            value: txAmount.toString(),
            token: 'tNIGHT',
            network: 'local',
            nodeUrl: 'ws://localhost:9944'
        };

        console.log('🔐 Requesting signature from Lace...');

        // Method 1: Try direct transaction signing
        let signedTx = null;
        let txHash = null;

        if (provider.signTransaction) {
            try {
                signedTx = await provider.signTransaction(txParams);
                console.log('✅ Transaction signed');
            } catch (signError) {
                console.warn('⚠️ Direct signing failed, trying alternative method');
            }
        }

        // Method 2: Try request method
        if (!signedTx && provider.request) {
            try {
                signedTx = await provider.request({
                    method: 'midnight_signTransaction',
                    params: [txParams]
                });
                console.log('✅ Transaction signed via request method');
            } catch (requestError) {
                console.warn('⚠️ Request method failed');
            }
        }

        // Method 3: Try sendTransaction (sign + submit in one call)
        if (!signedTx && provider.sendTransaction) {
            try {
                const result = await provider.sendTransaction(txParams);
                txHash = result.hash || result.txHash || result.transactionHash || result;
                console.log('✅ Transaction submitted:', txHash);
                
                return {
                    success: true,
                    txHash: txHash,
                    from: window.MidnightWallet.address,
                    to: recipientAddress,
                    amount: txAmount,
                    message: 'Transaction submitted successfully'
                };
            } catch (sendError) {
                throw new Error(`Failed to send transaction: ${sendError.message}`);
            }
        }

        // If we have a signed transaction, submit it
        if (signedTx) {
            console.log('📡 Submitting transaction to local node...');

            // Method 4: Submit via provider
            if (provider.submitTransaction) {
                try {
                    const result = await provider.submitTransaction(signedTx);
                    txHash = result.hash || result.txHash || result;
                } catch (submitError) {
                    throw new Error(`Failed to submit transaction: ${submitError.message}`);
                }
            }
            // Method 5: Submit via request
            else if (provider.request) {
                try {
                    const result = await provider.request({
                        method: 'midnight_sendRawTransaction',
                        params: [signedTx]
                    });
                    txHash = result.hash || result.txHash || result;
                } catch (submitError) {
                    throw new Error(`Failed to submit transaction: ${submitError.message}`);
                }
            }
            // Method 6: Direct submission to node
            else {
                try {
                    const response = await fetch('http://localhost:9944', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: Date.now(),
                            method: 'author_submitExtrinsic',
                            params: [signedTx]
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Node returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    if (data.error) {
                        throw new Error(`Node error: ${data.error.message || JSON.stringify(data.error)}`);
                    }

                    txHash = data.result;
                } catch (fetchError) {
                    throw new Error(`Failed to submit to node: ${fetchError.message}`);
                }
            }

            if (!txHash) {
                throw new Error('Transaction submitted but no hash returned');
            }

            console.log('✅ Transaction submitted successfully');
            console.log('📝 Transaction Hash:', txHash);

            return {
                success: true,
                txHash: txHash,
                from: window.MidnightWallet.address,
                to: recipientAddress,
                amount: txAmount,
                message: 'Transaction submitted successfully',
                explorerUrl: `http://localhost:9944/tx/${txHash}` // For future use
            };
        }

        // If we get here, all methods failed
        throw new Error('Could not sign or submit transaction. Please check Lace Wallet configuration.');

    } catch (error) {
        console.error('❌ Transaction failed:', error);

        // Categorize errors for better user feedback
        let errorMessage = error.message;
        let errorType = 'unknown';

        if (error.message.includes('not connected')) {
            errorType = 'connection';
        } else if (error.message.includes('rejected') || error.message.includes('denied')) {
            errorType = 'rejected';
            errorMessage = 'Transaction rejected by user';
        } else if (error.message.includes('insufficient')) {
            errorType = 'insufficient_funds';
            errorMessage = 'Insufficient balance';
        } else if (error.message.includes('Invalid')) {
            errorType = 'validation';
        } else if (error.message.includes('Node') || error.message.includes('network')) {
            errorType = 'network';
            errorMessage = 'Network error. Is the local node running at localhost:9944?';
        }

        return {
            success: false,
            error: errorMessage,
            errorType: errorType,
            message: errorMessage
        };
    }
}

/**
 * Get transaction status from local node
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction status
 */
async function getTransactionStatus(txHash) {
    try {
        if (!txHash) {
            throw new Error('Transaction hash is required');
        }

        console.log('🔍 Checking transaction status:', txHash);

        // Try to get status from provider first
        const provider = window.MidnightWallet.provider;
        
        if (provider && provider.getTransaction) {
            try {
                const tx = await provider.getTransaction(txHash);
                return {
                    success: true,
                    status: tx.status || 'pending',
                    transaction: tx
                };
            } catch (providerError) {
                console.warn('⚠️ Provider status check failed:', providerError.message);
            }
        }

        // Fallback: Query node directly
        const response = await fetch('http://localhost:9944', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'chain_getBlock',
                params: [txHash]
            })
        });

        if (!response.ok) {
            throw new Error(`Node returned ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            return {
                success: false,
                status: 'not_found',
                error: 'Transaction not found'
            };
        }

        return {
            success: true,
            status: data.result ? 'confirmed' : 'pending',
            data: data.result
        };

    } catch (error) {
        console.error('❌ Status check failed:', error);
        return {
            success: false,
            error: error.message,
            status: 'unknown'
        };
    }
}

/**
 * Get wallet balance from local node
 * @returns {Promise<Object>} Balance information
 */
async function getWalletBalance() {
    try {
        if (!window.MidnightWallet.connected) {
            throw new Error('Wallet not connected');
        }

        const address = window.MidnightWallet.address;
        console.log('💰 Fetching balance for:', address);

        const provider = window.MidnightWallet.provider;

        // Try provider method first
        if (provider && provider.getBalance) {
            try {
                const balance = await provider.getBalance(address);
                return {
                    success: true,
                    balance: balance.toString(),
                    address: address
                };
            } catch (providerError) {
                console.warn('⚠️ Provider balance check failed:', providerError.message);
            }
        }

        // Fallback: Query node directly
        const response = await fetch('http://localhost:9944', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'system_accountNextIndex',
                params: [address]
            })
        });

        if (!response.ok) {
            throw new Error(`Node returned ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            balance: data.result || '0',
            address: address,
            message: 'Balance retrieved successfully'
        };

    } catch (error) {
        console.error('❌ Balance check failed:', error);
        return {
            success: false,
            error: error.message,
            balance: '0'
        };
    }
}

// Export functions to global scope
window.MidnightWalletAPI = {
    connect: connectLaceWallet,
    disconnect: disconnectWallet,
    getStatus: getWalletStatus,
    isInstalled: isLaceWalletInstalled,
    updateUI: updateWalletUI,
    init: initWalletConnection,
    listenForChanges: listenForAccountChanges,
    sendTransaction: sendTestTransaction,
    getTransactionStatus: getTransactionStatus,
    getBalance: getWalletBalance
};

console.log('✅ Midnight Wallet API loaded');
console.log('📦 Available functions:', Object.keys(window.MidnightWalletAPI));
