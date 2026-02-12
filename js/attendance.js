/* Attendance System - Service Layer */

const AttendanceService = {
    // Get all attendance records
    getAllAttendance: function() {
        return JSON.parse(localStorage.getItem('attendance_records') || '[]');
    },

    // Get student email helper
    getStudentEmail: function(studentId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) return user.email;
        
        // Try to get from bookings
        if (window.BookingSystem) {
            const bookings = BookingSystem.getBookings();
            const booking = bookings.find(b => String(b.id) === String(studentId));
            if (booking && booking.email) return booking.email;
        }
        
        // Fallback
        return user.email || 'student@happylivingpg.com';
    },

    // Get attendance by student
    getAttendanceByStudent: function(studentId, date = null, mealType = null) {
        const attendances = AttendanceService.getAllAttendance();
        return attendances.filter(a => {
            // Convert both to string for comparison
            if (String(a.studentId) !== String(studentId)) return false;
            if (date && a.date !== date) return false;
            if (mealType && a.mealType !== mealType) return false;
            return true;
        });
    },

    // Get current meal type based on time
    getCurrentMealType: function() {
        const hour = new Date().getHours();
        if (hour >= 7 && hour < 10) return 'Breakfast';
        if (hour >= 12 && hour < 15) return 'Lunch';
        if (hour >= 19 && hour < 22) return 'Dinner';
        return null;
    },

    // Mark attendance (prevents duplicates)
    markAttendance: function(studentId, date, mealType, status = 'Present') {
        if (!studentId || !date || !mealType) {
            throw new Error('Missing required fields: studentId, date, mealType');
        }

        // Check for duplicate
        const existing = AttendanceService.getAttendanceByStudent(studentId, date, mealType);
        if (existing && existing.length > 0) {
            throw new Error('Attendance already marked for this meal');
        }

        const attendance = {
            id: Date.now(),
            studentId: studentId,
            studentEmail: AttendanceService.getStudentEmail(studentId),
            date: date, // YYYY-MM-DD format
            mealType: mealType, // Breakfast, Lunch, Dinner
            status: status, // Present, Absent
            createdAt: new Date().toISOString(),
            mode: 'Manual' // Manual or QR
        };

        const attendances = AttendanceService.getAllAttendance();
        attendances.unshift(attendance);
        localStorage.setItem('attendance_records', JSON.stringify(attendances));

        // Trigger notification
        if (window.NotificationSystem) {
            NotificationSystem.triggerAttendanceNotification(studentId, mealType, status);
        }

        return attendance;
    },

    // Mark attendance via QR Code
    markAttendanceQR: function(studentId, qrData) {
        try {
            const qrInfo = JSON.parse(qrData);
            const today = new Date().toISOString().split('T')[0];
            
            if (qrInfo.date !== today) {
                throw new Error('QR code expired or invalid date');
            }

            const currentMeal = AttendanceService.getCurrentMealType();
            if (qrInfo.mealType && qrInfo.mealType !== currentMeal) {
                throw new Error('QR code is not valid for current meal');
            }

            return AttendanceService.markAttendance(
                studentId,
                today,
                qrInfo.mealType || currentMeal,
                'Present'
            );
        } catch (error) {
            throw new Error('Invalid QR code: ' + error.message);
        }
    },

    // Generate QR code data for admin
    generateQRCode: function(mealType) {
        const today = new Date().toISOString().split('T')[0];
        const qrData = {
            date: today,
            mealType: mealType,
            generatedAt: new Date().toISOString(),
            token: 'QR_' + Date.now() + '_' + Math.random().toString(36).substring(7)
        };
        return JSON.stringify(qrData);
    },

    // Get attendance report (Admin)
    getAttendanceReport: function(filters = {}) {
        let attendances = AttendanceService.getAllAttendance();

        if (filters.date) {
            attendances = attendances.filter(a => a.date === filters.date);
        }
        if (filters.mealType) {
            attendances = attendances.filter(a => a.mealType === filters.mealType);
        }
        if (filters.studentId) {
            attendances = attendances.filter(a => a.studentId === filters.studentId);
        }
        if (filters.status) {
            attendances = attendances.filter(a => a.status === filters.status);
        }

        // Group by date and meal type for reporting
        const report = {};
        attendances.forEach(a => {
            const key = `${a.date}_${a.mealType}`;
            if (!report[key]) {
                report[key] = {
                    date: a.date,
                    mealType: a.mealType,
                    total: 0,
                    present: 0,
                    absent: 0,
                    students: []
                };
            }
            report[key].total++;
            if (a.status === 'Present') {
                report[key].present++;
            } else {
                report[key].absent++;
            }
            report[key].students.push({
                studentId: a.studentId,
                studentEmail: a.studentEmail,
                status: a.status,
                mode: a.mode
            });
        });

        return Object.values(report);
    },

    // Get monthly attendance for student
    getMonthlyAttendance: function(studentId, year, month) {
        const attendances = AttendanceService.getAttendanceByStudent(studentId);
        const targetMonth = String(month).padStart(2, '0');
        
        return attendances.filter(a => {
            const [aYear, aMonth] = a.date.split('-');
            return aYear === String(year) && aMonth === targetMonth;
        });
    },

    // Calculate attendance percentage
    calculateAttendancePercentage: function(studentId, startDate, endDate) {
        const attendances = AttendanceService.getAttendanceByStudent(studentId);
        const filtered = attendances.filter(a => {
            return a.date >= startDate && a.date <= endDate;
        });

        if (filtered.length === 0) return 0;

        const present = filtered.filter(a => a.status === 'Present').length;
        return Math.round((present / filtered.length) * 100);
    },

    // Check if attendance already marked
    isAttendanceMarked: function(studentId, date, mealType) {
        const attendances = AttendanceService.getAttendanceByStudent(studentId, date, mealType);
        return attendances.length > 0;
    }
};

// Export
window.AttendanceService = AttendanceService;
