/* AI & Smart Automation Service */

const AIService = {
    // Food Waste Prediction
    predictFoodRequirement: function(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date(targetDate).getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        
        // Get last 30 days attendance
        const allAttendance = AttendanceService.getAllAttendance();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        
        const recentAttendance = allAttendance.filter(a => a.date >= cutoffDate && a.date < targetDate);
        
        // Calculate meal-wise averages
        const mealStats = {
            Breakfast: { present: 0, total: 0, dates: new Set() },
            Lunch: { present: 0, total: 0, dates: new Set() },
            Dinner: { present: 0, total: 0, dates: new Set() }
        };
        
        recentAttendance.forEach(a => {
            if (a.status === 'Present' && mealStats[a.mealType]) {
                mealStats[a.mealType].present++;
                mealStats[a.mealType].dates.add(a.date);
            }
            mealStats[a.mealType].total++;
        });
        
        // Calculate averages per meal
        const predictions = {};
        Object.keys(mealStats).forEach(meal => {
            const stats = mealStats[meal];
            const uniqueDays = stats.dates.size || 1;
            const avgPresent = uniqueDays > 0 ? Math.round(stats.present / uniqueDays) : 0;
            
            // Add trend factor (recent days weighted more)
            const recentDays = recentAttendance.filter(a => 
                a.mealType === meal && 
                a.status === 'Present' &&
                a.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            );
            const recentAvg = recentDays.length > 0 ? Math.round(recentDays.length / 7) : avgPresent;
            
            // Final prediction (70% average + 30% recent trend)
            const predicted = Math.round(avgPresent * 0.7 + recentAvg * 0.3);
            
            predictions[meal] = {
                expectedStudents: Math.max(predicted, 0),
                foodQuantity: AIService.calculateFoodQuantity(meal, predicted),
                confidence: uniqueDays >= 7 ? 'High' : uniqueDays >= 3 ? 'Medium' : 'Low',
                basedOnDays: uniqueDays
            };
        });
        
        return {
            date: targetDate,
            dayName: dayName,
            predictions: predictions,
            totalExpected: Object.values(predictions).reduce((sum, p) => sum + p.expectedStudents, 0)
        };
    },
    
    calculateFoodQuantity: function(mealType, students) {
        // Base quantities per student (in grams/servings)
        const baseQuantities = {
            Breakfast: { rice: 100, curry: 150, roti: 2, extras: 50 },
            Lunch: { rice: 200, curry: 200, roti: 3, dal: 100, extras: 50 },
            Dinner: { rice: 200, curry: 200, roti: 3, dal: 100, extras: 50 }
        };
        
        const base = baseQuantities[mealType] || baseQuantities.Lunch;
        const quantities = {};
        
        Object.keys(base).forEach(item => {
            quantities[item] = Math.ceil(base[item] * students * 1.1); // 10% buffer
        });
        
        return quantities;
    },
    
    // Smart Menu Recommendation
    recommendMenu: function(day = null) {
        const targetDay = day || new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const menu = getData.Menu();
        const currentMenu = menu[targetDay] || menu.Sunday;
        
        // Get attendance trends for menu items
        const allAttendance = AttendanceService.getAllAttendance();
        const last30Days = allAttendance.filter(a => {
            const aDate = new Date(a.date);
            const now = new Date();
            return (now - aDate) <= 30 * 24 * 60 * 60 * 1000;
        });
        
        // Get complaints related to food
        const foodComplaints = ComplaintService ? 
            ComplaintService.getAllComplaints({ category: 'Food' }) : [];
        
        // Analyze which meals have higher attendance
        const mealPopularity = {
            Breakfast: 0,
            Lunch: 0,
            Dinner: 0
        };
        
        last30Days.forEach(a => {
            if (a.status === 'Present' && mealPopularity[a.mealType] !== undefined) {
                mealPopularity[a.mealType]++;
            }
        });
        
        // Get vendor menu ratings (if available)
        const vendorMenus = window.getData ? getData.VendorMenu : () => ({});
        
        // Generate recommendations
        const recommendations = {
            Breakfast: AIService.suggestBreakfastItems(currentMenu.Breakfast, foodComplaints),
            Lunch: AIService.suggestLunchItems(currentMenu.Lunch, foodComplaints),
            Dinner: AIService.suggestDinnerItems(currentMenu.Dinner, foodComplaints)
        };
        
        return {
            day: targetDay,
            currentMenu: currentMenu,
            recommendations: recommendations,
            mealPopularity: mealPopularity,
            suggestions: AIService.generateMenuSuggestions(recommendations, currentMenu)
        };
    },
    
    suggestBreakfastItems: (currentItems, complaints) => {
        const avoidedItems = complaints
            .filter(c => c.status !== 'Resolved')
            .map(c => c.description.toLowerCase())
            .join(' ');
        
        const popularItems = ['Poha', 'Idli', 'Paratha', 'Upma', 'Dosa'];
        const suggested = popularItems.filter(item => 
            !currentItems.includes(item) && 
            !avoidedItems.includes(item.toLowerCase())
        );
        
        return suggested.slice(0, 2);
    },
    
    suggestLunchItems: (currentItems, complaints) => {
        const avoidedItems = complaints
            .filter(c => c.status !== 'Resolved')
            .map(c => c.description.toLowerCase())
            .join(' ');
        
        const popularItems = ['Biryani', 'Rajma Chawal', 'Dal Makhani', 'Paneer', 'Chole Bhature'];
        const suggested = popularItems.filter(item => 
            !currentItems.some(ci => ci.includes(item)) && 
            !avoidedItems.includes(item.toLowerCase())
        );
        
        return suggested.slice(0, 2);
    },
    
    suggestDinnerItems: (currentItems, complaints) => {
        const avoidedItems = complaints
            .filter(c => c.status !== 'Resolved')
            .map(c => c.description.toLowerCase())
            .join(' ');
        
        const popularItems = ['Paneer Butter Masala', 'Dal Tadka', 'Mix Veg', 'Chicken Curry', 'Palak Paneer'];
        const suggested = popularItems.filter(item => 
            !currentItems.some(ci => ci.includes(item)) && 
            !avoidedItems.includes(item.toLowerCase())
        );
        
        return suggested.slice(0, 2);
    },
    
    generateMenuSuggestions: (recommendations, currentMenu) => {
        const suggestions = [];
        
        if (recommendations.Breakfast.length > 0) {
            suggestions.push({
                meal: 'Breakfast',
                message: `Consider adding: ${recommendations.Breakfast.join(', ')}`,
                reason: 'Popular items not in current menu'
            });
        }
        
        if (recommendations.Lunch.length > 0) {
            suggestions.push({
                meal: 'Lunch',
                message: `Consider adding: ${recommendations.Lunch.join(', ')}`,
                reason: 'High student preference'
            });
        }
        
        if (recommendations.Dinner.length > 0) {
            suggestions.push({
                meal: 'Dinner',
                message: `Consider adding: ${recommendations.Dinner.join(', ')}`,
                reason: 'Variety improvement'
            });
        }
        
        return suggestions;
    },
    
    // AI Chatbot
    processChatbotQuery: function(query, userRole = 'student', userId = null) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Menu queries
        if (normalizedQuery.includes('menu') || normalizedQuery.includes('food') || normalizedQuery.includes('meal')) {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const menu = getData.Menu();
            const todayMenu = menu[today];
            
            if (normalizedQuery.includes('today')) {
                return {
                    response: `Today's menu (${today}):\n\nBreakfast: ${todayMenu.Breakfast.join(', ')}\nLunch: ${todayMenu.Lunch.join(', ')}\nDinner: ${todayMenu.Dinner.join(', ')}`,
                    type: 'menu',
                    data: todayMenu
                };
            }
            
            return {
                response: `I can help you with menu information. Today is ${today}. Would you like to see today's menu or a specific day?`,
                type: 'menu_help'
            };
        }
        
        // Complaint queries
        if (normalizedQuery.includes('complaint') || normalizedQuery.includes('issue') || normalizedQuery.includes('problem')) {
            if (userRole === 'student' && userId && ComplaintService) {
                const complaints = ComplaintService.getComplaintsByStudent(userId);
                const openComplaints = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
                
                if (openComplaints.length > 0) {
                    const statusList = openComplaints.map(c => 
                        `#${c.id} - ${c.category} (${c.status})`
                    ).join('\n');
                    return {
                        response: `You have ${openComplaints.length} open complaint(s):\n\n${statusList}\n\nWould you like details on any specific complaint?`,
                        type: 'complaints',
                        data: openComplaints
                    };
                } else {
                    return {
                        response: 'You have no open complaints. All your complaints have been resolved!',
                        type: 'complaints'
                    };
                }
            }
            
            return {
                response: 'I can help you check complaint status or create a new complaint. What would you like to do?',
                type: 'complaint_help'
            };
        }
        
        // Payment/Billing queries
        if (normalizedQuery.includes('payment') || normalizedQuery.includes('fee') || normalizedQuery.includes('bill') || normalizedQuery.includes('due')) {
            if (userRole === 'student' && userId && BookingSystem) {
                const bookings = BookingSystem.getBookings();
                const userBooking = bookings.find(b => b.id === userId || b.email);
                
                if (userBooking) {
                    const nextDue = new Date();
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    return {
                        response: `Your monthly rent is ₹${userBooking.rent}. Next payment due: ${nextDue.toLocaleDateString()}. You can pay through the dashboard.`,
                        type: 'billing',
                        data: userBooking
                    };
                }
            }
            
            return {
                response: 'I can help you with payment information. Please check your billing section in the dashboard for details.',
                type: 'billing_help'
            };
        }
        
        // Attendance queries
        if (normalizedQuery.includes('attendance') || normalizedQuery.includes('present')) {
            if (userRole === 'student' && userId && AttendanceService) {
                const today = new Date().toISOString().split('T')[0];
                const attendances = AttendanceService.getAttendanceByStudent(userId, today);
                
                if (attendances.length > 0) {
                    const statusList = attendances.map(a => 
                        `${a.mealType}: ${a.status}`
                    ).join('\n');
                    return {
                        response: `Today's attendance:\n\n${statusList}`,
                        type: 'attendance',
                        data: attendances
                    };
                } else {
                    return {
                        response: 'You haven\'t marked attendance for today yet. Please mark it in the Attendance section.',
                        type: 'attendance'
                    };
                }
            }
            
            return {
                response: 'I can help you check your attendance. Please visit the Attendance section to mark or view your attendance.',
                type: 'attendance_help'
            };
        }
        
        // Greeting queries
        if (normalizedQuery.includes('hello') || normalizedQuery.includes('hi') || normalizedQuery.includes('hey')) {
            return {
                response: `Hello! I'm your PG assistant. I can help you with:\n- Menu information\n- Complaint status\n- Payment details\n- Attendance\n\nWhat would you like to know?`,
                type: 'greeting'
            };
        }
        
        // Help queries
        if (normalizedQuery.includes('help') || normalizedQuery.includes('what can you do')) {
            return {
                response: `I can help you with:\n\n1. Menu - Ask about today's menu or weekly menu\n2. Complaints - Check your complaint status\n3. Payments - Get billing and due date information\n4. Attendance - Check your attendance records\n\nJust ask me anything!`,
                type: 'help'
            };
        }
        
        // Default response
        return {
            response: 'I\'m not sure I understand. I can help you with menu, complaints, payments, or attendance. What would you like to know?',
            type: 'unknown'
        };
    }
};

// Export
window.AIService = AIService;
