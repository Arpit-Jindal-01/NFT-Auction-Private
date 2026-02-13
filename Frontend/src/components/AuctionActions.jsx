/**
 * AuctionActions Component
 * Converted from legacy auction.html auction actions card
 * Provides UI for auction actions - create, bid, end, settle
 * Preserves existing CSS classes and structure
 */

import { useWallet } from '../contexts/WalletContext';
import { useAuction } from '../contexts/AuctionContext';

export default function AuctionActions() {
  const wallet = useWallet();
  const auction = useAuction();

  // Handle create auction (matching legacy startAuction event handler)
  const handleCreateAuction = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    // Simple prompts for now (matches legacy modal behavior)
    const title = prompt(
      '🎨 Create New Auction\n\nNFT Title:',
      'e.g., Cool NFT #123'
    );

    if (title === null) return; // User cancelled

    if (!title || title.trim() === '') {
      alert('Title cannot be empty');
      return;
    }

    const startingPriceStr = prompt(
      '🎨 Create New Auction\n\nStarting Price (tNIGHT):',
      '100'
    );

    if (startingPriceStr === null) return; // User cancelled

    try {
      const startingPrice = parseFloat(startingPriceStr);

      if (startingPrice <= 0) {
        alert('Starting price must be greater than 0');
        return;
      }

      const newAuction = auction.createAuction(title, startingPrice);
      console.log(`✅ Auction created: ${title} - Starting at ${startingPrice} tNIGHT`);
      alert(`🎉 Auction "${title}" created! (Fee: 100 tNIGHT)`);

    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  // Handle place bid (matching legacy submitBid event handler)
  const handlePlaceBid = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    const auctions = auction.getAuctions();
    const myAddress = wallet.address;
    const openAuctions = auctions.filter(a => a.status === 'open' && a.creator !== myAddress);

    if (openAuctions.length === 0) {
      alert('⚠️ No open auctions available to bid on!');
      console.log('⚠️ No open auctions to bid on (excluding your own)');
      return;
    }

    const auctionToBid = openAuctions[0];
    const currentHighest = auctionToBid.highestBid;
    const balance = wallet.balance;

    const bidAmountStr = prompt(
      `💰 Bid on "${auctionToBid.title}"\n\n` +
      `Bid Amount (must be > ${currentHighest} tNIGHT)\n` +
      `Your balance: ${balance} tNIGHT`,
      (currentHighest + 100).toString()
    );

    if (bidAmountStr === null) return; // User cancelled

    try {
      const bidAmount = parseFloat(bidAmountStr);

      if (bidAmount <= currentHighest) {
        alert(`❌ Bid must be higher than ${currentHighest} tNIGHT`);
        return;
      }

      if (bidAmount > balance) {
        alert('❌ Insufficient balance!');
        return;
      }

      auction.placeBid(auctionToBid.id, bidAmount);
      console.log(`✅ Bid placed: ${bidAmount} tNIGHT on ${auctionToBid.title}`);
      alert(`✅ Bid placed: ${bidAmount} tNIGHT!`);

    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  // Handle end auction (matching legacy endAuctionBtn event handler)
  const handleEndAuction = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    const myAuctions = auction.getMyAuctions().filter(a => a.status === 'open');

    if (myAuctions.length === 0) {
      alert('⚠️ No open auctions to end');
      return;
    }

    const auctionToEnd = myAuctions[0];
    const confirmed = confirm(`🔒 End Auction\n\nEnd auction "${auctionToEnd.title}"?\nNo more bids will be accepted.`);

    if (!confirmed) return;

    try {
      auction.endAuction(auctionToEnd.id);
      console.log(`✅ Auction ended: ${auctionToEnd.title}`);
      alert(`🔒 Auction "${auctionToEnd.title}" ended!`);
    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  // Handle settle auction (matching legacy settleAuctionBtn event handler)
  const handleSettleAuction = () => {
    if (!wallet.connected) {
      alert('⚠️ Please connect wallet first');
      return;
    }

    const myAuctions = auction.getMyAuctions().filter(a => a.status === 'ended');

    if (myAuctions.length === 0) {
      alert('⚠️ No ended auctions to settle');
      return;
    }

    const auctionToSettle = myAuctions[0];

    try {
      const settledAuction = auction.settleAuction(auctionToSettle.id);
      console.log(`✅ Auction settled: ${settledAuction.title} - Received ${settledAuction.highestBid} tNIGHT`);
      alert(`💸 Auction settled! Received ${settledAuction.highestBid} tNIGHT`);
    } catch (error) {
      alert(error.message);
      console.error(`❌ ${error.message}`);
    }
  };

  return (
    <div className="card">
      <h3>⚡ Auction Actions</h3>
      <button 
        className="btn btn-success"
        onClick={handleCreateAuction}
        disabled={!wallet.connected}
      >
        🎨 Create Auction (-100 tNIGHT)
      </button>
      <button 
        className="btn btn-primary"
        onClick={handlePlaceBid}
        disabled={!wallet.connected}
      >
        💰 Place Bid
      </button>
      <button 
        className="btn btn-warning"
        onClick={handleEndAuction}
        disabled={!wallet.connected}
      >
        🔒 End Auction
      </button>
      <button 
        className="btn btn-danger"
        onClick={handleSettleAuction}
        disabled={!wallet.connected}
      >
        💸 Settle Auction
      </button>
    </div>
  );
}
