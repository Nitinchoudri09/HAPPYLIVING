/* QR Code Scanner Service for PG Booking Payments */

const QRScanner = {
    isScanning: false,
    stream: null,
    videoElement: null,
    canvasElement: null,
    scanningContext: null,
    scanInterval: null,
    modalElement: null,

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
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;

        modal.innerHTML = `
            <div style="background: white; width: 90%; max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.4); animation: slideIn 0.3s ease;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 1.5rem; text-align: center; position: relative;">
                    <button onclick="QRScanner.closeScanner()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
                        <i class="fas fa-times" style="font-size: 14px;"></i>
                    </button>
                    <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700;">PG Booking QR Scanner</h3>
                    <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9;">Scan QR code to complete your PG booking payment</p>
                </div>
                
                <div style="padding: 2rem; text-align: center; background: #f8fafc;">
                    <div style="position: relative; width: 100%; max-width: 300px; margin: 0 auto 1.5rem;">
                        <video id="qr-video" style="width: 100%; border-radius: 12px; background: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></video>
                        <canvas id="qr-canvas" style="display: none;"></canvas>
                        
                        <!-- Scanner overlay -->
                        <div id="scanner-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; border: 3px solid #10b981; border-radius: 12px; pointer-events: none; opacity: 0;">
                            <div style="position: absolute; top: -3px; left: -3px; width: 20px; height: 20px; border-top: 3px solid #10b981; border-left: 3px solid #10b981; border-radius: 12px 0 0 0; animation: scanLine 2s linear infinite;"></div>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; border: 2px solid #10b981; border-radius: 50%; opacity: 0.3;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: #10b981; border-radius: 50%; opacity: 0.6;"></div>
                            </div>
                        </div>
                        
                        <div id="camera-status" style="margin-top: 1rem; padding: 1rem; background: #e5e7eb; border-radius: 8px; color: #6b7280; font-size: 0.9rem;">
                            <i class="fas fa-camera" style="margin-right: 0.5rem;"></i>
                            Initializing camera...
                        </div>
                    </div>
                    
                    <div style="padding: 0 2rem 2rem; text-align: center;">
                        <button id="start-scan-btn" onclick="QRScanner.startScanning()" style="background: #10b981; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-camera" style="margin-right: 0.5rem;"></i>
                            Start Scanner
                        </button>
                        <button onclick="QRScanner.closeScanner()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-left: 1rem; transition: all 0.2s;">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            @keyframes scanLine {
                0% { top: -3px; }
                50% { top: calc(50% - 1px); }
                100% { top: calc(100% + 1px); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },

    // Show scanner modal
    showScanner: function() {
        const modal = document.getElementById('qr-scanner-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.videoElement = document.getElementById('qr-video');
            this.canvasElement = document.getElementById('qr-canvas');
            this.scanningContext = this.canvasElement.getContext('2d');
        }
    },

    // Hide scanner modal
    hideScanner: function() {
        const modal = document.getElementById('qr-scanner-modal');
        if (modal) {
            modal.style.display = 'none';
            this.stopScanning();
        }
    },

    // Close scanner
    closeScanner: function() {
        this.hideScanner();
        // Remove modal from DOM
        if (this.modalElement) {
            this.modalElement.remove();
        }
    },

    // Start scanning
    startScanning: async function() {
        if (this.isScanning) return;
        
        try {
            // Update UI
            document.getElementById('camera-status').innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Requesting camera access...';
            document.getElementById('start-scan-btn').disabled = true;
            document.getElementById('start-scan-btn').innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Starting...';
            
            // Get camera stream
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Set video source
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                this.videoElement.play();
            }
            
            // Update UI
            document.getElementById('camera-status').innerHTML = '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>Camera ready - Position QR code in frame';
            document.getElementById('scanner-overlay').style.opacity = '1';
            
            // Start scanning loop
            this.isScanning = true;
            this.scanInterval = setInterval(() => this.scanFrame(), 500);
            
        } catch (error) {
            console.error('Camera access error:', error);
            document.getElementById('camera-status').innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-right: 0.5rem;"></i>Camera access denied: ${error.message}`;
            document.getElementById('start-scan-btn').disabled = false;
            document.getElementById('start-scan-btn').innerHTML = '<i class="fas fa-camera"></i> Retry';
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
    },

    // Scan frame for QR code
    scanFrame: function() {
        if (!this.videoElement || !this.videoElement.videoWidth || !this.scanningContext) {
            return;
        }
        
        try {
            // Set canvas dimensions to match video
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            
            // Draw video frame to canvas
            this.scanningContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Get image data
            const imageData = this.scanningContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Simulate QR code detection (in production, use a real QR library)
            const qrDetected = this.detectQRCode(imageData);
            
            if (qrDetected) {
                this.onQRCodeDetected(qrDetected);
            }
            
        } catch (error) {
            console.error('Scanning error:', error);
        }
    },

    // Simulate QR code detection (replace with real QR library in production)
    detectQRCode: function(imageData) {
        // For demo purposes, randomly detect QR code after some scans
        // In production, use libraries like jsQR or qr-scanner
        const random = Math.random();
        
        if (random > 0.95) { // 5% chance per frame to detect QR
            return {
                type: 'PG_BOOKING_PAYMENT',
                data: {
                    bookingId: 'BK' + Date.now(),
                    pgName: 'Happy Living PG',
                    amount: 8500,
                    roomType: '2 Sharing',
                    duration: '1 month',
                    studentName: 'Demo Student',
                    email: 'student@example.com',
                    paymentMethod: 'QR_CODE',
                    timestamp: new Date().toISOString()
                },
                raw: 'BK' + Date.now() + '|HAPPY_LIVING|8500|2_SHARING|1_MONTH'
            };
        }
        
        return null;
    },

    // Handle QR code detection
    onQRCodeDetected: function(qrData) {
        // Stop scanning
        this.stopScanning();
        
        // Show success message
        document.getElementById('camera-status').innerHTML = '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>QR Code detected! Processing payment...';
        document.getElementById('scanner-overlay').style.opacity = '0';
        
        // Log the detected QR data
        console.log('QR Code Detected:', qrData);
        
        // Process the payment
        this.processQRPayment(qrData);
    },

    // Process QR payment
    processQRPayment: async function(qrData) {
        try {
            // Show loading
            document.getElementById('camera-status').innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Processing payment...';
            
            // Prepare payment data
            const paymentData = {
                transactionId: 'TXN' + Date.now(),
                amount: qrData.data.amount,
                paymentMethod: 'QR_CODE',
                details: {
                    type: 'PG Booking Payment',
                    bookingId: qrData.data.bookingId,
                    pgName: qrData.data.pgName,
                    roomType: qrData.data.roomType,
                    duration: qrData.data.duration,
                    studentName: qrData.data.studentName,
                    email: qrData.data.email,
                    qrRawData: qrData.raw,
                    timestamp: qrData.data.timestamp
                },
                status: 'Processing'
            };
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update UI with success
            document.getElementById('camera-status').innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <div style="font-weight: 600; color: #10b981; margin-bottom: 0.5rem;">Payment Successful!</div>
                    <div style="font-size: 0.9rem; color: #6b7280; margin-bottom: 1rem;">Transaction ID: ${paymentData.transactionId}</div>
                    <div style="font-size: 0.9rem; color: #6b7280; margin-bottom: 1rem;">Amount: ₹${paymentData.amount.toLocaleString()}</div>
                    <div style="font-size: 0.9rem; color: #6b7280;">PG: ${paymentData.details.pgName}</div>
                    <div style="font-size: 0.9rem; color: #6b7280;">Room: ${paymentData.details.roomType}</div>
                </div>
            `;
            
            // Store payment record
            this.storePaymentRecord(paymentData);
            
            // Close modal after delay
            setTimeout(() => {
                this.closeScanner();
                
                // Show success notification
                if (typeof window !== 'undefined' && window.showToast) {
                    window.showToast('Payment Successful', `PG booking payment of ₹${paymentData.amount.toLocaleString()} completed successfully!`, 'success');
                } else {
                    alert(`PG booking payment of ₹${paymentData.amount.toLocaleString()} completed successfully!\n\nTransaction ID: ${paymentData.transactionId}`);
                }
                
                // Redirect to payment history if on payment page
                if (window.location.pathname.includes('payment')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Payment processing error:', error);
            document.getElementById('camera-status').innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-right: 0.5rem;"></i>
                <div style="color: #ef4444;">Payment Failed: ${error.message}</div>
            `;
        }
    },

    // Store payment record
    storePaymentRecord: function(paymentData) {
        try {
            // Get existing payments
            const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
            
            // Add new payment
            existingPayments.push({
                ...paymentData,
                id: 'PAY_' + Date.now(),
                date: new Date().toISOString(),
                status: 'Completed'
            });
            
            // Save to localStorage
            localStorage.setItem('payments', JSON.stringify(existingPayments));
            
            // Also update user's booking status
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.email === paymentData.details.email) {
                user.bookingStatus = 'Confirmed';
                user.currentBooking = paymentData.details;
                localStorage.setItem('user', JSON.stringify(user));
            }
            
        } catch (error) {
            console.error('Error storing payment record:', error);
        }
    },

    // Get camera status
    getCameraStatus: async function() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            return {
                hasCamera: videoDevices.length > 0,
                devices: videoDevices,
                permissions: 'prompt' in navigator.mediaDevices
            };
        } catch (error) {
            console.error('Error checking camera status:', error);
            return {
                hasCamera: false,
                devices: [],
                permissions: false,
                error: error.message
            };
        }
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    QRScanner.init();
    console.log('QR Scanner Service initialized for PG booking payments');
});
