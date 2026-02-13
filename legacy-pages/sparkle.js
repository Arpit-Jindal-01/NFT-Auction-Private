/**
 * CURSOR SPARKLE EFFECT
 * Creates fading sparkle particles that follow mouse movement
 * Lightweight, no external dependencies, 60fps optimized
 */

(function() {
    'use strict';
    
    const MAX_SPARKLES = 25;
    const SPARKLE_LIFETIME = 700; // ms
    const SPARKLE_INTERVAL = 80; // ms between sparkles
    
    let sparkles = [];
    let lastSparkleTime = 0;
    let isEnabled = true;
    
    // Sparkle colors - purple/blue theme
    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(99, 102, 241, 0.6)',
    ];
    
    class Sparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = SPARKLE_LIFETIME;
            this.maxLife = SPARKLE_LIFETIME;
            
            this.element = document.createElement('div');
            this.element.className = 'sparkle';
            this.element.style.cssText = `
                position: fixed;
                width: ${this.size}px;
                height: ${this.size}px;
                background: ${this.color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 ${this.size * 2}px ${this.color};
                left: ${this.x}px;
                top: ${this.y}px;
            `;
            
            document.body.appendChild(this.element);
        }
        
        update(deltaTime) {
            this.life -= deltaTime;
            
            if (this.life <= 0) {
                this.remove();
                return false;
            }
            
            // Update position
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Calculate opacity based on remaining life
            const opacity = this.life / this.maxLife;
            
            // Update element
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.opacity = opacity;
            this.element.style.transform = `scale(${opacity})`;
            
            return true;
        }
        
        remove() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    }
    
    function createSparkle(x, y) {
        if (sparkles.length >= MAX_SPARKLES) {
            // Remove oldest sparkle
            const oldest = sparkles.shift();
            if (oldest) {
                oldest.remove();
            }
        }
        
        const sparkle = new Sparkle(x, y);
        sparkles.push(sparkle);
    }
    
    function updateSparkles() {
        const now = performance.now();
        const deltaTime = 16; // Assume 60fps
        
        // Update all sparkles
        sparkles = sparkles.filter(sparkle => sparkle.update(deltaTime));
        
        // Continue animation loop
        if (isEnabled) {
            requestAnimationFrame(updateSparkles);
        }
    }
    
    function handleMouseMove(e) {
        const now = performance.now();
        
        // Throttle sparkle creation
        if (now - lastSparkleTime < SPARKLE_INTERVAL) {
            return;
        }
        
        lastSparkleTime = now;
        
        // Create sparkle at cursor position with slight randomness
        const x = e.clientX + (Math.random() - 0.5) * 10;
        const y = e.clientY + (Math.random() - 0.5) * 10;
        
        createSparkle(x, y);
    }
    
    // Initialize
    function init() {
        // Only enable on non-touch devices
        if ('ontouchstart' in window) {
            return;
        }
        
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        updateSparkles();
    }
    
    // Cleanup function
    function destroy() {
        isEnabled = false;
        document.removeEventListener('mousemove', handleMouseMove);
        sparkles.forEach(sparkle => sparkle.remove());
        sparkles = [];
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose destroy function globally if needed
    window.destroySparkles = destroy;
    
})();
