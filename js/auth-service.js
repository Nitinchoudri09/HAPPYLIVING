/* Enhanced Authentication & Security Service */

const AuthService = {
    // Generate JWT-like token (simplified for localStorage)
    generateToken: (payload, expiresIn = '24h') => {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const expiration = new Date();
        if (expiresIn === '24h') {
            expiration.setHours(expiration.getHours() + 24);
        } else if (expiresIn === '7d') {
            expiration.setDate(expiration.getDate() + 7);
        } else if (expiresIn === '30m') {
            expiration.setMinutes(expiration.getMinutes() + 30);
        }

        payload.exp = expiration.getTime();
        payload.iat = Date.now();

        // Simple token generation (in production, use proper JWT library)
        const token = btoa(JSON.stringify(header)) + '.' +
            btoa(JSON.stringify(payload)) + '.' +
            btoa(Date.now().toString());

        return token;
    },

    // Verify token
    verifyToken: (token) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const payload = JSON.parse(atob(parts[1]));

            if (payload.exp && payload.exp < Date.now()) {
                return null; // Token expired
            }

            return payload;
        } catch (error) {
            return null;
        }
    },

    // Hash password (simplified - in production use bcrypt)
    hashPassword: (password) => {
        // Simple hash for demo (use bcrypt in production)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'hashed_' + Math.abs(hash).toString(36);
    },

    // Verify password
    verifyPassword: (password, hash) => {
        return AuthService.hashPassword(password) === hash;
    },

    // Generate OTP
    generateOTP: (length = 6) => {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < length; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    },

    // Store OTP
    storeOTP: (email, otp, expiresIn = 10) => {
        const otpData = {
            email: email,
            otp: otp,
            expiresAt: Date.now() + (expiresIn * 60 * 1000), // minutes to milliseconds
            attempts: 0,
            maxAttempts: 3
        };

        const otps = JSON.parse(localStorage.getItem('otp_storage') || '[]');
        // Remove old OTPs for this email
        const filtered = otps.filter(o => o.email !== email);
        filtered.push(otpData);
        localStorage.setItem('otp_storage', JSON.stringify(filtered));

        return otpData;
    },

    // Verify OTP
    verifyOTP: (email, otp) => {
        const otps = JSON.parse(localStorage.getItem('otp_storage') || '[]');
        const otpData = otps.find(o => o.email === email);

        if (!otpData) {
            return { valid: false, message: 'OTP not found' };
        }

        if (otpData.expiresAt < Date.now()) {
            return { valid: false, message: 'OTP expired' };
        }

        if (otpData.attempts >= otpData.maxAttempts) {
            return { valid: false, message: 'Maximum attempts exceeded' };
        }

        otpData.attempts++;
        const filtered = otps.filter(o => o.email !== email);
        filtered.push(otpData);
        localStorage.setItem('otp_storage', JSON.stringify(filtered));

        if (otpData.otp !== otp) {
            return { valid: false, message: 'Invalid OTP', attempts: otpData.attempts };
        }

        // Remove OTP after successful verification
        const remaining = otps.filter(o => o.email !== email);
        localStorage.setItem('otp_storage', JSON.stringify(remaining));

        return { valid: true, message: 'OTP verified' };
    },

    // Centralized Register method
    register: async (userData, role = 'student') => {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, role })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.warn('API registration failed or unavailable, falling back to local database...', error);
        }

        // Fallback to local storage
        const storageKey = role === 'admin' ? 'registered_admins' : 'registered_students';
        const users = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check if user already exists
        const exists = users.find(u => u.email === userData.email);
        if (exists) {
            throw new Error('User with this email already exists.');
        }

        // Hash the password before storing
        const newUser = {
            ...userData,
            id: Date.now(),
            role: role,
            password: AuthService.hashPassword(userData.password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(storageKey, JSON.stringify(users));
        
        console.log(`✅ ${role} registered successfully (Local Storage):`, newUser.email);
        return { success: true, user: newUser };
    },

    // Enhanced login with API support
    login: async function (identifier, password, role = 'student') {
        const email = identifier;

        // Try API login first (Real Data Connection)
        try {
            // Replace with your actual API endpoint base URL
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role })
            });

            if (response.ok) {
                const data = await response.json();

                // Store actual API tokens
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                this.clearLoginAttempts(email);
                return data;
            }
        } catch (error) {
            console.warn('API login failed or unavailable, falling back to local database...', error);
        }

        // Fallback to local data if API is not available
        let user = null;
        if (role === 'student') {
            const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
            user = registeredStudents.find(s =>
                (s.email && s.email.trim().toLowerCase() === identifier.toLowerCase()) ||
                (s.username && s.username.trim().toLowerCase() === identifier.toLowerCase())
            );

            if (user) {
                if (password !== 'otp_verified' && user.password !== this.hashPassword(password)) {
                    AuthService.recordLoginAttempt(identifier, false);
                    throw new Error('Invalid credentials');
                }
            } else {
                const bookings = window.BookingSystem ? window.BookingSystem.getBookings() : [];
                user = bookings.find(b =>
                    (b.email && b.email.trim().toLowerCase() === identifier.toLowerCase()) ||
                    (b.username && b.username.trim().toLowerCase() === identifier.toLowerCase())
                );

                if (user) {
                    if (password !== 'otp_verified' && user.password !== password) {
                        AuthService.recordLoginAttempt(identifier, false);
                        throw new Error('Invalid credentials');
                    }
                    user.role = 'student';
                } else {
                    if (identifier === 'student' || identifier === 'student@example.com') {
                        if (password === 'student123' || password === 'demo123' || password === 'otp_verified') {
                            user = {
                                id: 'demo-student',
                                email: 'student@example.com',
                                studentName: 'Demo Student',
                                role: 'student'
                            };
                        }
                    }
                }
            }
        } else if (role === 'admin') {
            if ((email === 'admin' || email === 'admin@happylivingpg.com') && password === 'admin123') {
                user = {
                    id: 1,
                    email: 'admin@happylivingpg.com',
                    name: 'Admin User',
                    role: 'admin'
                };
            } else {
                const admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
                user = admins.find(a => a.email === email && a.password === AuthService.hashPassword(password));

                if (!user) {
                    AuthService.recordLoginAttempt(email, false);
                    throw new Error('Invalid credentials');
                }
            }
        }

        if (!user) {
            AuthService.recordLoginAttempt(identifier, false);
            throw new Error('User not found or invalid account');
        }

        const accessToken = AuthService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        }, '24h');

        const refreshToken = AuthService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            type: 'refresh'
        }, '7d');

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.studentName || user.name,
            role: user.role
        }));

        AuthService.clearLoginAttempts(email);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.studentName || user.name,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    },

    // Register new user
    register: async function (userData, role = 'student') {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, role })
            });

            if (response.ok) {
                const data = await response.json();

                if (role === 'student') {
                    const students = JSON.parse(localStorage.getItem('registered_students') || '[]');
                    students.push(data);
                    localStorage.setItem('registered_students', JSON.stringify(students));
                } else if (role === 'admin') {
                    const admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
                    admins.push(data);
                    localStorage.setItem('registered_admins', JSON.stringify(admins));
                }

                return data;
            } else {
                console.warn('API /register failed, falling back to local DB...');
            }
        } catch (error) {
            console.warn('API connection failed during register, using fallback', error);
        }

        // Fallback to local
        if (role === 'student') {
            const students = JSON.parse(localStorage.getItem('registered_students') || '[]');
            if (students.find(s => s.email === userData.email)) {
                throw new Error('User already exists with this email');
            }

            const newUser = {
                ...userData,
                id: Date.now(),
                role: 'student',
                password: AuthService.hashPassword(userData.password)
            };

            students.push(newUser);
            localStorage.setItem('registered_students', JSON.stringify(students));
            return newUser;
        } else if (role === 'admin') {
            const admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            if (admins.find(a => a.email === userData.email) || userData.email === 'admin@happylivingpg.com') {
                throw new Error('Admin already exists with this email');
            }

            const newAdmin = {
                ...userData,
                id: Date.now(),
                role: 'admin',
                password: AuthService.hashPassword(userData.password)
            };

            admins.push(newAdmin);
            localStorage.setItem('registered_admins', JSON.stringify(admins));
            return newAdmin;
        }
    },

    // OTP Login
    loginWithOTP: async function (email, role = 'student') {
        const otp = AuthService.generateOTP();
        AuthService.storeOTP(email, otp);

        // Send OTP via email (simulated)
        if (window.EmailService) {
            EmailService.sendOTP(email, otp);
        }

        return {
            message: 'OTP sent to your email',
            email: email,
            expiresIn: 10 // minutes
        };
    },

    // Verify OTP and login
    verifyOTPAndLogin: function (email, otp, role = 'student') {
        const verification = AuthService.verifyOTP(email, otp);

        if (!verification.valid) {
            throw new Error(verification.message);
        }

        // Proceed with login
        return AuthService.login(email, 'otp_verified', role);
    },

    // Forgot password
    forgotPassword: async function (email) {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const data = await response.json();
                return data; // Assume API returns { message, email, otp (for dev) }
            } else {
                console.warn('API /forgot-password failed, falling back to local implementation...');
            }
        } catch (error) {
            console.warn('API connection failed during forgotPassword, using fallback', error);
        }

        const otp = AuthService.generateOTP();
        AuthService.storeOTP(email, otp, 15); // 15 minutes for password reset

        // Send reset OTP via email (simulated)
        if (window.EmailService) {
            EmailService.sendPasswordResetOTP(email, otp);
        }

        // Always log OTP to console as fallback (for development/demo)
        console.log('🔐 Password Reset OTP for ' + email + ': ' + otp);

        return {
            message: 'Password reset OTP sent to your email',
            email: email,
            otp: otp // Include in return for simulated system
        };
    },

    // Reset password
    resetPassword: async function (email, otp, newPassword) {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.warn('API /reset-password failed, falling back to local implementation...');
            }
        } catch (error) {
            console.warn('API connection failed during resetPassword, using fallback', error);
        }

        // Fallback to local
        const verification = AuthService.verifyOTP(email, otp);

        if (!verification.valid) {
            throw new Error(verification.message);
        }

        const hashedPassword = AuthService.hashPassword(newPassword);
        let userFound = false;

        // 1. Check/Update registered students
        const students = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const updatedStudents = students.map(s => {
            if (s.email && s.email.toLowerCase() === email.toLowerCase()) {
                userFound = true;
                return { ...s, password: hashedPassword };
            }
            return s;
        });

        if (userFound) {
            localStorage.setItem('registered_students', JSON.stringify(updatedStudents));
        } else {
            // 2. Check/Update registered admins
            const admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            const updatedAdmins = admins.map(a => {
                if (a.email && a.email.toLowerCase() === email.toLowerCase()) {
                    userFound = true;
                    return { ...a, password: hashedPassword };
                }
                return a;
            });

            if (userFound) {
                localStorage.setItem('registered_admins', JSON.stringify(updatedAdmins));
            }
        }

        // If it's a booking student (not yet in registered_students)
        if (!userFound) {
            const bookings = window.BookingSystem ? window.BookingSystem.getBookings() : [];
            const bookingUser = bookings.find(b => b.email && b.email.toLowerCase() === email.toLowerCase());

            if (bookingUser) {
                // For bookings, we update the plain text password as per project convention 
                // but checking the login logic again, AuthService.login uses plain password for bookings
                // So let's update it in the booking system if possible
                const updatedBookings = bookings.map(b => {
                    if (b.email && b.email.toLowerCase() === email.toLowerCase()) {
                        userFound = true;
                        return { ...b, password: newPassword }; // Bookings use plain text in this mock
                    }
                    return b;
                });

                if (userFound) {
                    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                }
            }
        }

        if (!userFound) {
            throw new Error('User not found. Password reset failed.');
        }

        // Mark it as reset for records
        const resetRecords = JSON.parse(localStorage.getItem('password_resets') || '[]');
        resetRecords.push({
            email: email,
            resetAt: new Date().toISOString()
        });
        localStorage.setItem('password_resets', JSON.stringify(resetRecords));

        return {
            message: 'Password reset successfully',
            email: email
        };
    },

    // Refresh token
    refreshAccessToken: function () {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const payload = AuthService.verifyToken(refreshToken);
        if (!payload || payload.type !== 'refresh') {
            throw new Error('Invalid refresh token');
        }

        const newAccessToken = AuthService.generateToken({
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        }, '24h');

        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Path-aware redirection
        const isNested = window.location.pathname.includes('/student/') || 
                         window.location.pathname.includes('/admin/') ||
                         window.location.pathname.includes('/auth/');
        const prefix = isNested ? '../' : '';
        window.location.href = prefix + 'index.html';
    },

    // Check authentication
    checkAuth: (requiredRole = null) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            return null;
        }

        const payload = AuthService.verifyToken(accessToken);
        if (!payload) {
            // Try to refresh
            try {
                AuthService.refreshAccessToken();
                const newToken = localStorage.getItem('accessToken');
                return AuthService.verifyToken(newToken);
            } catch (error) {
                AuthService.logout();
                return null;
            }
        }

        if (requiredRole && payload.role !== requiredRole) {
            return null;
        }

        return payload;
    },

    // Rate limiting helpers
    getLoginAttempts: (email) => {
        const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
        return attempts[email] || { count: 0, lastAttempt: 0 };
    },

    recordLoginAttempt: (email, success) => {
        const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');

        if (success) {
            delete attempts[email];
        } else {
            if (!attempts[email]) {
                attempts[email] = { count: 0, lastAttempt: 0 };
            }
            attempts[email].count++;
            attempts[email].lastAttempt = Date.now();
        }

        localStorage.setItem('login_attempts', JSON.stringify(attempts));
    },

    clearLoginAttempts: (email) => {
        const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
        delete attempts[email];
        localStorage.setItem('login_attempts', JSON.stringify(attempts));
    }
};

// Export
window.AuthService = AuthService;
