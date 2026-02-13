/**
 * Main App Component
 * Layout structure matching legacy auction.html
 * Uses existing CSS classes - no new styling
 */

import { WalletProvider } from './contexts/WalletContext';
import { AuctionProvider } from './contexts/AuctionContext';
import { 
  Header, 
  WalletBar, 
  Marketplace, 
  AuctionStatus, 
  AuctionActions 
} from './components';
import { useSparkles } from './hooks';

function App() {
  // Initialize sparkle effect (React-safe lifecycle)
  useSparkles();

  return (
    <WalletProvider>
      <AuctionProvider>
        <div className="container">
          <Header />
          <WalletBar />
          <Marketplace />
          
          {/* Main Content Grid - matching legacy layout */}
          <div className="main-grid">
            <AuctionStatus />
            <AuctionActions />
          </div>
        </div>
      </AuctionProvider>
    </WalletProvider>
  );
}

export default App;
