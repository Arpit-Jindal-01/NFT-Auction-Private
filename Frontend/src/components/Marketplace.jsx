/**
 * Marketplace Component
 * Converted from legacy auction.html marketplace section
 * Preserves existing CSS classes and structure
 * Now reads wallet and auction state from contexts
 */

import { useWallet } from '../contexts/WalletContext';
import { useAuction } from '../contexts/AuctionContext';
import AuctionCard from './AuctionCard';

export default function Marketplace() {
  const wallet = useWallet();
  const auction = useAuction();
  
  // Get auctions from context (replaces manual renderMarketplace)
  const auctions = auction.auctions;

  return (
    <>
      <div className="marketplace-header">
        <h2>🏪 NFT Auction Marketplace</h2>
        <p style={{ color: '#9ca3af' }}>All active and past auctions</p>
      </div>
      <div id="marketplace" className="marketplace-grid">
        {auctions.length === 0 ? (
          <div style={{ 
            gridColumn: '1/-1', 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#9ca3af' 
          }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>📦</div>
            <h3 style={{ color: '#6366f1', marginBottom: '10px' }}>No Auctions Yet</h3>
            <p>Create the first auction to get started!</p>
          </div>
        ) : (
          auctions.map((auctionItem) => (
            <AuctionCard 
              key={auctionItem.id} 
              auction={auctionItem}
              myAddress={wallet.connected ? wallet.address : null}
            />
          ))
        )}
      </div>
    </>
  );
}
