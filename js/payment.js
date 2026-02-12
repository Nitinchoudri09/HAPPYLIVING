/* Payment Service - Dummy Payment Implementation */

const PaymentService = {
    // Generate dummy transaction ID
    generateTransactionId: function() {
        return 'TXN' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    },

    // Generate student credentials
    generateCredentials: function(email) {
        // Generate username from email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        // Generate password
        const password = 'HL' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.floor(Math.random() * 100);
        return { username, password };
    },

    // Initiate dummy payment
    initiatePayment: function(amount, paymentMethod, details) {
        return new Promise((resolve) => {
            // Simulate payment processing delay
            setTimeout(() => {
                const transactionId = PaymentService.generateTransactionId();
                
                const payment = {
                    id: Date.now(),
                    transactionId: transactionId,
                    amount: amount,
                    paymentMethod: paymentMethod,
                    details: details,
                    status: 'Completed',
                    timestamp: new Date().toISOString(),
                    type: details.type || 'Payment'
                };
                
                // Store payment
                const payments = JSON.parse(localStorage.getItem('payments') || '[]');
                payments.unshift(payment);
                localStorage.setItem('payments', JSON.stringify(payments));
                
                resolve(payment);
            }, 2000); // 2 second delay to simulate processing
        });
    },

    // Save payment details
    savePaymentDetails: function(payment, bookingDetails) {
        const paymentRecord = {
            ...payment,
            bookingDetails: bookingDetails,
            savedAt: new Date().toISOString()
        };
        
        const records = JSON.parse(localStorage.getItem('payment_records') || '[]');
        records.unshift(paymentRecord);
        localStorage.setItem('payment_records', JSON.stringify(records));
        
        return paymentRecord;
    },

    // Show payment success
    showPaymentSuccess: function(payment, credentials, bookingDetails) {
        // This will be handled by the UI
        return {
            success: true,
            payment: payment,
            credentials: credentials,
            bookingDetails: bookingDetails,
            message: 'Payment completed successfully!'
        };
    },

    // Get payment by transaction ID
    getPaymentByTransactionId: function(transactionId) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        return payments.find(p => p.transactionId === transactionId);
    },

    // Get all payments
    getAllPayments: function() {
        return JSON.parse(localStorage.getItem('payments') || '[]');
    }
};

// Export
window.PaymentService = PaymentService;
