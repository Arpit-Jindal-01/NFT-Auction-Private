/**
 * AuctionCard Component
 * Converted from legacy auction.html marketplace card structure
 * Preserves existing CSS classes and structure
 * Now accepts auction data as props and handles actions
 */

import { useAuction } from '../contexts/AuctionContext';
import { useWallet } from '../contexts/WalletContext';

export default function AuctionCard({ auction, myAddress }) {
  const auctionContext = useAuction();
  const wallet = useWallet();

  // Default auction data if not provided
  const auctionData = auction || {
    title: 'Sample Auction',
    creator: 'midnight_user_abc123',
    startingPrice: 100,
    highestBid: 100,
    highestBidder: null,
    bids: [],
    status: 'open'
  };

  const creatorShort = auctionData.creator.substring(0, 6) + '...' + auctionData.creator.substring(auctionData.creator.length - 4);
  const bidderShort = auctionData.highestBidder 
    ? auctionData.highestBidder.substring(0, 6) + '...' + auctionData.highestBidder.substring(auctionData.highestBidder.length - 4)
    : 'None';

  // Determine button states (matching legacy logic)
  const isMyAuction = myAddress && auctionData.creator === myAddress;
  const canBid = myAddress && !isMyAuction && auctionData.status === 'open';
  const canEnd = isMyAuction && auctionData.status === 'open';
  const canSettle = isMyAuction && auctionData.status === 'ended';

  // Handle place bid (matching legacy placeBid event handler)
  const handlePlaceBid = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    if (!canBid) return;

    const currentHighest = auctionData.highestBid;
    const balance = wallet.getBalance();

    // Simple prompt for now (matches legacy modal behavior)
    const bidAmountStr = prompt(
      `💰 Bid on "${auctionData.title}"\n\n` +
      `Bid Amount (must be > ${currentHighest} tNIGHT)\n` +
      `Your balance: ${balance} tNIGHT`,
      (currentHighest + 100).toString()
    );

    if (bidAmountStr === null) return; // User cancelled

    try {
      const bidAmount = parseFloat(bidAmountStr);

      // Validate bid amount
      if (bidAmount <= currentHighest) {
        alert(`❌ Bid must be higher than ${currentHighest} tNIGHT`);
        return;
      }

      // Check balance
      if (bidAmount > balance) {
        alert('❌ Insufficient balance!');
        return;
      }

      const updatedAuction = auctionContext.placeBid(auctionData.id, bidAmount);
      console.log(`✅ Bid placed: ${bidAmount} tNIGHT on ${updatedAuction.title}`);
      alert(`✅ Bid placed: ${bidAmount} tNIGHT!`);

    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  // Handle end auction (matching legacy endAuction event handler)
  const handleEndAuction = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    if (!canEnd) return;

    const confirmed = confirm(`🔒 End Auction\n\nEnd auction "${auctionData.title}"?\nNo more bids will be accepted.`);
    
    if (!confirmed) return;

    try {
      const updatedAuction = auctionContext.endAuction(auctionData.id);
      console.log(`✅ Auction ended: ${updatedAuction.title}`);
      alert(`✅ Auction "${auctionData.title}" has been ended!`);

    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  // Handle settle auction (matching legacy settleAuction event handler)
  const handleSettleAuction = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    if (!canSettle) return;

    const confirmed = confirm(
      `💸 Settle Auction\n\n` +
      `Settle auction "${auctionData.title}"?\n` +
      `Highest bid: ${auctionData.highestBid} tNIGHT\n` +
      `Winner: ${auctionData.highestBidder || 'None'}`
    );
    
    if (!confirmed) return;

    try {
      const updatedAuction = auctionContext.settleAuction(auctionData.id);
      console.log(`✅ Auction settled: ${updatedAuction.title} - Received ${updatedAuction.highestBid} tNIGHT`);
      alert(`✅ Auction settled! Received ${auctionData.highestBid} tNIGHT`);

    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  return (
    <div className="auction-card">
      <div className="auction-card-header">
        <div className="auction-title">{auctionData.title}</div>
        <div className="auction-creator">by {creatorShort}</div>
      </div>
      
      <div className="auction-info">
        <div className="auction-info-row">
          <span className="auction-label">Starting Price</span>
          <span className="auction-value">{auctionData.startingPrice} tNIGHT</span>
        </div>
        <div className="auction-info-row">
          <span className="auction-label">Highest Bid</span>
          <span className="auction-value">{auctionData.highestBid} tNIGHT</span>
        </div>
        <div className="auction-info-row">
          <span className="auction-label">Highest Bidder</span>
          <span className="auction-value" style={{ fontSize: '0.85em' }}>{bidderShort}</span>
        </div>
        <div className="auction-info-row">
          <span className="auction-label">Total Bids</span>
          <span className="auction-value">{auctionData.bids.length}</span>
        </div>
        <div className="auction-info-row">
          <span className="auction-label">Status</span>
          <span className={`auction-status status-${auctionData.status}`}>
            {auctionData.status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="auction-actions">
        {canBid && (
          <button 
            className="btn btn-primary bid-btn"
            onClick={handlePlaceBid}
          >
            💰 Bid
          </button>
        )}
        {canEnd && (
          <button 
            className="btn btn-warning end-btn"
            onClick={handleEndAuction}
          >
            🔒 End
          </button>
        )}
        {canSettle && (
          <button 
            className="btn btn-success settle-btn"
            onClick={handleSettleAuction}
          >
            💸 Settle
          </button>
        )}
        {!canBid && !canEnd && !canSettle && (
          <button 
            className="btn btn-primary"
            disabled
            style={{ opacity: 0.3 }}
          >
            No Actions Available
          </button>
        )}
      </div>
    </div>
  );
}
