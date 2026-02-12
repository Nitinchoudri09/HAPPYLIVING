document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});

// Mock Authentication Helper (Legacy - use AuthService for new features)
const Auth = {
    login: (role, username, password) => {
        // Use AuthService if available
        if (window.AuthService) {
            try {
                const email = username.includes('@') ? username : username + '@happylivingpg.com';
                const result = AuthService.login(email, password, role);
                return true;
            } catch (error) {
                return false;
            }
        }
        
        // Fallback to simple validation
        if (role === 'admin' && username === 'admin' && password === 'admin123') {
            localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin User' }));
            return true;
        }
        if (role === 'student' && username === 'student' && password === 'student123') {
            localStorage.setItem('user', JSON.stringify({ role: 'student', name: 'John Doe', room: '101' }));
            return true;
        }
        return false;
    },
    
    logout: () => {
        if (window.AuthService) {
            AuthService.logout();
        } else {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    },

    checkAuth: (requiredRole) => {
        if (window.AuthService) {
            const payload = AuthService.checkAuth(requiredRole);
            if (!payload) {
                window.location.href = '../index.html';
                return null;
            }
            return payload;
        }
        
        // Fallback
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || user.role !== requiredRole) {
            window.location.href = '../index.html';
        }
        return user;
    }
};
