/**
 * Header Component
 * Converted from legacy auction.html
 * Preserves existing CSS classes and structure
 */

export default function Header() {
  return (
    <header>
      <img id="leftLogo" className="header-logo-left" alt="Rise in" />
      <img id="rightLogo" className="header-logo-right" alt="Info" />
      <h1>
        <img 
          src="assets/logo.svg" 
          alt="MidnightMark" 
          style={{ width: '40px', height: '40px', verticalAlign: 'middle', marginRight: '10px' }} 
        />
        Midnight NFT Auction
      </h1>
    </header>
  );
}
