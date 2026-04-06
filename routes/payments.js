const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '1234567890'
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// In-memory storage for demo (replace with database in production)
const payments = [];
const orders = [];

// Create payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${uuidv4()}`,
      notes: notes || {},
      payment_capture: 1
    };

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(orderData);

    // Store order details
    const order = {
      id: razorpayOrder.id,
      amount: amount,
      currency: currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
      status: 'created',
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        notes: razorpayOrder.notes
      },
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Process payment (verify and record)
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { 
      transactionId, 
      amount, 
      paymentMethod, 
      details,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature 
    } = req.body;

    // For demo, we'll accept payments without Razorpay verification
    // In production, you should verify the payment signature here
    const payment = {
      id: uuidv4(),
      transactionId: transactionId || `TXN${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      amount: amount,
      paymentMethod: paymentMethod || 'UPI',
      details: details || {},
      status: 'Completed',
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      razorpayOrderId,
      razorpayPaymentId
    };

    payments.push(payment);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        timestamp: payment.timestamp
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get payment history for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userPayments = payments.filter(p => p.userId === req.user.userId);
    
    // Sort by timestamp (newest first)
    userPayments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(userPayments);

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment by ID
router.get('/:paymentId', authenticateToken, (req, res) => {
  try {
    const payment = payments.find(p => 
      p.id === req.params.paymentId && p.userId === req.user.userId
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Refund payment (demo implementation)
router.post('/:paymentId/refund', authenticateToken, (req, res) => {
  try {
    const payment = payments.find(p => 
      p.id === req.params.paymentId && p.userId === req.user.userId
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment cannot be refunded' });
    }

    // Update payment status
    payment.status = 'Refunded';
    payment.refundedAt = new Date().toISOString();
    payment.refundReason = req.body.reason || 'Customer request';

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        refundedAt: payment.refundedAt
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get payment statistics (for admin dashboard)
router.get('/stats/summary', authenticateToken, (req, res) => {
  try {
    const userPayments = payments.filter(p => p.userId === req.user.userId);
    
    const stats = {
      totalPayments: userPayments.length,
      totalAmount: userPayments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: userPayments.filter(p => p.status === 'Completed').length,
      refundedPayments: userPayments.filter(p => p.status === 'Refunded').length,
      recentPayments: userPayments.slice(0, 5)
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

module.exports = router;
