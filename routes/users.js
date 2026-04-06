const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In-memory storage for demo (replace with database in production)
const users = [];
const allocations = [];

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

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    const { password, resetOTP, resetOTPExpires, ...safeUser } = user;

    res.json(safeUser);

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, address, emergencyContact } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (address) users[userIndex].address = address;
    if (emergencyContact) users[userIndex].emergencyContact = emergencyContact;

    const { password, resetOTP, resetOTPExpires, ...safeUser } = users[userIndex];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get room allocation
router.get('/allocation', authenticateToken, (req, res) => {
  try {
    const allocation = allocations.find(a => a.studentId === req.user.userId);
    
    if (!allocation) {
      // Return default allocation for demo
      return res.json({
        studentId: req.user.userId,
        pg: 'Sunrise Residency',
        room: '101',
        type: '2 Sharing',
        floor: '1st Floor',
        monthlyRent: 8500,
        status: 'Active',
        allocatedAt: new Date().toISOString()
      });
    }

    res.json(allocation);

  } catch (error) {
    console.error('Error fetching allocation:', error);
    res.status(500).json({ error: 'Failed to fetch allocation' });
  }
});

// Get mess subscription
router.get('/mess-subscription', authenticateToken, (req, res) => {
  try {
    // Return default subscription for demo
    const subscription = {
      studentId: req.user.userId,
      plan: 'Gold',
      amount: 3500,
      dietaryPreference: 'Veg',
      status: 'Active',
      currentMonth: 'January 2026',
      nextBillingDate: '2026-02-01',
      subscribedAt: new Date().toISOString()
    };

    res.json(subscription);

  } catch (error) {
    console.error('Error fetching mess subscription:', error);
    res.status(500).json({ error: 'Failed to fetch mess subscription' });
  }
});

// Update mess subscription
router.put('/mess-subscription', authenticateToken, (req, res) => {
  try {
    const { plan, dietaryPreference } = req.body;
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    const validPlans = ['Silver', 'Gold', 'Platinum'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const validPreferences = ['Veg', 'Non-Veg'];
    if (dietaryPreference && !validPreferences.includes(dietaryPreference)) {
      return res.status(400).json({ error: 'Invalid dietary preference' });
    }

    const planAmounts = { Silver: 2500, Gold: 3500, Platinum: 5000 };

    const subscription = {
      studentId: req.user.userId,
      plan,
      amount: planAmounts[plan],
      dietaryPreference: dietaryPreference || 'Veg',
      status: 'Active',
      currentMonth: 'January 2026',
      nextBillingDate: '2026-02-01',
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Mess subscription updated successfully',
      subscription
    });

  } catch (error) {
    console.error('Error updating mess subscription:', error);
    res.status(500).json({ error: 'Failed to update mess subscription' });
  }
});

// Get dashboard data
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      allocation: {
        pg: 'Sunrise Residency',
        room: '101',
        type: '2 Sharing',
        floor: '1st Floor',
        monthlyRent: 8500
      },
      messSubscription: {
        plan: 'Gold',
        amount: 3500,
        dietaryPreference: 'Veg',
        status: 'Active'
      },
      notifications: [
        {
          id: 1,
          type: 'payment',
          message: 'Rent for January 2026 is due',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'mess',
          message: 'Mess menu updated for this week',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      quickStats: {
        totalPaid: 12000,
        totalDue: 8500,
        nextDueDate: '2026-01-05',
        messDaysRemaining: 15
      }
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
