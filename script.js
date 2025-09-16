

function isEmbeddedFromDomain(allowedDomain) {
    // Check if we're in an iframe or webview
    if (window.self !== window.top) {
        // Check the domain that embedded us
        const referrer = document.referrer;
        if (referrer) {
            try {
                const parentDomain = new URL(referrer).hostname;
                return parentDomain === allowedDomain || parentDomain.endsWith('.' + allowedDomain);
            } catch (e) {
                return true;
            }
        }
        return true;
    }
    return true; //TODO will need to update this later
}

// Domain check function
function checkDomain() {
    if (isEmbeddedFromDomain('joinblink.com')) {
        document.getElementById('domain-check-overlay').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        return true;
    } else{
            document.getElementById('domain-check-overlay').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
            return false;
    }
}

// Wheel of Fortune Game Configuration
const wheelConfig = {
    sections: [
        // 8 sections for Stickers
        { name: "Pen", color: "#03390f", textColor: "#cfff71" },
        { name: "Chocolate", color: "#cfff71", textColor: "#03390f" },
        { name: "Pen", color: "#03390f", textColor: "#cfff71" },
        { name: "Chocolate", color: "#cfff71", textColor: "#03390f" },
        { name: "Tote bag", color: "#03390f", textColor: "#cfff71" },
        { name: "Pen", color: "#cfff71", textColor: "#03390f" },
        { name: "Tote bag", color: "#03390f", textColor: "#cfff71" },
        { name: "Chocolate", color: "#cfff71", textColor: "#03390f" },
        
        // 6 sections for Notebook
        { name: "Tote bag", color: "#03390f", textColor: "#cfff71" },
        { name: "Lego", color: "#cfff71", textColor: "#03390f" },
        { name: "Pen", color: "#03390f", textColor: "#cfff71" },
        { name: "Tote bag", color: "#cfff71", textColor: "#03390f" },
        { name: "Chocolate", color: "#03390f", textColor: "#cfff71" },
        { name: "Blinkie", color: "#cfff71", textColor: "#03390f" },
        
        // 4 sections for Plush toy
        { name: "Chocolate", color: "#03390f", textColor: "#cfff71" },
        { name: "Tote bag", color: "#cfff71", textColor: "#03390f" },
        { name: "Pen", color: "#03390f", textColor: "#cfff71" },
        { name: "Water bottle", color: "#cfff71", textColor: "#03390f" }
    ]
};

class WheelOfFortune {
    constructor() {
        // Only initialize if domain check passes
        if (checkDomain()) {
            this.canvas = document.getElementById('wheel');
            this.ctx = this.canvas.getContext('2d');
            this.isSpinning = false;
            this.currentRotation = 0;
            this.targetRotation = 0;
            this.spinSpeed = 0;
            this.friction = 0.98;
            this.minSpeed = 0.01;
            
            this.init();
        }
    }
    
    init() {
        this.drawWheel();
        this.setupEventListeners();
    }
    
    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const sectionAngle = (2 * Math.PI) / wheelConfig.sections.length;
        
        wheelConfig.sections.forEach((section, index) => {
            const startAngle = index * sectionAngle + this.currentRotation;
            const endAngle = startAngle + sectionAngle;
            // console.log(startAngle, endAngle);
            console.log(index)
            // Draw section
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = section.color;
             this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw text
            this.ctx.save();

            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + sectionAngle / 0.2);
            
            // console.log("console startAngle + sectionAngle / 1: ", startAngle + sectionAngle / 1);
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = section.textColor;
            this.ctx.font = 'bold 12px Arial';
            
            // Position text at a radius that radiates towards the center
            const textRadius = radius * 0.69;
            this.ctx.translate(0, -textRadius);
            // console.log("console textRadius: ", Math.PI / 2);
            // Rotate text to be parallel to the radius (pointing towards center)
            this.ctx.rotate(Math.PI / 2);
            
            // For 18 sections, use smaller font and adjust positioning
            const fontSize = wheelConfig.sections.length > 18 ? 10 : 12;
            this.ctx.font = `bold ${fontSize}px Arial`;
            

            this.ctx.fillText(`${section.name}`, 0, 0);
            console.log(`console section.name: ${section.name} and text color: ${section.textColor}`);

            
            this.ctx.restore();
        });
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#03390f';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinSpeed = Math.random() * 0.3 + 0.2; // Random speed between 0.2 and 0.5
        
        // Add some random variation to make it more exciting
        this.spinSpeed += Math.random() * 0.1;
        
        this.animate();
    }
    
    animate() {
        if (this.spinSpeed > this.minSpeed) {
            this.currentRotation += this.spinSpeed;
            this.spinSpeed *= this.friction;
            this.drawWheel();
            requestAnimationFrame(() => this.animate());
        } else {
            this.isSpinning = false;
            // Capture the winning section immediately when the wheel stops
            this.captureWinningSection();
        }
    }
    
    captureWinningSection() {
        // Calculate which section the wheel landed on at the moment it stopped
        const normalizedRotation = (this.currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const sectionAngle = (2 * Math.PI) / wheelConfig.sections.length;
        
        // The wheel sections are drawn starting from the top (12 o'clock position)
        // We need to find which section is currently pointing upward
        // Since the wheel rotates clockwise, we need to reverse the calculation
        const sectionIndex = (wheelConfig.sections.length - Math.floor((normalizedRotation / sectionAngle))) % wheelConfig.sections.length;
        this.winningSection = wheelConfig.sections[sectionIndex];
        
        console.log(`Winning section captured: ${sectionIndex}, Name: ${this.winningSection.name}`);
        console.log(`Normalized rotation: ${normalizedRotation}, Section angle: ${sectionAngle}`);
        
        // Now show the result with the captured winning section
        this.showResult();
    }
    
    showResult() {
        // Use the captured winning section instead of recalculating
        const winningSection = this.winningSection;
        
        // Add a 0.5 second delay before showing the popup
        setTimeout(() => {
            // Update popup content
            document.getElementById('popup-title').textContent = 'Congratulations!';
            document.getElementById('popup-message').textContent = `You won a ${winningSection.name}!`;
            
            // Show popup
            document.getElementById('popup').style.display = 'block';
            
            // Trigger confetti using JSConfetti
            try {
                const canvas = document.getElementById('confetti');
                const jsConfetti = new JSConfetti({ canvas });
                
                jsConfetti.addConfetti({
                    confettiColors: [
                      '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
                    ],
                  })
            } catch (error) {
                console.log('Confetti could not be triggered:', error);
            }
        }, 500); // 500 milliseconds = 0.5 seconds
    }
    
    setupEventListeners() {
        // Click/tap events for the wheel
        this.canvas.addEventListener('click', () => this.spin());
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.spin();
        });
        
        // Click/tap events for the center button
        const centerButton = document.querySelector('.wheel-center');
        centerButton.addEventListener('click', () => this.spin());
        centerButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.spin();
        });
        
        // Close popup
        document.getElementById('close-popup').addEventListener('click', () => {
            document.getElementById('popup').style.display = 'none';
        });
        
        // Close popup when clicking outside
        document.getElementById('popup').addEventListener('click', (e) => {
            if (e.target.id === 'popup') {
                document.getElementById('popup').style.display = 'none';

            }
        });
        
        // Keyboard support for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            } else if (e.code === 'Escape') {
                document.getElementById('popup').style.display = 'none';
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Domain check will be performed in the constructor
    new WheelOfFortune();
});

// Prevent context menu on mobile devices
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Prevent zoom on double tap for mobile devices
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false); 
