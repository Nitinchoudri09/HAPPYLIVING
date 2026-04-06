/* Debug and Fix Forgot Password Functionality */

// Debug function to check all user stores
function debugUserStores() {
    console.log('=== DEBUG: User Stores ===');
    
    // Check registered students
    const students = JSON.parse(localStorage.getItem('registered_students') || '[]');
    console.log('Registered Students:', students.length, students);
    
    // Check registered admins
    const admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
    console.log('Registered Admins:', admins.length, admins);
    
    // Check bookings
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    console.log('Bookings:', bookings.length, bookings);
    
    // Check OTP storage
    const otpStorage = JSON.parse(localStorage.getItem('otp_storage') || '[]');
    console.log('OTP Storage:', otpStorage.length, otpStorage);
    
    return { students, admins, bookings, otpStorage };
}

// Enhanced forgot password function with better error handling
async function debugForgotPassword(email) {
    console.log('=== DEBUG: Forgot Password Start ===');
    console.log('Email:', email);
    
    try {
        // Check if user exists first
        const stores = debugUserStores();
        
        let userExists = false;
        let userType = '';
        
        // Check all possible user locations
        if (stores.students.find(s => s.email && s.email.toLowerCase() === email.toLowerCase())) {
            userExists = true;
            userType = 'Student';
        }
        
        if (!userExists && stores.admins.find(a => a.email && a.email.toLowerCase() === email.toLowerCase())) {
            userExists = true;
            userType = 'Admin';
        }
        
        if (!userExists && email.toLowerCase() === 'admin@happylivingpg.com') {
            userExists = true;
            userType = 'Default Admin';
        }
        
        if (!userExists && stores.bookings.find(b => b.email && b.email.toLowerCase() === email.toLowerCase())) {
            userExists = true;
            userType = 'Booking';
        }
        
        if (!userExists && email.toLowerCase() === 'student@example.com') {
            userExists = true;
            userType = 'Demo Student';
        }
        
        console.log('User exists:', userExists, 'Type:', userType);
        
        if (!userExists) {
            throw new Error('No account found with this email address');
        }
        
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', otp);
        
        // Store OTP with expiration
        const otpData = {
            email: email,
            otp: otp,
            expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
            attempts: 0,
            maxAttempts: 3,
            createdAt: new Date().toISOString()
        };
        
        // Update OTP storage
        const otpStorage = stores.otpStorage.filter(o => o.email !== email);
        otpStorage.push(otpData);
        localStorage.setItem('otp_storage', JSON.stringify(otpStorage));
        
        console.log('OTP stored successfully');
        
        // Try backend API
        try {
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';
            console.log('Trying backend API:', API_BASE_URL);
            
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend API success:', data);
                return { ...data, otp, debug: true };
            } else {
                console.log('Backend API failed, using local storage');
            }
        } catch (apiError) {
            console.log('Backend API error:', apiError.message);
        }
        
        return {
            message: 'Password reset OTP sent to your email',
            email: email,
            otp: otp, // Include for demo
            debug: true,
            userType: userType
        };
        
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
}

// Enhanced reset password function
async function debugResetPassword(email, otp, newPassword) {
    console.log('=== DEBUG: Reset Password Start ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('New Password Length:', newPassword.length);
    
    try {
        // Verify OTP
        const otpStorage = JSON.parse(localStorage.getItem('otp_storage') || '[]');
        const otpData = otpStorage.find(o => o.email === email);
        
        console.log('OTP Data found:', !!otpData);
        
        if (!otpData) {
            throw new Error('OTP not found or expired');
        }
        
        // Check expiration
        if (otpData.expiresAt < Date.now()) {
            throw new Error('OTP has expired');
        }
        
        // Check attempts
        if (otpData.attempts >= otpData.maxAttempts) {
            throw new Error('Maximum attempts exceeded');
        }
        
        // Verify OTP
        if (otpData.otp !== otp) {
            otpData.attempts++;
            // Update attempts
            const updatedStorage = otpStorage.map(o => 
                o.email === email ? otpData : o
            );
            localStorage.setItem('otp_storage', JSON.stringify(updatedStorage));
            
            throw new Error(`Invalid OTP. Attempts remaining: ${otpData.maxAttempts - otpData.attempts}`);
        }
        
        console.log('OTP verified successfully');
        
        // Update password in all possible user stores
        const stores = debugUserStores();
        let passwordUpdated = false;
        
        // Update registered students
        const updatedStudents = stores.students.map(s => {
            if (s.email && s.email.toLowerCase() === email.toLowerCase()) {
                passwordUpdated = true;
                return { ...s, password: AuthService.hashPassword(newPassword) };
            }
            return s;
        });
        
        // Update registered admins
        const updatedAdmins = stores.admins.map(a => {
            if (a.email && a.email.toLowerCase() === email.toLowerCase()) {
                passwordUpdated = true;
                return { ...a, password: AuthService.hashPassword(newPassword) };
            }
            return a;
        });
        
        // Update bookings (plain text for bookings)
        const updatedBookings = stores.bookings.map(b => {
            if (b.email && b.email.toLowerCase() === email.toLowerCase()) {
                passwordUpdated = true;
                return { ...b, password: newPassword };
            }
            return b;
        });
        
        // Save updated data
        localStorage.setItem('registered_students', JSON.stringify(updatedStudents));
        localStorage.setItem('registered_admins', JSON.stringify(updatedAdmins));
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
        console.log('Password updated in stores:', passwordUpdated);
        
        // Clear OTP
        const cleanedOTPStorage = otpStorage.filter(o => o.email !== email);
        localStorage.setItem('otp_storage', JSON.stringify(cleanedOTPStorage));
        
        // Try backend API
        try {
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api/v1';
            
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend API success:', data);
                return { ...data, debug: true };
            } else {
                console.log('Backend API failed, using local storage');
            }
        } catch (apiError) {
            console.log('Backend API error:', apiError.message);
        }
        
        return {
            message: 'Password reset successfully',
            email: email,
            debug: true,
            passwordUpdated: passwordUpdated
        };
        
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
}

// Test function to verify the complete flow
async function testCompleteForgotPasswordFlow() {
    console.log('=== TESTING COMPLETE FORGOT PASSWORD FLOW ===');
    
    const testEmail = 'student@example.com';
    const newPassword = 'newtestpassword123';
    
    try {
        // Step 1: Generate OTP
        console.log('\n--- Step 1: Generate OTP ---');
        const otpResult = await debugForgotPassword(testEmail);
        console.log('OTP Result:', otpResult);
        
        // Step 2: Reset Password
        console.log('\n--- Step 2: Reset Password ---');
        const resetResult = await debugResetPassword(testEmail, otpResult.otp, newPassword);
        console.log('Reset Result:', resetResult);
        
        // Step 3: Test Login
        console.log('\n--- Step 3: Test Login ---');
        const loginResult = await AuthService.login(testEmail, newPassword, 'student');
        console.log('Login Result:', loginResult);
        
        console.log('\n=== FLOW TEST COMPLETED SUCCESSFULLY ===');
        return true;
        
    } catch (error) {
        console.error('Flow test failed:', error);
        return false;
    }
}

// Make functions available globally
window.debugForgotPassword = debugForgotPassword;
window.debugResetPassword = debugResetPassword;
window.testCompleteForgotPasswordFlow = testCompleteForgotPasswordFlow;
window.debugUserStores = debugUserStores;

console.log('Forgot Password Debug Module Loaded');
console.log('Available functions:');
console.log('- debugUserStores()');
console.log('- debugForgotPassword(email)');
console.log('- debugResetPassword(email, otp, newPassword)');
console.log('- testCompleteForgotPasswordFlow()');
