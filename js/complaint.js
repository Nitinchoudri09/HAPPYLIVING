/* Complaint & Maintenance System - Service Layer */

const ComplaintService = {
    // Complaint categories
    categories: ['Food', 'Room', 'Water', 'Electricity', 'Cleaning', 'Other'],

    // Priority levels
    priorities: ['Low', 'Medium', 'High'],

    // Status lifecycle
    statuses: ['Open', 'In Progress', 'Resolved', 'Closed'],

    // Get all complaints (Admin/Staff)
    getAllComplaints: async function (filters = {}) {
        try {
            const API_BASE_URL = window.API_BASE_URL || 'https://api.yourdomain.com/v1';
            const response = await fetch(`${API_BASE_URL}/complaints`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('complaints', JSON.stringify(data));
            }
        } catch (error) {
            console.warn('API fetch failed, falling back to local storage', error);
        }

        let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

        if (filters.status) {
            complaints = complaints.filter(c => c.status === filters.status);
        }
        if (filters.category) {
            complaints = complaints.filter(c => c.category === filters.category);
        }
        if (filters.priority) {
            complaints = complaints.filter(c => c.priority === filters.priority);
        }
        if (filters.assignedTo) {
            complaints = complaints.filter(c => c.assignedTo === filters.assignedTo);
        }
        if (filters.studentId) {
            complaints = complaints.filter(c => c.studentId === filters.studentId);
        }

        return complaints;
    },

    // Helper functions
    getStudentEmail: function (studentId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) return user.email;

        if (window.BookingSystem) {
            const bookings = BookingSystem.getBookings();
            const booking = bookings.find(b => String(b.id) === String(studentId));
            if (booking && booking.email) return booking.email;
        }
        return 'unknown@example.com';
    },

    getStudentName: function (studentId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) return user.name;

        if (window.BookingSystem) {
            const bookings = BookingSystem.getBookings();
            const booking = bookings.find(b => String(b.id) === String(studentId));
            if (booking && booking.studentName) return booking.studentName;
        }
        return 'Unknown Student';
    },

    // Create complaint
    createComplaint: async function (studentId, category, description, priority = 'Medium') {
        if (!studentId || !category || !description || !description.trim()) {
            throw new Error('All fields are required');
        }

        if (!ComplaintService.categories.includes(category)) {
            throw new Error('Invalid complaint category');
        }

        if (!ComplaintService.priorities.includes(priority)) {
            throw new Error('Invalid priority level');
        }

        const complaint = {
            id: Date.now(),
            studentId: studentId,
            studentEmail: ComplaintService.getStudentEmail(studentId),
            studentName: ComplaintService.getStudentName(studentId),
            category: category,
            description: description.trim(),
            priority: priority,
            status: 'Open',
            assignedTo: null,
            assignedToName: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolution: null,
            attachments: []
        };

        // Try to post to API first
        try {
            const API_BASE_URL = window.API_BASE_URL || 'https://api.yourdomain.com/v1';
            const response = await fetch(`${API_BASE_URL}/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(complaint)
            });

            if (response.ok) {
                const apiComplaint = await response.json();
                complaint.id = apiComplaint.id || complaint.id;
            } else {
                console.warn('API /complaints failed, saving to local storage');
            }
        } catch (error) {
            console.warn('API not accessible, saving complaint locally.', error);
        }

        const complaints = await ComplaintService.getAllComplaints();
        complaints.unshift(complaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));

        // Notify admin and student
        if (window.NotificationSystem) {
            NotificationSystem.triggerComplaintNotification(complaint.id, 'created', {});
        }

        return complaint;
    },

    // Get complaints by student
    getComplaintsByStudent: async function (studentId) {
        const complaints = await ComplaintService.getAllComplaints();
        return complaints.filter(c => String(c.studentId) === String(studentId));
    },

    // Assign complaint to staff
    assignComplaint: async function (complaintId, staffId, staffName) {
        if (!complaintId || !staffId || !staffName) {
            throw new Error('Complaint ID, Staff ID, and Staff Name are required');
        }

        const complaints = await ComplaintService.getAllComplaints();
        const complaint = complaints.find(c => c.id === complaintId);

        if (!complaint) {
            throw new Error('Complaint not found');
        }

        complaint.assignedTo = staffId;
        complaint.assignedToName = staffName;
        complaint.status = 'In Progress';
        complaint.updatedAt = new Date().toISOString();

        localStorage.setItem('complaints', JSON.stringify(complaints));

        // Notify student
        if (window.NotificationSystem) {
            NotificationSystem.triggerComplaintNotification(complaintId, 'assigned', { staffName });
        }

        return complaint;
    },

    // Update complaint status (Staff/Admin)
    updateComplaintStatus: async function (complaintId, status, resolution = null) {
        if (!complaintId || !status) {
            throw new Error('Complaint ID and Status are required');
        }

        if (!ComplaintService.statuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const complaints = await ComplaintService.getAllComplaints();
        const complaint = complaints.find(c => c.id === complaintId);

        if (!complaint) {
            throw new Error('Complaint not found');
        }

        const oldStatus = complaint.status;
        complaint.status = status;
        complaint.updatedAt = new Date().toISOString();

        if (resolution) {
            complaint.resolution = resolution.trim();
        }

        localStorage.setItem('complaints', JSON.stringify(complaints));

        // Notify student if status changed
        if (oldStatus !== status && window.NotificationSystem) {
            NotificationSystem.triggerComplaintNotification(complaintId, 'status_changed', { status });
        }

        return complaint;
    },

    // Get complaint by ID
    getComplaintById: async function (complaintId) {
        const complaints = await ComplaintService.getAllComplaints();
        return complaints.find(c => c.id === complaintId);
    },

    // Get complaint statistics
    getComplaintStats: async function () {
        const complaints = await ComplaintService.getAllComplaints();

        return {
            total: complaints.length,
            byStatus: ComplaintService.statuses.reduce(function (acc, status) {
                acc[status] = complaints.filter(c => c.status === status).length;
                return acc;
            }, {}),
            byCategory: ComplaintService.categories.reduce(function (acc, category) {
                acc[category] = complaints.filter(c => c.category === category).length;
                return acc;
            }, {}),
            byPriority: ComplaintService.priorities.reduce(function (acc, priority) {
                acc[priority] = complaints.filter(c => c.priority === priority).length;
                return acc;
            }, {}),
            open: complaints.filter(c => c.status === 'Open').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length
        };
    }
};

// Export
window.ComplaintService = ComplaintService;
