// Right header logo - Circular design with center marks
export const RIGHT_LOGO = `data:image/svg+xml;base64,${btoa(`
<svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Outer circle -->
  <circle cx="21" cy="21" r="18" fill="none" stroke="#ffffff" stroke-width="3" filter="url(#glow)"/>
  
  <!-- Inner vertical marks -->
  <rect x="19.5" y="12" width="3" height="6" rx="1.5" fill="#ffffff" filter="url(#glow)"/>
  <rect x="19.5" y="18" width="3" height="6" rx="1.5" fill="#ffffff" filter="url(#glow)"/>
  <rect x="19.5" y="24" width="3" height="6" rx="1.5" fill="#ffffff" filter="url(#glow)"/>
</svg>
`)}`;
