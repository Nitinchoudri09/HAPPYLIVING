/* QR Code Scanner Service for Payments */

const QRScanner = {
    isScanning: false,
    stream: null,
    videoElement: null,
    canvasElement: null,
    scanningContext: null,
    scanInterval: null,

    // Initialize QR Scanner
    init: function() {
        // Create scanner modal if it doesn't exist
        if (!document.getElementById('qr-scanner-modal')) {
            this.createScannerModal();
        }
    },

    // Create scanner modal
    createScannerModal: function() {
        const modal = document.createElement('div');
        modal.id = 'qr-scanner-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="background: white; width: 90%; max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; text-align: center;">
                    <h3 style="margin: 0; font-size: 1.2rem;">QR Code Scanner</h3>
                    <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9;">Scan QR code for payment</p>
                </div>
                
                <div style="padding: 2rem; text-align: center;">
                    <div style="position: relative; width: 100%; max-width: 300px; margin: 0 auto 1.5rem;">
                        <video id="qr-video" style="width: 100%; border-radius: 12px; background: #000;"></video>
                        <canvas id="qr-canvas" style="display: none;"></canvas>
                        
                        <!-- Scanner overlay -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; border: 3px solid #667eea; border-radius: 12px; pointer-events: none;">
                            <div style="position: absolute; top: -3px; left: -3px; width: 20px; height: 20px; border-top: 3px solid #667eea; border-left: 3px solid #667eea; border-radius: 12px 0 0 0;"></div>
                            <div style="position: absolute; top: -3px; right: -3px; width: 20px; height: 20px; border-top: 3px solid #667eea; border-right: 3px solid #667eea; border-radius: 0 12px 0 0;"></div>
                            <div style="position: absolute; bottom: -3px; left: -3px; width: 20px; height: 20px; border-bottom: 3px solid #667eea; border-left: 3px solid #667eea; border-radius: 0 0 0 12px;"></div>
                            <div style="position: absolute; bottom: -3px; right: -3px; width: 20px; height: 20px; border-bottom: 3px solid #667eea; border-right: 3px solid #667eea; border-radius: 0 0 12px 0;"></div>
                            
                            <!-- Scanning line animation -->
                            <div id="scan-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #667eea, transparent); animation: scan 2s linear infinite;"></div>
                        </div>
                    </div>
                    
                    <div id="scan-result" style="display: none; margin: 1rem 0; padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; text-align: left;">
                        <h4 style="margin: 0 0 0.5rem; color: #0c4a6e;">QR Code Detected!</h4>
                        <p id="qr-data" style="margin: 0; font-family: monospace; font-size: 0.85rem; color: #0f172a; word-break: break-all;"></p>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="start-scan-btn" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <i class="fa-solid fa-camera"></i> Start Scanner
                        </button>
                        <button id="stop-scan-btn" style="display: none; padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <i class="fa-solid fa-stop"></i> Stop Scanner
                        </button>
                        <button id="close-scanner-btn" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <i class="fa-solid fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: calc(100% - 3px); }
                    100% { top: 0; }
                }
            </style>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('start-scan-btn').addEventListener('click', () => this.startScanning());
        document.getElementById('stop-scan-btn').addEventListener('click', () => this.stopScanning());
        document.getElementById('close-scanner-btn').addEventListener('click', () => this.closeScanner());
    },

    // Start scanning
    startScanning: async function() {
        try {
            this.videoElement = document.getElementById('qr-video');
            this.canvasElement = document.getElementById('qr-canvas');
            this.scanningContext = this.canvasElement.getContext('2d');

            // Get camera stream
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            this.videoElement.srcObject = this.stream;
            this.videoElement.play();

            // Wait for video to be ready
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                this.isScanning = true;
                
                // Update UI
                document.getElementById('start-scan-btn').style.display = 'none';
                document.getElementById('stop-scan-btn').style.display = 'block';
                
                // Start scanning loop
                this.scanQRCode();
            };

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError('Unable to access camera. Please check permissions.');
        }
    },

    // Stop scanning
    stopScanning: function() {
        this.isScanning = false;
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        // Update UI
        document.getElementById('start-scan-btn').style.display = 'block';
        document.getElementById('stop-scan-btn').style.display = 'none';
    },

    // Scan QR Code
    scanQRCode: function() {
        if (!this.isScanning) return;

        try {
            this.scanningContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            const imageData = this.scanningContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Try to decode QR code (using a simple pattern detection for demo)
            const qrData = this.decodeQRCode(imageData);
            
            if (qrData) {
                this.handleQRCodeDetected(qrData);
                this.stopScanning();
                return;
            }

        } catch (error) {
            console.error('Error scanning QR code:', error);
        }

        // Continue scanning
        this.scanInterval = setTimeout(() => this.scanQRCode(), 300);
    },

    // Decode QR Code (simplified for demo - in production use a proper QR library)
    decodeQRCode: function(imageData) {
        // This is a simplified demo implementation
        // In production, use a library like jsQR or qr-scanner
        
        // For demo purposes, we'll simulate QR detection
        // In reality, you'd use a proper QR code decoding library
        
        // Simulate detection after some time for demo
        if (Math.random() < 0.05) { // 5% chance per frame
            return this.generateMockQRData();
        }
        
        return null;
    },

    // Generate mock QR data for demo
    generateMockQRData: function() {
        return {
            type: 'payment',
            bank: 'Union Bank Of India',
            account: '8549',
            upiId: 'happyliving@unionbank',
            amount: 8500,
            merchant: 'Happy Living PG',
            description: 'PG Booking Payment'
        };
    },

    // Handle QR Code detection
    handleQRCodeDetected: function(qrData) {
        const resultDiv = document.getElementById('scan-result');
        const qrDataDiv = document.getElementById('qr-data');
        
        resultDiv.style.display = 'block';
        qrDataDiv.textContent = JSON.stringify(qrData, null, 2);
        
        // Auto-process payment after 2 seconds
        setTimeout(() => {
            this.processQRPayment(qrData);
        }, 2000);
    },

    // Process QR payment
    processQRPayment: async function(qrData) {
        try {
            // Show processing
            this.showProcessing();
            
            // Create payment object
            const payment = {
                type: 'QR Payment',
                amount: qrData.amount || 8500,
                method: 'QR Code',
                bank: qrData.bank,
                account: qrData.account,
                upiId: qrData.upiId,
                merchant: qrData.merchant,
                description: qrData.description,
                timestamp: new Date().toISOString(),
                status: 'Processing'
            };

            // Send to backend for processing
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';
            const response = await fetch(`${API_BASE_URL}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    transactionId: `QR${Date.now()}`,
                    amount: payment.amount,
                    paymentMethod: 'QR_CODE',
                    details: payment
                })
            });

            if (response.ok) {
                const data = await response.json();
                payment.status = 'Completed';
                payment.transactionId = data.payment?.transactionId;
                
                this.showSuccess(payment);
                setTimeout(() => this.closeScanner(), 3000);
            } else {
                throw new Error('Payment processing failed');
            }

        } catch (error) {
            console.error('QR Payment error:', error);
            this.showError('Payment failed. Please try again.');
        }
    },

    // Show processing state
    showProcessing: function() {
        const resultDiv = document.getElementById('scan-result');
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                <h4 style="margin: 0; color: #1e293b;">Processing Payment...</h4>
                <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Please wait while we process your payment</p>
            </div>
        `;
    },

    // Show success state
    showSuccess: function(payment) {
        const resultDiv = document.getElementById('scan-result');
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="background: #dcfce7; color: #166534; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.8rem;">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h4 style="color: #166534; margin: 0;">Payment Successful!</h4>
                <p style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0;">Transaction ID: ${payment.transactionId}</p>
                <p style="color: #1e293b; font-weight: 600; margin: 0.5rem 0;">Amount: ₹${payment.amount.toLocaleString()}</p>
            </div>
        `;
    },

    // Show error state
    showError: function(message) {
        const resultDiv = document.getElementById('scan-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem; background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px;">
                <div style="background: #fef2f2; color: #dc2626; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.8rem;">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                </div>
                <h4 style="color: #dc2626; margin: 0;">Error</h4>
                <p style="color: #7f1d1d; font-size: 0.9rem; margin: 0.5rem 0;">${message}</p>
            </div>
        `;
    },

    // Show scanner modal
    showScanner: function() {
        const modal = document.getElementById('qr-scanner-modal');
        modal.style.display = 'flex';
    },

    // Close scanner
    closeScanner: function() {
        this.stopScanning();
        const modal = document.getElementById('qr-scanner-modal');
        modal.style.display = 'none';
        
        // Reset result
        const resultDiv = document.getElementById('scan-result');
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = `
            <h4 style="margin: 0 0 0.5rem; color: #0c4a6e;">QR Code Detected!</h4>
            <p id="qr-data" style="margin: 0; font-family: monospace; font-size: 0.85rem; color: #0f172a; word-break: break-all;"></p>
        `;
    }
};

// Export
window.QRScanner = QRScanner;
