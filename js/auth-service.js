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
        return this.hashPassword(password) === hash;
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

    // Enhanced login
    login: function (identifier, password, role = 'student') {
        // Rate limiting check removed by user request
        const email = identifier; // Alias for backward compatibility in rest of function if needed, though we should use identifier for lookup

        // Get user from bookings or create mock
        let user = null;
        if (role === 'student') {
            const bookings = window.BookingSystem ? window.BookingSystem.getBookings() : [];
            // Check against email OR username
            user = bookings.find(b => (b.email && b.email.trim() === identifier) || (b.username && b.username.trim() === identifier));
            console.log('Login lookup:', identifier, 'Found:', !!user);

            if (user) {
                // If user exists in system (bookings), verify their specific password
                // Note: In a real app we would hash the input and compare with stored hash
                if (password !== 'otp_verified' && user.password !== password) {
                    AuthService.recordLoginAttempt(email, false);
                    throw new Error('Invalid credentials');
                }
            } else {
                // Mock user for demo (if not found in DB)
                user = {
                    id: Date.now(),
                    email: email,
                    studentName: email.split('@')[0],
                    role: 'student',
                    password: this.hashPassword(password) // Mock
                };

                // For non-existent users, only allow specific demo passwords
                if (password !== 'otp_verified' && password !== 'student123' && password !== 'demo123') {
                    AuthService.recordLoginAttempt(email, false);
                    throw new Error('Invalid credentials');
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
                AuthService.recordLoginAttempt(email, false);
                throw new Error('Invalid credentials');
            }
        }

        if (!user) {
            AuthService.recordLoginAttempt(email, false);
            throw new Error('User not found');
        }

        // Generate tokens
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

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.studentName || user.name,
            role: user.role
        }));

        // Clear login attempts
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
    forgotPassword: function (email) {
        const otp = AuthService.generateOTP();
        AuthService.storeOTP(email, otp, 15); // 15 minutes for password reset

        // Send reset OTP via email (simulated)
        if (window.EmailService) {
            EmailService.sendPasswordResetOTP(email, otp);
        }

        return {
            message: 'Password reset OTP sent to your email',
            email: email
        };
    },

    // Reset password
    resetPassword: function (email, otp, newPassword) {
        const verification = AuthService.verifyOTP(email, otp);

        if (!verification.valid) {
            throw new Error(verification.message);
        }

        // In real app, update password in database
        // For demo, we'll just mark it as reset
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
        window.location.href = '../index.html';
    },

    // Check authentication
    checkAuth: (requiredRole = null) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            return null;
        }

        const payload = this.verifyToken(accessToken);
        if (!payload) {
            // Try to refresh
            try {
                this.refreshAccessToken();
                const newToken = localStorage.getItem('accessToken');
                return this.verifyToken(newToken);
            } catch (error) {
                this.logout();
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
