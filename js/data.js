/* Data Store for Happy Living */

// --- Persistence Helper ---
const DB = {
    init: () => {
        // Data Version Control (increment to force update)
        const currentVersion = '1.4';
        const savedVersion = localStorage.getItem('happyLiving_DataVersion');

        if (savedVersion !== currentVersion) {
            localStorage.setItem('happyLiving_PGs', JSON.stringify(PGs_Static));
            localStorage.setItem('happyLiving_Menu', JSON.stringify(WeeklyMenu_Static));
            localStorage.setItem('happyLiving_DataVersion', currentVersion);
        }

        if (!localStorage.getItem('happyLiving_Allocations')) {
            localStorage.setItem('happyLiving_Allocations', JSON.stringify(Allocations_Static));
        }
    },
    get: (key) => JSON.parse(localStorage.getItem(key)),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    updateMenu: (day, type, items) => {
        const menu = DB.get('happyLiving_Menu');
        menu[day][type] = items.split(',').map(s => s.trim());
        DB.set('happyLiving_Menu', menu);
    }
};

// --- Static Data (Initial) ---
const PGs_Static = [
    {
        id: 1,
        name: "Happy Living Premium PG",
        address: "Near College Road",
        sharingVariants: { 2: 9500, 3: 7500, 4: 6000 },
        rating: 4.8,
        type: "Co-Ed",
        image: "../assets/pg_modern_1.png",
        amenities: ["WiFi", "Mess", "Power Backup", "Water Supply"],
        messOptions: [{ id: 101, name: "Premium Mess", price: 0, rating: 4.8 }] // Included
    },
    {
        id: 2,
        name: "Green Nest Student PG",
        address: "City Center",
        sharingVariants: { 2: 9000, 3: 7200, 4: 5800 },
        rating: 4.5,
        type: "Girls",
        image: "../assets/pg_cozy_1.png",
        amenities: ["WiFi", "Mess", "Laundry", "CCTV"],
        messOptions: [{ id: 102, name: "Green Mess", price: 0, rating: 4.5 }]
    },
    {
        id: 3,
        name: "Sunrise Comfort PG",
        address: "Near Bus Stand",
        sharingVariants: { 2: 8800, 3: 7000, 4: 5500 },
        rating: 4.2,
        type: "Boys",
        image: "../assets/pg_exterior.png",
        amenities: ["WiFi", "Mess", "Water Supply"],
        messOptions: [{ id: 103, name: "Sunrise Foods", price: 0, rating: 4.2 }]
    },
    {
        id: 4,
        name: "Royal Stay PG & Mess",
        address: "Main Market Area",
        sharingVariants: { 2: 10000, 3: 8000, 4: 6500 },
        rating: 4.9,
        type: "Co-Ed",
        image: "../assets/pg_rooftop.png",
        amenities: ["WiFi", "AC", "Mess", "Gym"],
        messOptions: [{ id: 104, name: "Royal Dining", price: 0, rating: 4.9 }]
    },
    {
        id: 5,
        name: "Safe Home Boys PG",
        address: "Near Tech Park",
        sharingVariants: { 2: 9200, 3: 7400, 4: 5900 },
        rating: 4.4,
        type: "Boys",
        image: "../assets/pg_modern_1.png",
        amenities: ["WiFi", "Mess", "Security"],
        messOptions: [{ id: 105, name: "Homely Mess", price: 0, rating: 4.4 }]
    },
    {
        id: 6,
        name: "Comfort Zone PG",
        address: "Residential Area",
        sharingVariants: { 2: 8500, 3: 6800, 4: 5300 },
        rating: 4.0,
        type: "Girls",
        image: "../assets/pg_cozy_1.png",
        amenities: ["WiFi", "Mess", "Garden"],
        messOptions: [{ id: 106, name: "Comfort Foods", price: 0, rating: 4.0 }]
    },
    {
        id: 7,
        name: "Student Hub PG",
        address: "Near University Gate",
        sharingVariants: { 2: 9800, 3: 7800, 4: 6200 },
        rating: 4.6,
        type: "Co-Ed",
        image: "../assets/pg_mess_1.png",
        amenities: ["WiFi", "Mess", "Library"],
        messOptions: [{ id: 107, name: "Hub Mess", price: 0, rating: 4.6 }]
    },
    {
        id: 8,
        name: "Urban Living PG",
        address: "Downtown",
        sharingVariants: { 2: 10500, 3: 8300, 4: 6700 },
        rating: 4.7,
        type: "Boys",
        image: "../assets/pg_rooftop.png",
        amenities: ["WiFi", "AC", "Mess", "Laundry"],
        messOptions: [{ id: 108, name: "Urban Bites", price: 0, rating: 4.7 }]
    },
    {
        id: 9,
        name: "Smart Stay PG",
        address: "Near Metro Station",
        sharingVariants: { 2: 9000, 3: 7000, 4: 5600 },
        rating: 4.3,
        type: "Girls",
        image: "../assets/pg_interior_2.png",
        amenities: ["WiFi", "Mess", "Metro Access"],
        messOptions: [{ id: 109, name: "Smart Kitchen", price: 0, rating: 4.3 }]
    },
    {
        id: 10,
        name: "Golden Leaf PG & Mess",
        address: "Quiet Zone",
        sharingVariants: { 2: 8700, 3: 6900, 4: 5400 },
        rating: 4.5,
        type: "Co-Ed",
        image: "../assets/pg_modern_1.png",
        amenities: ["WiFi", "Mess", "Study Room"],
        messOptions: [{ id: 110, name: "Golden Spoon", price: 0, rating: 4.5 }]
    }
];

const VendorMenus = {
    101: { special: "Spicy Chicken Biryani", items: ["Chicken Curry", "Rice", "Raita", "Salad"] },
    102: { special: "Thali Special", items: ["Dal Makhani", "Paneer", "Rice", "Naan"] },
    103: { special: "Keto Salad Bowl", items: ["Grilled Chicken", "Lettuce", "Avocado", "Dressing"] },
    104: { special: "Ghar ka Khana", items: ["Aloo Gobi", "Dal Fry", "Roti", "Rice"] },
    105: { special: "Chef's Pasta", items: ["White Sauce Pasta", "Garlic Bread", "Coke"] },
    106: { special: "Misal Pav", items: ["Misal", "Pav", "Farsan", "Buttermilk"] },
    107: { special: "Fish Curry", items: ["Rohu Fish Curry", "Rice", "Bhaja"] },
    108: { special: "Hyderabadi Dum Biryani", items: ["Mutton Biryani", "Mirchi ka Salan", "Raita"] },
    109: { special: "Dhokla & Fafda", items: ["Khaman", "Kadhi", "Jalebi"] },
    110: { special: "Vada Pav Combo", items: ["2 Vada Pav", "Chutney", "Fried Chilli", "Tea"] },
    111: { special: "Dosa Platter", items: ["Masala Dosa", "Idli", "Vada", "Sambar"] },
    112: { special: "Dal Baati Churma", items: ["Dal", "Baati", "Churma", "Gatte ki Sabzi"] },
    113: { special: "Royal Thali", items: ["Butter Chicken", "Biryani", "Naan", "Raita", "Dessert"] },
    114: { special: "Coastal Fish Curry", items: ["Pomfret Fry", "Rice", "Coconut Curry", "Appam"] },
    115: { special: "Garden Fresh Salad", items: ["Quinoa Bowl", "Grilled Vegetables", "Hummus", "Fresh Juice"] },
    116: { special: "Home Style Thali", items: ["Dal Tadka", "Aloo Matar", "Roti", "Rice", "Pickle"] },
    117: { special: "Tech Special Burger", items: ["Chicken Burger", "French Fries", "Coke", "Dessert"] },
    118: { special: "Quick Wrap Combo", items: ["Chicken Wrap", "Salad", "Soup", "Juice"] },
    119: { special: "Nawabi Biryani", items: ["Mutton Biryani", "Mirchi ka Salan", "Raita", "Shahi Tukda"] },
    120: { special: "Traditional South Thali", items: ["Sambar", "Rasam", "Curry", "Rice", "Papad"] },
    121: { special: "Kerala Fish Curry", items: ["Karimeen Fry", "Rice", "Avial", "Pappadam"] },
    122: { special: "Kerala Sadya", items: ["Rice", "Sambar", "Aviyal", "Olan", "Pachadi", "Payasam"] },
    123: { special: "Campus Special Meal", items: ["Rajma Chawal", "Roti", "Salad", "Lassi"] },
    124: { special: "Student Thali", items: ["Dal", "Sabzi", "Roti", "Rice", "Sweet"] },
    125: { special: "Fine Dining Platter", items: ["Grilled Salmon", "Mashed Potatoes", "Asparagus", "Wine"] },
    126: { special: "Gourmet Pasta", items: ["Truffle Pasta", "Garlic Bread", "Caesar Salad", "Tiramisu"] },
    127: { special: "Economy Thali", items: ["Dal", "Aloo Sabzi", "Roti", "Rice"] },
    128: { special: "Budget Meal", items: ["Khichdi", "Kadhi", "Papad", "Pickle"] },
    129: { special: "Healthy Bowl", items: ["Brown Rice", "Grilled Chicken", "Steamed Veggies", "Tahini"] },
    130: { special: "Organic Thali", items: ["Organic Dal", "Farm Fresh Vegetables", "Whole Wheat Roti", "Brown Rice"] },
    131: { special: "Metro Quick Meal", items: ["Fried Rice", "Manchurian", "Soup", "Noodles"] },
    132: { special: "Express Thali", items: ["Dal Fry", "Mix Veg", "Roti", "Rice", "Salad"] },
    133: { special: "Goan Fish Curry", items: ["Kingfish Curry", "Rice", "Kokum", "Poi"] },
    134: { special: "Seafood Platter", items: ["Prawns Curry", "Fish Fry", "Rice", "Salad"] },
    135: { special: "Study Meal", items: ["Khichdi", "Kadhi", "Papad", "Buttermilk"] },
    136: { special: "Brain Booster Thali", items: ["Omega-3 Rich Fish", "Brown Rice", "Nuts", "Fruits"] },
    137: { special: "Elite Continental", items: ["Grilled Chicken", "Mashed Potatoes", "Vegetables", "Dessert"] },
    138: { special: "Premium Thali", items: ["Paneer Butter Masala", "Dal Makhani", "Naan", "Biryani", "Ice Cream"] },
    139: { special: "City Special Meal", items: ["Butter Chicken", "Naan", "Rice", "Raita", "Gulab Jamun"] },
    140: { special: "Urban Thali", items: ["Dal Makhani", "Paneer Tikka", "Roti", "Jeera Rice", "Salad"] },
    141: { special: "Hill Station Special", items: ["Mutton Curry", "Rice", "Local Vegetables", "Tea"] },
    142: { special: "Organic Farm Thali", items: ["Organic Dal", "Seasonal Vegetables", "Millet Roti", "Brown Rice", "Honey"] }
};

const WeeklyMenu_Static = {
    "Sunday": {
        Breakfast: ["Idli", "Sambar", "Tea"],
        Lunch: ["Rice", "Dal", "Veg Curry", "Curd"],
        Snacks: ["Samosa", "Coffee"],
        Dinner: ["Chapati", "Paneer Curry", "Rice"]
    },
    "Monday": {
        Breakfast: ["Poha", "Banana", "Milk"],
        Lunch: ["Rice", "Sambar", "Beetroot Curry"],
        Snacks: ["Biscuits", "Tea"],
        Dinner: ["Chapati", "Dal Fry", "Veg Kurma"]
    },
    "Tuesday": {
        Breakfast: ["Upma", "Chutney", "Coffee"],
        Lunch: ["Lemon Rice", "Potato Fry", "Curd"],
        Snacks: ["Bajji", "Tea"],
        Dinner: ["Roti", "Mixed Veg Curry", "Rice"]
    },
    "Wednesday": {
        Breakfast: ["Dosa", "Sambar", "Chutney"],
        Lunch: ["Veg Biryani", "Raita", "Salad"],
        Snacks: ["Sandwich", "Coffee"],
        Dinner: ["Chapati", "Chicken Curry/Veg Kofta"]
    },
    "Thursday": {
        Breakfast: ["Pongal", "Vada", "Chutney"],
        Lunch: ["Rice", "Rasam", "Cabbage Poriyal"],
        Snacks: ["Cake", "Tea"],
        Dinner: ["Phulka", "Aloo Gobi", "Dal"]
    },
    "Friday": {
        Breakfast: ["Vada Pav", "Chutney", "Tea"],
        Lunch: ["Fried Rice", "Manchurian", "Salad"],
        Snacks: ["Sausage/Cutlet", "Coffee"],
        Dinner: ["Roti", "Palak Paneer", "Rice"]
    },
    "Saturday": {
        Breakfast: ["Puri", "Bhaji", "Milk"],
        Lunch: ["Rice", "Dal Makhani", "Jeera Rice"],
        Snacks: ["Puff", "Tea"],
        Dinner: ["Pasta", "Garlic Bread", "Soup"]
    }
};

const Allocations_Static = [
    { student: "John Doe", room: "101", pg: "Happy Living Premium PG", type: "2 Sharing" },
    { student: "Amit Patel", room: "101", pg: "Happy Living Premium PG", type: "2 Sharing" },
    { student: "Sneha Gupta", room: "204", pg: "Green Nest Student PG", type: "3 Sharing" },
    { student: "Rahul Verma", room: "105", pg: "Royal Stay PG & Mess", type: "4 Sharing" },
    { student: "Priya Singh", room: "302", pg: "Green Nest Student PG", type: "2 Sharing" },
    { student: "Vikram Malhotra", room: "102", pg: "Safe Home Boys PG", type: "2 Sharing" },
    { student: "Anjali Rao", room: "201", pg: "Smart Stay PG", type: "3 Sharing" }
];

// Initialize Data
DB.init();

// Export accessors (using var/window to be global in browser)
window.getData = {
    PGs: () => {
        const pgs = DB.get('happyLiving_PGs');
        return (pgs && pgs.length > 0) ? pgs : PGs_Static;
    },
    Menu: () => DB.get('happyLiving_Menu') || WeeklyMenu_Static,
    Allocations: () => DB.get('happyLiving_Allocations') || Allocations_Static,
    VendorMenu: (id) => VendorMenus[id] || { special: "Standard Meal", items: ["Rice", "Dal", "Veggie"] }
};

// Subscription Tiers Configuration
const SubscriptionTiers = {
    Silver: {
        name: "Silver",
        multiplier: 1.0,
        features: ["2 Meals/Day", "Basic Menu", "Standard Service"],
        color: "#94a3b8"
    },
    Gold: {
        name: "Gold",
        multiplier: 1.3,
        features: ["3 Meals/Day", "Premium Menu", "Priority Service", "Extra Snacks"],
        color: "#fbbf24"
    },
    Platinum: {
        name: "Platinum",
        multiplier: 1.6,
        features: ["3 Meals/Day", "Gourmet Menu", "VIP Service", "Unlimited Snacks", "Special Dishes"],
        color: "#8b5cf6"
    }
};

// Laundry Configuration
const LaundryPlans = {
    Monthly: {
        name: "Monthly Subscription",
        price: 600,
        description: "Unlimited laundry (up to 40 clothes/month)",
        features: ["Washing", "Ironing", "48h Delivery"]
    },
    PerCloth: {
        name: "Pay Per Cloth",
        price: 15,
        description: "Pay only for what you wash",
        features: ["Washing", "Ironing", "24h Delivery"]
    }
};

// Initialize Laundry Data
if (!localStorage.getItem('happyLiving_LaundrySubs')) {
    localStorage.setItem('happyLiving_LaundrySubs', JSON.stringify([]));
}
if (!localStorage.getItem('happyLiving_LaundryHistory')) {
    localStorage.setItem('happyLiving_LaundryHistory', JSON.stringify([
        { id: 1, studentId: 'student', date: '2025-12-15', items: 12, amount: 180, status: 'Paid', plan: 'PerCloth' },
        { id: 2, studentId: 'student', date: '2026-01-10', items: 0, amount: 600, status: 'Pd', plan: 'Monthly' } // 'Pd' matches 'Paid' loosely or fix later
    ]));
}

// Payment System (Legacy - uses PaymentService)
const PaymentSystem = {
    processPayment: function (type, amount, details, email) {
        if (window.PaymentService) {
            return PaymentService.initiatePayment(amount, 'Online', {
                type: type,
                details: details,
                email: email
            });
        }

        // Fallback
        return new Promise((resolve) => {
            setTimeout(() => {
                const payment = {
                    id: Date.now(),
                    type: type,
                    amount: amount,
                    details: details,
                    email: email,
                    status: 'Completed',
                    date: new Date().toISOString(),
                    transactionId: 'TXN' + Date.now()
                };

                const payments = JSON.parse(localStorage.getItem('payments') || '[]');
                payments.unshift(payment);
                localStorage.setItem('payments', JSON.stringify(payments));

                resolve(payment);
            }, 2000);
        });
    },

    getPayments: function () {
        if (window.PaymentService) {
            return PaymentService.getAllPayments();
        }
        return JSON.parse(localStorage.getItem('payments') || '[]');
    }
};

// Notification System (Enhanced)
const NotificationSystem = {
    notifications: [],

    // Add notification with role support
    add: function (title, message, type = 'info', userId = null, role = null, notificationType = 'general') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const targetUserId = userId || user.id || 'all';
        const targetRole = role || user.role || 'all';

        const notification = {
            id: Date.now(),
            userId: targetUserId,
            role: targetRole,
            title: title,
            message: message,
            type: type, // 'success', 'error', 'info', 'warning'
            notificationType: notificationType, // 'attendance', 'complaint', 'billing', 'menu', 'general'
            read: false,
            timestamp: new Date().toISOString(),
            actionUrl: null,
            metadata: {}
        };

        // Load existing notifications first to verify persistence
        const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
        NotificationSystem.notifications = existing;

        NotificationSystem.notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(NotificationSystem.notifications));

        // Show browser notification if permitted and user matches
        if (Notification.permission === 'granted' &&
            (targetRole === 'all' || targetRole === user.role || !user.role)) {
            new Notification(title, {
                body: message,
                icon: '/assets/hero_image.png',
                tag: notification.id.toString()
            });
        }

        return notification;
    },

    // Get notifications for current user/role
    getAll: function (userId = null, role = null) {
        NotificationSystem.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const targetUserId = userId || user.id;
        const targetRole = role || user.role;

        return NotificationSystem.notifications.filter(n => {
            if (n.userId !== 'all' && n.userId !== targetUserId && targetUserId) return false;
            if (n.role !== 'all' && n.role !== targetRole && targetRole) return false;
            return true;
        });
    },

    // Get notifications by type
    getByType: function (notificationType, userId = null, role = null) {
        return NotificationSystem.getAll(userId, role).filter(n => n.notificationType === notificationType);
    },

    markAsRead: function (id) {
        NotificationSystem.notifications = NotificationSystem.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(NotificationSystem.notifications));
    },

    markAllAsRead: function (userId = null, role = null) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const targetUserId = userId || user.id;
        const targetRole = role || user.role;

        NotificationSystem.notifications = NotificationSystem.notifications.map(n => {
            const matches = (n.userId === 'all' || n.userId === targetUserId) &&
                (n.role === 'all' || n.role === targetRole);
            return matches ? { ...n, read: true } : n;
        });
        localStorage.setItem('notifications', JSON.stringify(NotificationSystem.notifications));
    },

    getUnreadCount: function (userId = null, role = null) {
        return NotificationSystem.getAll(userId, role).filter(n => !n.read).length;
    },

    requestPermission: () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    // Auto-trigger notifications for events
    triggerAttendanceNotification(studentId, mealType, status) {
        this.add(
            'Attendance Marked',
            `Your ${mealType} attendance has been marked as ${status}.`,
            'success',
            studentId,
            'student',
            'attendance'
        );
    },

    triggerComplaintNotification(complaintId, event, details) {
        const complaint = ComplaintService ? ComplaintService.getComplaintById(complaintId) : null;
        if (!complaint) return;

        if (event === 'created') {
            this.add(
                'Complaint Submitted',
                `Your ${complaint.category} complaint has been submitted.`,
                'success',
                complaint.studentId,
                'student',
                'complaint'
            );
        } else if (event === 'assigned') {
            this.add(
                'Complaint Assigned',
                `Your complaint has been assigned to ${details.staffName}.`,
                'info',
                complaint.studentId,
                'student',
                'complaint'
            );
        } else if (event === 'status_changed') {
            this.add(
                'Complaint Status Updated',
                `Your complaint status is now: ${details.status}`,
                details.status === 'Resolved' ? 'success' : 'info',
                complaint.studentId,
                'student',
                'complaint'
            );
        }
    },

    triggerBillingNotification(studentId, amount, dueDate) {
        this.add(
            'Payment Due Reminder',
            `Your payment of ₹${amount} is due on ${dueDate}.`,
            'warning',
            studentId,
            'student',
            'billing'
        );
    },

    triggerMenuUpdateNotification(role = 'all') {
        this.add(
            'Menu Updated',
            'The weekly mess menu has been updated. Check it out!',
            'info',
            'all',
            role,
            'menu'
        );
    }
};

// Email Service (Enhanced)
const EmailService = {
    sendOTP: (email, otp) => {
        const emailData = {
            to: email,
            subject: 'Your OTP for Happy Living PG Login',
            body: `
Your OTP for login is: ${otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Happy Living PG Team
            `,
            sent: true,
            timestamp: new Date().toISOString(),
            type: 'otp'
        };

        const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        emails.unshift(emailData);
        localStorage.setItem('sentEmails', JSON.stringify(emails));

        console.log('📧 OTP sent to:', email, 'OTP:', otp);
        return emailData;
    },

    sendPasswordResetOTP: (email, otp) => {
        const emailData = {
            to: email,
            subject: 'Password Reset OTP - Happy Living PG',
            body: `
Your password reset OTP is: ${otp}

This OTP is valid for 15 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
Happy Living PG Team
            `,
            sent: true,
            timestamp: new Date().toISOString(),
            type: 'password_reset'
        };

        const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        emails.unshift(emailData);
        localStorage.setItem('sentEmails', JSON.stringify(emails));

        console.log('📧 Password reset OTP sent to:', email, 'OTP:', otp);
        return emailData;
    },

    sendBookingConfirmation: (email, studentName, booking, pgDetails, paymentMethod) => {
        const emailData = {
            to: email,
            subject: 'Welcome to Happy Living PG - Booking Confirmed & Login Credentials',
            body: `
Dear ${studentName},

Welcome to Happy Living PG!

═══════════════════════════════════════════════════════
            BOOKING CONFIRMATION
═══════════════════════════════════════════════════════

Your PG booking has been confirmed successfully!

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• PG Name: ${booking.pgName}
• Room Type: ${booking.sharing}-Sharing
• Monthly Rent: ₹${booking.rent}
• Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}
• Payment Method: ${paymentMethod}
• Transaction ID: ${booking.paymentId ? 'TXN' + booking.paymentId : 'N/A'}

═══════════════════════════════════════════════════════
            YOUR LOGIN CREDENTIALS
═══════════════════════════════════════════════════════

IMPORTANT: Please save these credentials securely!

Username: ${booking.username}
Password: ${booking.password}

You can use these credentials to login to your student portal at:
https://happylivingpg.com/student/login.html

═══════════════════════════════════════════════════════
            PAYMENT RECEIPT
═══════════════════════════════════════════════════════

Amount Paid: ₹${booking.rent}
Payment Status: Completed
Payment Method: ${paymentMethod}
Transaction ID: ${booking.paymentId ? 'TXN' + booking.paymentId : 'N/A'}

A detailed receipt has been generated and is available in your account.

═══════════════════════════════════════════════════════

Next Steps:
1. Login to your student portal using the credentials above
2. Complete your profile
3. Explore mess options and subscribe if needed
4. Mark your daily attendance
5. Access all student services

If you have any questions or need assistance, please contact our support team.

Best regards,
Happy Living PG Team
Email: support@happylivingpg.com
Phone: +91-XXXXX-XXXXX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated email. Please do not reply.
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { background: #f8fafc; padding: 20px; margin: 20px 0; }
        .credentials { background: #f0f4ff; border: 2px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .credentials strong { font-family: monospace; font-size: 1.1em; }
        .footer { text-align: center; color: #666; font-size: 0.9em; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Happy Living PG!</h1>
        </div>
        <div class="content">
            <p>Dear ${studentName},</p>
            <p>Your PG booking has been confirmed successfully!</p>
            
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>PG Name:</strong> ${booking.pgName}</li>
                <li><strong>Room Type:</strong> ${booking.sharing}-Sharing</li>
                <li><strong>Monthly Rent:</strong> ₹${booking.rent}</li>
                <li><strong>Payment Method:</strong> ${paymentMethod}</li>
            </ul>
            
            <div class="credentials">
                <h3 style="color: #4f46e5; margin-top: 0;">Your Login Credentials</h3>
                <p><strong>Username:</strong> <span style="font-family: monospace; font-size: 1.1em;">${booking.username}</span></p>
                <p><strong>Password:</strong> <span style="font-family: monospace; font-size: 1.1em;">${booking.password}</span></p>
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    Please keep these credentials safe. Use them to login to your student portal.
                </p>
            </div>
            
            <h3>Payment Receipt</h3>
            <p>Amount Paid: <strong>₹${booking.rent}</strong></p>
            <p>Payment Status: <strong style="color: #10b981;">Completed</strong></p>
            <p>Transaction ID: ${booking.paymentId ? 'TXN' + booking.paymentId : 'N/A'}</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Happy Living PG Team</p>
            <p style="font-size: 0.8em; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
            `,
            sent: true,
            timestamp: new Date().toISOString(),
            type: 'booking_confirmation'
        };

        const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        emails.unshift(emailData);
        localStorage.setItem('sentEmails', JSON.stringify(emails));

        // Show confirmation
        console.log('📧 Email sent to:', email);
        console.log('📧 Subject:', emailData.subject);
        return emailData;
    },

    sendSubscriptionConfirmation: (email, studentName, subscription, messDetails, paymentMethod) => {
        const emailData = {
            to: email,
            subject: 'Mess Subscription Activated - Happy Living PG',
            body: `
Dear ${studentName},

Your mess subscription has been activated successfully!

═══════════════════════════════════════════════════════
            SUBSCRIPTION DETAILS
═══════════════════════════════════════════════════════

• Mess Name: ${messDetails.messName}
• PG: ${messDetails.pgName}
• Subscription Plan: ${subscription.tier}
• Base Price: ₹${subscription.basePrice}/month
• Final Price: ₹${subscription.finalPrice}/month
• Payment Method: ${paymentMethod}
• Transaction ID: ${subscription.paymentId ? 'TXN' + subscription.paymentId : 'N/A'}
• Start Date: ${new Date(subscription.startDate).toLocaleDateString()}
• Status: Active

═══════════════════════════════════════════════════════
            PAYMENT RECEIPT
═══════════════════════════════════════════════════════

Amount Paid: ₹${subscription.finalPrice}
Payment Status: Completed
Payment Method: ${paymentMethod}

Your subscription is now active. You can start marking your attendance for meals.

Best regards,
Happy Living PG Team
            `,
            sent: true,
            timestamp: new Date().toISOString(),
            type: 'subscription_confirmation'
        };

        const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        emails.unshift(emailData);
        localStorage.setItem('sentEmails', JSON.stringify(emails));

        console.log('📧 Email sent to:', email);
        return emailData;
    },

    sendCredentials: (email, username, password, bookingDetails) => {
        // Legacy method - redirects to new method
        return this.sendBookingConfirmation(email, 'Student', {
            username: username,
            password: password,
            pgName: 'N/A',
            sharing: 'N/A',
            rent: 0,
            paymentId: null,
            bookingDate: new Date().toISOString()
        }, {}, 'N/A');
    }
};

// Booking System
const BookingSystem = {
    generateCredentials: function (email) {
        // Generate username from email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        // Generate password
        const password = 'HL' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.floor(Math.random() * 100);
        return { username, password };
    },

    bookPG: async function (pgId, sharing, rent, email, studentName, phone) {
        console.log('BookPG started:', { pgId, email, studentName });
        const PGs = getData.PGs();
        // Use loose equality to match string/number ID
        const pg = PGs.find(p => p.id == pgId);

        if (!pg) {
            console.error('PG not found for ID:', pgId);
            throw new Error('PG not found');
        }

        // Process payment
        console.log('Processing payment...');
        const payment = window.PaymentService ? await PaymentService.processPayment(
            rent,
            'PG',
            'Card', // Default method
            {
                pgName: pg.name,
                roomType: `${sharing} Sharing`
            },
            email,
            studentName
        ) : { id: 'bk_' + Date.now(), status: 'Completed', amount: rent };
        console.log('Payment processed:', payment);

        // Generate credentials
        let username, password;
        if (window.PaymentService) {
            const creds = PaymentService.generateCredentials(email);
            username = creds.username;
            password = creds.password;
        } else {
            const creds = BookingSystem.generateCredentials(email);
            username = creds.username;
            password = creds.password;
        }

        // Create booking
        const booking = {
            id: Date.now(),
            type: 'PG',
            pgId: pg ? pg.id : pgId,
            pgName: pg.name,
            sharing: sharing,
            rent: rent,
            studentName: studentName,
            email: email,
            phone: phone,
            username: username,
            password: password,
            status: 'Confirmed',
            bookingDate: new Date().toISOString(),
            paymentId: payment.id
        };

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.unshift(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        // Add to allocations
        const allocations = getData.Allocations();
        allocations.push({
            student: studentName,
            room: `Room-${Math.floor(Math.random() * 500)}`,
            pg: pg.name,
            type: `${sharing} Sharing`
        });
        DB.set('happyLiving_Allocations', allocations);

        // Add notification for Student
        if (window.NotificationSystem) {
            NotificationSystem.add(
                'PG Booking Confirmed!',
                `Your booking at ${pg.name} is confirmed. Check your email for login credentials.`,
                'success'
            );

            // Add notification for Admin
            NotificationSystem.add(
                'New PG Booking',
                `Student ${studentName} has booked ${pg.name} (${sharing}-Sharing).`,
                'info',
                'all',
                'admin',
                'billing'
            );
        }

        return booking;
    },

    addResidentByAdmin: async function (studentName, email, phone, pgId, roomNo, sharing, rent) {
        const PGs = getData.PGs();
        // Convert pgId to number since value from select might be string
        const pg = PGs.find(p => p.id === parseInt(pgId));
        const pgName = pg ? pg.name : 'Unknown PG';

        // Generate credentials
        const creds = BookingSystem.generateCredentials(email);
        const username = creds.username;
        const password = creds.password;

        // Create booking/user record
        const booking = {
            id: Date.now(),
            type: 'PG',
            pgId: parseInt(pgId),
            pgName: pgName,
            sharing: sharing,
            rent: rent,
            studentName: studentName,
            email: email,
            phone: phone,
            username: username,
            password: password,
            status: 'Confirmed',
            bookingDate: new Date().toISOString(),
            paymentId: 'ADMIN-' + Date.now(),
            roomNumber: roomNo
        };

        // Save to bookings (User DB)
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

        // Check if email already exists
        if (bookings.some(b => b.email === email)) {
            throw new Error('Student with this email already exists!');
        }

        bookings.unshift(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        // Add to allocations
        const allocations = getData.Allocations();
        allocations.push({
            student: studentName,
            room: roomNo,
            pg: pgName,
            type: `${sharing} Sharing`
        });
        DB.set('happyLiving_Allocations', allocations);

        // Add notification
        NotificationSystem.add(
            'Resident Added',
            `Resident ${studentName} added successfully to ${pgName}.`,
            'success'
        );

        return booking;
    },

    subscribeMess: async (messId, messName, basePrice, tier, email, studentName, phone, pgName) => {
        const tierInfo = SubscriptionTiers[tier];
        const finalPrice = Math.round(basePrice * tierInfo.multiplier);

        // Process payment
        const payment = await PaymentSystem.processPayment(
            'Mess',
            finalPrice,
            `Mess Subscription: ${messName} (${tier} Plan)`,
            email
        );

        // Create subscription
        const subscription = {
            id: Date.now(),
            type: 'Mess',
            messId: messId,
            messName: messName,
            tier: tier,
            basePrice: basePrice,
            finalPrice: finalPrice,
            studentName: studentName,
            email: email,
            phone: phone,
            pgName: pgName,
            status: 'Active',
            startDate: new Date().toISOString(),
            paymentId: payment.id
        };

        const subscriptions = JSON.parse(localStorage.getItem('messSubscriptions') || '[]');
        subscriptions.unshift(subscription);
        localStorage.setItem('messSubscriptions', JSON.stringify(subscriptions));

        // Add notification for Student
        NotificationSystem.add(
            'Mess Subscription Activated!',
            `Your ${tier} subscription to ${messName} is now active.`,
            'success'
        );

        // Add notification for Admin
        NotificationSystem.add(
            'New Mess Subscription',
            `Student ${studentName} has subscribed to ${messName} (${tier} Plan).`,
            'info',
            'all',
            'admin',
            'billing'
        );

        return subscription;
    },

    getBookings: () => JSON.parse(localStorage.getItem('bookings') || '[]'),
    getSubscriptions: () => JSON.parse(localStorage.getItem('messSubscriptions') || '[]')
};

// Request Handling
const RequestSystem = {
    addRequest: (type, details) => {
        const requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
        const newRequest = {
            id: Date.now(),
            type: type,
            studentName: 'Student User', // Mock name
            details: details,
            status: 'Pending',
            date: new Date().toLocaleDateString()
        };
        requests.unshift(newRequest);
        localStorage.setItem('adminRequests', JSON.stringify(requests));
        alert(`${type} request sent successfully!`);
    },

    getRequests: () => JSON.parse(localStorage.getItem('adminRequests') || '[]'),

    updateRequestStatus: (id, status) => {
        let requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
        requests = requests.map(req => req.id === id ? { ...req, status: status } : req);
        localStorage.setItem('adminRequests', JSON.stringify(requests));
        return requests;
    }
};

// Complaint Service (Moved to complaint.js)
// const ComplaintService = { ... };

// Profile Service
const ProfileService = {
    // Get profile
    getProfile: function (studentId) {
        // Mock data or from localStorage if updated
        const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        if (profiles[studentId]) return profiles[studentId];

        // Default dummy profile
        return {
            fullName: "John Doe",
            studentId: studentId || "STU-1001",
            roomNumber: "101",
            phone: "+91 98765 43210",
            email: "student@happyliving.com",
            emergencyContact: "+91 91234 56789"
        };
    },

    // Update profile
    updateProfile: function (studentId, details) {
        const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        profiles[studentId] = { ...details, studentId: studentId }; // Ensure ID matches
        localStorage.setItem('profiles', JSON.stringify(profiles));
        return profiles[studentId];
    }
};

// Export systems
window.PaymentSystem = PaymentSystem;
window.NotificationSystem = NotificationSystem;
window.EmailService = EmailService;
window.BookingSystem = BookingSystem;
window.SubscriptionTiers = SubscriptionTiers;
// window.ComplaintService = ComplaintService;
window.ProfileService = ProfileService;

// Expose Data Access globally
window.getData = {
    PGs: () => DB.get('happyLiving_PGs') || [],
    Menu: () => DB.get('happyLiving_Menu') || {},
    Allocations: () => DB.get('happyLiving_Allocations') || [],
    VendorMenu: (id) => VendorMenus[id] || { special: "Standard Meal", items: ["Rice", "Dal", "Veg"] }
};

// Initialize DB on load
DB.init();
