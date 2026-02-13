/**
 * WalletBar Component
 * Converted from legacy auction.html wallet card section
 * Preserves existing CSS classes and structure
 * Now uses WalletContext instead of direct DOM manipulation
 */

import { useWallet } from '../contexts/WalletContext';

export default function WalletBar() {
  const wallet = useWallet();

  // Handle wallet connection (matching legacy behavior)
  const handleConnect = () => {
    try {
      // Simple prompt for now - matches legacy modal behavior
      const address = prompt('🌙 Connect Wallet\n\nEnter your username:');
      
      if (address === null) {
        // User cancelled
        return;
      }
      
      if (!address || address.trim() === '') {
        alert('Address cannot be empty');
        return;
      }
      
      const connectedAddress = wallet.connect(address);
      
      // Show success message (console for now, will add toast later)
      console.log(`🎉 Connected as ${connectedAddress}! (Starting balance: 31337 tNIGHT)`);
      
    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h2>💼 Wallet</h2>
        <div className="wallet-status">
          <span 
            className={wallet.connected ? 'dot-connected' : 'dot-disconnected'}
          >
            ●
          </span>
          <span className={wallet.connected ? 'status-connected' : 'status-disconnected'}>
            {wallet.connected ? 'Connected ✓' : 'Not Connected'}
          </span>
        </div>
      </div>
      
      <div className="wallet-info">
        <div className="wallet-row">
          <span className="wallet-label">Address:</span>
          <span className="wallet-value">
            {wallet.connected ? wallet.address : 'Not connected'}
          </span>
        </div>
        <div className="wallet-row">
          <span className="wallet-label">Balance:</span>
          <span className="wallet-value">
            {wallet.balance} tNIGHT
          </span>
        </div>
      </div>
      
      <button 
        className="btn btn-primary"
        onClick={handleConnect}
        disabled={wallet.connected}
      >
        {wallet.connected ? 'Connected' : 'Connect Wallet'}
      </button>
    </div>
  );
}
