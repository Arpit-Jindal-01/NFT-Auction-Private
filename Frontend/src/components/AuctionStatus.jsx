/**
 * AuctionStatus Component
 * Converted from legacy auction.html auction status card
 * Displays status of the most recent auction
 * Preserves existing CSS classes and structure
 */

import { useAuction } from '../contexts/AuctionContext';

export default function AuctionStatus() {
  const auction = useAuction();

  // Get most recent auction (matching legacy updateAuctionList logic)
  const auctions = auction.getAuctions();
  const latest = auctions.length > 0 ? auctions[0] : null;

  return (
    <div className="card">
      <h3>📊 Auction Status</h3>
      <div className="status-item">
        <span className="status-label">State:</span>
        <span className="status-value">
          {latest ? latest.status.toUpperCase() : 'No Auctions'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Highest Bid:</span>
        <span className="status-value">
          {latest ? latest.highestBid : '0'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Total Bids:</span>
        <span className="status-value">
          {latest ? latest.bids.length : '0'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Auction ID:</span>
        <span className="status-value" style={{ fontSize: '0.75em' }}>
          {latest ? latest.id.substring(0, 25) + '...' : 'N/A'}
        </span>
      </div>
    </div>
  );
}
