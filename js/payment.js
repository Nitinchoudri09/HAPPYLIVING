/* Payment Service - Dummy Payment Implementation */

const PaymentService = {
    // Generate dummy transaction ID
    generateTransactionId: function () {
        return 'TXN' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    },

    // Generate student credentials
    generateCredentials: function (email) {
        // Generate username from email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        // Generate password
        const password = 'HL' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.floor(Math.random() * 100);
        return { username, password };
    },

    // Initiate dummy payment
    initiatePayment: function (amount, paymentMethod, details) {
        return new Promise((resolve, reject) => {
            if (!amount || !paymentMethod) {
                reject(new Error('Amount and Payment Method are required'));
                return;
            }

            // Create Gateway Modal
            const modalId = 'payment-gateway-modal';
            let modal = document.getElementById(modalId);
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.style = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                    background: rgba(0,0,0,0.8); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                `;
                document.body.appendChild(modal);
            }

            const renderUI = (content) => {
                modal.innerHTML = `
                    <div style="background: white; width: 90%; max-width: 450px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                        <div style="background: #4f46e5; color: white; padding: 1.5rem; text-align: center;">
                            <h3 style="margin: 0;">Happy Living Payment Gateway</h3>
                            <p style="margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9;">Secure Dummy Transaction</p>
                        </div>
                        <div style="padding: 2rem;">
                            ${content}
                        </div>
                        <div style="padding: 1rem; text-align: center; border-top: 1px solid #f1f5f9; font-size: 0.8rem; color: #64748b;">
                             <i class="fas fa-lock"></i> 128-bit Encryption (Simulated)
                        </div>
                    </div>
                `;
            };

            const showProcessing = () => {
                renderUI(`
                    <div style="text-align: center; padding: 1rem;">
                        <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                        <h4 style="margin: 0; color: #1e293b;">Processing your payment...</h4>
                        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Please do not refresh or close this window.</p>
                    </div>
                `);

                setTimeout(() => {
                    completePayment();
                }, 2500);
            };

            const completePayment = async () => {
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

                try {
                    const API_BASE_URL = window.API_BASE_URL || 'https://api.yourdomain.com/v1';
                    const response = await fetch(`${API_BASE_URL}/payments/process`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        },
                        body: JSON.stringify(payment)
                    });
                    if (response.ok) {
                        const data = await response.json();
                        payment.transactionId = data.transactionId || payment.transactionId;
                    } else {
                        console.warn('API /payments/process failed, falling back to local storage');
                    }
                } catch (error) {
                    console.warn('API connection failed during payment, using fallback', error);
                }

                // Store payment
                const payments = await PaymentService.getAllPayments();
                payments.unshift(payment);
                localStorage.setItem('payments', JSON.stringify(payments));

                renderUI(`
                    <div style="text-align: center;">
                        <div style="background: #dcfce7; color: #166534; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 1.8rem;">
                            <i class="fas fa-check"></i>
                        </div>
                        <h3 style="color: #166534; margin: 0;">Payment Successful!</h3>
                        <p style="color: #64748b; font-size: 0.9rem; margin: 1rem 0;">Transaction ID: ${transactionId}</p>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: left; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: #64748b;">Amount Paid:</span>
                                <span style="font-weight: 600;">₹${amount.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #64748b;">Merchant:</span>
                                <span style="font-weight: 600;">Happy Living PG</span>
                            </div>
                        </div>
                        <button id="close-gateway-btn" style="width: 100%; padding: 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Return to Merchant</button>
                    </div>
                `);

                document.getElementById('close-gateway-btn').onclick = () => {
                    modal.style.display = 'none';
                    resolve(payment);
                };
            };

            // Start Flow
            modal.style.display = 'flex';
            renderUI(`
                <div style="margin-bottom: 2rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem;">
                    <p style="color: #64748b; margin: 0; font-size: 0.9rem;">Paying to</p>
                    <h4 style="margin: 0.25rem 0 0; color: #1e293b;">Happy Living PG Management</h4>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <span style="font-size: 1.1rem; color: #1e293b;">Total Amount:</span>
                    <span style="font-size: 1.5rem; font-weight: 800; color: #4f46e5;">₹${amount.toLocaleString()}</span>
                </div>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: #1e40af;">
                        <i class="fas fa-info-circle"></i> You have selected <strong>${paymentMethod}</strong> as your payment method.
                    </p>
                </div>
                <button id="pay-now-btn" style="width: 100%; padding: 1rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                    Secure Pay ₹${amount.toLocaleString()}
                </button>
                <button id="cancel-pay-btn" style="width: 100%; margin-top: 1rem; background: transparent; color: #ef4444; border: none; font-size: 0.9rem; cursor: pointer;">Cancel Payment</button>
            `);

            document.getElementById('pay-now-btn').onclick = showProcessing;
            document.getElementById('cancel-pay-btn').onclick = () => {
                modal.style.display = 'none';
                reject(new Error('Payment cancelled by user'));
            };
        });
    },

    // Compatibility method
    processPayment: function (amount, type, method, details, email, name) {
        return this.initiatePayment(amount, method || 'Online', {
            ...details,
            type: type,
            email: email,
            studentName: name
        });
    },

    // Get all payments
    getAllPayments: async function () {
        try {
            const API_BASE_URL = window.API_BASE_URL || 'https://api.yourdomain.com/v1';
            const response = await fetch(`${API_BASE_URL}/payments`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('payments', JSON.stringify(data));
                return data;
            }
        } catch (error) {
            console.warn('API fetch failed for payments', error);
        }
        return JSON.parse(localStorage.getItem('payments') || '[]');
    }
};

// Export
window.PaymentService = PaymentService;
